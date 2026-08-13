import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CloudSun,
  Command,
  CreditCard,
  FileText,
  Globe2,
  Headphones,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Moon,
  Plane,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sun,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Runway Ledger: this page uses the airport-terminal rail, editorial KPI bands, boarding-pass cards,
// orange route waypoints, Space Grotesk-style headlines, and calm role-aware operational copy.

type Language = "en" | "am";
type Role = "super" | "technical" | "client";

type Copy = {
  [key in Language]: {
    overview: string;
    greeting: string;
    dashboard: string;
    bookings: string;
    routes: string;
    customers: string;
    support: string;
    team: string;
    settings: string;
    operations: string;
    currentPeriod: string;
    search: string;
    newBooking: string;
    activeBookings: string;
    revenue: string;
    passengers: string;
    onTime: string;
    nextMovement: string;
    viewManifest: string;
    recentBookings: string;
    bookingId: string;
    passenger: string;
    route: string;
    departure: string;
    status: string;
    total: string;
    confirmed: string;
    pending: string;
    viewAll: string;
    performance: string;
    flightHealth: string;
    weather: string;
    clearSkies: string;
    controlTower: string;
    flightOps: string;
    clients: string;
    technical: string;
    superAdmin: string;
    switchRole: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
  };
};

const copy: Copy = {
  en: {
    overview: "Overview",
    greeting: "Good morning, Selam",
    dashboard: "Dashboard",
    bookings: "Bookings",
    routes: "Routes & schedules",
    customers: "Customers",
    support: "Support center",
    team: "Team & permissions",
    settings: "Workspace settings",
    operations: "Operations overview",
    currentPeriod: "Aug 01 — Aug 31, 2026",
    search: "Search bookings, routes, clients",
    newBooking: "New booking",
    activeBookings: "Active bookings",
    revenue: "Gross revenue",
    passengers: "Passengers served",
    onTime: "On-time departure",
    nextMovement: "Next movement",
    viewManifest: "View manifest",
    recentBookings: "Recent bookings",
    bookingId: "Booking ID",
    passenger: "Passenger",
    route: "Route",
    departure: "Departure",
    status: "Status",
    total: "Total",
    confirmed: "Confirmed",
    pending: "Pending",
    viewAll: "View all bookings",
    performance: "Performance",
    flightHealth: "Flight health",
    weather: "Addis Ababa weather",
    clearSkies: "Clear skies · 21°C",
    controlTower: "Control tower",
    flightOps: "Flight operations",
    clients: "Client workspace",
    technical: "Technical team",
    superAdmin: "Super admin",
    switchRole: "Switch role",
    language: "Language",
    theme: "Theme",
    light: "Light mode",
    dark: "Dark mode",
  },
  am: {
    overview: "አጠቃላይ እይታ",
    greeting: "እንደምን አደሩ፣ ሰላም",
    dashboard: "ዳሽቦርድ",
    bookings: "ቦታ ማስያዣዎች",
    routes: "መንገዶች እና የጊዜ ሰሌዳ",
    customers: "ደንበኞች",
    support: "የድጋፍ ማዕከል",
    team: "ቡድን እና ፈቃዶች",
    settings: "የስራ ቦታ ቅንብሮች",
    operations: "የስራ አስተዳደር አጠቃላይ እይታ",
    currentPeriod: "ነሐሴ 01 — ነሐሴ 31፣ 2018",
    search: "ቦታ ማስያዣ፣ መንገድ ወይም ደንበኛ ይፈልጉ",
    newBooking: "አዲስ ቦታ ማስያዣ",
    activeBookings: "ንቁ ቦታ ማስያዣዎች",
    revenue: "ጠቅላላ ገቢ",
    passengers: "ያገለገሉ ተሳፋሪዎች",
    onTime: "በሰዓቱ የሚነሳ",
    nextMovement: "ቀጣይ እንቅስቃሴ",
    viewManifest: "ዝርዝር ይመልከቱ",
    recentBookings: "የቅርብ ጊዜ ቦታ ማስያዣዎች",
    bookingId: "የቦታ ማስያዣ መለያ",
    passenger: "ተሳፋሪ",
    route: "መንገድ",
    departure: "መነሻ",
    status: "ሁኔታ",
    total: "ድምር",
    confirmed: "ተረጋግጧል",
    pending: "በመጠባበቅ ላይ",
    viewAll: "ሁሉንም ቦታ ማስያዣዎች ይመልከቱ",
    performance: "አፈጻጸም",
    flightHealth: "የበረራ ሁኔታ",
    weather: "የአዲስ አበባ አየር ሁኔታ",
    clearSkies: "ጥሩ ሰማይ · 21°C",
    controlTower: "የቁጥጥር ማዕከል",
    flightOps: "የበረራ ስራዎች",
    clients: "የደንበኛ የስራ ቦታ",
    technical: "የቴክኒክ ቡድን",
    superAdmin: "ሱፐር አስተዳዳሪ",
    switchRole: "ሚና ይቀይሩ",
    language: "ቋንቋ",
    theme: "ገጽታ",
    light: "ብሩህ ሁነታ",
    dark: "ጨለማ ሁነታ",
  },
};

