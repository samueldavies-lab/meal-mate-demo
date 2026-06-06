import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Lock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrainingModule from '@/components/feeder/TrainingModule';

const SESSION_KEY = 'feeder_activated';
const TRAINING_KEY = 'feeder_training_completed';
const PROGRESS_KEY = 'feeder_training_progress';

const MODULES = [
  {
    id: 1,
    title: 'Introduction to Street Dog Welfare',
    description: 'Learn the basics of stray dog welfare, why it matters, and your role as a feeder in creating lasting change in your community.',
    duration: '8 min',
    thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    quiz: [
      { q: 'What is the primary goal of the Feed a Stray program?', options: ['Adopt all stray dogs', 'Provide regular meals and improve welfare of stray dogs', 'Train stray dogs', 'Sell dog food'], answer: 1 },
      { q: 'Why is consistency important when feeding stray dogs?', options: ['It is not important', 'Dogs rely on predictable food sources for survival', 'It helps sell more dog food', 'None of the above'], answer: 1 },
      { q: 'What should you do if a stray dog appears injured?', options: ['Ignore it', 'Try to catch it yourself', 'Report it to the Feed a Stray team immediately', 'Feed it extra food'], answer: 2 },
    ],
  },
  {
    id: 2,
    title: 'Safe Feeding Practices',
    description: 'Discover how to safely approach, feed, and interact with stray dogs while protecting both yourself and the animals.',
    duration: '10 min',
    thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
    quiz: [
      { q: 'What is the safest way to approach an unfamiliar stray dog?', options: ['Run toward it excitedly', 'Crouch down and let the dog approach you', 'Make loud noises', 'Chase it'], answer: 1 },
      { q: 'Where should you place food for stray dogs?', options: ['In the middle of the road', 'In a clean, safe spot away from traffic', 'On someone else\'s property', 'Anywhere convenient'], answer: 1 },
      { q: 'How often should feeding spots be cleaned?', options: ['Never', 'Once a year', 'After every feeding session', 'Only when they look dirty'], answer: 2 },
    ],
  },
  {
    id: 3,
    title: 'Documentation & Photo Standards',
    description: 'Learn how to properly document your feedings with high-quality photos and accurate records to ensure transparency and trust.',
    duration: '7 min',
    thumbnail: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800&q=80',
    quiz: [
      { q: 'Why is photo documentation important for each feeding?', options: ['It is not important', 'It provides proof of feeding and builds donor trust', 'To post on social media for personal gain', 'To show off'], answer: 1 },
      { q: 'What makes a good feeding photo?', options: ['Blurry and dark', 'Clear, well-lit, showing the dog eating or near the food', 'Only showing the food without the dog', 'A photo from very far away'], answer: 1 },
      { q: 'How soon after a feeding should you submit your documentation?', options: ['Within 24 hours', 'Within a week', 'Within a month', 'No deadline'], answer: 0 },
    ],
  },
  {
    id: 4,
    title: 'Health & Nutrition Basics',
    description: 'Understand what foods are safe for stray dogs, portion sizes, and how to identify signs of illness or malnutrition.',
    duration: '9 min',
    thumbnail: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800&q=80',
    quiz: [
      { q: 'Which of these foods is TOXIC to dogs?', options: ['Plain cooked chicken', 'Brown rice', 'Chocolate and grapes', 'Carrots'], answer: 2 },
      { q: 'What is a sign that a stray dog may be malnourished?', options: ['Shiny coat and bright eyes', 'Visible ribs and dull coat', 'Energetic and playful', 'Well-hydrated gums'], answer: 1 },
      { q: 'How much water should be provided during each feeding?', options: ['No water needed', 'A small cup', 'Fresh, clean water in a bowl', 'Water is optional'], answer: 2 },
    ],
  },
  {
    id: 5,
    title: 'Community & Ethics',
    description: 'Learn how to engage with your local community, handle complaints, and maintain ethical standards as a Feed a Stray representative.',
    duration: '8 min',
    thumbnail: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?w=800&q=80',
    quiz: [
      { q: 'If a neighbor complains about your feeding spot, you should:', options: ['Ignore them', 'Argue loudly', 'Listen respectfully and try to find a mutually agreeable solution', 'Stop feeding immediately'], answer: 2 },
      { q: 'As a feeder, you represent:', options: ['Only yourself', 'The Feed a Stray organization and its mission', 'Your local government', 'No one in particular'], answer: 1 },
      { q: 'What should you do with the Feed a Stray app data you collect?', options: ['Share it publicly on social media', 'Keep it confidential and only use it through the app', 'Sell it to third parties', 'Delete it immediately'], answer: 1 },
    ],
  },
];

export default function FeederTraining() {
  const navigate = useNavigate();
  const [completedModules, setCompletedModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) !== 'true') {
      navigate('/FeederGate', { replace: true });
      return;
    }
    if (localStorage.getItem(TRAINING_KEY) === 'true') {
      navigate('/FeederDashboard', { replace: true });
      return;
    }
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) setCompletedModules(JSON.parse(saved));
  }, []);

  const handleModuleComplete = (moduleId) => {
    const updated = [...new Set([...completedModules, moduleId])];
    setCompletedModules(updated);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    setActiveModule(null);
    if (updated.length === MODULES.length) {
      localStorage.setItem(TRAINING_KEY, 'true');
      setTimeout(() => navigate('/FeederRegister', { replace: true }), 500);
    }
  };

  if (activeModule) {
    return (
      <TrainingModule
        module={activeModule}
        onComplete={() => handleModuleComplete(activeModule.id)}
        onBack={() => setActiveModule(null)}
      />
    );
  }

  const allDone = completedModules.length === MODULES.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50">
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-emerald-100 px-4 py-4 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-emerald-900">Feeder Training</h1>
              <p className="text-xs text-emerald-600">{completedModules.length}/{MODULES.length} modules completed</p>
            </div>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
              animate={{ width: `${(completedModules.length / MODULES.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <p className="text-sm text-emerald-700 text-center">
          Complete all 5 modules to unlock the Feeder Dashboard.
        </p>

        {MODULES.map((mod, idx) => {
          const done = completedModules.includes(mod.id);
          const locked = idx > 0 && !completedModules.includes(MODULES[idx - 1].id);
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => !locked && setActiveModule(mod)}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${
                locked ? 'opacity-50 cursor-not-allowed border-gray-100' : done ? 'border-emerald-200 cursor-pointer hover:shadow-md' : 'border-amber-200 cursor-pointer hover:shadow-md'
              }`}
            >
              <div className="relative">
                <img src={mod.thumbnail} alt={mod.title} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full">{mod.duration}</span>
                  {done && (
                    <div className="bg-emerald-500 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {locked && (
                    <div className="bg-gray-500 rounded-full p-1">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute top-2 left-3 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Module {mod.id}
                </div>
              </div>
              <div className="p-4">
                <h3 className={`font-bold text-sm mb-1 ${done ? 'text-emerald-700' : 'text-gray-900'}`}>{mod.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{mod.description}</p>
                {!locked && !done && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">▶ Start Module</span>
                  </div>
                )}
                {done && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">✓ Completed</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4">
            <Button
              onClick={() => navigate('/FeederRegister')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold text-base"
            >
              🎉 Continue to Registration →
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}