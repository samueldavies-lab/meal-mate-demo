import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart } from 'lucide-react';
import { useLanguage, LANGUAGES } from '@/lib/LanguageContext';
import { base44 } from '@/api/base44Client';

const factsByLang = {
  en: ["600 million stray dogs roam the world today","A single meal costs less than a cup of coffee","Your ads fund real meals for real dogs","Together we've fed thousands of strays worldwide"],
  fr: ["600 millions de chiens errants dans le monde","Un seul repas coûte moins qu'un café","Vos pubs financent de vrais repas pour de vrais chiens","Ensemble, nous avons nourri des milliers de chiens"],
  de: ["600 Millionen streunende Hunde weltweit","Eine Mahlzeit kostet weniger als ein Kaffee","Ihre Werbung finanziert echte Mahlzeiten","Zusammen haben wir Tausende ernährt"],
  es: ["600 millones de perros callejeros en el mundo","Una comida cuesta menos que un café","Tus anuncios financian comidas reales","Juntos hemos alimentado a miles de perros"],
  ko: ["전 세계 6억 마리의 유기견","한 끼 식사는 커피 한 잔보다 저렴해요","당신의 광고가 진짜 밥을 만들어요","함께 수천 마리를 먹였습니다"],
  ar: ["600 مليون كلب ضال في العالم","وجبة واحدة أرخص من كوب قهوة","إعلاناتك تمول وجبات حقيقية","معاً أطعمنا آلاف الكلاب"],
};

const dogPhotos = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c83f101e2_WhatsAppImage2026-02-17at192315.jpg",
];

export default function Welcome() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [factIndex, setFactIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // No redirect here — App.jsx handles sending logged-in users to /Home

  useEffect(() => {
    const facts = factsByLang[lang] || factsByLang.en;
    const factTimer = setInterval(() => {
      setFactIndex(i => (i + 1) % facts.length);
    }, 3000);
    const photoTimer = setInterval(() => {
      setPhotoIndex(i => (i + 1) % dogPhotos.length);
    }, 2500);
    return () => { clearInterval(factTimer); clearInterval(photoTimer); };
  }, [lang]);

  const facts = factsByLang[lang] || factsByLang.en;
  const goToRegister = () => {
    localStorage.setItem('mm_demo_v2_logged_in', '1');
    navigate('/Login?mode=signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 flex flex-col relative overflow-hidden" dir={LANGUAGES.find(l => l.code === lang)?.dir || 'ltr'}>
      {/* Language Picker */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <button
            onClick={() => setShowLangPicker(v => !v)}
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5 text-white text-sm flex items-center gap-1.5 hover:bg-white/30 transition-all"
          >
            <span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
            <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.label}</span>
            <span className="text-xs opacity-70">▾</span>
          </button>
          {showLangPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden min-w-[160px] z-30"
            >
              <p className="text-xs text-amber-600 font-semibold px-3 pt-2 pb-1">{t('splash_choose_language')}</p>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLangPicker(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-amber-50 transition-colors ${lang === l.code ? 'bg-amber-50 font-semibold text-amber-700' : 'text-gray-700'}`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
        >
          <span className="text-5xl">🐕</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-white text-center leading-tight mb-2"
        >
          Feed a Stray
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-amber-200 text-center text-lg mb-10"
        >
          {t('splash_tagline')}
        </motion.p>

        {/* Rotating dog photos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative w-full max-w-xs mb-10"
        >
          <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/30">
            {dogPhotos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="stray dog"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === photoIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-5 py-2 shadow-lg flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-amber-900 font-semibold text-sm">{t('splash_real')}</span>
          </div>
        </motion.div>

        {/* Rotating fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 max-w-xs w-full text-center mb-8 min-h-[64px] flex items-center justify-center"
        >
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-amber-100 text-sm font-medium"
          >
            💡 {facts[factIndex]}
          </motion.p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-6 mb-10"
        >
          {[
            { icon: '🌍', label: 'Countries', value: '5+' },
            { icon: '🍚', label: 'Meals Fed', value: '1000s' },
            { icon: '🐕', label: 'Dogs Helped', value: '100s' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
              <p className="text-amber-300 text-xs">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 pb-10 relative z-10 flex flex-col gap-3 items-center"
      >
        <button
          onClick={goToRegister}
          className="w-full max-w-sm bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-8 py-5 rounded-2xl text-lg shadow-2xl shadow-orange-900/50 transition-all active:scale-95"
        >
          {t('splash_cta')}
        </button>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="w-full max-w-sm bg-white/10 hover:bg-white/20 border border-white/30 text-amber-100 font-semibold px-8 py-4 rounded-2xl text-base transition-all active:scale-95"
        >
          Already have an account? Log in
        </button>
        <p className="text-amber-400/70 text-xs text-center">
          {t('splash_free')}
        </p>

        {/* Portal navigation */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate('/FeederGate')}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-amber-200 text-xs font-medium px-4 py-2 rounded-xl transition-all"
          >
            🐾 Feeders Portal
          </button>
          <button
            onClick={() => navigate('/DevPortal')}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-amber-200 text-xs font-medium px-4 py-2 rounded-xl transition-all"
          >
            💻 Developers Portal
          </button>
          <button
            onClick={() => navigate('/Supporter')}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-amber-200 text-xs font-medium px-4 py-2 rounded-xl transition-all"
          >
            ⚡ Supporters Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
}