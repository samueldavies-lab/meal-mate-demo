import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Play, Plus, Minus, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AdWatchingModal from '../components/home/AdWatchingModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const countryLocations = [
  { name: 'Nepal',        lat: 27.7172,  lng: 85.3240,  active: true,  city: 'Kathmandu' },
  { name: 'India',        lat: 28.6139,  lng: 77.2090,  active: true,  city: 'Delhi' },
  { name: 'South Korea',  lat: 37.5665,  lng: 126.9780, active: true,  city: 'Seoul' },
  { name: 'Nigeria',      lat: 9.0765,   lng: 7.3986,   active: false, city: 'Abuja' },
  { name: 'Ethiopia',     lat: 9.0320,   lng: 38.7469,  active: false, city: 'Addis Ababa' },
  { name: 'Indonesia',    lat: -8.3405,  lng: 115.0920, active: false, city: 'Bali' },
  { name: 'Turkey',       lat: 41.0082,  lng: 28.9784,  active: false, city: 'Istanbul' },
  { name: 'Thailand',     lat: 13.7563,  lng: 100.5018, active: true,  city: 'Bangkok' },
  { name: 'Philippines',  lat: 14.5995,  lng: 120.9842, active: false, city: 'Manila' },
  { name: 'Sri Lanka',    lat: 6.9271,   lng: 79.8612,  active: false, city: 'Colombo' },
  { name: 'Brazil',       lat: -22.9068, lng: -43.1729, active: false, city: 'Rio de Janeiro' },
  { name: 'Mexico',       lat: 19.4326,  lng: -99.1332, active: false, city: 'Mexico City' },
  { name: 'Romania',      lat: 44.4268,  lng: 26.1025,  active: false, city: 'Bucharest' },
  { name: 'Egypt',        lat: 30.0444,  lng: 31.2357,  active: false, city: 'Cairo' },
  { name: 'South Africa', lat: -33.9249, lng: 18.4241,  active: false, city: 'Cape Town' },
];

// Spread offsets so N dogs in the same city each get a unique pin position
// Offsets in degrees (~3-5km apart so they're clearly separate at zoom 7)
const spreadOffsets = [
  { lat:  0.00,  lng:  0.00 },
  { lat:  0.05,  lng:  0.05 },
  { lat: -0.05,  lng:  0.05 },
  { lat:  0.05,  lng: -0.05 },
  { lat: -0.05,  lng: -0.05 },
  { lat:  0.08,  lng:  0.00 },
  { lat: -0.08,  lng:  0.00 },
  { lat:  0.00,  lng:  0.08 },
  { lat:  0.00,  lng: -0.08 },
  { lat:  0.08,  lng:  0.08 },
];

// Each city gets exact real-world coordinates
const cityCoords = {
  'Delhi':       { lat: 28.6139,  lng: 77.2090  },
  'Mumbai':      { lat: 19.0760,  lng: 72.8777  },
  'Jaipur':      { lat: 26.9124,  lng: 75.7873  },
  'Varanasi':    { lat: 25.3176,  lng: 82.9739  },
  'Chennai':     { lat: 13.0827,  lng: 80.2707  },
  'Kolkata':     { lat: 22.5726,  lng: 88.3639  },
  'Bangalore':   { lat: 12.9716,  lng: 77.5946  },
  'Kathmandu':   { lat: 27.7172,  lng: 85.3240  },
  'Pokhara':     { lat: 28.2096,  lng: 83.9856  },
  'Bhaktapur':   { lat: 27.6710,  lng: 85.4298  },
  'Bangkok':     { lat: 13.7563,  lng: 100.5018 },
  'Chiang Mai':  { lat: 18.7883,  lng: 98.9853  },
  'Phuket':      { lat: 7.8804,   lng: 98.3923  },
  'Seoul':       { lat: 37.5665,  lng: 126.9780 },
  'Busan':       { lat: 35.1796,  lng: 129.0756 },
  'Daegu':       { lat: 35.8714,  lng: 128.6014 },
  'Incheon':     { lat: 37.4563,  lng: 126.7052 },
};

