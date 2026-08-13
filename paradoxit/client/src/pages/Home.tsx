import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, ChevronDown, Globe2, Instagram, LogIn, LogOut, Menu, Moon, Send, Sun, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";

const heroImage = "/manus-storage/paradoxit-hero_36607c10.jpg";

type Language = "en" | "am";

const copy = {
  en: {
    nav: ["Home", "About", "Inventory", "Gallery"],
    heroKicker: "A new standard of distinction",
    heroTitle: "Where earth meets the exceptional.",
    heroBody: "Paradoxit is a considered world of objects, ideas, and experiences shaped with quiet confidence and a luminous point of view.",
    explore: "Explore Paradoxit",
    about: "About the house",
    aboutTitle: "Designed for those who notice the difference.",
    aboutBody: "We bring together material intelligence, rare perspective, and exacting craft to create work that feels at home in the future. Every detail is edited. Every gesture is intentional.",
    philosophy: "Our philosophy",
    philosophyBody: "Luxury is not excess. It is clarity, patience, and the confidence to leave room for what matters.",
    inventoryKicker: "The collection",
    inventoryTitle: "Selected works in orbit.",
    inventoryBody: "A changing selection of pieces and projects with a shared language: elemental, enduring, and quietly arresting.",
    viewAll: "View all works",
    galleryKicker: "Visual archive",
    galleryTitle: "A study in light, texture, and form.",
    galleryBody: "Enter the Paradoxit image archive — a visual vocabulary of midnight surfaces, warm metals, and earthly horizons.",
    visit: "Visit the archive",
    member: "Your Paradoxit account",
    login: "Sign in with OAuth",
    signout: "Sign out",
    signedIn: "Signed in as",
    address: "Bole, Addis Ababa, Ethiopia",
    footer: "An independent house for the considered life.",
    allRights: "© 2026 Paradoxit. All rights reserved.",
    menu: "Menu",
    theme: "Theme",
    language: "Language",
  },
  am: {
    nav: ["መነሻ", "ስለ እኛ", "ኢንቬንተሪ", "ምስሎች"],
    heroKicker: "የልዩነት አዲስ መስፈርት",
    heroTitle: "ምድር ከልዩ ውበት ጋር በምትገናኝበት።",
    heroBody: "ፓራዶክሲት በጸጥታ እምነት እና በብርሃናማ እይታ የተቀረጹ ነገሮችን፣ ሀሳቦችን እና ልምዶችን የሚያገናኝ ዓለም ነው።",
    explore: "ፓራዶክሲትን ያስሱ",
    about: "ስለ ቤቱ",
    aboutTitle: "ልዩነቱን ለሚመለከቱ የተዘጋጀ።",
    aboutBody: "ቁሳዊ ጥበብን፣ ልዩ እይታን እና ጥብቅ የእጅ ሥራን በማጣመር ለወደፊቱ ተስማሚ የሆኑ ሥራዎችን እንፈጥራለን። እያንዳንዱ ዝርዝር የተመረጠ ነው።",
    philosophy: "ፍልስፍናችን",
    philosophyBody: "ቅንጦት ብዛት አይደለም። ግልጽነት፣ ትዕግሥት እና ለአስፈላጊው ቦታ መተው ነው።",
    inventoryKicker: "ስብስቡ",
    inventoryTitle: "በምህዋር ያሉ የተመረጡ ሥራዎች።",
    inventoryBody: "የተለዋዋጭ የሆኑ እቃዎች እና ፕሮጀክቶች፤ አንድ የጋራ ቋንቋ ያላቸው፡ መሠረታዊ፣ ዘላቂ እና በጸጥታ የሚስቡ።",
    viewAll: "ሁሉንም ሥራዎች ይመልከቱ",
    galleryKicker: "የምስል ማህደር",
    galleryTitle: "የብርሃን፣ የሸካራነት እና የቅርጽ ጥናት።",
    galleryBody: "ወደ ፓራዶክሲት የምስል ማህደር ይግቡ — የሌሊት ገጽታዎች፣ የሞቃት ብረቶች እና የምድር አድማሶች የሚያቀርብ የምስል ቋንቋ።",
    visit: "ማህደሩን ይመልከቱ",
    member: "የእርስዎ የፓራዶክሲት መለያ",
    login: "በOAuth ይግቡ",
    signout: "ይውጡ",
    signedIn: "የገቡት በ",
    address: "ቦሌ፣ አዲስ አበባ፣ ኢትዮጵያ",
    footer: "ለተመረጠ ሕይወት የተቋቋመ ገለልተኛ ቤት።",
    allRights: "© 2026 ፓራዶክሲት። መብቱ በሙሉ የተጠበቀ ነው።",
    menu: "ምናሌ",
    theme: "ገጽታ",
    language: "ቋንቋ",
  },
} as const;