const roleLabels: Record<Role, keyof Copy["en"]> = {
  super: "superAdmin",
  technical: "technical",
  client: "clients",
};

const roleCopy: Record<Role, Record<Language, { title: string; description: string; focus: string }>> = {
  super: {
    en: { title: "Super Admin workspace", description: "Govern the whole booking network, revenue, users, and configuration from one control surface.", focus: "Governance · access · revenue" },
    am: { title: "የሱፐር አስተዳዳሪ የስራ ቦታ", description: "የቦታ ማስያዣ አውታረ መረብ፣ ገቢ፣ ተጠቃሚዎች እና ቅንብሮችን ከአንድ የቁጥጥር ገጽ ያስተዳድሩ።", focus: "አስተዳደር · መዳረሻ · ገቢ" },
  },
  technical: {
    en: { title: "Technical Team workspace", description: "Monitor integrations, service health, route synchronization, and operational incidents in real time.", focus: "Service health · integrations · incidents" },
    am: { title: "የቴክኒክ ቡድን የስራ ቦታ", description: "የሲስተም ጤና፣ የመንገድ ማመሳሰል እና የስራ ችግሮችን በቅጽበት ይከታተሉ።", focus: "የሲስተም ጤና · ውህደቶች · ችግሮች" },
  },
  client: {
    en: { title: "Client workspace", description: "Create and review bookings, track passenger movements, and keep client-facing service details clear.", focus: "Bookings · passengers · service" },
    am: { title: "የደንበኛ የስራ ቦታ", description: "ቦታ ማስያዣዎችን ይፍጠሩ፣ ተሳፋሪዎችን ይከታተሉ እና የደንበኛ አገልግሎት መረጃን ግልጽ ያድርጉ።", focus: "ቦታ ማስያዣ · ተሳፋሪዎች · አገልግሎት" },
  },
};

const navItems = [
  { icon: LayoutDashboard, key: "dashboard" as const },
  { icon: ClipboardList, key: "bookings" as const },
  { icon: Plane, key: "routes" as const },
  { icon: Users, key: "customers" as const },
  { icon: LifeBuoy, key: "support" as const },
];

const bookings = [
  { id: "RB-20841", passenger: "Mekdes Tadesse", initials: "MT", route: "ADD → DXB", date: "Aug 14 · 06:40", status: "confirmed", total: "$482.00", accent: "orange" },
  { id: "RB-20839", passenger: "Daniel Bekele", initials: "DB", route: "LHR → ADD", date: "Aug 14 · 11:15", status: "confirmed", total: "$729.00", accent: "blue" },
  { id: "RB-20836", passenger: "Sara Ahmed", initials: "SA", route: "ADD → NBO", date: "Aug 15 · 09:20", status: "pending", total: "$318.50", accent: "green" },
  { id: "RB-20831", passenger: "Yonas Tesfaye", initials: "YT", route: "CAI → ADD", date: "Aug 15 · 17:55", status: "confirmed", total: "$396.00", accent: "purple" },
];

