import { ArrowUpRight } from "lucide-react";
import type { Language } from "@shared/i18n";
import { siteContent } from "@shared/i18n";

const images = [
  { src: "/manus-storage/my-cold-life-gallery-interior_4898946e.jpg", alt: "Plant-filled reading room", className: "gallery-large" },
  { src: "/manus-storage/my-cold-life-portrait-1_7b783ea1.jpg", alt: "Fiddle leaf fig in a charcoal planter", className: "gallery-tall" },
  { src: "/manus-storage/my-cold-life-portrait-2_21db12cc.jpg", alt: "Calathea in ivory ceramic planter", className: "gallery-square" },
  { src: "/manus-storage/my-cold-life-hero_4048e8f9.jpg", alt: "Monstera in a dark green interior", className: "gallery-wide" },
];

export default function Gallery({ language }: { language: Language }) {
  const t = siteContent[language];
  return <section className="page-section gallery-page"><div className="container page-intro"><p className="eyebrow">{t.gallery.eyebrow}</p><h1>{t.gallery.title}</h1><p className="page-lead">{t.gallery.body}</p></div><div className="container gallery-grid">{images.map((image, index) => <figure className={`gallery-item ${image.className}`} key={image.src}><img src={image.src} alt={image.alt} /><figcaption><span>0{index + 1} / My Cold Life</span><ArrowUpRight size={15} /></figcaption></figure>)}</div></section>;
}
