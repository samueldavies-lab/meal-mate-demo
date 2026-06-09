import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, ChevronRight, Check, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, LANGUAGES } from '@/lib/LanguageContext';
import AdoptionMapModal from '@/components/onboarding/AdoptionMapModal';

const TOTAL_STEPS = 2;
const PROFILE_START_STEP = 1;

const countries = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany", "France",
  "Spain", "Italy", "Netherlands", "India", "Brazil", "Mexico", "Japan",
  "South Korea", "Philippines", "Indonesia", "Thailand", "Vietnam", "Turkey",
  "Egypt", "South Africa", "Nigeria", "Kenya", "Argentina", "Colombia", "Other"
];

const interests = [
  { id: 'pets', label: '🐕 Pets & Animals' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'food', label: '🍕 Food & Cooking' },
  { id: 'fitness', label: '💪 Fitness & Health' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'music', label: '🎵 Music' },
  { id: 'movies', label: '🎬 Movies & TV' },
  { id: 'tech', label: '💻 Technology' },
  { id: 'fashion', label: '👗 Fashion' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'reading', label: '📚 Reading' },
  { id: 'nature', label: '🌿 Nature & Environment' },
  { id: 'beauty', label: '💄 Beauty & Skincare' },
  { id: 'finance', label: '💰 Finance & Investing' },
  { id: 'parenting', label: '👶 Parenting & Family' },
  { id: 'home', label: '🏠 Home & Interior' },
];

const valueOptions = [
  { id: 'environment', label: '🌍 Environmental sustainability' },
  { id: 'family', label: '👨‍👩‍👧 Family & relationships' },
  { id: 'achievement', label: '🏆 Career & achievement' },
  { id: 'community', label: '🤝 Community & giving back' },
  { id: 'adventure', label: '🧗 Adventure & new experiences' },
  { id: 'health', label: '🧘 Health & wellbeing' },
  { id: 'creativity', label: '🎨 Creativity & self-expression' },
  { id: 'security', label: '🔒 Security & stability' },
  { id: 'justice', label: '⚖️ Social justice & equality' },
  { id: 'spirituality', label: '✨ Spirituality & mindfulness' },
];

function WhyBanner({ t }) {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 mb-6 text-white">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">🐕</div>
        <div>
          <p className="font-bold text-sm mb-1">{t('why_title')}</p>
          <p className="text-xs text-amber-100 leading-relaxed">{t('why_body')}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleGrid({ options, selected, onToggle, cols = 2 }) {
  return (
    <div className={`grid grid-cols-${cols} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onToggle(opt.id)}
          className={`p-3 rounded-xl border-2 text-left transition-all ${
            selected.includes(opt.id)
              ? 'border-amber-500 bg-amber-50'
              : 'border-amber-100 hover:border-amber-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium text-amber-800 leading-tight">{opt.label}</span>
            {selected.includes(opt.id) && <Check className="w-3 h-3 text-amber-600 shrink-0" />}
          </div>
        </button>
      ))}
    </div>
  );
}

