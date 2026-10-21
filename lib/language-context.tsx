'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type AppLanguage = 'en' | 'hi'

export interface TranslationDictionary {
  brandName: string
  tagline: string
  navHome: string
  navPersonalize: string
  navWrite: string
  navAdmin: string
  navSignIn: string
  navJoin: string
  navSignOut: string
  creditsLeft: string
  penName: string
  // Hero
  heroBadge: string
  heroTitle1: string
  heroTitle2: string
  heroDesc: string
  heroBtnRead: string
  heroBtnPersonalize: string
  heroBtnWrite: string
  // Feed
  feedTitle: string
  feedSubtitle: string
  filterCategory: string
  filterLanguage: string
  resetFilters: string
  noStoriesTitle: string
  noStoriesDesc: string
  makeYourStory: string
  clearFilters: string
  // Categories
  catAll: string
  catBhabhi: string
  catAunty: string
  catPadosan: string
  catTeacherStudent: string
  catMaid: string
  catTravel: string
  catOutdoor: string
  catOffice: string
  catRomance: string
  catErotica: string
  catFantasy: string
  catTaboo: string
  // Languages
  langAll: string
  langEnglish: string
  langHindi: string
  langHinglish: string
  // Badges & cards
  minRead: string
  personalizedBadge: string
  spicyBadge: string
  explicitBadge: string
  // Footer
  footerRights: string
  footerAdultOnly: string
  footerSafeHarbor: string
  // Personalize page
  personalizeTitle: string
  personalizeSubtitle: string
  premiseLabel: string
  maleCharLabel: string
  femaleCharLabel: string
  moodLabel: string
  btnCreateStory: string
  creatingDraft: string
  reviewTitle: string
  publishDirectly: string
  copyStory: string
  saveToLibrary: string
  // Age gate
  ageGateTitle: string
  ageGateLegal: string
  ageGateEnter: string
  ageGateExit: string
}

