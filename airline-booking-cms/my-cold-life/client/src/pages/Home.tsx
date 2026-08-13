import { Link } from "wouter";
import { ArrowUpRight, ChevronRight, Leaf, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { Language } from "@shared/i18n";
import { plantSeeds, siteContent } from "@shared/i18n";

const heroImage = "/manus-storage/my-cold-life-hero_4048e8f9.jpg";
const galleryImage = "/manus-storage/my-cold-life-gallery-interior_4898946e.jpg";

export default function Home({ language }: { language: Language }) {
  const t = siteContent[language];
  const plantsQuery = trpc.plants.list.useQuery();
  const plants = (plantsQuery.data?.slice(0, 3) || plantSeeds).map((plant, index) => ({ ...plant, id: "id" in plant ? plant.id : index }));
  return <>
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(9,24,19,.96) 0%, rgba(9,24,19,.76) 43%, rgba(9,24,19,.08) 100%), url(${heroImage})` }}>
      <div className="container hero-content"><p className="eyebrow">{t.hero.eyebrow}</p><h1>{t.hero.title}</h1><p className="hero-subtitle">{t.hero.subtitle}</p><p className="hero-amharic">{t.hero.amharic}</p><div className="hero-actions"><Link href="/inventory" className="button button-gold">{t.hero.cta}<ArrowUpRight size={16} /></Link><Link href="/about" className="text-link">{t.hero.secondary}<ChevronRight size={15} /></Link></div></div><div className="hero-note"><span className="rule" /> <span>01 / 04</span></div></section>
    <section className="section collection-section"><div className="container section-heading"><div><p className="eyebrow">{t.home.collectionEyebrow}</p><h2>{t.home.collectionTitle}</h2></div><div className="section-intro"><p>{t.home.collectionBody}</p><Link href="/inventory" className="text-link">{t.home.viewInventory}<ChevronRight size={15} /></Link></div></div><div className="container plant-grid">{plants.map((plant) => <article className="plant-card" key={plant.id}><div className="plant-image-wrap"><img src={plant.imageUrl} alt={language === "en" ? plant.name : plant.nameAm} /><span className="plant-index">0{plants.indexOf(plant) + 1}</span></div><div className="plant-card-copy"><div><p className="plant-name">{language === "en" ? plant.name : plant.nameAm}</p><p className="plant-description">{language === "en" ? plant.description : plant.descriptionAm}</p></div><span className="round-arrow"><ArrowUpRight size={16} /></span></div></article>)}</div></section>
    <section className="editorial-band" style={{ backgroundImage: `linear-gradient(90deg, rgba(13,31,24,.92), rgba(13,31,24,.25)), url(${galleryImage})` }}><div className="container editorial-copy"><p className="eyebrow">{t.home.galleryEyebrow}</p><h2>{t.home.galleryTitle}</h2><p>{t.home.galleryBody}</p><Link href="/gallery" className="button button-outline">{t.nav.gallery}<ArrowUpRight size={16} /></Link></div></section>
    <section className="section philosophy-section"><div className="container philosophy-grid"><div className="numbered-title"><span>02</span><p className="eyebrow">My Cold Life</p></div><div><h2>{t.home.aboutCta}</h2><p className="large-copy">{t.about.body}</p><Link href="/about" className="text-link">{t.home.aboutCta}<ArrowUpRight size={15} /></Link></div><div className="philosophy-stamp"><Leaf size={28} strokeWidth={1} /><span><MapPin size={13} /> Addis Ababa</span></div></div></section>
  </>;
}
