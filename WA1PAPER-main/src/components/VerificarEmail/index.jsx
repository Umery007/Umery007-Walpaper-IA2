import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../services/api";
import useAuth from "../../contexts/useAuth";

export default function VerificarEmail() {
  const [params] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Confirmando seu e-mail...");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("O link de verificacao esta incompleto.");
      return;
    }

    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(async () => {
        await refreshUser();
        setStatus("success");
        setMessage("E-mail confirmado. Sua conta esta pronta para usar.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message);
      });
  }, [params, refreshUser]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#0b0b0e", color: "#fff", fontFamily: "Roboto Slab, serif" }}>
      <section style={{ width: "min(440px, 100%)", padding: 28, border: "1px solid rgba(255,255,255,.16)", borderRadius: 20, background: "#17171c", textAlign: "center" }}>
        <h1>Confirmacao de e-mail</h1>
        <p role={status === "error" ? "alert" : "status"}>{message}</p>
        {status !== "loading" && <Link to="/" style={{ color: "#fff" }}>Voltar ao WA1PAPER</Link>}
      </section>
    </main>
  );
}