const works = [
  { id: "01", title: { en: "Solaris Form", am: "ሶላሪስ ቅርጽ" }, subtitle: { en: "A study in radiant restraint", am: "የብርሃን ጸጥታ ጥናት" }, color: "from-amber-200/70 via-orange-500/20 to-slate-950", tone: "bg-[#c88732]" },
  { id: "02", title: { en: "Nocturne Matter", am: "የሌሊት ቁሳቁስ" }, subtitle: { en: "Objects for the after-hours", am: "ለዝምታ ሰዓታት የተዘጋጁ ነገሮች" }, color: "from-slate-300/20 via-indigo-800/30 to-[#090b10]", tone: "bg-[#202a42]" },
  { id: "03", title: { en: "Terra Quiet", am: "የምድር ጸጥታ" }, subtitle: { en: "A language of grounded calm", am: "የመሠረታዊ ሰላም ቋንቋ" }, color: "from-emerald-200/20 via-stone-700/30 to-[#11110f]", tone: "bg-[#435344]" },
];

const gallery = [
  { label: { en: "I. Horizon", am: "I. አድማስ" }, size: "md:row-span-2", position: "bg-[radial-gradient(circle_at_65%_40%,rgba(248,188,89,.92),transparent_17%),linear-gradient(140deg,#111827,#34210f_58%,#d08930)]" },
  { label: { en: "II. Mineral", am: "II. ማዕድን" }, size: "", position: "bg-[radial-gradient(circle_at_30%_20%,rgba(221,162,83,.45),transparent_20%),linear-gradient(145deg,#42485a,#131722 60%,#7a4a26)]" },
  { label: { en: "III. Atmosphere", am: "III. ከባቢ" }, size: "", position: "bg-[radial-gradient(circle_at_70%_70%,rgba(65,106,130,.45),transparent_26%),linear-gradient(145deg,#0d1c2a,#0b0d13 70%,#a36b31)]" },
  { label: { en: "IV. Orbit", am: "IV. ምህዋር" }, size: "md:col-span-2", position: "bg-[radial-gradient(ellipse_at_70%_50%,rgba(232,171,87,.85),transparent_13%),linear-gradient(100deg,#11151d,#1f2836 56%,#5d3d25)]" },
];

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return <Link href={href} className={`relative py-2 text-[11px] font-semibold uppercase tracking-[.18em] transition-colors ${active ? "text-gold" : "text-foreground/65 hover:text-gold"}`}>{children}{active && <span className="absolute -bottom-1 left-0 h-px w-full bg-accent" />}</Link>;
}

