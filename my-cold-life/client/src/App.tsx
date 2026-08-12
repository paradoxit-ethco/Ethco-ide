import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link, useLocation } from "wouter";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import About from "./pages/About";
import Inventory from "./pages/Inventory";
import Gallery from "./pages/Gallery";
import Earth from "./pages/Earth";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Globe2, Leaf, LogIn, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { siteContent, type Language, socialLinks } from "@shared/i18n";
import { startLogin } from "@/const";

export function SiteHeader({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const t = siteContent[language];
  const links = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/inventory", label: t.nav.inventory },
    { href: "/gallery", label: t.nav.gallery },
    { href: "/earth", label: language === "en" ? "Earth" : "መሬት" },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Leaf size={16} strokeWidth={1.5} /></span>
          <span>My Cold Life</span>
        </Link>
        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={location === link.href ? "active" : ""}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label={t.common.theme} onClick={toggleTheme}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button className="language-button" aria-label={`Switch to ${t.common.language}`} onClick={() => setLanguage(language === "en" ? "am" : "en")}><Globe2 size={15} /> {language === "en" ? "አማ" : "EN"}</button>
          {isAuthenticated ? <><span className="user-name">{user?.name || "My Cold Life member"}</span><button className="auth-button" onClick={() => logout()}><LogOut size={15} /> {t.nav.logout}</button></> : <button className="auth-button" onClick={() => startLogin()}><LogIn size={15} /> {t.nav.login}</button>}
          <button className="mobile-menu" aria-label={open ? t.common.close : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>
  );
}

function Footer({ language }: { language: Language }) {
  const t = siteContent[language];
  const socials = Object.entries(socialLinks);
  return <footer className="site-footer"><div className="container footer-grid"><div><Link href="/" className="brand footer-brand"><span className="brand-mark"><Leaf size={16} /></span><span>My Cold Life</span></Link><p className="footer-statement">{t.footer.statement}</p></div><div><p className="footer-label">{t.about.addressLabel}</p><p>{t.footer.address}</p></div><div><p className="footer-label">{t.about.socialLabel}</p><div className="social-row">{socials.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name}>{name === "instagram" ? "IG" : name === "telegram" ? "TG" : name === "facebook" ? "FB" : name === "whatsapp" ? "WA" : "GH"}</a>)}</div></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} My Cold Life</span><span>{t.footer.rights}</span></div></footer>;
}

function Router() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("mcl-language") as Language) || "en");
  const updateLanguage = (next: Language) => { setLanguage(next); localStorage.setItem("mcl-language", next); };
  return <div className="app-frame"><SiteHeader language={language} setLanguage={updateLanguage} /><main><Switch><Route path="/" component={() => <Home language={language} />} /><Route path="/about" component={() => <About language={language} />} /><Route path="/inventory" component={() => <Inventory language={language} />} /><Route path="/gallery" component={() => <Gallery language={language} />} /><Route path="/earth" component={() => <Earth language={language} />} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></main><Footer language={language} /></div>;
}

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark" switchable><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
