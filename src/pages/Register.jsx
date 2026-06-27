import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dog, ChevronRight, Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage, LANGUAGES } from '@/lib/LanguageContext';

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

const socialPlatforms = [
  { id: 'instagram', label: '📸 Instagram' },
  { id: 'tiktok', label: '🎵 TikTok' },
  { id: 'youtube', label: '▶️ YouTube' },
  { id: 'facebook', label: '👍 Facebook' },
  { id: 'twitter', label: '🐦 X / Twitter' },
  { id: 'snapchat', label: '👻 Snapchat' },
  { id: 'linkedin', label: '💼 LinkedIn' },
  { id: 'pinterest', label: '📌 Pinterest' },
];

const shoppingChannels = [
  { id: 'amazon', label: '📦 Amazon' },
  { id: 'local_stores', label: '🏪 Local stores' },
  { id: 'brand_websites', label: '🌐 Brand websites' },
  { id: 'social_commerce', label: '📱 Social media shops' },
  { id: 'malls', label: '🏬 Shopping malls' },
  { id: 'subscription', label: '🔄 Subscription boxes' },
];

const purchaseIntentCategories = [
  { id: 'electronics', label: '📱 Electronics' },
  { id: 'clothing', label: '👕 Clothing & Footwear' },
  { id: 'travel_booking', label: '✈️ Travel & Holidays' },
  { id: 'home_appliances', label: '🏠 Home & Appliances' },
  { id: 'beauty_products', label: '💄 Beauty & Skincare' },
  { id: 'fitness_gear', label: '🏋️ Fitness Equipment' },
  { id: 'food_delivery', label: '🍔 Food & Dining' },
  { id: 'pet_products', label: '🐾 Pet Products' },
  { id: 'automotive', label: '🚗 Automotive' },
  { id: 'financial_products', label: '💳 Financial Products' },
];

