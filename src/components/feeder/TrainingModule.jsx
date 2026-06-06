import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, PlayCircle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrainingModule({ module, onComplete, onBack }) {
  const [phase, setPhase] = useState('video'); // 'video' | 'quiz' | 'result'
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [videoWatched, setVideoWatched] = useState(false);

  const questions = module.quiz;
  const totalQ = questions.length;

  const handleAnswer = () => {
    const updated = [...answers, { q: currentQ, selected, correct: selected === questions[currentQ].answer }];
    setAnswers(updated);
    if (currentQ + 1 < totalQ) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setPhase('result');
    }
  };

  const score = answers.filter(a => a.correct).length;
  const passed = phase === 'result' && score >= Math.ceil(totalQ * 0.7);

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setPhase('quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-emerald-100 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-emerald-700" />
        </button>
        <div>
          <span className="text-xs font-semibold text-emerald-500">MODULE {module.id}</span>
          <h2 className="text-sm font-bold text-emerald-900 leading-tight">{module.title}</h2>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {/* VIDEO PHASE */}
          {phase === 'video' && (
            <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-5 bg-gray-900 cursor-pointer group"
                style={{ aspectRatio: '16/9' }}
                onClick={() => setVideoWatched(true)}
              >
                <img src={module.thumbnail} alt={module.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {!videoWatched ? (
                    <>
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-10 h-10 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium opacity-90">Click to play video</span>
                      <span className="text-white/60 text-xs mt-1">{module.duration} · Video coming soon</span>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-emerald-500/80 backdrop-blur rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">Video watched ✓</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-5">
                <h3 className="font-bold text-emerald-900 text-lg mb-2">{module.title}</h3>
                <p className="text-emerald-700 text-sm leading-relaxed">{module.description}</p>
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                  <strong>📋 Note:</strong> This video is a placeholder. Full training content will be uploaded shortly. You may proceed to the quiz when ready.
                </div>
              </div>

              <Button
                onClick={() => setPhase('quiz')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold text-base"
              >
                Start Quiz →
              </Button>
            </motion.div>
          )}

          {/* QUIZ PHASE */}
          {phase === 'quiz' && (
            <motion.div key={`quiz-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 bg-emerald-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${(currentQ / totalQ) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-600">{currentQ + 1}/{totalQ}</span>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-4">
                <span className="text-xs font-semibold text-emerald-500 mb-3 block">QUESTION {currentQ + 1}</span>
                <h3 className="text-base font-bold text-gray-900 leading-snug">{questions[currentQ].q}</h3>
              </div>

              <div className="space-y-3 mb-6">
                {questions[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                      selected === i
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-gray-100 bg-white text-gray-700 hover:border-emerald-200'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${
                      selected === i ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleAnswer}
                disabled={selected === null}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold text-base disabled:opacity-40"
              >
                {currentQ + 1 < totalQ ? 'Next Question' : 'Submit Answers'} <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* RESULT PHASE */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className={`rounded-3xl p-6 text-center shadow-lg mb-6 ${passed ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-orange-400 to-red-500'}`}>
                <div className="text-5xl mb-3">{passed ? '🎉' : '😅'}</div>
                <h2 className="text-white text-2xl font-bold mb-1">{passed ? 'Quiz Passed!' : 'Not Quite!'}</h2>
                <p className="text-white/90 text-sm mb-4">
                  You scored <strong>{score}/{totalQ}</strong> — {Math.round((score / totalQ) * 100)}%
                </p>
                <p className="text-white/80 text-xs">{passed ? 'Great work! You can move on to the next module.' : `You need at least ${Math.ceil(totalQ * 0.7)} correct answers (70%) to pass.`}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Answer Review</h4>
                <div className="space-y-2">
                  {answers.map((a, idx) => (
                    <div key={idx} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${a.correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      {a.correct ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                      <div>
                        <div className="font-medium text-gray-800">{questions[idx].q}</div>
                        {!a.correct && <div className="text-emerald-700 mt-0.5">✓ {questions[idx].options[questions[idx].answer]}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {passed ? (
                <Button
                  onClick={onComplete}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold text-base"
                >
                  Complete Module ✓
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button onClick={handleRetry} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 py-5 rounded-xl font-semibold">
                    Retry Quiz
                  </Button>
                  <Button onClick={() => setPhase('video')} variant="outline" className="w-full border-emerald-200 text-emerald-700 py-5 rounded-xl">
                    Re-watch Video
                  </Button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}