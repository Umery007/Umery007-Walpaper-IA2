import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Criarconta from "./components/Criarconta";
import Cadastrar from "./components/Cadastrar";
import Perfil from "./components/Perfil";
import Baixados from "./components/Baixados";
import Favoritados from "./components/Favoritados";
import Comunidade from "./components/Comunidade";
import DispositivosConectados from "./components/Dispositivos-Conectados";
import RecuperacaoConta from "./components/Recuperacao-conta";
import AutenticacaoDoisFatores from "./components/Autenticacao-dois-fatores";
import UpdateVip from "./components/Update-vip";
import Credito from "./components/Credito";
import Notificacoes from "./components/Notificacoes";
import Pin from "./components/Pin";
import PublicarWallpaper from "./components/PublicarWallpaper";
import PasswordRecovery from "./components/PasswordRecovery";
import Chatbot from "./components/Chatbot";
import AlterarSenha from "./components/Alterarsenha";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/criar-conta" element={<Criarconta />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/cadastro" element={<Cadastrar />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/salvos" element={<Perfil mostrarSalvos />} />
        <Route path="/Salvos-encolher" element={<Perfil mostrarSalvos salvosAmpliadoInicial={false} />} />
        <Route path="/baixados" element={<Baixados />} />
        <Route path="/favoritados" element={<Favoritados />} />
        <Route path="/comunidade" element={<Comunidade />} />
        <Route path="/dispositivos-conectados" element={<DispositivosConectados />} />
        <Route path="/recuperacao-conta" element={<RecuperacaoConta />} />
        <Route path="/autenticacao-dois-fatores" element={<AutenticacaoDoisFatores />} />
        <Route path="/planos" element={<UpdateVip />} />
        <Route path="/Update-vip" element={<UpdateVip />} />
        <Route path="/credito" element={<Credito />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/pin" element={<Pin />} />
        <Route path="/wallpapers/novo" element={<PublicarWallpaper />} />
        <Route path="/esqueci-senha" element={<PasswordRecovery />} />
        <Route path="/resetar-senha" element={<PasswordRecovery reset />} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default Router;