const translations: Record<AppLanguage, TranslationDictionary> = {
  en: {
    brandName: 'Kinkyomen',
    tagline: 'Adult Romance & Taboo Realm',
    navHome: 'Home',
    navPersonalize: 'Personalize',
    navWrite: 'Write Story',
    navAdmin: 'Admin Panel',
    navSignIn: 'Sign In',
    navJoin: 'Join',
    navSignOut: 'Sign Out',
    creditsLeft: 'Credits left',
    penName: 'Pen Name',
    heroBadge: 'Adult Romance & Taboo Stories',
    heroTitle1: 'Awaken Your Deepest Desires',
    heroTitle2: 'In The Midnight Realm',
    heroDesc:
      'Immerse yourself in deeply sensual romances, high-fantasy erotic sagas, and taboo encounters. Browse community tales or personalize your own custom fantasy.',
    heroBtnRead: 'Start Reading',
    heroBtnPersonalize: 'Personalize Story',
    heroBtnWrite: 'Write Story',
    feedTitle: 'Stories Feed',
    feedSubtitle: 'Stories curated for mature readers (18+ only)',
    filterCategory: 'Category:',
    filterLanguage: 'Language:',
    resetFilters: 'Reset Filters',
    noStoriesTitle: 'No Stories Found',
    noStoriesDesc: 'There are no stories matching the selected filters.',
    makeYourStory: 'Make Your Story',
    clearFilters: 'Clear Filters',
    catAll: 'All',
    catBhabhi: 'Bhabhi',
    catAunty: 'Aunty',
    catPadosan: 'Neighbor / Padosan',
    catTeacherStudent: 'Teacher & Student',
    catMaid: 'Maid & Boss',
    catTravel: 'Travel & Vacation',
    catOutdoor: 'Outdoor & Public',
    catOffice: 'Office & Boss',
    catRomance: 'Romance',
    catErotica: 'Erotica',
    catFantasy: 'Fantasy',
    catTaboo: 'Taboo',
    langAll: 'All',
    langEnglish: 'English',
    langHindi: 'Hindi',
    langHinglish: 'Hinglish',
    minRead: 'min read',
    personalizedBadge: 'Personalized',
    spicyBadge: 'Spicy',
    explicitBadge: 'Explicit',
    footerRights: '© 2026 Kinkyomen. All rights reserved.',
    footerAdultOnly: '18+ Adult Stories',
    footerSafeHarbor: '18+ Safe-Harbor Compliant',
    personalizeTitle: 'Personalize Your Story',
    personalizeSubtitle:
      'Tailor characters, mood, and authentic dialogues crafted around your unique fantasy.',
    premiseLabel: 'Story Premise / Scenario',
    maleCharLabel: 'Male Lead Details',
    femaleCharLabel: 'Female Lead Details',
    moodLabel: 'Mood & Flavor',
    btnCreateStory: 'Create Story Draft',
    creatingDraft: 'Drafting your custom fantasy...',
    reviewTitle: 'Live Editor & Story Manuscript',
    publishDirectly: 'Publish Directly to Live Feed',
    copyStory: 'Copy Story',
    saveToLibrary: 'Save to My Stories',
    ageGateTitle: '18+ Adult Content Verification',
    ageGateLegal:
      'This website contains sexually explicit content, mature romance, and taboo themes. You must be at least 18 years old (or the legal age of majority in your jurisdiction) to enter.',
    ageGateEnter: 'I am 18 or Older - Enter',
    ageGateExit: 'Exit',
  },
  hi: {
    brandName: 'Kinkyomen',
    tagline: 'कामुक रोमांस और वर्जित दास्तानें',
    navHome: 'होम',
    navPersonalize: 'पर्सनलाइज़',
    navWrite: 'कहानी लिखें',
    navAdmin: 'एडमिन पैनल',
    navSignIn: 'साइन इन',
    navJoin: 'जुड़ें',
    navSignOut: 'लॉग आउट',
    creditsLeft: 'क्रेडिट्स शेष',
    penName: 'उपनाम',
    heroBadge: 'वयस्क रोमांस और फंतासी का संसार',
    heroTitle1: 'अपनी सबसे गहरी इच्छाओं और',
    heroTitle2: 'कामुक फंतासियों में खो जाएं',
    heroDesc:
      'गहरी कामुक कहानियाँ, वर्जित रिश्ते और रात की दास्तानें। समुदाय की कहानियाँ पढ़ें या अपनी खुद की फंतासी को शब्दों में ढालें।',
    heroBtnRead: 'पढ़ना शुरू करें',
    heroBtnPersonalize: 'कहानी पर्सनलाइज़ करें',
    heroBtnWrite: 'कहानी लिखें',
    feedTitle: 'कहानियों की दुनिया',
    feedSubtitle: 'वयस्क पाठकों के लिए चुनिंदा कहानियाँ (केवल 18+)',
    filterCategory: 'श्रेणी:',
    filterLanguage: 'भाषा:',
    resetFilters: 'फ़िल्टर रीसेट करें',
    noStoriesTitle: 'कोई कहानी नहीं मिली',
    noStoriesDesc: 'चुने गए फ़िल्टर के अनुसार कोई कहानी उपलब्ध नहीं है।',
    makeYourStory: 'अपनी कहानी बनाएं',
    clearFilters: 'फ़िल्टर हटाएं',
    catAll: 'सभी',
    catBhabhi: 'भाभी',
    catAunty: 'आंटी',
    catPadosan: 'पड़ोसन',
    catTeacherStudent: 'शिक्षक और छात्र',
    catMaid: 'नौकरानी और मालिक',
    catTravel: 'सफ़र और छुट्टियां',
    catOutdoor: 'खुली जगहें',
    catOffice: 'दफ्तर और बॉस',
    catRomance: 'रोमांस',
    catErotica: 'कामुक',
    catFantasy: 'फंतासी',
    catTaboo: 'वर्जित',
    langAll: 'सभी',
    langEnglish: 'अंग्रेज़ी',
    langHindi: 'हिंदी',
    langHinglish: 'हिंग्लिश',
    minRead: 'मिनट की पढ़ाई',
    personalizedBadge: 'पर्सनलाइज़्ड',
    spicyBadge: 'मसालेदार',
    explicitBadge: 'वयस्क 18+',
    footerRights: '© 2026 Kinkyomen. सर्वाधिकार सुरक्षित।',
    footerAdultOnly: '18+ वयस्क कहानियाँ',
    footerSafeHarbor: '18+ सेफ़-हार्बर प्रमाणित',
    personalizeTitle: 'अपनी कहानी पर्सनलाइज़ करें',
    personalizeSubtitle:
      'अपनी पसंद के किरदार, माहौल और संवाद चुनकर अपनी अनोखी फंतासी तैयार करें।',
    premiseLabel: 'कहानी का कथानक / विचार',
    maleCharLabel: 'नायक का विवरण',
    femaleCharLabel: 'नायिका का विवरण',
    moodLabel: 'मूड और शैली',
    btnCreateStory: 'कहानी का ड्राफ्ट बनाएं',
    creatingDraft: 'आपकी फंतासी लिखी जा रही है...',
    reviewTitle: 'लाइव एडिटर और कहानी',
    publishDirectly: 'सीधे लाइव फ़ीड पर प्रकाशित करें',
    copyStory: 'कहानी कॉपी करें',
    saveToLibrary: 'मेरी कहानियों में सेव करें',
    ageGateTitle: '18+ कानूनी उम्र सत्यापन',
    ageGateLegal:
      'इस वेबसाइट में कामुक रोमांस, नग्नता और परिपक्व वयस्क विषय शामिल हैं। प्रवेश करने के लिए आपकी उम्र कम से कम 18 वर्ष (या आपके देश में कानूनी वयस्क उम्र) होनी चाहिए।',
    ageGateEnter: 'मेरी उम्र 18 या अधिक है - प्रवेश करें',
    ageGateExit: 'बाहर निकलें',
  },
}

interface LanguageContextType {
  lang: AppLanguage
  setLang: (lang: AppLanguage) => void
  t: TranslationDictionary
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLanguage>('en')

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem('kinkyomen_lang') as AppLanguage | null
    if (saved === 'hi' || saved === 'en') {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: AppLanguage) => {
    setLangState(newLang)
    localStorage.setItem('kinkyomen_lang', newLang)
    document.cookie = `kinkyomen_lang=${newLang}; path=/; max-age=31536000`
    document.documentElement.lang = newLang
  }

  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en')
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang],
        toggleLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