const chartBars = [46, 64, 56, 78, 62, 84, 72, 92, 74, 88, 80, 96];

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [role, setRole] = useState<Role>("super");
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [search, setSearch] = useState("");
  const t = copy[language];

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => `${booking.id} ${booking.passenger} ${booking.route}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const notify = (message: string) => toast(message);

  const toggleTheme = () => {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="ltr">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-sidebar-border bg-sidebar px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <button className="flex items-center gap-3 text-left" onClick={() => notify("Runway Ledger workspace") }>
            <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#F26A3D] shadow-[0_10px_24px_rgba(242,106,61,0.25)]">
              <span className="relative block h-5 w-3 border-x-2 border-white"><span className="absolute -right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white" /></span>
            </span>
            <span>
              <span className="block font-display text-[15px] font-bold tracking-[-0.02em]">Runway Ledger</span>
              <span className="wayfinding-label text-muted-foreground">AIRLINE CMS</span>
            </span>
          </button>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="mt-10 px-2"><span className="wayfinding-label text-muted-foreground">{t.controlTower}</span></div>
        <nav className="mt-3 space-y-1">
          {navItems.map(({ icon: Icon, key }) => {
            const active = activeNav === key;
            return <button key={key} onClick={() => { setActiveNav(key); setMobileOpen(false); if (key !== "dashboard") notify(`${t[key]} · ${language === "en" ? "ready for configuration" : "ለማዋቀር ዝግጁ"}`); }} className={`nav-item flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition-all ${active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"}`}><Icon size={17} strokeWidth={active ? 2.3 : 1.8} /><span>{t[key]}</span>{active && <span className="ml-auto h-2 w-2 rounded-full bg-[#F26A3D]" />}</button>;
          })}
        </nav>

        <div className="mt-8 px-2"><span className="wayfinding-label text-muted-foreground">{t.flightOps}</span></div>
        <nav className="mt-3 space-y-1">
          {(role === "super" ? [{ icon: ShieldCheck, key: "team" as const }, { icon: Settings2, key: "settings" as const }] : role === "technical" ? [{ icon: Activity, key: "support" as const }, { icon: Settings2, key: "settings" as const }] : [{ icon: WalletCards, key: "bookings" as const }, { icon: CircleHelp, key: "support" as const }]).map(({ icon: Icon, key }) => <button key={key} onClick={() => notify(`${t[key]} · ${language === "en" ? "module selected" : "ሞጁል ተመርጧል"}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><Icon size={17} strokeWidth={1.8} /><span>{t[key]}</span></button>)}
        </nav>

        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" /><span className="wayfinding-label text-muted-foreground">SYSTEM STATUS</span></div>
          <p className="mt-3 text-[13px] font-semibold">All systems operational</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Last sync 2 minutes ago · 48 routes monitored</p>
        </div>
      </aside>

      {mobileOpen && <button className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}

      <main className="min-h-screen lg:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-4 px-5 sm:px-8">
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <div className="relative hidden max-w-[360px] flex-1 sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="h-10 rounded-xl border-border/70 bg-card pl-9 text-xs shadow-none" /><span className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground md:flex"><Command size={10} /> K</span></div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="hidden h-10 gap-2 rounded-xl border-border/80 bg-card font-semibold sm:flex" onClick={() => setLanguage(language === "en" ? "am" : "en")}><Globe2 size={15} /> {language === "en" ? "አማ" : "EN"}</Button>
              <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground" aria-label={dark ? t.light : t.dark}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
              <button onClick={() => notify(language === "en" ? "You have 3 operational notifications" : "3 የስራ ማሳወቂያዎች አሉዎት")} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground"><Bell size={16} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#F26A3D]" /></button>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <div className="relative flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#183B56] text-xs font-bold text-white">ST</div><div className="hidden leading-tight lg:block"><div className="text-xs font-bold">Selam Tesfaye</div><div className="text-[11px] text-muted-foreground">{t[roleLabels[role]]}</div></div><ChevronDown size={14} className="hidden text-muted-foreground lg:block" /></div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 sm:py-9">
          <section className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div><div className="mb-3 flex items-center gap-2"><span className="h-px w-7 bg-[#F26A3D]" /><span className="wayfinding-label text-[#F26A3D]">{t.overview}</span></div><h1 className="font-display text-3xl font-bold tracking-[-0.045em] sm:text-[38px]">{t.greeting}</h1><p className="mt-2 text-sm text-muted-foreground">{t.operations} <span className="mx-2 text-border">/</span> {t.currentPeriod}</p></div>
            <div className="flex flex-wrap items-center gap-2"><Button variant="outline" className="h-10 rounded-xl bg-card text-xs font-semibold" onClick={() => notify(`${t.currentPeriod} · ${language === "en" ? "date range selected" : "የቀን ክልል ተመርጧል"}`)}><CalendarDays size={15} className="mr-2" />{t.currentPeriod}<ChevronDown size={14} className="ml-2" /></Button><Button className="h-10 rounded-xl bg-[#F26A3D] px-4 text-xs font-bold text-white shadow-[0_8px_18px_rgba(242,106,61,0.22)] hover:bg-[#dd5930]" onClick={() => notify(`${t.newBooking} · ${language === "en" ? "booking flow opened" : "የማስያዣ ሂደት ተከፍቷል"}`)}><Plus size={16} className="mr-2" />{t.newBooking}</Button></div>
          </section>

          <section className="mb-7 overflow-hidden rounded-2xl border border-border/75 bg-card shadow-[0_8px_26px_rgba(24,59,86,0.04)]"><div className="flex flex-col gap-4 border-b border-dashed border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><div className="flex items-center gap-2"><span className="waypoint-dot" /><span className="wayfinding-label text-muted-foreground">{t.switchRole}</span></div><h2 className="mt-2 font-display text-base font-bold tracking-[-0.025em]">{roleCopy[role][language].title}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{roleCopy[role][language].description}</p></div><span className="rounded-full border border-[#F26A3D]/20 bg-[#F26A3D]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#D8532D]">{roleCopy[role][language].focus}</span></div><div className="flex flex-wrap gap-2 p-4 sm:p-5">{(["super", "technical", "client"] as Role[]).map((roleOption) => <button key={roleOption} onClick={() => setRole(roleOption)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${role === roleOption ? "border-[#F26A3D] bg-[#F26A3D] text-white shadow-[0_6px_14px_rgba(242,106,61,0.2)]" : "border-border bg-background text-muted-foreground hover:border-[#F26A3D]/50 hover:text-foreground"}`}><span className={`h-2 w-2 rounded-full ${role === roleOption ? "bg-white" : "bg-[#F26A3D]"}`} />{t[roleLabels[roleOption]]}</button>)}</div></section>

          <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t.activeBookings} value="1,284" change="12.6%" icon={ClipboardList} positive detail={language === "en" ? "vs last month" : "ካለፈው ወር"} />
            <StatCard label={t.revenue} value="$284.6k" change="8.4%" icon={CreditCard} positive detail={language === "en" ? "vs last month" : "ካለፈው ወር"} />
            <StatCard label={t.passengers} value="3,842" change="4.2%" icon={Users} positive detail={language === "en" ? "vs last month" : "ካለፈው ወር"} />
            <StatCard label={t.onTime} value="92.8%" change="1.8%" icon={Activity} positive={false} detail={language === "en" ? "vs last month" : "ካለፈው ወር"} />
          </section>

          <section className="mb-7 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="dashboard-card min-h-[318px] overflow-hidden p-5 sm:p-6"><div className="flex items-start justify-between border-b border-dashed border-border/80 pb-4"><div><div className="flex items-center gap-2"><span className="waypoint-dot" /><div className="wayfinding-label text-muted-foreground">{t.performance}</div></div><h2 className="mt-2 font-display text-lg font-bold tracking-[-0.025em]">Bookings & revenue trend</h2></div><button className="rounded-lg p-2 text-muted-foreground hover:bg-accent" onClick={() => notify("Performance view expanded")}><ArrowUpRight size={17} /></button></div><div className="mt-7 flex items-end justify-between gap-4"><div><div className="font-display text-[32px] font-bold tracking-[-0.05em]">$284,620</div><div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1 font-bold text-emerald-600"><ArrowUpRight size={13} /> 8.4%</span> {language === "en" ? "from the previous period" : "ከቀደመው ጊዜ"}</div></div><div className="hidden items-center gap-4 text-[11px] text-muted-foreground sm:flex"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#F26A3D]" />Revenue</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#183B56]" />Bookings</span></div></div><div className="mt-7 flex h-[120px] items-end gap-2 border-b border-border/80 pb-0 sm:gap-3">{chartBars.map((height, index) => <div key={index} className="group relative flex h-full flex-1 items-end gap-1"><div className="w-full rounded-t-md bg-[#183B56]/75 transition-all duration-200 group-hover:bg-[#183B56]" style={{ height: `${Math.max(22, height - 12)}%` }} /><div className="w-full rounded-t-md bg-[#F26A3D]/80 transition-all duration-200 group-hover:bg-[#F26A3D]" style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"><span>Aug 01</span><span>Aug 08</span><span>Aug 15</span><span>Aug 22</span><span>Aug 31</span></div></div>

            <div className="dashboard-card relative min-h-[318px] overflow-hidden bg-[#183B56] p-6 text-white"><div className="absolute inset-x-6 top-[68px] border-t border-dashed border-white/20" /><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('/manus-storage/ethiopian-route-map_2566119d.png')", backgroundPosition: "center", backgroundSize: "cover" }} /><div className="relative z-10 flex h-full flex-col"><div className="flex items-center justify-between"><div><div className="wayfinding-label text-white/55">{t.nextMovement}</div><h2 className="mt-2 font-display text-lg font-bold">ET 602 · Addis Ababa</h2></div><span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">On time</span></div><div className="my-auto py-6"><div className="flex items-center gap-3"><div><div className="font-display text-3xl font-bold">ADD</div><div className="mt-1 text-xs text-white/55">06:40 EAT</div></div><div className="relative mx-1 h-px flex-1 bg-white/25"><span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#F26A3D]/50 bg-[#183B56]"><Plane size={13} className="rotate-90 text-[#F26A3D]" /></span></div><div className="text-right"><div className="font-display text-3xl font-bold">DXB</div><div className="mt-1 text-xs text-white/55">11:15 GST</div></div></div></div><div className="flex items-center justify-between border-t border-white/15 pt-4 text-xs"><span className="text-white/60">Gate B12 · 4h 35m · 238 seats</span><button onClick={() => notify(t.viewManifest)} className="flex items-center gap-1.5 font-bold text-[#ff9b78] transition hover:text-white">{t.viewManifest}<ArrowUpRight size={14} /></button></div></div></div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="dashboard-card overflow-hidden"><div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="wayfinding-label text-muted-foreground">{t.bookingId}</div><h2 className="mt-2 font-display text-lg font-bold">{t.recentBookings}</h2></div><button onClick={() => notify(t.viewAll)} className="flex items-center gap-1.5 text-xs font-bold text-[#F26A3D] hover:text-[#dd5930]">{t.viewAll}<ArrowUpRight size={14} /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[670px] text-left"><thead className="bg-muted/35 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-bold sm:px-6">{t.bookingId}</th><th className="px-3 py-3 font-bold">{t.passenger}</th><th className="px-3 py-3 font-bold">{t.route}</th><th className="px-3 py-3 font-bold">{t.departure}</th><th className="px-3 py-3 font-bold">{t.status}</th><th className="px-5 py-3 text-right font-bold sm:px-6">{t.total}</th></tr></thead><tbody className="divide-y divide-border/70">{filteredBookings.map((booking) => <tr key={booking.id} className="group transition hover:bg-muted/30"><td className="px-5 py-4 font-mono text-xs font-semibold text-muted-foreground sm:px-6">{booking.id}</td><td className="px-3 py-4"><div className="flex items-center gap-2.5"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${booking.accent === "orange" ? "bg-orange-100 text-orange-700" : booking.accent === "blue" ? "bg-blue-100 text-blue-700" : booking.accent === "green" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>{booking.initials}</span><span className="whitespace-nowrap text-xs font-bold">{booking.passenger}</span></div></td><td className="px-3 py-4"><span className="route-chip"><span className="waypoint-dot waypoint-dot--small" />{booking.route}</span></td><td className="whitespace-nowrap px-3 py-4 text-xs text-muted-foreground">{booking.date}</td><td className="px-3 py-4"><Badge variant="outline" className={`rounded-full border-0 px-2.5 py-1 text-[10px] font-bold ${booking.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{booking.status === "confirmed" ? t.confirmed : t.pending}</Badge></td><td className="px-5 py-4 text-right font-display text-xs font-bold sm:px-6">{booking.total}</td></tr>)}</tbody></table></div></div>

            <div className="space-y-5"><div className="dashboard-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="wayfinding-label text-muted-foreground">{t.flightHealth}</div><h2 className="mt-2 font-display text-lg font-bold">Network snapshot</h2></div><Activity size={18} className="text-[#F26A3D]" /></div><div className="mt-5 space-y-4"><HealthRow label="Flights today" value="38 / 42" percent={90} color="orange" /><HealthRow label="Seats occupied" value="78%" percent={78} color="blue" /><HealthRow label="Payment success" value="96.4%" percent={96} color="green" /></div></div><div className="dashboard-card relative overflow-hidden p-5 sm:p-6"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#F26A3D]/10" /><div className="relative flex items-start justify-between"><div><div className="wayfinding-label text-muted-foreground">{t.weather}</div><h2 className="mt-2 font-display text-lg font-bold">Bole International</h2><p className="mt-2 text-xs text-muted-foreground">{t.clearSkies}</p></div><CloudSun size={25} className="text-[#F26A3D]" /></div><div className="mt-5 flex items-center justify-between"><div className="font-display text-4xl font-bold tracking-[-0.06em]">21°</div><div className="text-right text-[11px] leading-5 text-muted-foreground">Visibility 10km<br />Wind 8 km/h</div></div></div></div>
          </section>

          <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-border/70 pt-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Runway Ledger CMS · v2.4.1</div><div className="flex flex-wrap items-center gap-4"><button className="hover:text-foreground" onClick={() => notify(t.support)}>{t.support}</button><button className="hover:text-foreground" onClick={() => notify(t.settings)}>{t.settings}</button><button className="hover:text-foreground" onClick={() => setRole(role === "super" ? "technical" : role === "technical" ? "client" : "super")}>{t.switchRole}: {t[roleLabels[role]]}</button><button className="flex items-center gap-1 hover:text-foreground" onClick={() => setLanguage(language === "en" ? "am" : "en")}><Globe2 size={12} /> {t.language}</button></div></footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon, positive, detail }: { label: string; value: string; change: string; icon: typeof Activity; positive: boolean; detail: string }) {
  return <div className="dashboard-card relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(24,59,86,0.08)]"><span className="ticket-notch ticket-notch--left" /><span className="ticket-notch ticket-notch--right" /><div className="flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F26A3D]/10 text-[#F26A3D]"><Icon size={17} /></div><span className={`flex items-center gap-0.5 text-[11px] font-bold ${positive ? "text-emerald-600" : "text-rose-500"}`}>{positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span></div><div className="mt-5"><div className="wayfinding-label text-muted-foreground">{label}</div><div className="mt-1 font-display text-[26px] font-bold tracking-[-0.05em]">{value}</div><div className="mt-1 text-[11px] text-muted-foreground">{detail}</div></div></div>;
}

function HealthRow({ label, value, percent, color }: { label: string; value: string; percent: number; color: "orange" | "blue" | "green" }) {
  const colors = { orange: "bg-[#F26A3D]", blue: "bg-[#183B56]", green: "bg-emerald-500" };
  return <div><div className="mb-2 flex justify-between text-xs"><span className="font-semibold">{label}</span><span className="font-mono text-muted-foreground">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${colors[color]}`} style={{ width: `${percent}%` }} /></div></div>;
}
