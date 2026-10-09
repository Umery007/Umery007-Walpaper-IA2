import { FaDiscord, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa6";
import { FiArrowUpRight, FiCheckCircle, FiHeart, FiMail } from "react-icons/fi";
import {
  FooterBar,
  FooterBottom,
  FooterBottomLink,
  FooterColumn,
  FooterColumnTitle,
  FooterContent,
  FooterDescription,
  FooterDivider,
  FooterHeading,
  FooterLink,
  FooterLinks,
  FooterLogo,
  FooterMark,
  FooterNav,
  FooterStatus,
  FooterText,
  SocialLabel,
  SocialLink,
} from "./styles";

const socialLinks = [
  { label: "Discord", icon: FaDiscord, href: "https://discord.com" },
  { label: "Instagram", icon: FaInstagram, href: "https://instagram.com" },
  { label: "TikTok", icon: FaTiktok, href: "https://tiktok.com" },
  { label: "Twitter", icon: FaTwitter, href: "https://twitter.com" },
];

export default function Footer() {
  return (
    <FooterBar>
      <FooterContent>
        <FooterHeading>
          <FooterLogo>
            <FooterMark>W</FooterMark>
            <span>LogoMarca</span>
          </FooterLogo>
          <FooterDescription>
            Wallpapers que transformam ideias em ambientes com personalidade.
          </FooterDescription>
          <FooterStatus><FiCheckCircle /> Sistema online</FooterStatus>
        </FooterHeading>

        <FooterNav>
          <FooterColumn>
            <FooterColumnTitle>Explorar</FooterColumnTitle>
            <FooterLink href="/">Início <FiArrowUpRight /></FooterLink>
            <FooterLink href="/favoritados">Favoritados <FiArrowUpRight /></FooterLink>
            <FooterLink href="/baixados">Downloads <FiArrowUpRight /></FooterLink>
          </FooterColumn>
          <FooterColumn>
            <FooterColumnTitle>Conta</FooterColumnTitle>
            <FooterLink href="/perfil">Meu perfil <FiArrowUpRight /></FooterLink>
            <FooterLink href="/criar-conta">Criar conta <FiArrowUpRight /></FooterLink>
            <FooterLink href="/alterar-senha">Segurança <FiArrowUpRight /></FooterLink>
          </FooterColumn>
          <FooterColumn $social>
            <FooterColumnTitle>Fique por perto</FooterColumnTitle>
            <FooterLinks aria-label="Redes sociais">
          {socialLinks.map(({ label, icon: Icon, href }) => (
            <SocialLink key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Acessar ${label}`}>
              <Icon aria-hidden="true" />
              <SocialLabel>{label}</SocialLabel>
            </SocialLink>
          ))}
            </FooterLinks>
            <FooterLink href="mailto:contato@logomarca.com"><FiMail /> Fale com a gente</FooterLink>
          </FooterColumn>
        </FooterNav>
      </FooterContent>
      <FooterDivider />
      <FooterBottom>
        <FooterText>LogoMarca © {new Date().getFullYear()} · Feito com <FiHeart /> para quem cria.</FooterText>
        <div>
          <FooterBottomLink href="#">Privacidade</FooterBottomLink>
          <FooterBottomLink href="#">Termos de uso</FooterBottomLink>
        </div>
      </FooterBottom>
    </FooterBar>
  );
}