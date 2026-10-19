 import { FiSend } from "react-icons/fi";
 import {
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
  disabled = false,
}) {
  return (
    <PromptBar onSubmit={onSubmit} aria-busy={disabled}>
      <PromptInput
        aria-label={placeholder}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={1000}
        disabled={disabled}
      />

      <PromptSide>
        <SubmitButton type="submit" aria-label="Enviar prompt" title="Enviar" disabled={disabled || !value.trim()}>
          <FiSend />
        </SubmitButton>
      </PromptSide>
    </PromptBar>
  );
}