export default function Register() {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(-2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState([]);
  const [formData, setFormData] = useState({
    display_name: '',
    age_range: '',
    country: '',
    interests: [],
    values: [],
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        setUser(u);
        setFormData(prev => ({ ...prev, display_name: u?.full_name || '' }));
        setStep(-1);
      }
    }).catch(() => {});
  }, []);

  const toggle = (field, id) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(i => i !== id)
        : [...prev[field], id]
    }));
  };

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await base44.auth.me();
        if (currentUser) setUser(currentUser);
      }
      if (!currentUser) {
        setIsSubmitting(false);
        return;
      }
      const existing = await base44.entities.UserStats.filter({ user_email: currentUser.email });
      const rand = Math.random();
      const target = rand < 0.5 ? 3 : rand < 0.8 ? 4 : 5;

      const statsData = {
        user_email: currentUser.email,
        user_name: formData.display_name,
        age_range: formData.age_range,
        country: formData.country,
        interests: formData.interests,
        values: formData.values,
        registration_completed: true,
        total_ads_watched: 0,
        total_meals_provided: 0,
        total_dogs_fed: 0,
        current_progress: 0,
        current_target: target
      };

      if (existing.length > 0) {
        await base44.entities.UserStats.update(existing[0].id, statsData);
      } else {
        await base44.entities.UserStats.create(statsData);
      }

      window.location.href = createPageUrl('Home');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = {
    1: formData.display_name && formData.age_range && formData.country,
    2: formData.interests.length >= 2 && formData.values.length >= 2,
  };

  const dir = LANGUAGES.find(l => l.code === lang)?.dir || 'ltr';

  if (step === -2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 flex flex-col items-center justify-center px-6" dir={dir}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mb-4">
              <span className="text-4xl">🐕</span>
            </div>
            <h1 className="text-3xl font-black text-white text-center">Feed a Stray</h1>
            <p className="text-amber-200 text-center mt-4 text-sm leading-relaxed">Watch ads. Help dogs. Make a real difference in the lives of stray dogs around the world.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎬</span>
              <div><p className="text-white font-semibold text-sm">Watch ads</p><p className="text-amber-200 text-xs">Each ad helps feed a stray dog</p></div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐕</span>
              <div><p className="text-white font-semibold text-sm">Adopt dogs</p><p className="text-amber-200 text-xs">Care for your virtual family of strays</p></div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌍</span>
              <div><p className="text-white font-semibold text-sm">Real impact</p><p className="text-amber-200 text-xs">Local feeders provide real meals</p></div>
            </div>
          </div>

          <Button
            onClick={() => {
              setUser({ id: 'demo-user-1', email: 'demo@feedastray.org', full_name: 'Demo User', role: 'user' });
              setStep(-1);
            }}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-6 py-4 rounded-2xl text-base shadow-lg"
          >
            Get Started (Demo)
          </Button>
        </motion.div>
      </div>
    );
  }

  if (step === -1) {
    return (
      <AdoptionMapModal
        onComplete={(dogs) => {
          setSelectedDogs(dogs);
          setStep(1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50" dir={dir}>
      <div className="relative h-56 overflow-hidden">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c43cb7165_A81B62BE-3B20-435B-A09E-5A3006F7C4DA.jpg"
          alt="Puppies eating"
          className="w-full h-full object-cover"
          style={{ objectPosition: '85% 75%', transform: 'scale(1.3)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-amber-50" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-2 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Feed a Stray</h1>
          <p className="text-amber-100 text-sm drop-shadow-md">{t('step_of', { step: 1, total: TOTAL_STEPS })}</p>
        </motion.div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i + 1 === 1 ? 'w-8 bg-amber-500' : 'w-6 bg-amber-200'}`} />
          ))}
        </div>

        <WhyBanner t={t} />

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <h2 className="text-lg font-semibold text-amber-900 mb-4">{t('basic_info')}</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-amber-800">{t('display_name')}</Label>
                  <Input value={formData.display_name}
                    onChange={(e) => set('display_name', e.target.value)}
                    placeholder={t('display_name_placeholder')}
                    className="mt-1 border-amber-200 focus:border-amber-400" />
                </div>
                <div>
                  <Label className="text-amber-800">{t('age_range')}</Label>
                  <Select value={formData.age_range} onValueChange={v => set('age_range', v)}>
                    <SelectTrigger className="mt-1 border-amber-200"><SelectValue placeholder={t('age_range_placeholder')} /></SelectTrigger>
                    <SelectContent>
                      {["13-17","18-24","25-34","35-44","45-54","55-64","65+"].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-amber-800">{t('country')}</Label>
                  <Select value={formData.country} onValueChange={v => set('country', v)}>
                    <SelectTrigger className="mt-1 border-amber-200"><SelectValue placeholder={t('country_placeholder')} /></SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep(2)} disabled={!canProceed[1]}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl text-lg font-semibold">
              {t('continue')} <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <h2 className="text-lg font-semibold text-amber-900 mb-1">{t('interests_values')}</h2>
              <p className="text-xs text-amber-600 mb-4">{t('interests_sub')}</p>
              <h3 className="text-sm font-semibold text-amber-800 mb-2">{t('what_interests')}</h3>
              <ToggleGrid options={interests} selected={formData.interests} onToggle={id => toggle('interests', id)} />
              <h3 className="text-sm font-semibold text-amber-800 mt-4 mb-2">{t('what_values')}</h3>
              <ToggleGrid options={valueOptions} selected={formData.values} onToggle={id => toggle('values', id)} cols={1} />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1 py-6 rounded-xl border-amber-200">{t('back')}</Button>
              <Button onClick={handleSubmit} disabled={!canProceed[2] || isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 rounded-xl font-semibold">
                {isSubmitting ? 'Saving...' : 'Start Feeding Dogs! 🐕'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
