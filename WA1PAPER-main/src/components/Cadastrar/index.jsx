import fundo from "../../assets/fundo/fundo.png";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../../contexts/useAuth";
import PasswordInput from "../PasswordInput";
import {
  Wrapper,
  Card,
  TopBar,
  TopTitle,
  CloseButton,
  Group219,
  Group218,
  LabelEmail,
  EmailInput,
  LabelSenha,
  SenhaInput,
  ButtonRect,
  ButtonText,
} from "./styles";

export default function Cadastrar() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Wrapper
      style={{
        backgroundImage: `url(${fundo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card>
        <TopBar>
          <TopTitle>Entrar</TopTitle>
          <CloseButton type="button" aria-label="Voltar" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} strokeWidth={1.8} />
          </CloseButton>
        </TopBar>

        <form onSubmit={handleSubmit}>
        <Group219>
          <Group218>
            <LabelEmail htmlFor="login-email">E-mail</LabelEmail>
            <EmailInput id="login-email" autoComplete="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Digite aqui...." />

            <LabelSenha htmlFor="login-password">Senha</LabelSenha>
            <PasswordInput Input={SenhaInput} id="login-password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Digite aqui...." />
          </Group218>

          <ButtonRect type="submit" disabled={loading}>
            <ButtonText>{loading ? "Entrando..." : "Entrar"}</ButtonText>
          </ButtonRect>
          {error && <p role="alert" style={{ color: "#ffb4ad", textAlign: "center" }}>{error}</p>}
          <p style={{ textAlign: "center" }}><Link style={{ color: "#fff" }} to="/esqueci-senha">Esqueci minha senha</Link></p>
          <p style={{ textAlign: "center", color: "#fff" }}>
            Ainda não tem conta?{" "}
            <Link style={{ color: "#fff", fontWeight: 700 }} to="/criar-conta">Criar conta</Link>
          </p>
        </Group219>
        </form>
      </Card>
    </Wrapper>
  );
}
