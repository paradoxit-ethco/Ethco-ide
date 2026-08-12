export type Language = "en" | "am";

export const socialLinks = {
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",
  facebook: "https://facebook.com/",
  whatsapp: "https://wa.me/",
  github: "https://github.com/paradoxit-ethco/woreda4girls-hair",
} as const;

export const siteContent = {
  en: {
    nav: { home: "Home", about: "About", inventory: "Inventory", gallery: "Gallery", login: "Login", logout: "Sign out" },
    hero: {
      eyebrow: "Botanical living, considered",
      title: "Cultivate a life of quiet distinction.",
      subtitle: "My Cold Life curates resilient plants, refined spaces, and the rituals that bring them together.",
      amharic: "የተፈጥሮን ውበት በተረጋጋ እና በተመረጠ አኗኗር ይለማመዱ።",
      cta: "Explore the collection",
      secondary: "Our philosophy",
    },
    home: {
      collectionEyebrow: "The collection",
      collectionTitle: "Plants with presence.",
      collectionBody: "Each specimen is selected for its character, longevity, and ability to transform a room without asking for attention.",
      viewInventory: "View inventory",
      galleryEyebrow: "A considered atmosphere",
      galleryTitle: "A colder palette. A warmer life.",
      galleryBody: "Our visual language pairs forest tones with luminous metal, natural texture, and the quiet geometry of living things.",
      aboutCta: "Discover My Cold Life",
    },
    about: {
      eyebrow: "The founder",
      title: "A life shaped by living things.",
      body: "My Cold Life began with a simple belief: a well-chosen plant can change the way a person moves through a room. We create considered plant collections for homes, studios, and spaces that value calm, craft, and permanence.",
      addressLabel: "Visit the studio",
      address: "Bole, Addis Ababa, Ethiopia",
      socialLabel: "Stay connected",
      loginNote: "Your account is secured through Manus OAuth. Passwords are managed by the identity provider.",
    },
    inventory: {
      eyebrow: "The inventory",
      title: "A curated botanical cabinet.",
      body: "Explore the current selection. Availability and care notes are managed from the private collection desk.",
      empty: "The cabinet is being refreshed. Return soon for the next selection.",
      height: "Mature height",
      care: "Care profile",
      easy: "Easy",
      moderate: "Moderate",
      viewDetails: "View details",
    },
    gallery: {
      eyebrow: "The gallery",
      title: "Spaces in quiet bloom.",
      body: "A visual study of plants, materials, and the spaces they make feel complete.",
    },
    footer: { statement: "A considered life, rooted in nature.", address: "Bole, Addis Ababa, Ethiopia", rights: "All rights reserved." },
    common: { language: "Amharic", theme: "Theme", light: "Light", dark: "Dark", close: "Close" },
  },
  am: {
    nav: { home: "መነሻ", about: "ስለ እኛ", inventory: "የእፅዋት ስብስብ", gallery: "ጋለሪ", login: "ግባ", logout: "ውጣ" },
    hero: {
      eyebrow: "የተመረጠ የተፈጥሮ አኗኗር",
      title: "የተረጋጋ እና የተለየ ሕይወት ይለማመዱ።",
      subtitle: "My Cold Life ጠንካራ እፅዋትን፣ የተሻሉ ቦታዎችን እና እነሱን የሚያገናኙ ልምዶችን ይመርጣል።",
      amharic: "የተፈጥሮን ውበት በተረጋጋ እና በተመረጠ አኗኗር ይለማመዱ።",
      cta: "ስብስቡን ይመልከቱ",
      secondary: "ፍልስፍናችን",
    },
    home: {
      collectionEyebrow: "ስብስቡ",
      collectionTitle: "ልዩ ባህሪ ያላቸው እፅዋት።",
      collectionBody: "እያንዳንዱ እፅዋት ባህሪውን፣ ዕድሜውን እና ክፍልን በጸጥታ የመቀየር ችሎታውን በማየት ይመረጣል።",
      viewInventory: "ስብስቡን ይመልከቱ",
      galleryEyebrow: "የተመረጠ ከባቢ",
      galleryTitle: "ጥልቅ ቀለም። ሙቅ ሕይወት።",
      galleryBody: "የእኛ ምስላዊ ቋንቋ የደን ቀለሞችን ከብረት፣ ከተፈጥሯዊ ሸካራነት እና ከሕያዋን ነገሮች ጂኦሜትሪ ጋር ያጣምራል።",
      aboutCta: "ስለ My Cold Life ይወቁ",
    },
    about: {
      eyebrow: "መስራቹ",
      title: "በሕያዋን ነገሮች የተቀረጸ ሕይወት።",
      body: "My Cold Life የተጀመረው በአንድ ቀላል እምነት ነው፤ በጥንቃቄ የተመረጠ እፅዋት አንድ ሰው በክፍሉ ውስጥ የሚንቀሳቀስበትን መንገድ ሊቀይር ይችላል።",
      addressLabel: "ስቱዲዮውን ይጎብኙ",
      address: "ቦሌ፣ አዲስ አበባ፣ ኢትዮጵያ",
      socialLabel: "ከእኛ ጋር ይገናኙ",
      loginNote: "መለያዎ በ Manus OAuth የተጠበቀ ነው። የይለፍ ቃላት በመለያ አቅራቢው ይተዳደራሉ።",
    },
    inventory: {
      eyebrow: "የእፅዋት ስብስብ",
      title: "የተመረጠ የእፅዋት ካቢኔ።",
      body: "የአሁኑን ምርጫ ይመልከቱ። መገኘት እና የእንክብካቤ ማስታወሻዎች ከግል የስብስብ ዴስክ ይተዳደራሉ።",
      empty: "ካቢኔው በመታደስ ላይ ነው። ለቀጣዩ ምርጫ በቅርቡ ይመለሱ።",
      height: "የተሟላ ቁመት",
      care: "የእንክብካቤ ደረጃ",
      easy: "ቀላል",
      moderate: "መካከለኛ",
      viewDetails: "ዝርዝር ይመልከቱ",
    },
    gallery: { eyebrow: "ጋለሪ", title: "በጸጥታ የሚያብቡ ቦታዎች።", body: "የእፅዋት፣ የቁሳቁስ እና ቦታን የተሟላ የሚያደርጉ ነገሮች ምስላዊ ጥናት።" },
    footer: { statement: "በተፈጥሮ ሥር የሰደደ የተመረጠ ሕይወት።", address: "ቦሌ፣ አዲስ አበባ፣ ኢትዮጵያ", rights: "መብቱ በሙሉ የተጠበቀ ነው።" },
    common: { language: "English", theme: "ገጽታ", light: "ብርሃን", dark: "ጨለማ", close: "ዝጋ" },
  },
} as const;

