 import { FiEye, FiMic, FiPlus, FiSend } from "react-icons/fi";
import {
  ActionButton,
  PromptBar,
  PromptInput,
  PromptSide,
  SubmitButton,
} from "./styles";

export default function Prompt({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Crie seu wallpaper",
}) {
  return (
    <PromptBar onSubmit={onSubmit}>
      <ActionButton type="button" aria-label="Adicionar conteúdo" title="Adicionar">
        <FiPlus />
      </ActionButton>

      <PromptInput
        aria-label={placeholder}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      <PromptSide>
        <ActionButton type="button" aria-label="Usar microfone" title="Microfone">
          <FiMic />
        </ActionButton>
        <ActionButton type="button" aria-label="Visualizar wallpaper" title="Visualizar">
          <FiEye />
        </ActionButton>
        <SubmitButton type="submit" aria-label="Enviar prompt" title="Enviar">
          <FiSend />
        </SubmitButton>
      </PromptSide>
    </PromptBar>
  );
}