function WhyBanner({ t, isSupporter }) {
  return (
    <div className={`bg-gradient-to-r rounded-2xl p-4 mb-6 text-white ${isSupporter ? 'from-indigo-500 to-violet-500' : 'from-amber-500 to-orange-500'}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">{isSupporter ? '⚡' : '🐕'}</div>
        <div>
          <p className="font-bold text-sm mb-1">{t('why_title')}</p>
          <p className={`text-xs leading-relaxed ${isSupporter ? 'text-indigo-100' : 'text-amber-100'}`}>{t('why_body')}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleGrid({ options, selected, onToggle, cols = 2, isSupporter }) {
  return (
    <div className={`grid grid-cols-${cols} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onToggle(opt.id)}
          className={`p-3 rounded-xl border-2 text-left transition-all ${
            selected.includes(opt.id)
              ? isSupporter ? 'border-indigo-500 bg-indigo-50' : 'border-amber-500 bg-amber-50'
              : isSupporter ? 'border-indigo-100 hover:border-indigo-300 bg-white' : 'border-amber-100 hover:border-amber-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className={`text-xs font-medium leading-tight ${isSupporter ? 'text-indigo-800' : 'text-amber-800'}`}>{opt.label}</span>
            {selected.includes(opt.id) && <Check className={`w-3 h-3 shrink-0 ${isSupporter ? 'text-indigo-600' : 'text-amber-600'}`} />}
          </div>
        </button>
      ))}
    </div>
  );
}

export default function Register() {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSupporter = searchParams.get('type') === 'supporter' || searchParams.get('redirect') === '/Supporter';
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(-2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState([]);
  const [formData, setFormData] = useState({
    display_name: '',
    age_range: '',
    country: '',
    relationship_status: '',
    employment_status: '',
    household_size: '',
    income_range: '',
    gender: '',
    interests: [],
    values: [],
    lifestyle: '',
    shopping_frequency: '',
    shopping_channels: [],
    primary_device: '',
    social_media_platforms: [],
    daily_screen_time: '',
    purchase_intent_categories: [],
  });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      if (u) {
        setUser(u);
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.display_name) {
          setFormData(prev => ({ ...prev, display_name: user.user_metadata.display_name }));
        }
      } else {
        navigate('/Login');
      }
    })();
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
        navigate('/Login');
        return;
      }
      const existing = await base44.entities.UserStats.filter({ user_email: currentUser.email });
      const target = 5;

      const statsData = {
        user_email: currentUser.email,
        user_name: formData.display_name,
        age_range: formData.age_range,
        country: formData.country,
        gender: formData.gender,
        relationship_status: formData.relationship_status,
        employment_status: formData.employment_status,
        household_size: formData.household_size,
        income_range: formData.income_range,
        interests: formData.interests,
        values: formData.values,
        lifestyle: formData.lifestyle,
        shopping_frequency: formData.shopping_frequency,
        shopping_channels: formData.shopping_channels,
        primary_device: formData.primary_device,
        social_media_platforms: formData.social_media_platforms,
        daily_screen_time: formData.daily_screen_time,
        purchase_intent_categories: formData.purchase_intent_categories,
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

      navigate(isSupporter ? '/Supporter' : '/Home');
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

  const stepIcons = [Heart, Check];
  const StepIcon = step === 1 ? stepIcons[0] : step === 2 ? stepIcons[1] : Dog;

  const dir = LANGUAGES.find(l => l.code === lang)?.dir || 'ltr';

  // STEP -2: Explainer
  if (step === -2) {
    return (
      <div className={`min-h-screen bg-gradient-to-b flex flex-col items-center justify-center px-6 ${isSupporter ? 'from-indigo-900 via-indigo-800 to-violet-900' : 'from-amber-900 via-amber-800 to-orange-900'}`} dir={dir}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl mb-4 ${isSupporter ? 'bg-gradient-to-br from-indigo-400 to-violet-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
              <span className="text-4xl">{isSupporter ? '⚡' : '🐕'}</span>
            </div>
            <h1 className="text-3xl font-black text-white text-center">{isSupporter ? 'Server Supporter' : 'Feed a Stray'}</h1>
            <p className={`text-center mt-4 text-sm leading-relaxed ${isSupporter ? 'text-indigo-200' : 'text-amber-200'}`}>{isSupporter ? 'Watch ads. Fund server time. Keep this platform running for everyone.' : 'Watch ads. Help dogs. Make a real difference in the lives of stray dogs around the world.'}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{isSupporter ? '⚡' : '🎬'}</span>
              <div>
                <p className="text-white font-semibold text-sm">{isSupporter ? 'Watch ads' : 'Watch ads'}</p>
                <p className={`text-xs ${isSupporter ? 'text-indigo-200' : 'text-amber-200'}`}>{isSupporter ? 'Each ad helps fund server infrastructure' : 'Each ad helps feed a stray dog'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{isSupporter ? '🖥️' : '🐕'}</span>
              <div>
                <p className="text-white font-semibold text-sm">{isSupporter ? 'Cover server costs' : 'Adopt dogs'}</p>
                <p className={`text-xs ${isSupporter ? 'text-indigo-200' : 'text-amber-200'}`}>{isSupporter ? 'Every 5 ads = 3 hours of server uptime' : 'Care for your virtual family of strays'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{isSupporter ? '💜' : '🌍'}</span>
              <div>
                <p className="text-white font-semibold text-sm">{isSupporter ? 'Keep the app running' : 'Real impact'}</p>
                <p className={`text-xs ${isSupporter ? 'text-indigo-200' : 'text-amber-200'}`}>{isSupporter ? 'Your support keeps Feed a Stray online for everyone' : 'Local feeders provide real meals'}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setStep(1)}
            className={`w-full text-white font-bold px-6 py-4 rounded-2xl text-base shadow-lg ${isSupporter ? 'bg-gradient-to-r from-indigo-400 to-violet-500 hover:from-indigo-500 hover:to-violet-600' : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600'}`}
          >
            {isSupporter ? 'Set Up Your Supporter Profile ⚡' : 'Set Up Your Profile 🐾'}
          </Button>

          <p className={`text-xs text-center mt-4 ${isSupporter ? 'text-indigo-400/70' : 'text-amber-400/70'}`}>
            🔒 Free forever. Your data is never sold.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${isSupporter ? 'from-indigo-50 to-violet-50' : 'from-amber-50 to-orange-50'}`} dir={dir}>
      {/* Hero Image Header */}
      <div className="relative h-56 overflow-hidden">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c43cb7165_A81B62BE-3B20-435B-A09E-5A3006F7C4DA.jpg"
          alt="Puppies eating"
          className="w-full h-full object-cover"
          style={{ objectPosition: '85% 75%', transform: 'scale(1.3)' }}
        />
        <div className={`absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 ${isSupporter ? 'to-indigo-50' : 'to-amber-50'}`} />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 shadow-lg ${isSupporter ? 'bg-gradient-to-br from-indigo-400 to-violet-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            <StepIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{isSupporter ? 'Server Supporter' : 'Feed a Stray'}</h1>
          <p className={`text-sm drop-shadow-md ${isSupporter ? 'text-indigo-100' : 'text-amber-100'}`}>{t('step_of', { step, total: TOTAL_STEPS })}</p>
          {/* Language switcher */}
          <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`text-lg px-1.5 py-0.5 rounded-lg transition-all ${lang === l.code ? isSupporter ? 'bg-indigo-200 ring-2 ring-indigo-400' : 'bg-amber-200 ring-2 ring-amber-400' : 'hover:bg-white/20'}`}
                title={l.label}>
                {l.flag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-6 py-6">

      {/* Progress */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all ${
            i + 1 === step ? isSupporter ? 'w-8 bg-indigo-500' : 'w-8 bg-amber-500' : i + 1 < step ? isSupporter ? 'w-6 bg-indigo-400' : 'w-6 bg-amber-400' : isSupporter ? 'w-6 bg-indigo-200' : 'w-6 bg-amber-200'
          }`} />
        ))}
      </div>

      <WhyBanner t={t} isSupporter={isSupporter} />

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className={`bg-white rounded-2xl p-5 shadow-sm border ${isSupporter ? 'border-indigo-100' : 'border-amber-100'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isSupporter ? 'text-indigo-900' : 'text-amber-900'}`}>{t('basic_info')}</h2>
            <div className="space-y-4">
              <div>
                <Label className={isSupporter ? 'text-indigo-800' : 'text-amber-800'}>{t('display_name')}</Label>
                <Input value={formData.display_name}
                  onChange={(e) => set('display_name', e.target.value)}
                  placeholder={t('display_name_placeholder')}
                  className={`mt-1 ${isSupporter ? 'border-indigo-200 focus:border-indigo-400' : 'border-amber-200 focus:border-amber-400'}`} />
              </div>
              <div>
                <Label className={isSupporter ? 'text-indigo-800' : 'text-amber-800'}>{t('age_range')}</Label>
                <Select value={formData.age_range} onValueChange={v => set('age_range', v)}>
                  <SelectTrigger className={`mt-1 ${isSupporter ? 'border-indigo-200 text-indigo-900' : 'border-amber-200 text-amber-900'}`}><SelectValue placeholder={t('age_range_placeholder')} /></SelectTrigger>
                  <SelectContent className={isSupporter ? 'text-indigo-900' : 'text-amber-900'}>
                    {["13-17","18-24","25-34","35-44","45-54","55-64","65+"].map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={isSupporter ? 'text-indigo-800' : 'text-amber-800'}>{t('country')}</Label>
                <Select value={formData.country} onValueChange={v => set('country', v)}>
                  <SelectTrigger className={`mt-1 ${isSupporter ? 'border-indigo-200 text-indigo-900' : 'border-amber-200 text-amber-900'}`}><SelectValue placeholder={t('country_placeholder')} /></SelectTrigger>
                  <SelectContent className={isSupporter ? 'text-indigo-900' : 'text-amber-900'}>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button onClick={() => setStep(2)} disabled={!canProceed[1]}
            className={`w-full py-6 rounded-xl text-lg font-semibold ${isSupporter ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'}`}>
            {t('continue')} <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}

      {/* STEP 2: Interests & Values */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className={`bg-white rounded-2xl p-5 shadow-sm border ${isSupporter ? 'border-indigo-100' : 'border-amber-100'}`}>
            <h2 className={`text-lg font-semibold mb-1 ${isSupporter ? 'text-indigo-900' : 'text-amber-900'}`}>{t('interests_values')}</h2>
            <p className={`text-xs mb-4 ${isSupporter ? 'text-indigo-600' : 'text-amber-600'}`}>{t('interests_sub')}</p>

            <h3 className={`text-sm font-semibold mb-2 ${isSupporter ? 'text-indigo-800' : 'text-amber-800'}`}>{t('what_interests')}</h3>
            <ToggleGrid options={interests} selected={formData.interests} onToggle={id => toggle('interests', id)} isSupporter={isSupporter} />

            <h3 className={`text-sm font-semibold mt-4 mb-2 ${isSupporter ? 'text-indigo-800' : 'text-amber-800'}`}>{t('what_values')}</h3>
            <ToggleGrid options={valueOptions} selected={formData.values} onToggle={id => toggle('values', id)} cols={1} isSupporter={isSupporter} />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setStep(1)} variant="outline" className={`flex-1 py-6 rounded-xl ${isSupporter ? 'border-indigo-200' : 'border-amber-200'}`}>{t('back')}</Button>
            <Button onClick={handleSubmit} disabled={!canProceed[2] || isSubmitting}
              className={`flex-1 py-6 rounded-xl font-semibold ${isSupporter ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'}`}>
              {isSubmitting ? 'Saving...' : isSupporter ? 'Start Supporting! ⚡' : 'Start Feeding Dogs! 🐕'}
            </Button>
          </div>
        </motion.div>
      )}


      </div>
    </div>
  );
}