export const plantSeeds = [
  { slug: "monstera-deliciosa", name: "Monstera Deliciosa", nameAm: "ሞንስቴራ ዴሊሲዮሳ", description: "A generous silhouette with sculptural leaves and an instinct for making an entrance.", descriptionAm: "በተቀረጹ ቅጠሎች ክፍልን የሚያስውብ እፅዋት።", imageUrl: "/manus-storage/my-cold-life-hero_4048e8f9.jpg", height: "1.8m", care: "Moderate", featured: true },
  { slug: "fiddle-leaf-fig", name: "Fiddle Leaf Fig", nameAm: "ፊድል ሊፍ ፊግ", description: "Tall, architectural, and quietly confident in a room with natural light.", descriptionAm: "በተፈጥሯዊ ብርሃን የሚያድግ ረጅም እና ውብ እፅዋት።", imageUrl: "/manus-storage/my-cold-life-portrait-1_7b783ea1.jpg", height: "1.6m", care: "Moderate", featured: true },
  { slug: "calathea-orbifolia", name: "Calathea Orbifolia", nameAm: "ካላቴያ ኦርቢፎሊያ", description: "Silvery leaf bands bring a composed rhythm to intimate corners.", descriptionAm: "ብርማ ቅጠሎቹ ለትንንሽ ቦታዎች ልዩ ውበት ይሰጣሉ።", imageUrl: "/manus-storage/my-cold-life-portrait-2_21db12cc.jpg", height: "0.8m", care: "Easy", featured: true },
] as const;

export type SiteContent = (typeof siteContent)[Language];
