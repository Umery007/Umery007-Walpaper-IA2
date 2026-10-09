import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMaximize,
  FiMaximize2,
  FiMessageCircle,
  FiX,
} from "react-icons/fi";
import Prompt from "../Prompt";
import TelaCheia from "../Tela-cheia";
import { apiRequest } from "../../services/api";
import useAuth from "../../contexts/useAuth";
import {
  ChatWindow,
  CloseButton,
  MessageActions,
  Launcher,
  Message,
  Messages,
  MessageIcon,
  Header,
  HeaderActions,
  Subtitle,
  Title,
  LauncherHint,
} from "./styles";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState([
    { id: "welcome", text: "Olá, seja bem-vindo 👋" },
    { id: "intro", text: "Descreva o wallpaper que você imagina e eu vou gerar uma imagem para você." },
  ]);
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleNewChat() {
    setConversation([
      { id: "welcome", text: "Olá, seja bem-vindo 👋" },
      { id: "intro", text: "Descreva o wallpaper que você imagina e eu vou gerar uma imagem para você." },
    ]);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt || isGenerating) return;
    setConversation((current) => [...current, { id: crypto.randomUUID(), text: prompt, fromUser: true }]);
    setMessage("");
    if (!user) {
      setConversation((current) => [...current, { id: crypto.randomUUID(), text: "Entre na sua conta para gerar e salvar imagens." }]);
      navigate("/cadastro");
      return;
    }

    setIsGenerating(true);
    try {
      const { wallpaper } = await apiRequest("/images/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      setConversation((current) => [
        ...current,
        { id: crypto.randomUUID(), text: "Seu wallpaper foi gerado e salvo na galeria.", image: wallpaper.image_url },
      ]);
    } catch (error) {
      setConversation((current) => [...current, { id: crypto.randomUUID(), text: error.message }]);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      {isOpen && !isFullScreen && (
        <ChatWindow $isExpanded={isExpanded} aria-label="Conversa com o Toc Toc">
          <Header>
            <div>
              <Title>Oi seja bem vindo!</Title>
              <Subtitle>LogoMarca está online para ajudar</Subtitle>
            </div>
            <HeaderActions>
              <CloseButton
                type="button"
                aria-label="Fechar conversa"
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                  setIsFullScreen(false);
                }}
              >
                <FiX />
              </CloseButton>
            </HeaderActions>
          </Header>

          <Messages>
            {conversation.map(({ id, text, image, fromUser }) => (
              <Message key={id} $fromUser={fromUser}>
                {text}
                {image && <img src={image} alt="Wallpaper gerado por IA" style={{ display: "block", width: "100%", marginTop: 10, borderRadius: 10 }} />}
              </Message>
            ))}
            {isGenerating && <Message role="status">Gerando seu wallpaper...</Message>}
            <MessageActions aria-label="Controles de tamanho">
              <MessageIcon
                type="button"
                aria-label={isExpanded ? "Reduzir conversa" : "Ampliar conversa"}
                title={isExpanded ? "Reduzir conversa" : "Ampliar conversa"}
                onClick={() => setIsExpanded((expanded) => !expanded)}
              >
                <FiMaximize2 />
              </MessageIcon>
              {isExpanded && (
                <MessageIcon
                  type="button"
                  aria-label="Abrir tela cheia"
                  title="Abrir tela cheia"
                  onClick={() => setIsFullScreen(true)}
                >
                  <FiMaximize />
                </MessageIcon>
              )}
            </MessageActions>
            <small>Ex: João</small>
          </Messages>

          <Prompt
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onSubmit={handleSubmit}
            placeholder="Crie seu wallpaper"
          />
        </ChatWindow>
      )}

      {isOpen && isFullScreen && (
        <TelaCheia
          onClose={() => setIsFullScreen(false)}
          onNewChat={handleNewChat}
          conversation={conversation}
          isGenerating={isGenerating}
          message={message}
          onChange={(event) => setMessage(event.target.value)}
          onSubmit={handleSubmit}
        />
      )}

      {!isOpen && (
        <Launcher
          type="button"
          aria-label="Abrir conversa"
          onClick={() => setIsOpen(true)}
        >
          <FiMessageCircle />
          <LauncherHint aria-hidden="true">Que foi Diabe</LauncherHint>
        </Launcher>
      )}
    </>
  );
}
