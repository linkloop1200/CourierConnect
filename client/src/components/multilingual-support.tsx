import { useState, createContext, useContext, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

interface Translations {
  [key: string]: {
    [languageCode: string]: string;
  };
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages: Language[] = [
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' }
];

const translations: Translations = {
  // App Navigation
  'app.title': {
    nl: 'Spoedpakketjes',
    en: 'Express Packages',
    de: 'Express Pakete',
    fr: 'Colis Express',
    es: 'Paquetes Express',
    it: 'Pacchi Express',
    pt: 'Pacotes Expressos',
    pl: 'Paczki Express',
    tr: 'Hızlı Paketler',
    ar: 'الطرود السريعة',
    zh: '快递包裹',
    ja: 'エクスプレス配送'
  },
  'nav.home': {
    nl: 'Home',
    en: 'Home',
    de: 'Startseite',
    fr: 'Accueil',
    es: 'Inicio',
    it: 'Home',
    pt: 'Início',
    pl: 'Strona główna',
    tr: 'Ana Sayfa',
    ar: 'الرئيسية',
    zh: '首页',
    ja: 'ホーム'
  },
  'nav.delivery': {
    nl: 'Bezorgen',
    en: 'Delivery',
    de: 'Lieferung',
    fr: 'Livraison',
    es: 'Entrega',
    it: 'Consegna',
    pt: 'Entrega',
    pl: 'Dostawa',
    tr: 'Teslimat',
    ar: 'التوصيل',
    zh: '配送',
    ja: '配送'
  },
  'nav.tracking': {
    nl: 'Volgen',
    en: 'Tracking',
    de: 'Verfolgung',
    fr: 'Suivi',
    es: 'Seguimiento',
    it: 'Tracciamento',
    pt: 'Rastreamento',
    pl: 'Śledzenie',
    tr: 'Takip',
    ar: 'التتبع',
    zh: '跟踪',
    ja: '追跡'
  },
  // Delivery Types
  'delivery.package': {
    nl: 'Pakket',
    en: 'Package',
    de: 'Paket',
    fr: 'Colis',
    es: 'Paquete',
    it: 'Pacco',
    pt: 'Pacote',
    pl: 'Paczka',
    tr: 'Paket',
    ar: 'طرد',
    zh: '包裹',
    ja: '荷物'
  },
  'delivery.letter': {
    nl: 'Brief',
    en: 'Letter',
    de: 'Brief',
    fr: 'Lettre',
    es: 'Carta',
    it: 'Lettera',
    pt: 'Carta',
    pl: 'List',
    tr: 'Mektup',
    ar: 'رسالة',
    zh: '信件',
    ja: '手紙'
  },
  // Status Messages
  'status.pending': {
    nl: 'In behandeling',
    en: 'Pending',
    de: 'Ausstehend',
    fr: 'En attente',
    es: 'Pendiente',
    it: 'In attesa',
    pt: 'Pendente',
    pl: 'Oczekuje',
    tr: 'Beklemede',
    ar: 'في الانتظار',
    zh: '待处理',
    ja: '保留中'
  },
  'status.picked_up': {
    nl: 'Opgehaald',
    en: 'Picked up',
    de: 'Abgeholt',
    fr: 'Récupéré',
    es: 'Recogido',
    it: 'Ritirato',
    pt: 'Coletado',
    pl: 'Odebrane',
    tr: 'Alındı',
    ar: 'تم الاستلام',
    zh: '已取件',
    ja: '集荷済み'
  },
  'status.delivered': {
    nl: 'Bezorgd',
    en: 'Delivered',
    de: 'Zugestellt',
    fr: 'Livré',
    es: 'Entregado',
    it: 'Consegnato',
    pt: 'Entregue',
    pl: 'Dostarczono',
    tr: 'Teslim edildi',
    ar: 'تم التوصيل',
    zh: '已送达',
    ja: '配達完了'
  },
  // Forms
  'form.pickup_address': {
    nl: 'Ophaaladres',
    en: 'Pickup address',
    de: 'Abholadresse',
    fr: 'Adresse de collecte',
    es: 'Dirección de recogida',
    it: 'Indirizzo di ritiro',
    pt: 'Endereço de coleta',
    pl: 'Adres odbioru',
    tr: 'Alma adresi',
    ar: 'عنوان الاستلام',
    zh: '取件地址',
    ja: '集荷先住所'
  },
  'form.delivery_address': {
    nl: 'Bezorgadres',
    en: 'Delivery address',
    de: 'Lieferadresse',
    fr: 'Adresse de livraison',
    es: 'Dirección de entrega',
    it: 'Indirizzo di consegna',
    pt: 'Endereço de entrega',
    pl: 'Adres dostawy',
    tr: 'Teslimat adresi',
    ar: 'عنوان التوصيل',
    zh: '配送地址',
    ja: '配送先住所'
  },
  // Buttons
  'button.send_package': {
    nl: 'Verstuur pakket',
    en: 'Send package',
    de: 'Paket senden',
    fr: 'Envoyer le colis',
    es: 'Enviar paquete',
    it: 'Invia pacco',
    pt: 'Enviar pacote',
    pl: 'Wyślij paczkę',
    tr: 'Paket gönder',
    ar: 'إرسال الطرد',
    zh: '发送包裹',
    ja: '荷物を送る'
  },
  'button.track_package': {
    nl: 'Pakket volgen',
    en: 'Track package',
    de: 'Paket verfolgen',
    fr: 'Suivre le colis',
    es: 'Seguir paquete',
    it: 'Traccia pacco',
    pt: 'Rastrear pacote',
    pl: 'Śledź paczkę',
    tr: 'Paketi takip et',
    ar: 'تتبع الطرد',
    zh: '跟踪包裹',
    ja: '荷物を追跡'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return saved || 'nl';
  });

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('selectedLanguage', code);
    
    // Set document direction for RTL languages
    const language = availableLanguages.find(lang => lang.code === code);
    document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const t = (key: string): string => {
    return translations[key]?.[currentLanguage] || translations[key]?.['nl'] || key;
  };

  useEffect(() => {
    const language = availableLanguages.find(lang => lang.code === currentLanguage);
    document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages: availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageSelectorProps {
  variant?: "compact" | "full";
}

export function LanguageSelector({ variant = "compact" }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);
  const popularLanguages = languages.filter(lang => ['nl', 'en', 'de', 'fr', 'es'].includes(lang.code));

  if (variant === "compact") {
    return (
      <Select value={currentLanguage} onValueChange={setLanguage}>
        <SelectTrigger className="w-auto min-w-[120px]">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentLang?.flag}</span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-2">
                <span>{language.flag}</span>
                <span>{language.nativeName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Taal selecteren / Choose Language</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Populaire talen</h4>
            <div className="grid grid-cols-1 gap-2">
              {popularLanguages.map((language) => (
                <Button
                  key={language.code}
                  variant={currentLanguage === language.code ? "default" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => setLanguage(language.code)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{language.flag}</span>
                      <div className="text-left">
                        <p className="font-medium">{language.nativeName}</p>
                        <p className="text-xs text-gray-500">{language.name}</p>
                      </div>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Minder talen' : 'Meer talen'} ({languages.length - popularLanguages.length})
            </Button>
          </div>

          {showAll && (
            <div>
              <h4 className="font-medium mb-3">Alle talen</h4>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {languages
                  .filter(lang => !popularLanguages.includes(lang))
                  .map((language) => (
                    <Button
                      key={language.code}
                      variant={currentLanguage === language.code ? "default" : "outline"}
                      className="justify-start h-auto p-3"
                      onClick={() => setLanguage(language.code)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{language.flag}</span>
                          <div className="text-left">
                            <p className="font-medium">{language.nativeName}</p>
                            <p className="text-xs text-gray-500">{language.name}</p>
                          </div>
                        </div>
                        {currentLanguage === language.code && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Huidige taal:</span>
              <Badge variant="outline">
                {currentLang?.flag} {currentLang?.nativeName}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MultilingualSupport() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Meertalige Ondersteuning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Spoedpakketjes ondersteunt {availableLanguages.length} talen om onze service 
              toegankelijk te maken voor internationale gebruikers.
            </p>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-blue">{availableLanguages.length}</p>
                <p className="text-sm text-gray-600">Talen</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-sm text-gray-600">Interface</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">RTL</p>
                <p className="text-sm text-gray-600">Ondersteuning</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">Auto</p>
                <p className="text-sm text-gray-600">Detectie</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LanguageSelector variant="full" />
    </div>
  );
}