import { ArrowUpRight, Instagram, MapPin, MessageCircle, Send, Github, Facebook } from "lucide-react";
import type { Language } from "@shared/i18n";
import { siteContent, socialLinks } from "@shared/i18n";

const portrait = "/manus-storage/my-cold-life-portrait-2_21db12cc.jpg";

export default function About({ language }: { language: Language }) {
  const t = siteContent[language];
  const socials = [
    { key: "instagram", label: "Instagram", href: socialLinks.instagram, icon: Instagram },
    { key: "telegram", label: "Telegram", href: socialLinks.telegram, icon: Send },
    { key: "facebook", label: "Facebook", href: socialLinks.facebook, icon: Facebook },
    { key: "whatsapp", label: "WhatsApp", href: socialLinks.whatsapp, icon: MessageCircle },
    { key: "github", label: "GitHub", href: socialLinks.github, icon: Github },
  ];
  return <section className="page-section"><div className="container page-intro"><p className="eyebrow">{t.about.eyebrow}</p><h1>{t.about.title}</h1><p className="page-lead">{t.about.body}</p></div><div className="container about-grid"><div className="about-image"><img src={portrait} alt="Calathea plant in a refined interior" /><span className="image-caption">My Cold Life / 2026</span></div><div className="about-details"><div className="detail-block"><p className="footer-label"><MapPin size={15} /> {t.about.addressLabel}</p><p className="detail-value">{t.about.address}</p></div><div className="detail-block"><p className="footer-label">{t.about.socialLabel}</p><div className="social-list">{socials.map(({ key, label, href, icon: Icon }) => <a key={key} href={href} target="_blank" rel="noreferrer"><span className="social-icon"><Icon size={16} /></span><span>{label}</span><ArrowUpRight size={15} /></a>)}</div></div><div className="quote-block"><span>“</span><p>{language === "en" ? "The most beautiful spaces leave room for something alive." : "በጣም የሚያምሩ ቦታዎች ለሕያው ነገር ቦታ ይተዋሉ።"}</p></div></div></div><div className="container account-note"><p className="eyebrow">Account care</p><p>{t.about.loginNote}</p></div></section>;
}