export default function Home() {
  const [location] = useLocation();
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("paradoxit-language") as Language) || "en");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const t = copy[language];
  const page = useMemo(() => location === "/about" ? "about" : location === "/inventory" ? "inventory" : location === "/gallery" ? "gallery" : "home", [location]);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    localStorage.setItem("paradoxit-language", next);
  };

  const navItems = [{ href: "/", label: t.nav[0] }, { href: "/about", label: t.nav[1] }, { href: "/inventory", label: t.nav[2] }, { href: "/gallery", label: t.nav[3] }];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-accent/70 bg-accent/10 text-accent"><span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_20px_6px_rgba(224,161,76,.45)]" /><span className="absolute inset-1 rounded-full border border-accent/25" /></span>
            <span className="font-display text-xl tracking-[.12em]">Paradoxit</span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">{navItems.map(item => <NavLink key={item.href} href={item.href} active={location === item.href}>{item.label}</NavLink>)}</nav>
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center rounded-full border border-border/70 p-1 text-[11px] font-semibold"><button onClick={() => changeLanguage("en")} className={`rounded-full px-2.5 py-1 ${language === "en" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>EN</button><button onClick={() => changeLanguage("am")} className={`rounded-full px-2.5 py-1 ${language === "am" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>አማ</button></div>
            <button aria-label={t.theme} onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full border border-border/70 text-muted-foreground hover:border-accent hover:text-accent">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
            {isAuthenticated ? <button onClick={() => logout()} className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-accent hover:text-accent"><LogOut size={14} />{t.signout}</button> : <button onClick={() => startLogin()} className="flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground hover:bg-[#f1b866]"><LogIn size={14} />{t.login}</button>}
          </div>
          <button onClick={() => setMobileOpen(v => !v)} className="grid h-10 w-10 place-items-center rounded-full border border-border/70 lg:hidden" aria-label={t.menu}>{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        {mobileOpen && <div className="border-t border-border/60 bg-background px-6 py-5 lg:hidden"><div className="container grid gap-4">{navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="text-sm font-semibold uppercase tracking-[.18em] text-foreground/75">{item.label}</Link>)}<div className="flex items-center gap-3 pt-2"><button onClick={() => changeLanguage(language === "en" ? "am" : "en")} className="flex items-center gap-2 text-xs text-muted-foreground"><Globe2 size={15} />{language === "en" ? "አማርኛ" : "English"}</button><button onClick={toggleTheme} className="flex items-center gap-2 text-xs text-muted-foreground">{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}{t.theme}</button></div>{isAuthenticated ? <button onClick={() => logout()} className="flex items-center gap-2 text-left text-xs font-semibold text-accent"><LogOut size={15} />{t.signout}</button> : <button onClick={() => startLogin()} className="flex items-center gap-2 text-left text-xs font-semibold text-accent"><LogIn size={15} />{t.login}</button>}</div></div>}
      </header>

      {page === "home" && <>
        <main>
          <section className="relative flex min-h-[780px] items-end overflow-hidden bg-[#0b0d13] pt-28">
            <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${heroImage})` }} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,11,16,.98)_0%,rgba(9,11,16,.78)_42%,rgba(9,11,16,.08)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,11,16,.92),transparent_48%)]" />
            <div className="container relative z-10 grid items-end gap-12 pb-20 lg:grid-cols-[1.08fr_.92fr] lg:pb-28">
              <div className="max-w-3xl"><p className="mb-5 font-display text-2xl tracking-[.16em] text-white sm:text-3xl">Paradoxit</p><p className="eyebrow mb-6 text-gold">{t.heroKicker}</p><h1 className="max-w-3xl font-display text-5xl leading-[.98] tracking-[-.04em] text-white sm:text-7xl lg:text-[6.8rem]">{t.heroTitle}</h1><p className="mt-5 text-sm font-semibold tracking-wide text-gold/90">Where earth meets the exceptional. <span className="mx-2 text-white/30">/</span> ምድር ከልዩ ውበት ጋር በምትገናኝበት።</p><p className="mt-6 max-w-xl text-base leading-8 text-white/65 sm:text-lg">{t.heroBody}</p><div className="mt-10 flex flex-wrap gap-4"><Link href="/inventory" className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground hover:bg-[#f1b866]">{t.explore}<ArrowUpRight size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link><Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:border-accent hover:text-gold">{t.about}</Link></div></div>
              <div className="hidden justify-self-end lg:block"><div className="glass-panel max-w-[260px] rounded-2xl p-6 text-white"><div className="mb-7 flex items-center justify-between"><span className="eyebrow text-white/50">01 / 04</span><span className="h-px w-16 bg-accent" /></div><p className="font-display text-2xl leading-tight">{language === "en" ? "A quiet radiance." : "ዝምተኛ ብርሃን።"}</p><p className="mt-4 text-sm leading-6 text-white/55">{language === "en" ? "For the rare, the real, and the beautifully considered." : "ለልዩ፣ ለእውነተኛ እና በጥንቃቄ ለተመረጠው።"}</p></div></div>
            </div>
          </section>
          <section className="paper-texture border-b border-border/70 py-16"><div className="container grid gap-8 md:grid-cols-3"><div><p className="eyebrow text-accent">{t.about}</p></div><p className="font-display text-2xl leading-tight md:col-span-2 md:text-4xl">{t.aboutTitle}</p><p className="max-w-xl text-sm leading-7 text-muted-foreground md:col-start-2">{t.aboutBody}</p></div></section>
          <section className="space-texture py-24 text-white"><div className="container grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><p className="eyebrow text-gold">{t.philosophy}</p><p className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">{t.philosophyBody}</p></div><div className="grid grid-cols-2 gap-4"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-6"><p className="font-display text-4xl text-gold">01</p><p className="mt-8 text-sm text-white/60">{language === "en" ? "Material intelligence" : "የቁሳቁስ ጥበብ"}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-6"><p className="font-display text-4xl text-gold">02</p><p className="mt-8 text-sm text-white/60">{language === "en" ? "Measured detail" : "የተመጠነ ዝርዝር"}</p></div></div></div></section>
          <section className="paper-texture py-24"><div className="container"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow text-accent">{t.inventoryKicker}</p><h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">{t.inventoryTitle}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">{t.inventoryBody}</p></div><Link href="/inventory" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-foreground">{t.viewAll}<ArrowUpRight size={16} /></Link></div><div className="mt-12 grid gap-5 md:grid-cols-3">{works.map(work => <Link href="/inventory" key={work.id} className="group overflow-hidden rounded-2xl border border-border bg-card"><div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${work.color}`}><div className={`absolute inset-8 rounded-full ${work.tone} opacity-40 blur-3xl`} /><div className="absolute inset-x-6 bottom-6 flex justify-between text-white"><span className="eyebrow text-white/60">{work.id}</span><ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></div><div className="p-5"><h3 className="font-display text-xl">{work.title[language]}</h3><p className="mt-1 text-sm text-muted-foreground">{work.subtitle[language]}</p></div></Link>)}</div></div></section>
          <section className="space-texture py-24 text-white"><div className="container"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow text-gold">{t.galleryKicker}</p><h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">{t.galleryTitle}</h2></div><Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-white">{t.visit}<ArrowUpRight size={16} /></Link></div><div className="mt-12 grid auto-rows-[180px] gap-4 md:grid-cols-3">{gallery.map(item => <Link href="/gallery" key={item.label.en} className={`group relative overflow-hidden rounded-2xl border border-white/10 ${item.size} ${item.position}`}><div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" /><span className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[.2em] text-white/70">{item.label[language]}</span></Link>)}</div></div></section>
        </main>
      </>}

      {page !== "home" && <main className="pt-[76px]"><section className="space-texture relative min-h-[360px] overflow-hidden px-6 py-24 text-white"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url(${heroImage})`, backgroundPosition: page === "gallery" ? "center 65%" : "center" , backgroundSize: "cover" }} /><div className="absolute inset-0 bg-black/55" /><div className="container relative"><p className="eyebrow text-gold">{page === "about" ? t.about : page === "inventory" ? t.inventoryKicker : t.galleryKicker}</p><h1 className="mt-5 max-w-4xl font-display text-5xl leading-none sm:text-7xl">{page === "about" ? t.aboutTitle : page === "inventory" ? t.inventoryTitle : t.galleryTitle}</h1></div></section>{page === "about" && <section className="paper-texture py-24"><div className="container grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><p className="eyebrow text-accent">{t.philosophy}</p><div><p className="font-display text-3xl leading-tight sm:text-5xl">{t.aboutBody}</p><p className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground">{t.philosophyBody}</p></div></div></section>}{page === "inventory" && <section className="paper-texture py-24"><div className="container"><p className="max-w-2xl text-base leading-8 text-muted-foreground">{t.inventoryBody}</p><div className="mt-12 grid gap-5 md:grid-cols-3">{works.map(work => <div key={work.id} className="overflow-hidden rounded-2xl border border-border bg-card"><div className={`aspect-[4/5] bg-gradient-to-br ${work.color}`} /><div className="p-5"><h2 className="font-display text-2xl">{work.title[language]}</h2><p className="mt-2 text-sm text-muted-foreground">{work.subtitle[language]}</p></div></div>)}</div></div></section>}{page === "gallery" && <section className="space-texture py-24"><div className="container"><p className="max-w-2xl text-base leading-8 text-white/60">{t.galleryBody}</p><div className="mt-12 grid auto-rows-[200px] gap-4 md:grid-cols-3">{gallery.map(item => <div key={item.label.en} className={`relative overflow-hidden rounded-2xl border border-white/10 ${item.size} ${item.position}`}><span className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[.2em] text-white/70">{item.label[language]}</span></div>)}</div></div></section>}</main>}

      <footer className="border-t border-border/70 bg-background py-12"><div className="container grid gap-10 md:grid-cols-[1.2fr_.8fr_.8fr]"><div><Link href="/" className="font-display text-2xl tracking-[.12em]">Paradoxit</Link><p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">{t.footer}</p><p className="mt-6 text-sm text-muted-foreground">{t.address}</p></div><div><p className="eyebrow text-accent">{t.member}</p>{isAuthenticated && user ? <div className="mt-4"><p className="font-display text-xl">{user.name || user.email || "Paradoxit member"}</p><p className="mt-1 text-xs text-muted-foreground">{t.signedIn}</p></div> : <button onClick={() => startLogin()} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-foreground"><LogIn size={15} />{t.login}</button>}</div><div><p className="eyebrow text-accent">Connect</p><div className="mt-5 flex flex-wrap gap-2"><a aria-label="Instagram" href="https://instagram.com/paradoxit" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent"><Instagram size={15} /></a><a aria-label="Telegram" href="https://t.me/paradoxit" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent"><Send size={15} /></a><a aria-label="Facebook" href="https://facebook.com/paradoxit" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent"><span className="text-xs font-bold">f</span></a><a aria-label="WhatsApp" href="https://wa.me/251900000000" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent"><span className="text-xs font-bold">WA</span></a><a aria-label="GitHub" href="https://github.com/paradoxit-ethco/woreda4girls-hair" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent"><span className="text-xs font-bold">GH</span></a></div></div></div><div className="container mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">{t.allRights}</div></footer>
    </div>
  );
}
