import { ArrowUpRight, Droplets, Ruler } from "lucide-react";
import type { Language } from "@shared/i18n";
import { plantSeeds, siteContent } from "@shared/i18n";
import { trpc } from "@/lib/trpc";

export default function Inventory({ language }: { language: Language }) {
  const t = siteContent[language];
  const { data, isLoading } = trpc.plants.list.useQuery();
  const plants = data || plantSeeds;
  return <section className="page-section"><div className="container page-intro inventory-intro"><div><p className="eyebrow">{t.inventory.eyebrow}</p><h1>{t.inventory.title}</h1></div><p className="page-lead">{t.inventory.body}</p></div><div className="container inventory-grid">{isLoading ? [1, 2, 3].map((item) => <div className="skeleton-card" key={item} />) : plants.length === 0 ? <div className="empty-state">{t.inventory.empty}</div> : plants.map((plant) => <article className="inventory-card" key={plant.slug}><div className="inventory-image"><img src={plant.imageUrl} alt={language === "en" ? plant.name : plant.nameAm} /><span className="inventory-tag">{plant.care === "Easy" ? t.inventory.easy : t.inventory.moderate}</span></div><div className="inventory-copy"><p className="plant-name">{language === "en" ? plant.name : plant.nameAm}</p><p className="plant-description">{language === "en" ? plant.description : plant.descriptionAm}</p><div className="inventory-meta"><span><Ruler size={14} /> {t.inventory.height}: {plant.height}</span><span><Droplets size={14} /> {t.inventory.care}: {plant.care === "Easy" ? t.inventory.easy : t.inventory.moderate}</span></div><button className="inventory-detail">{t.inventory.viewDetails}<ArrowUpRight size={15} /></button></div></article>)}</div></section>;
}