// City center anchors — country pin click will zoom here
const cityAnchors = cityCoords;

function getDisplayCity(dog) {
  return dog.city;
}

const activeIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="background:#EF4444;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 14px rgba(239,68,68,0.5);">
    </div>
    <div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #EF4444;margin-top:-1px;"></div>
  </div>`,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
});

const inactiveIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:#9CA3AF;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(156,163,175,0.3);"><div style="transform:rotate(45deg);color:white;font-size:16px;margin-top:2px;margin-left:6px;">📍</div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const dogPinIcon = (photoUrl) => new L.DivIcon({
  className: '',
  html: `<div style="width:48px;height:56px;">
    <div style="width:48px;height:48px;border-radius:50%;border:3px solid #F59E0B;box-shadow:0 4px 12px rgba(245,158,11,0.5);overflow:hidden;cursor:pointer;background:#FEF3C7;">
      <img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />
    </div>
    <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #F59E0B;margin:0 auto;margin-top:-2px;"></div>
  </div>`,
  iconSize: [48, 56],
  iconAnchor: [24, 56],
});

const DOG_PIN_ZOOM = 5;

function ZoomWatcher({ onZoomChange }) {
  useMapEvents({ zoomend: (e) => onZoomChange(e.target.getZoom()) });
  return null;
}

function ZoomButton({ direction }) {
  const map = useMap();
  return (
    <button
      onClick={() => direction === 'in' ? map.zoomIn() : map.zoomOut()}
      className="w-10 h-10 bg-white rounded-xl shadow-lg border border-amber-100 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors"
    >
      {direction === 'in' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
    </button>
  );
}

function MapController({ flyTarget }) {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom, { duration: 1.5 });
      setTimeout(() => map.closePopup(), 800);
    }
  }, [flyTarget, map]);
  return null;
}

export default function StrayMap() {
   const navigate = useNavigate();
    const [user, setUser] = useState(null);
   const [selectedDog, setSelectedDog] = useState(null);
   const [showAdModal, setShowAdModal] = useState(false);
   const [selectedDogForAd, setSelectedDogForAd] = useState(null);
   const [currentZoom, setCurrentZoom] = useState(2.5);
   const [flyTarget, setFlyTarget] = useState(null);
   const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
   const [showExplainer, setShowExplainer] = useState(true);

   useEffect(() => {
     base44.auth.me().then(u => {
       if (u) setUser(u);
     });
   }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowExplainer(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const showDogPins = currentZoom >= DOG_PIN_ZOOM;

  const { data: allDogs = [] } = useQuery({
    queryKey: ['strayMapDogs'],
    queryFn: () => base44.entities.StrayDog.list('-created_date', 500),
    refetchInterval: 60000
  });

  // Assign each dog a unique spread position within its city
  const cityCounters = {};
  const dogsWithCoords = allDogs.map(dog => {
    const city = getDisplayCity(dog);
    const anchor = cityCoords[city];
    if (!anchor) {
      // Unknown city — still place it using country anchor if possible
      const countryAnchor = countryLocations.find(c => c.name === dog.country);
      if (!countryAnchor) return { ...dog, coords: null };
      if (cityCounters[dog.country] === undefined) cityCounters[dog.country] = 0;
      const idx = cityCounters[dog.country]++;
      const offset = spreadOffsets[idx % spreadOffsets.length];
      return { ...dog, coords: { lat: countryAnchor.lat + offset.lat, lng: countryAnchor.lng + offset.lng } };
    }
    if (cityCounters[city] === undefined) cityCounters[city] = 0;
    const idx = cityCounters[city]++;
    const offset = spreadOffsets[idx % spreadOffsets.length];
    return {
      ...dog,
      coords: { lat: anchor.lat + offset.lat, lng: anchor.lng + offset.lng }
    };
  });

  const handleCityPinClick = (cityName, lat, lng) => {
    setFlyTarget({ lat, lng, zoom: 12 });
  };

  // Build per-city cluster pins: one pin per city that has dogs, showing dog count
  const cityPins = useMemo(() => {
    const pins = [];
    const activeDogCities = {};
    allDogs.forEach(dog => {
      const key = `${dog.country}__${dog.city}`;
      if (!activeDogCities[key]) {
        const coords = cityCoords[dog.city] || countryLocations.find(c => c.name === dog.country);
        if (coords) {
          activeDogCities[key] = { country: dog.country, city: dog.city, lat: coords.lat, lng: coords.lng, count: 0 };
        }
      }
      if (activeDogCities[key]) activeDogCities[key].count++;
    });
    Object.values(activeDogCities).forEach(p => pins.push({ ...p, active: true }));

    // Inactive countries — single pin at their default location
    countryLocations.filter(c => !c.active && !pins.find(p => p.country === c.name)).forEach(c => {
      pins.push({ country: c.name, city: c.city, lat: c.lat, lng: c.lng, active: false, count: 0 });
    });

    return pins;
    }, [allDogs]);

  const handleFeedDog = async (dog) => {
    if (!user?.email) {
      navigate('/');
      return;
    }

    try {
      // Check if user has already adopted this dog
      const existingAdoption = await base44.entities.UserDog.filter({
        user_email: user.email,
        dog_id: dog.id
      });

      if (existingAdoption.length > 0) {
        // Dog already adopted, just navigate to gallery
        setSelectedDog(null);
        navigate('/Gallery', { state: { dogAdopted: dog } });
        return;
      }

      // Create UserDog record to add dog to user's family
      await base44.entities.UserDog.create({
        user_email: user.email,
        dog_id: dog.id,
        dog_name: dog.name,
        dog_photo: dog.photo_url || '',
        dog_country: dog.country,
        dog_city: dog.city,
        meals_provided: 0,
        adopted_date: new Date().toISOString().split('T')[0]
      });

      // Navigate to Gallery and set state to show first meal prompt
      setSelectedDog(null);
      navigate('/Gallery', { state: { dogAdopted: dog } });
    } catch (error) {
      console.error('Error adopting dog:', error);
    }
  };

  const handleAdComplete = async () => {
    if (selectedDogForAd) {
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + (48 + Math.random() * 10) * 60 * 60 * 1000);
      await base44.entities.PendingMeal.create({
        user_email: 'anonymous',
        dog_id: selectedDogForAd.id,
        dog_name: selectedDogForAd.name,
        dog_photo: selectedDogForAd.photo_url || '',
        dog_country: selectedDogForAd.country,
        dog_city: selectedDogForAd.city,
        status: 'pending',
        created_at: now.toISOString(),
        delivery_scheduled_at: deliveryTime.toISOString()
      });
    }
  };

  // Group dogs by country for list view
  const dogsByCountry = useMemo(() => {
    const groups = {};
    dogsWithCoords.forEach(dog => {
      if (!groups[dog.country]) groups[dog.country] = [];
      groups[dog.country].push(dog);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [dogsWithCoords]);

  return (
    <div className="relative h-screen w-full">
      {/* Header with View Toggle */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-white to-transparent px-6 pt-8 pb-6 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">See Our Strays</h1>
              <p className="text-amber-700 text-sm">Tap a country pin to zoom in & meet the dogs</p>
            </div>
          </div>
          
          {/* View Toggle Buttons */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-700 hover:bg-amber-50'}`}
              title="Map view"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-700 hover:bg-amber-50'}`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="absolute top-32 left-6 z-[1000] bg-white rounded-2xl shadow-lg p-4 border border-amber-100 pointer-events-none">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-amber-900">Active Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-amber-900">Coming Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-100"></div>
            <span className="text-amber-900">Individual dogs</span>
          </div>
        </div>
      </div>



      {/* Explainer */}
      <AnimatePresence>
        {showExplainer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none"
          >
            <div className="max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-amber-100 p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Here are all the dogs in our network who are not yet being fed.</span> Add them to your family if you would like to feed them.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map View */}
      {viewMode === 'map' && (
      <MapContainer center={[20, 40]} zoom={2} style={{ height: '100%', width: '100%' }} className="z-0" minZoom={2} maxZoom={18}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController flyTarget={flyTarget} />
        <ZoomWatcher onZoomChange={setCurrentZoom} />

        {/* Zoom Controls — must be inside MapContainer to use useMap */}
        <div className="leaflet-bottom leaflet-right" style={{zIndex:1000,pointerEvents:'auto'}}>
          <div className="leaflet-control flex flex-col gap-1 m-4">
            <ZoomButton direction="in" />
            <ZoomButton direction="out" />
          </div>
        </div>

        {/* Individual dog pins — each dog has its own pin, visible when zoomed in */}
        {showDogPins && dogsWithCoords.map(dog =>
          dog.coords ? (
            <Marker
              key={`dog-${dog.id}`}
              position={[dog.coords.lat, dog.coords.lng]}
              icon={dogPinIcon(dog.photo_url || '')}
              eventHandlers={{ click: () => setSelectedDog(dog) }}
            />
          ) : null
        )}

        {/* City cluster pins — hide when zoomed in enough to see individual dogs */}
        {!showDogPins && cityPins.map((pin) => (
          <Marker
            key={`${pin.country}-${pin.city}`}
            position={[pin.lat, pin.lng]}
            icon={pin.active ? activeIcon : inactiveIcon}
            eventHandlers={{ click: () => pin.active && handleCityPinClick(pin.city, pin.lat, pin.lng) }}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold text-amber-900">{pin.city}</h3>
                <p className="text-sm text-amber-700">{pin.country}</p>
                {pin.active
                  ? <p className="text-xs text-green-600 mt-1">🐕 {pin.count} dogs — tap to zoom in!</p>
                  : <p className="text-xs text-gray-600 mt-1">🔜 Coming Soon</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="h-full w-full overflow-y-auto pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            {dogsByCountry.map(([country, dogs]) => (
              <div key={country} className="mb-8">
                <h2 className="text-xl font-bold text-amber-900 mb-4 sticky top-32 bg-gradient-to-b from-amber-50 to-transparent pt-2">{country}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dogs.map(dog => (
                    <motion.div
                      key={dog.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedDog(dog)}
                    >
                      {dog.photo_url && (
                        <img src={dog.photo_url} alt={dog.name} className="w-full h-40 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-amber-900 text-lg">{dog.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{dog.city}</span>
                        </div>
                        {dog.age && (
                          <p className="text-xs text-amber-500 mt-1">{dog.age} · {dog.gender}</p>
                        )}
                        {dog.description && (
                          <p className="text-sm text-amber-700 mt-2 line-clamp-2">{dog.description}</p>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedDog(dog);
                          }}
                          className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg text-sm"
                        >
                          Adopt {dog.name} into your family
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dog detail card */}
      <AnimatePresence>
        {selectedDog && (
          <motion.div
            key="dog-card"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-20 left-0 right-0 z-[1001] px-4 pb-2"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden max-w-md mx-auto">
              <div className="flex gap-4 p-4">
                {selectedDog.photo_url && (
                  <img src={selectedDog.photo_url} alt={selectedDog.name} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-amber-900 text-xl">{selectedDog.name}</h3>
                    <button onClick={() => setSelectedDog(null)} className="p-1 hover:bg-amber-100 rounded-full transition-colors ml-2">
                      <X className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedDog.city}, {selectedDog.country}</span>
                  </div>
                  {selectedDog.description && (
                    <p className="text-sm text-amber-700 mt-1 line-clamp-2">{selectedDog.description}</p>
                  )}
                  {selectedDog.age && (
                    <p className="text-xs text-amber-500 mt-1">{selectedDog.age} · {selectedDog.gender}</p>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4">
                <Button
                  onClick={() => handleFeedDog(selectedDog)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-semibold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Adopt {selectedDog.name} into your family
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Modal */}
      <AdWatchingModal
        isOpen={showAdModal}
        onClose={() => { setShowAdModal(false); setSelectedDogForAd(null); }}
        onAdComplete={() => {}}
        currentProgress={2}
        currentTarget={3}
        onMealComplete={handleAdComplete}
      />
    </div>
  );
}