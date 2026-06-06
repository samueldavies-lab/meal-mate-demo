import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Clock, CheckCircle, AlertCircle, Upload, Plus, X, Bell, BellOff, Images, Flame, Heart, Star, TrendingUp, MoreVertical, Trash2, Eye } from 'lucide-react';
import PhotoBacklogModal from './PhotoBacklogModal';
import FeedDogModal from './FeedDogModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function Countdown({ deadline }) {
  const [timeLeft, setTimeLeft] = React.useState('');
  const [isUrgent, setIsUrgent] = React.useState(false);

  React.useEffect(() => {
    const calc = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) { setTimeLeft('OVERDUE'); setIsUrgent(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(h < 12);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  return (
    <div className={`rounded-2xl p-4 text-center ${isUrgent ? 'bg-red-50 border-2 border-red-200' : 'bg-amber-50 border-2 border-amber-200'}`}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-500' : 'text-amber-500'}`} />
        <span className={`text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>Time remaining to feed</span>
      </div>
      <p className={`text-4xl font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>{timeLeft}</p>
      {isUrgent && timeLeft !== 'OVERDUE' && <p className="text-xs text-red-600 mt-1 font-medium">⚠️ Feed urgently!</p>}
    </div>
  );
}

// Visibility score: 0–100 based on consistency
function calcVisibility(totalFeedings, streak, lastFedDaysAgo) {
  if (totalFeedings === 0) return 0;
  const base = Math.min(totalFeedings * 3, 40); // up to 40 from volume
  const streakBonus = Math.min(streak * 5, 40);  // up to 40 from streak
  const recencyBonus = lastFedDaysAgo === 0 ? 20 : lastFedDaysAgo === 1 ? 10 : 0;
  return Math.min(base + streakBonus + recencyBonus, 100);
}

function VisibilityBar({ score }) {
  const level = score >= 80 ? { label: 'High', color: 'bg-emerald-500', text: 'text-emerald-700' }
    : score >= 50 ? { label: 'Medium', color: 'bg-amber-400', text: 'text-amber-700' }
    : score >= 20 ? { label: 'Low', color: 'bg-orange-400', text: 'text-orange-700' }
    : { label: 'Very Low', color: 'bg-red-400', text: 'text-red-700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-500 font-medium">Visibility to animal-lovers</span>
        </div>
        <span className={`text-[10px] font-bold ${level.text}`}>{level.label} ({score}%)</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${level.color}`}
        />
      </div>
    </div>
  );
}

const REMOVE_REASONS = ['The dog passed away 🌈', 'Dog was adopted 🏠', 'Can no longer find them', 'Relocated to another area'];

export default function FeederHomeTab({ feederProfile, user }) {
  const queryClient = useQueryClient();

  const [backlogDog, setBacklogDog] = useState(null);
  const [feedDog, setFeedDog] = useState(null);
  const [removeDog, setRemoveDog] = useState(null);
  const [removeReason, setRemoveReason] = useState('');
  const [removingDog, setRemovingDog] = useState(false);
  const [showAddDog, setShowAddDog] = useState(false);
  const [dogForm, setDogForm] = useState({ name: '', age: '', description: '', photo: null });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingDog, setSavingDog] = useState(false);
  const [photos, setPhotos] = useState([null, null, null]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const { data: myDogs = [] } = useQuery({
    queryKey: ['feederDogs', user?.email],
    queryFn: () => base44.entities.StrayDog.filter({ registered_by: user.email }, '-created_date', 50),
    enabled: !!user?.email
  });

  const myDogIds = myDogs.map(d => d.id);

  const { data: pendingMeals = [] } = useQuery({
    queryKey: ['feederPendingMeals', myDogIds.join(',')],
    queryFn: async () => {
      if (myDogIds.length === 0) return [];
      const all = await base44.entities.PendingMeal.filter({ status: 'pending' }, 'created_date', 50);
      return all.filter(m => myDogIds.includes(m.dog_id));
    },
    enabled: myDogIds.length > 0,
    refetchInterval: 30000
  });

  const { data: allFeedingLogs = [] } = useQuery({
    queryKey: ['feederAllLogs', user?.email],
    queryFn: () => base44.entities.FeedingLog.filter({ feeder_email: user.email }, '-created_date', 200),
    enabled: !!user?.email
  });

  const { data: deliveredMeals = [] } = useQuery({
    queryKey: ['deliveredMeals', myDogIds.join(',')],
    queryFn: async () => {
      if (myDogIds.length === 0) return [];
      const all = await base44.entities.PendingMeal.filter({ status: 'delivered' }, '-created_date', 200);
      return all.filter(m => myDogIds.includes(m.dog_id));
    },
    enabled: myDogIds.length > 0
  });

  // Per-dog stats including streak calculation
  const dogStats = useMemo(() => {
    const stats = {};
    myDogs.forEach(dog => {
      const logsForDog = allFeedingLogs.filter(l => l.dog_name === dog.name);
      const deliveredForDog = deliveredMeals.filter(m => m.dog_id === dog.id);
      const pendingForDog = pendingMeals.filter(m => m.dog_id === dog.id);
      const lastFedLog = logsForDog[0];
      const lastFedDate = lastFedLog ? new Date(lastFedLog.created_date) : null;
      const today = new Date();
      const daysSinceLastFed = lastFedDate
        ? Math.floor((today - lastFedDate) / (1000 * 60 * 60 * 24))
        : null;

      // Calculate consecutive day streak
      let streak = 0;
      if (logsForDog.length > 0) {
        const uniqueDays = [...new Set(logsForDog.map(l =>
          new Date(l.created_date).toISOString().split('T')[0]
        ))].sort((a, b) => b.localeCompare(a));

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = new Date(today - 86400000).toISOString().split('T')[0];
        if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
          streak = 1;
          for (let i = 1; i < uniqueDays.length; i++) {
            const prev = new Date(uniqueDays[i - 1]);
            const curr = new Date(uniqueDays[i]);
            const diff = Math.round((prev - curr) / 86400000);
            if (diff === 1) streak++;
            else break;
          }
        }
      }

      const totalFeedings = logsForDog.length;
      const visibility = calcVisibility(totalFeedings, streak, daysSinceLastFed);

      stats[dog.id] = {
        totalMeals: deliveredForDog.length,
        totalFeedings,
        pendingCount: pendingForDog.length,
        lastFedDate,
        daysSinceLastFed,
        fedToday: daysSinceLastFed === 0,
        streak,
        visibility,
      };
    });
    return stats;
  }, [myDogs, allFeedingLogs, deliveredMeals, pendingMeals]);

  // Global tallies
  const totalSponsors = deliveredMeals.length;
  const totalFeedings = allFeedingLogs.length;
  const fedTodayCount = myDogs.filter(d => dogStats[d.id]?.fedToday).length;
  const bestStreak = myDogs.reduce((max, d) => Math.max(max, dogStats[d.id]?.streak || 0), 0);

  const currentTask = activeTaskId
    ? pendingMeals.find(m => m.id === activeTaskId)
    : pendingMeals[0] || null;

  const deadline = currentTask
    ? new Date(new Date(currentTask.created_at).getTime() + 72 * 3600 * 1000).toISOString()
    : null;

  const handleUploadDogPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setDogForm(prev => ({ ...prev, photo: file_url }));
      toast.success('Photo uploaded!');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveDog = async () => {
    if (!removeReason.trim()) { toast.error('Please select or type a reason'); return; }
    setRemovingDog(true);
    try {
      await base44.entities.StrayDog.update(removeDog.id, {
        description: `[REMOVED: ${removeReason.trim()}] ${removeDog.description || ''}`.trim(),
        registered_by: `removed_${user.email}`
      });
      toast.success(`${removeDog.name} has been removed from the map.`);
      setRemoveDog(null);
      setRemoveReason('');
      queryClient.invalidateQueries({ queryKey: ['feederDogs'] });
    } finally {
      setRemovingDog(false);
    }
  };

  const handleAddDog = async () => {
    if (!dogForm.name || !dogForm.age || !dogForm.photo) {
      toast.error('Please fill in name, age and photo');
      return;
    }
    setSavingDog(true);
    try {
      await base44.entities.StrayDog.create({
        name: dogForm.name,
        age: dogForm.age,
        description: dogForm.description,
        country: feederProfile.country,
        city: feederProfile.city,
        photo_url: dogForm.photo,
        gender: 'unknown',
        registered_by: user.email
      });
      toast.success(`${dogForm.name} added! They'll now appear on the Stray Map.`);
      setDogForm({ name: '', age: '', description: '', photo: null });
      setShowAddDog(false);
      queryClient.invalidateQueries({ queryKey: ['feederDogs'] });
    } finally {
      setSavingDog(false);
    }
  };

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotos(prev => { const p = [...prev]; p[index] = file_url; return p; });
      toast.success(`Photo ${index + 1} uploaded!`);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmitFeeding = async () => {
    if (photos.filter(Boolean).length < 3) {
      toast.error('Please upload all 3 required photos');
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.FeedingLog.create({
        feeder_email: user.email,
        feeder_name: feederProfile.feeder_name,
        dogs_fed: 1,
        dog_name: currentTask.dog_name,
        photo_url: photos[0],
        photo_urls: photos,
        location: `${feederProfile.city}, ${feederProfile.country}`,
        notes: `Feeding documented for ${currentTask.dog_name}`
      });
      await base44.entities.PendingMeal.update(currentTask.id, {
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        delivery_photo: photos[0]
      });
      for (const url of photos) {
        await base44.entities.FeedingMedia.create({
          title: `${currentTask.dog_name} meal`,
          media_url: url,
          media_type: 'photo',
          location: `${feederProfile.city}, ${feederProfile.country}`,
          dogs_fed: 1
        });
        await base44.entities.FeedingPhotoBacklog.create({
          dog_id: currentTask.dog_id,
          dog_name: currentTask.dog_name,
          feeder_email: user.email,
          photo_url: url,
          is_used: true,
          used_at: new Date().toISOString()
        });
      }
      await base44.entities.FeederProfile.update(feederProfile.id, {
        total_dogs_fed: (feederProfile.total_dogs_fed || 0) + 1,
        total_feedings: (feederProfile.total_feedings || 0) + 1
      });
      toast.success('Feeding documented! Thank you! 🐕');
      setPhotos([null, null, null]);
      setActiveTaskId(null);
      queryClient.invalidateQueries({ queryKey: ['feederPendingMeals'] });
      queryClient.invalidateQueries({ queryKey: ['feederProfile'] });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoFulfill = async (task) => {
    const backlog = await base44.entities.FeedingPhotoBacklog.filter({
      dog_id: task.dog_id,
      feeder_email: user.email,
      is_used: false
    }, 'created_date', 1);
    if (backlog.length === 0) return false;
    const photo = backlog[0];
    await base44.entities.PendingMeal.update(task.id, {
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      delivery_photo: photo.photo_url
    });
    await base44.entities.FeedingPhotoBacklog.update(photo.id, {
      is_used: true,
      used_at: new Date().toISOString()
    });
    await base44.entities.FeedingLog.create({
      feeder_email: user.email,
      feeder_name: feederProfile.feeder_name,
      dogs_fed: 1,
      dog_name: task.dog_name,
      photo_url: photo.photo_url,
      location: `${feederProfile.city}, ${feederProfile.country}`,
      notes: `Auto-fulfilled from photo backlog for ${task.dog_name}`
    });
    queryClient.invalidateQueries({ queryKey: ['feederPendingMeals'] });
    queryClient.invalidateQueries({ queryKey: ['photoBacklog'] });
    return true;
  };

  return (
    <div className="px-4 pb-8 space-y-5">

      {/* ── HERO STATS ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg"
      >
        <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-3">Your impact</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-3xl font-black">{totalSponsors}</p>
            <p className="text-[10px] text-emerald-100 leading-tight mt-0.5">meals<br/>sponsored</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-3xl font-black">{totalFeedings}</p>
            <p className="text-[10px] text-emerald-100 leading-tight mt-0.5">feedings<br/>logged</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-3xl font-black flex items-center justify-center gap-0.5">
              {bestStreak}<span className="text-xl">🔥</span>
            </p>
            <p className="text-[10px] text-emerald-100 leading-tight mt-0.5">best<br/>streak</p>
          </div>
        </div>
        <div className={`rounded-xl px-4 py-2.5 flex items-center gap-3 ${fedTodayCount === myDogs.length && myDogs.length > 0 ? 'bg-white/20' : 'bg-amber-500/80'}`}>
          <Flame className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            {myDogs.length === 0 ? (
              <p className="text-sm font-semibold">Register dogs to start tracking</p>
            ) : fedTodayCount === myDogs.length ? (
              <p className="text-sm font-semibold">🎉 All {myDogs.length} dogs fed today!</p>
            ) : (
              <p className="text-sm font-semibold">
                {fedTodayCount}/{myDogs.length} dogs fed today — keep going!
              </p>
            )}
            <p className="text-[11px] text-white/80">Daily feedings boost your visibility to animal-lovers</p>
          </div>
        </div>
      </motion.div>

      {/* ── SPONSORED MEAL ALERT ── */}
      {pendingMeals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-base">
                🍖 {pendingMeals.length} sponsored meal{pendingMeals.length > 1 ? 's' : ''} waiting!
              </p>
              <p className="text-sm text-orange-100">
                An animal-lover funded a meal — please feed within 72 hours.
              </p>
            </div>
          </div>
          {pendingMeals.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {pendingMeals.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveTaskId(m.id)}
                  className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    (activeTaskId === m.id || (!activeTaskId && pendingMeals[0]?.id === m.id))
                      ? 'bg-white text-orange-600'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {m.dog_name}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── ACTIVE FEEDING TASK ── */}
      {currentTask && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-orange-200 overflow-hidden shadow-sm"
          >
            {currentTask.dog_photo && (
              <div className="relative">
                <img src={currentTask.dog_photo} alt={currentTask.dog_name} className="w-full h-48 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-xl font-bold">{currentTask.dog_name}</p>
                  <p className="text-white/80 text-sm">{currentTask.dog_city}, {currentTask.dog_country}</p>
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <p className="text-orange-800 font-semibold">Meal sponsored — please feed now</p>
              </div>
              <p className="text-sm text-gray-600 bg-orange-50 rounded-xl p-3 mb-3">
                📋 Prepare a chicken & rice meal. Deliver to the dog's usual spot. Take <strong>3 photos</strong>: before, during, and after feeding.
              </p>
              <button
                onClick={async () => {
                  const fulfilled = await handleAutoFulfill(currentTask);
                  if (fulfilled) toast.success('✅ Meal auto-fulfilled from your photo backlog!');
                  else toast.info('No backlog photos available — please upload photos manually.');
                }}
                className="w-full text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl py-2 font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Images className="w-3.5 h-3.5" /> Use a photo from my backlog instead
              </button>
            </div>
          </motion.div>

          <Countdown deadline={deadline} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm"
          >
            <h3 className="font-bold text-emerald-900 mb-1">📸 Required Documentation</h3>
            <p className="text-sm text-gray-500 mb-4">Upload 3 photos: before, during, and after feeding</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[0, 1, 2].map(index => (
                <div key={index} className="relative">
                  {photos[index] ? (
                    <div className="relative">
                      <img src={photos[index]} alt={`Photo ${index + 1}`} className="w-full aspect-square object-cover rounded-xl border-2 border-emerald-400" />
                      <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-0.5">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <button onClick={() => { const p = [...photos]; p[index] = null; setPhotos(p); }}
                        className="absolute top-1 left-1 bg-black/50 rounded-full p-0.5 text-white w-5 h-5 flex items-center justify-center text-xs">✕</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, index)} disabled={uploadingIndex !== null} />
                      {uploadingIndex === index
                        ? <div className="animate-pulse text-emerald-400 text-xs">...</div>
                        : <><Camera className="w-5 h-5 text-emerald-300 mb-1" /><span className="text-xs text-emerald-400">{['Before', 'During', 'After'][index]}</span></>
                      }
                    </label>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={handleSubmitFeeding}
              disabled={submitting || photos.filter(Boolean).length < 3}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-5 rounded-xl font-semibold"
            >
              {submitting ? 'Submitting...' : <><Upload className="w-4 h-4 mr-2" />Submit Documentation ({photos.filter(Boolean).length}/3 photos)</>}
            </Button>
          </motion.div>
        </>
      )}

      {/* ── DOG FEEDING SCHEDULE ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">My Dogs ({myDogs.length})</h3>
          <button
            onClick={() => setShowAddDog(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
          >
            <Plus className="w-3 h-3" /> Add Dog
          </button>
        </div>

        {myDogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center"
          >
            <div className="text-5xl mb-3">🐕</div>
            <p className="text-gray-600 font-medium mb-1">No dogs registered yet</p>
            <p className="text-sm text-gray-400 mb-4">Upload dogs you know near you so animal-lovers can sponsor their meals.</p>
            <button
              onClick={() => setShowAddDog(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              + Register Your First Dog
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {myDogs.map(dog => {
              const stats = dogStats[dog.id] || {};
              const hasPending = stats.pendingCount > 0;
              const fedToday = stats.fedToday;
              const days = stats.daysSinceLastFed;
              const isOverdue = days === null || days >= 2;

              const borderColor = fedToday
                ? 'border-emerald-300'
                : isOverdue ? 'border-red-200' : 'border-amber-200';
              const bgColor = fedToday
                ? 'bg-white'
                : isOverdue ? 'bg-red-50/40' : 'bg-white';

              return (
                <motion.div
                  key={dog.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border-2 overflow-hidden ${borderColor} ${bgColor}`}
                >
                  {/* Top row: photo + name + sponsor badge + remove */}
                  <div className="flex gap-3 p-3 pb-0">
                    <div className="relative flex-shrink-0">
                      {dog.photo_url
                        ? <img src={dog.photo_url} alt={dog.name} className="w-20 h-20 rounded-xl object-cover" />
                        : <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">🐕</div>
                      }
                      {fedToday && (
                        <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-1">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      {!fedToday && isOverdue && (
                        <div className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1">
                          <AlertCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start gap-1 mb-1">
                        <p className="font-bold text-gray-900 flex-1 leading-tight">{dog.name}</p>
                        <button
                          onClick={() => { setRemoveDog(dog); setRemoveReason(''); }}
                          className="text-gray-300 hover:text-red-400 transition-colors p-0.5 rounded flex-shrink-0"
                          title="Remove dog"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Key stats */}
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        <div className="bg-white/80 rounded-lg p-1.5 text-center border border-gray-100">
                          <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-0.5">
                            <Heart className="w-3 h-3" />{stats.totalMeals || 0}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight">sponsors</p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-1.5 text-center border border-gray-100">
                          <p className="text-sm font-bold text-orange-600 flex items-center justify-center gap-0.5">
                            🔥{stats.streak || 0}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight">day streak</p>
                        </div>
                        <div className={`rounded-lg p-1.5 text-center border ${fedToday ? 'bg-emerald-100 border-emerald-200' : isOverdue ? 'bg-red-100 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                          <p className={`text-sm font-bold ${fedToday ? 'text-emerald-700' : isOverdue ? 'text-red-600' : 'text-amber-700'}`}>
                            {fedToday ? '✅' : days === null ? '—' : days === 0 ? 'Today' : `${days}d`}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight">last fed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visibility bar + CTA */}
                  <div className="px-3 pb-3 mt-2 space-y-2">
                    <VisibilityBar score={stats.visibility || 0} />

                    {/* Status nudge */}
                    <p className={`text-xs font-medium ${fedToday ? 'text-emerald-600' : isOverdue ? 'text-red-600' : 'text-amber-700'}`}>
                      {fedToday
                        ? '✅ Fed today — visibility boosted!'
                        : days === null
                          ? '⚠️ First feeding needed to start gaining visibility'
                          : days === 1
                            ? '🕐 Feed today to keep your streak going!'
                            : `🚨 ${days} days without feeding — visibility dropping`
                      }
                    </p>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setFeedDog(dog)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-all ${
                          hasPending
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : fedToday
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300'
                              : isOverdue
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        <Camera className="w-3 h-3" />
                        {hasPending
                          ? `Feed ${dog.name} (sponsored!)`
                          : fedToday
                            ? 'Log another feeding'
                            : `Feed ${dog.name} now`
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* No pending tasks message (only shown when no dogs have pending meals) */}
      {pendingMeals.length === 0 && myDogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-teal-50 rounded-2xl border border-teal-100 p-4 flex items-center gap-3"
        >
          <BellOff className="w-5 h-5 text-teal-300 flex-shrink-0" />
          <div>
            <p className="text-teal-700 font-medium text-sm">No sponsored meals pending</p>
            <p className="text-xs text-teal-500 mt-0.5">Keep feeding daily — the more consistent you are, the more animal-lovers will sponsor your dogs.</p>
          </div>
        </motion.div>
      )}

      {/* ── MODALS ── */}

      <FeedDogModal
        isOpen={!!feedDog}
        onClose={() => setFeedDog(null)}
        dog={feedDog}
        feederProfile={feederProfile}
        user={user}
      />

      <PhotoBacklogModal
        isOpen={!!backlogDog}
        onClose={() => setBacklogDog(null)}
        dog={backlogDog}
        feederEmail={user?.email}
      />

      {/* Remove Dog Modal */}
      <AnimatePresence>
        {removeDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setRemoveDog(null)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 28 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" /> Remove {removeDog.name}
                </h3>
                <button onClick={() => setRemoveDog(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                This will remove {removeDog.name} from the Stray Map. Please tell us why.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {REMOVE_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setRemoveReason(reason)}
                    className={`text-xs font-medium py-2.5 px-3 rounded-xl border-2 transition-all text-left ${
                      removeReason === reason
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <Textarea
                value={REMOVE_REASONS.includes(removeReason) ? '' : removeReason}
                onChange={e => setRemoveReason(e.target.value)}
                placeholder="Or type your own reason..."
                className="border-gray-200 resize-none h-16 text-sm mb-4"
              />
              <Button
                onClick={handleRemoveDog}
                disabled={removingDog || !removeReason.trim()}
                className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-xl font-semibold"
              >
                {removingDog ? 'Removing...' : `Remove ${removeDog.name} from map`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Dog Modal */}
      <AnimatePresence>
        {showAddDog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowAddDog(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 28 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Register a Stray Dog</h3>
                <button onClick={() => setShowAddDog(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                Once registered, this dog will appear on the Stray Map so animal-lovers worldwide can sponsor their meals.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Dog Photo *</label>
                  {dogForm.photo ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={dogForm.photo} alt="Dog" className="w-full h-52 object-cover rounded-xl" />
                      <button
                        onClick={() => setDogForm(prev => ({ ...prev, photo: null }))}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 w-7 h-7 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl py-8 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadDogPhoto} disabled={uploadingPhoto} />
                      {uploadingPhoto
                        ? <span className="text-sm text-emerald-500 animate-pulse">Uploading...</span>
                        : <><Camera className="w-10 h-10 text-emerald-300 mb-2" /><span className="text-sm text-emerald-600 font-medium">Take or upload a photo</span></>
                      }
                    </label>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Dog Name *</label>
                  <Input
                    value={dogForm.name}
                    onChange={e => setDogForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Buddy, Luna, Max"
                    className="border-gray-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Rough Age *</label>
                  <Input
                    value={dogForm.age}
                    onChange={e => setDogForm(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g. Puppy, 2 years, Senior"
                    className="border-gray-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Location</label>
                  <Input
                    value={`${feederProfile?.city}, ${feederProfile?.country}`}
                    disabled
                    className="border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Description (optional)</label>
                  <Textarea
                    value={dogForm.description}
                    onChange={e => setDogForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the dog's appearance, personality, or story..."
                    className="border-gray-200 resize-none h-20"
                  />
                </div>

                <Button
                  onClick={handleAddDog}
                  disabled={savingDog}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-4 rounded-xl font-semibold text-base mt-2"
                >
                  {savingDog ? 'Registering...' : '🐕 Register Dog'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}