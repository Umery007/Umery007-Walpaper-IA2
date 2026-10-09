import {
  FiArrowLeft,
  FiMessageSquare,
  FiPlus,
  FiShare2,
  FiUser,
} from "react-icons/fi";
import Prompt from "../Prompt";
import {
  Brand,
  BrandMark,
  ChatMessage,
  ChatPanel,
  ChatSidebar,
  Conversation,
  Header,
  HeaderUser,
  Main,
  MessageText,
  NewChatButton,
  Notice,
  ProfileAvatar,
  Rail,
  RailButton,
  Screen,
  SidebarLabel,
  SidebarSection,
  SidebarSelection,
  TopBar,
} from "./styles";

export default function TelaCheia({
  onClose,
  onNewChat,
  conversation = [],
  isGenerating = false,
  message = "",
  onChange,
  onSubmit,
}) {
  return (
    <Screen aria-label="Tela cheia do gerador de wallpapers">
      <Rail>
        <BrandMark aria-label="WA1PAPER">W</BrandMark>
        <RailButton type="button" aria-label="Conversas" title="Conversas" $active>
          <FiMessageSquare />
        </RailButton>
        <RailButton type="button" aria-label="Compartilhar" title="Compartilhar">
          <FiShare2 />
        </RailButton>
      </Rail>

      <ChatSidebar>
        <Brand>LogoMarca</Brand>
        <NewChatButton type="button" onClick={onNewChat}>
          <FiPlus /> Novo chat
        </NewChatButton>
        <SidebarSection>
          <SidebarLabel>HISTÓRICO</SidebarLabel>
          <SidebarSelection type="button" aria-current="page">
            <FiMessageSquare />
            <span>Conversa atual</span>
          </SidebarSelection>
        </SidebarSection>
        <SidebarSection>
          <SidebarLabel>PROJETOS</SidebarLabel>
          <p>Seus projetos aparecerão aqui.</p>
        </SidebarSection>
      </ChatSidebar>

      <Main>
        <Header>
          <TopBar>
            <button
              type="button"
              className="back-button"
              onClick={onClose}
              aria-label="Voltar para o chatbot"
              title="Voltar"
            >
              <FiArrowLeft />
            </button>
            <HeaderUser>
              <span>LogoMarca</span>
              <ProfileAvatar aria-label="Perfil">
                <FiUser />
              </ProfileAvatar>
            </HeaderUser>
          </TopBar>
        </Header>

        <ChatPanel>
          <Conversation aria-live="polite">
            {conversation.map(({ id, text, image, fromUser }) => (
              <ChatMessage key={id} $fromUser={fromUser}>
                <MessageText>{text}</MessageText>
                {image && <img src={image} alt="Wallpaper gerado por IA" />}
              </ChatMessage>
            ))}
            {isGenerating && (
              <ChatMessage role="status">
                <MessageText>Gerando seu wallpaper...</MessageText>
              </ChatMessage>
            )}
          </Conversation>

          <Prompt
            value={message}
            onChange={onChange}
            onSubmit={onSubmit}
            placeholder="Descreva o wallpaper que você imagina..."
          />
          <Notice>Nosso site pode cometer erros enquanto está em crescimento.</Notice>
        </ChatPanel>
      </Main>
    </Screen>
  );
}
