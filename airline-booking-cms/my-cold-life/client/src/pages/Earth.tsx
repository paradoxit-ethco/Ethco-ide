import { ArrowUpRight, CircleDot, Globe2, Orbit } from "lucide-react";
import type { Language } from "@shared/i18n";
import { earthContent } from "@shared/i18n";

const comparisonImage = "/manus-storage/my-cold-life-earth-comparison_2cabeec6.jpg";

export default function Earth({ language }: { language: Language }) {
  const t = earthContent[language];
  return <section className="page-section earth-page"><div className="container page-intro"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="page-lead">{t.intro}</p></div><div className="container earth-visual"><img src={comparisonImage} alt={language === "en" ? "Solar System and Earth comparison" : "የስርዓተ ፀሐይ እና የመሬት ንጽጽር"} /><div className="earth-visual-label"><Globe2 size={16} /> {t.caption}</div></div><div className="container earth-comparison"><article className="earth-card solar-card"><div className="earth-card-icon"><Orbit size={24} /></div><p className="eyebrow">01 / {t.solarTitle}</p><h2>{t.solarTitle}</h2><p>{t.solarBody}</p><ul>{t.solarFacts.map((fact) => <li key={fact}><CircleDot size={12} />{fact}</li>)}</ul></article><article className="earth-card earth-card-highlight"><div className="earth-card-icon"><Globe2 size={24} /></div><p className="eyebrow">02 / {t.earthTitle}</p><h2>{t.earthTitle}</h2><p>{t.earthBody}</p><ul>{t.earthFacts.map((fact) => <li key={fact}><CircleDot size={12} />{fact}</li>)}</ul></article></div><div className="container earth-summary"><span className="summary-line" /><p>{t.summary}</p><ArrowUpRight size={18} /></div></section>;
}
