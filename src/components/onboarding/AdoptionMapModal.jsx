import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { X, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const countryLocations = [
  { name: 'Nepal', lat: 27.7172, lng: 85.3240, active: true },
  { name: 'India', lat: 28.6139, lng: 77.2090, active: true },
  { name: 'South Korea', lat: 37.5665, lng: 126.9780, active: true },
  { name: 'Nigeria', lat: 9.0765, lng: 7.3986, active: false },
  { name: 'Ethiopia', lat: 9.0320, lng: 38.7469, active: false },
  { name: 'Indonesia', lat: -8.3405, lng: 115.0920, active: false },
  { name: 'Turkey', lat: 41.0082, lng: 28.9784, active: false },
  { name: 'Thailand', lat: 13.7563, lng: 100.5018, active: false },
  { name: 'Philippines', lat: 14.5995, lng: 120.9842, active: false },
  { name: 'Romania', lat: 44.4268, lng: 26.1025, active: false },
  { name: 'Brazil', lat: -22.9068, lng: -43.1729, active: false },
];

const allDogs = [
  { id: "dog-1", name: "Coco", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/90eb8fd98_WhatsAppImage2026-02-17at1923151.jpg", country: "Nepal", city: "Kathmandu", age: "Young", gender: "female", description: "Living in a rescue shelter, Coco loves her cozy sweater and warm blankets!" },
  { id: "dog-2", name: "Shadow", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/2e9e05909_WhatsAppImage2026-02-17at1923152.jpg", country: "Nepal", city: "Pokhara", age: "Puppy", gender: "male", description: "A playful pup found on the streets, now thriving with daily meals!" },
  { id: "dog-3", name: "Bruno", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/15319c2e9_WhatsAppImage2026-02-17at1923153.jpg", country: "India", city: "Delhi", age: "Adult", gender: "male", description: "A friendly shelter dog with the sweetest smile, loves belly rubs!" },
  { id: "dog-4", name: "Goldie", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/479937c32_WhatsAppImage2026-02-17at1923161.jpg", country: "India", city: "Jaipur", age: "Adult", gender: "female", description: "Lives near a local market, always eager for her daily meal!" },
  { id: "dog-5", name: "Kalu", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/df957e82c_WhatsAppImage2026-02-17at1923162.jpg", country: "Nepal", city: "Kathmandu", age: "Adult", gender: "male", description: "A gentle giant at the rescue shelter, loves lounging on the grass." },
  { id: "dog-6", name: "Fluffy", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/703fb21a5_WhatsAppImage2026-02-17at1923163.jpg", country: "Nepal", city: "Pokhara", age: "Young", gender: "female", description: "A sweet street dog with a fluffy tail, always wagging for treats!" },
  { id: "dog-7", name: "Casper", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c83f101e2_WhatsAppImage2026-02-17at192315.jpg", country: "India", city: "Mumbai", age: "Adult", gender: "male", description: "Found wandering the streets, now gets regular meals from our feeders." },
  { id: "dog-8", name: "Patches", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/a48c07bc9_WhatsAppImage2026-02-17at1923154.jpg", country: "Nepal", city: "Bhaktapur", age: "Puppy", gender: "male", description: "An adorable puppy living on the streets, needs your help to grow strong!" },
  { id: "dog-9", name: "Blackie", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/3e47c2d51_WhatsAppImage2026-02-17at1923165.jpeg", country: "Nepal", city: "Kathmandu", age: "Senior", gender: "male", description: "Recovering at the shelter with a leg injury, needs nutritious meals." },
  { id: "dog-10", name: "Oreo", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/6e2ec4dba_WhatsAppImage2026-02-17at1923164.jpeg", country: "Nepal", city: "Pokhara", age: "Adult", gender: "male", description: "A calm shelter resident with soulful eyes, waiting for his next meal." },
  { id: "dog-14", name: "Hope", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/c23588dca_WhatsAppImage2026-02-17at19231710.jpg", country: "India", city: "Chennai", age: "Adult", gender: "female", description: "Severely malnourished when found, now recovering with regular meals." },
  { id: "dog-18", name: "Luna", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/13525cd25_WhatsAppImage2026-02-14at013153.jpg", country: "South Korea", city: "Seoul", age: "Adult", gender: "female", description: "A beautiful white dog found in the countryside, now getting regular meals." },
  { id: "dog-20", name: "Mary", photo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6989e83e8a88fafc135e714b/mary-dog.jpg", country: "Nepal", city: "Kathmandu", age: "Adult", gender: "female", description: "A gentle street dog waiting for her daily meals." },
];

const activeIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#EF4444;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(239,68,68,0.4);cursor:pointer;"></div>`,
  iconSize: [30, 30], iconAnchor: [15, 30],
});
const inactiveIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#9CA3AF;width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 24],
});

function MapFly({ country }) {
  const map = useMap();
  useEffect(() => {
    if (country) map.flyTo([country.lat, country.lng], 5, { duration: 1.2 });
    else map.flyTo([20, 40], 2.5, { duration: 1.2 });
  }, [country, map]);
  return null;
}

const REQUIRED = 3;

export default function AdoptionMapModal({ isOpen, userEmail, onComplete }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showDogs, setShowDogs] = useState(false);
  const [chosen, setChosen] = useState([]); // array of dog objects
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (dogs) => {
      const today = new Date().toISOString().split('T')[0];
      await Promise.all(dogs.map(dog =>
        base44.entities.UserDog.create({
          user_email: userEmail,
          dog_id: dog.id,
          dog_name: dog.name,
          dog_photo: dog.photo_url,
          dog_country: dog.country,
          dog_city: dog.city,
          meals_provided: 0,
          adopted_date: today,
        })
      ));
    },
    onSuccess: (_, dogs) => {
      queryClient.invalidateQueries({ queryKey: ['allUserDogs'] });
      onComplete(dogs);
    },
  });

  const dogsInCountry = selectedCountry
    ? allDogs.filter(d => d.country === selectedCountry.name)
    : [];

  const toggle = (dog) => {
    setChosen(prev => {
      const already = prev.find(d => d.id === dog.id);
      if (already) return prev.filter(d => d.id !== dog.id);
      if (prev.length >= REQUIRED) return prev;
      return [...prev, dog];
    });
  };

  const isChosen = (id) => chosen.some(d => d.id === id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-white">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 pt-10 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-white font-black text-lg leading-tight">Choose Your 3 Dogs</h2>
            <p className="text-amber-100 text-xs">Tap a red pin to see the dogs there 🗺️</p>
          </div>
          <div className="flex items-center gap-2">
            {[1,2,3].map(n => (
              <div key={n} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all ${chosen.length >= n ? 'bg-white border-white' : 'bg-white/20 border-white/40'}`}>
                {chosen.length >= n ? <Check className="w-4 h-4 text-orange-500" /> : <span className="text-white/60 text-xs">{n}</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Hint */}
        <div className="bg-white/20 rounded-xl px-3 py-2 text-xs text-white flex items-center gap-2">
          <span>💡</span>
          <span>
            {chosen.length === 0 && "Here is the map — dogs live all over the world! Tap a 🔴 red pin to explore."}
            {chosen.length === 1 && "Great pick! Select 2 more dogs to complete your feeding family."}
            {chosen.length === 2 && "Almost there! Choose one more dog — they need you!"}
            {chosen.length === 3 && "Perfect! Your feeding family is ready. Tap Confirm below! 🎉"}
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapContainer center={[20, 40]} zoom={2.5} style={{ height: '100%', width: '100%' }} minZoom={2}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFly country={selectedCountry} />
          {countryLocations.map(country => (
            <Marker
              key={country.name}
              position={[country.lat, country.lng]}
              icon={country.active ? activeIcon : inactiveIcon}
              eventHandlers={{ click: () => { if (country.active) { setSelectedCountry(country); setShowDogs(true); } } }}
            >
              <Popup>
                <div className="text-center text-sm font-semibold text-amber-800">
                  {country.active ? `🐕 ${country.name}` : `🔜 ${country.name} (coming soon)`}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom confirm bar */}
      <AnimatePresence>
        {chosen.length === REQUIRED && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="bg-white border-t border-amber-100 px-4 py-4 flex-shrink-0"
          >
            <div className="flex gap-2 mb-3">
              {chosen.map(dog => (
                <div key={dog.id} className="flex-1 flex flex-col items-center">
                  <img src={dog.photo_url} alt={dog.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-400" />
                  <span className="text-xs text-amber-800 font-semibold mt-1">{dog.name}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => saveMutation.mutate(chosen)}
              disabled={saveMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-5 rounded-2xl font-bold text-base"
            >
              {saveMutation.isPending ? 'Saving...' : '🐾 Adopt These 3 Dogs!'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dog list drawer */}
      <AnimatePresence>
        {showDogs && selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[2100] flex items-end"
            onClick={() => setShowDogs(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-lg font-bold text-amber-900">🐕 Dogs in {selectedCountry.name}</h3>
                  <p className="text-xs text-amber-600">
                    👇 Please select a hungry dog that needs feeding
                  </p>
                </div>
                <button onClick={() => setShowDogs(false)} className="p-2 hover:bg-amber-50 rounded-full">
                  <X className="w-5 h-5 text-amber-700" />
                </button>
              </div>

              {/* Selection count reminder */}
              <div className="bg-amber-50 rounded-xl px-3 py-2 mb-4 text-xs text-amber-700 flex items-center gap-2">
                <span>🎯</span>
                <span>{REQUIRED - chosen.length > 0 ? `Select ${REQUIRED - chosen.length} more dog${REQUIRED - chosen.length !== 1 ? 's' : ''} to complete your family` : 'All 3 chosen! Tap Adopt below 🎉'}</span>
              </div>

              {/* Adopt button inside the drawer when 3 dogs are chosen */}
              <AnimatePresence>
                {chosen.length === REQUIRED && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-4"
                  >
                    <div className="flex gap-2 mb-3">
                      {chosen.map(dog => (
                        <div key={dog.id} className="flex-1 flex flex-col items-center">
                          <img src={dog.photo_url} alt={dog.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-400" />
                          <span className="text-xs text-amber-800 font-semibold mt-1 text-center leading-tight">{dog.name}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => saveMutation.mutate(chosen)}
                      disabled={saveMutation.isPending}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-5 rounded-2xl font-bold text-base"
                    >
                      {saveMutation.isPending ? 'Saving...' : '🐾 Adopt These 3 Dogs!'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {dogsInCountry.length === 0 ? (
                  <p className="text-center text-amber-600 py-8">No dogs listed here yet — check another country!</p>
                ) : (
                  dogsInCountry.map(dog => {
                    const selected = isChosen(dog.id);
                    const full = chosen.length >= REQUIRED && !selected;
                    return (
                      <motion.div
                        key={dog.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !full && toggle(dog)}
                        className={`rounded-2xl border-2 p-3 flex gap-3 items-start cursor-pointer transition-all ${
                          selected ? 'border-amber-400 bg-amber-50' : full ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-amber-100 bg-white hover:border-amber-300'
                        }`}
                      >
                        <img src={dog.photo_url} alt={dog.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-amber-900">{dog.name}</p>
                            {selected && (
                              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-amber-600 mb-1">{dog.city} · {dog.age} · {dog.gender}</p>
                          <p className="text-xs text-amber-700 line-clamp-2">{dog.description}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}