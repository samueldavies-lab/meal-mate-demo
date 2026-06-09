const PREFIX = 'mm_demo_v2_';
const ENT_KEY = PREFIX + 'entity_';
const ONBOARD_KEY = PREFIX + 'onboarding_done';

const DEMO_USER = {
  id: 'demo-user-1',
  email: 'demo@feedastray.org',
  full_name: 'Demo User',
  role: 'user',
};

const today = new Date().toISOString().split('T')[0];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const initialStats = {
  id: 'demo-stats-1',
  user_email: 'demo@feedastray.org',
  user_name: 'Demo User',
  age_range: '25-34',
  country: 'United Kingdom',
  gender: 'male',
  relationship_status: 'single',
  employment_status: 'employed_full_time',
  household_size: '1',
  income_range: '50k_75k',
  interests: ['pets', 'tech', 'nature', 'food'],
  values: ['community', 'environment', 'health'],
  lifestyle: 'adventurer',
  shopping_frequency: 'weekly',
  shopping_channels: ['amazon', 'local_stores'],
  primary_device: 'smartphone',
  social_media_platforms: ['instagram', 'tiktok'],
  daily_screen_time: '3_5h',
  purchase_intent_categories: ['pet_products', 'electronics', 'food_delivery'],
  registration_completed: true,
  total_ads_watched: 342,
  total_meals_provided: 68,
  total_dogs_fed: 12,
  current_progress: 3,
  current_target: 5,
  current_streak: 7,
  longest_streak: 14,
  last_activity_date: today,
  avatar_url: null,
  referral_code: 'DEMO123',
  referral_count: 5,
  total_referral_meals: 15,
};

const strayDogs = [
  { id: "dog-1",  name: "Coco",     photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Young",  gender: "female", description: "Living in a rescue shelter, Coco loves her cozy sweater and warm blankets!", last_fed: daysAgo(0), meal_count: 47 },
  { id: "dog-2",  name: "Shadow",   photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Puppy",  gender: "male",   description: "A playful pup found on the streets, now thriving with daily meals!", last_fed: daysAgo(0), meal_count: 38 },
  { id: "dog-3",  name: "Bruno",    photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "India",       city: "Delhi",     age: "Adult",  gender: "male",   description: "A friendly shelter dog with the sweetest smile, loves belly rubs!", last_fed: daysAgo(0), meal_count: 52 },
  { id: "dog-4",  name: "Goldie",   photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "India",       city: "Jaipur",    age: "Adult",  gender: "female", description: "Lives near a local market, always eager for her daily meal!", last_fed: daysAgo(1), meal_count: 41 },
  { id: "dog-5",  name: "Kalu",     photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Adult",  gender: "male",   description: "A gentle giant at the rescue shelter, loves lounging on the grass.", last_fed: daysAgo(0), meal_count: 33 },
  { id: "dog-6",  name: "Fluffy",   photo_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Young",  gender: "female", description: "A sweet street dog with a fluffy tail, always wagging for treats!", last_fed: daysAgo(2), meal_count: 29 },
  { id: "dog-7",  name: "Casper",   photo_url: "https://images.unsplash.com/photo-1553882809-a4f57e595701?w=200&q=80",  country: "India",       city: "Mumbai",    age: "Adult",  gender: "male",   description: "Found wandering the streets, now gets regular meals from our feeders.", last_fed: daysAgo(0), meal_count: 44 },
  { id: "dog-8",  name: "Patches",  photo_url: "https://images.unsplash.com/photo-1598136490941-1d39cc345781?w=200&q=80",  country: "Nepal",       city: "Bhaktapur", age: "Puppy",  gender: "male",   description: "An adorable puppy living on the streets, needs your help to grow strong!", last_fed: daysAgo(0), meal_count: 22 },
  { id: "dog-9",  name: "Blackie",  photo_url: "https://images.unsplash.com/photo-1546525841-0d2e937f13b7?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Senior", gender: "male",   description: "Recovering at the shelter with a leg injury, needs nutritious meals.", last_fed: daysAgo(3), meal_count: 18 },
  { id: "dog-10", name: "Oreo",     photo_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea2393?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Adult",  gender: "male",   description: "A calm shelter resident with soulful eyes, waiting for his next meal.", last_fed: daysAgo(1), meal_count: 36 },
  { id: "dog-11", name: "Luna",     photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80",  country: "Thailand",    city: "Bangkok",   age: "Young",  gender: "female", description: "A friendly street dog from Bangkok, loves the local night market crowds!", last_fed: daysAgo(0), meal_count: 31 },
  { id: "dog-12", name: "Buster",   photo_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&q=80",  country: "Thailand",    city: "Chiang Mai", age: "Adult",  gender: "male",   description: "Wanders near the temple grounds, fed daily by local monks and volunteers.", last_fed: daysAgo(0), meal_count: 27 },
  { id: "dog-13", name: "Maya",     photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80",  country: "Turkey",      city: "Istanbul",  age: "Adult",  gender: "female", description: "Istanbul's beloved street dog, known to every shopkeeper on her block!", last_fed: daysAgo(1), meal_count: 43 },
  { id: "dog-14", name: "Rex",      photo_url: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=200&q=80",  country: "South Korea", city: "Seoul",     age: "Adult",  gender: "male",   description: "Rescued from a meat farm, now living happily at a sanctuary.", last_fed: daysAgo(0), meal_count: 39 },
  { id: "dog-15", name: "Bella",    photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "Philippines", city: "Manila",    age: "Young",  gender: "female", description: "A resilient street pup from Manila, surviving on kindness and scraps.", last_fed: daysAgo(2), meal_count: 15 },
];

const feederDogs = [
  // --- Nepal: Kathmandu ---
  { id: "fdog-1",  name: "Coco",     photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Young",  gender: "female", description: "Living in a rescue shelter, Coco loves her cozy sweater and warm blankets!", latitude: 27.7172, longitude: 85.3240, last_fed: daysAgo(0) },
  { id: "fdog-2",  name: "Shadow",   photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Puppy",  gender: "male",   description: "A playful pup found on the streets, now thriving with daily meals!",   latitude: 28.2096, longitude: 83.9856, last_fed: daysAgo(0) },
  { id: "fdog-3",  name: "Bruno",    photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "India",       city: "Delhi",     age: "Adult",  gender: "male",   description: "A friendly shelter dog with the sweetest smile, loves belly rubs!",      latitude: 28.6139, longitude: 77.2090, last_fed: daysAgo(0) },
  // --- Nepal: Kathmandu ---
  { id: "fdog-4",  name: "Kalu",     photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Adult",  gender: "male",   description: "A gentle giant at the rescue shelter, loves lounging on the grass.",  latitude: 27.7172, longitude: 85.3240, last_fed: daysAgo(0) },
  { id: "fdog-5",  name: "Lucky",    photo_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea2393?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Puppy",  gender: "male",   description: "A cheerful puppy rescued from the streets, now safe at the shelter.", latitude: 27.7172, longitude: 85.3240, last_fed: daysAgo(1) },
  { id: "fdog-6",  name: "Maya",     photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Adult",  gender: "female", description: "A calm mama dog who watches over the temple grounds.",              latitude: 27.7172, longitude: 85.3240, last_fed: daysAgo(0) },
  { id: "fdog-7",  name: "Tika",     photo_url: "https://images.unsplash.com/photo-1553882809-a4f57e595701?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Senior", gender: "female", description: "An old soul who loves sunbathing by the square.",                    latitude: 27.7172, longitude: 85.3240, last_fed: daysAgo(2) },
  { id: "fdog-8",  name: "Oreo",     photo_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Young",  gender: "male",   description: "Curious and playful, Oreo explores every alley in Patan.",           latitude: 27.7172, longitude: 85.3240, last_fed: daysAgo(0) },
  // --- Nepal: Pokhara ---
  { id: "fdog-9",  name: "Fluffy",   photo_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Young",  gender: "female", description: "A sweet street dog with a fluffy tail, always wagging for treats!", latitude: 28.2096, longitude: 83.9856, last_fed: daysAgo(1) },
  { id: "fdog-10", name: "Snow",     photo_url: "https://images.unsplash.com/photo-1546525841-0d2e937f13b7?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Adult",  gender: "male",   description: "White-coated dog seen near Phewa Lake every morning.",               latitude: 28.2096, longitude: 83.9856, last_fed: daysAgo(0) },
  { id: "fdog-11", name: "Goru",     photo_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Adult",  gender: "male",   description: "A gentle dog who waits near the bus park for his daily meal.",       latitude: 28.2096, longitude: 83.9856, last_fed: daysAgo(0) },
  { id: "fdog-12", name: "Sita",     photo_url: "https://images.unsplash.com/photo-1598136490941-1d39cc345781?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Puppy",  gender: "female", description: "A tiny pup rescued near the lakeside, growing stronger every day.",  latitude: 28.2096, longitude: 83.9856, last_fed: daysAgo(3) },
  // --- Nepal: Bhaktapur ---
  { id: "fdog-13", name: "Patches",  photo_url: "https://images.unsplash.com/photo-1598136490941-1d39cc345781?w=200&q=80",  country: "Nepal",       city: "Bhaktapur", age: "Puppy",  gender: "male",   description: "An adorable puppy living on the streets, needs your help to grow strong!", latitude: 27.6710, longitude: 85.4298, last_fed: daysAgo(0) },
  { id: "fdog-14", name: "Durga",    photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "Nepal",       city: "Bhaktapur", age: "Adult",  gender: "female", description: "A loyal dog who guards the ancient palace square.",                  latitude: 27.6710, longitude: 85.4298, last_fed: daysAgo(0) },
  { id: "fdog-15", name: "Bhairav",  photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "Nepal",       city: "Bhaktapur", age: "Adult",  gender: "male",   description: "A strong street dog who roams the pottery square looking for food.", latitude: 27.6710, longitude: 85.4298, last_fed: daysAgo(1) },
  // --- India: Delhi ---
  { id: "fdog-16", name: "Goldie",   photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "India",       city: "Delhi",     age: "Adult",  gender: "female", description: "A golden-brown dog who lives near the Delhi metro station.",         latitude: 28.6139, longitude: 77.2090, last_fed: daysAgo(1) },
  { id: "fdog-17", name: "Raja",     photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "India",       city: "Delhi",     age: "Adult",  gender: "male",   description: "A proud dog who patrols the neighbourhood market area.",             latitude: 28.6139, longitude: 77.2090, last_fed: daysAgo(0) },
  { id: "fdog-18", name: "Kaju",     photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "India",       city: "Delhi",     age: "Young",  gender: "female", description: "A sweet dog who loves head scratches and belly rubs.",               latitude: 28.6139, longitude: 77.2090, last_fed: daysAgo(0) },
  { id: "fdog-19", name: "Tiger",    photo_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&q=80",  country: "India",       city: "Delhi",     age: "Adult",  gender: "male",   description: "A striped street dog who lives near the India Gate gardens.",        latitude: 28.6139, longitude: 77.2090, last_fed: daysAgo(1) },
  { id: "fdog-20", name: "Rani",     photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80",  country: "India",       city: "Delhi",     age: "Senior", gender: "female", description: "A gentle senior who rests near the temple steps every afternoon.",  latitude: 28.6139, longitude: 77.2090, last_fed: daysAgo(2) },
  // --- India: Mumbai ---
  { id: "fdog-21", name: "Bombay",   photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80",  country: "India",       city: "Mumbai",    age: "Adult",  gender: "male",   description: "A friendly local who hangs out at Marine Drive.",                    latitude: 19.0760, longitude: 72.8777, last_fed: daysAgo(0) },
  { id: "fdog-22", name: "Chikki",   photo_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea2393?w=200&q=80",  country: "India",       city: "Mumbai",    age: "Young",  gender: "female", description: "A tiny street pup with a big personality, loves vada pav crumbs.",   latitude: 19.0760, longitude: 72.8777, last_fed: daysAgo(0) },
  { id: "fdog-23", name: "Gulab",    photo_url: "https://images.unsplash.com/photo-1553882809-a4f57e595701?w=200&q=80",  country: "India",       city: "Mumbai",    age: "Adult",  gender: "female", description: "Sweet-natured dog who sleeps near the railway station entrance.",     latitude: 19.0760, longitude: 72.8777, last_fed: daysAgo(1) },
  { id: "fdog-24", name: "Rocky",    photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "India",       city: "Mumbai",    age: "Adult",  gender: "male",   description: "The unofficial guardian of a local chai stall.",                     latitude: 19.0760, longitude: 72.8777, last_fed: daysAgo(0) },
  // --- India: Jaipur ---
  { id: "fdog-25", name: "Pinku",    photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "India",       city: "Jaipur",    age: "Young",  gender: "male",   description: "A puppy found near Hawa Mahal, always wagging his tail!",            latitude: 26.9124, longitude: 75.7873, last_fed: daysAgo(0) },
  { id: "fdog-26", name: "Meera",    photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "India",       city: "Jaipur",    age: "Adult",  gender: "female", description: "A peaceful dog who rests near the City Palace gates.",               latitude: 26.9124, longitude: 75.7873, last_fed: daysAgo(0) },
  { id: "fdog-27", name: "Bhola",    photo_url: "https://images.unsplash.com/photo-1546525841-0d2e937f13b7?w=200&q=80",  country: "India",       city: "Jaipur",    age: "Adult",  gender: "male",   description: "An innocent dog who waits patiently for his evening meal.",          latitude: 26.9124, longitude: 75.7873, last_fed: daysAgo(3) },
  // --- India: Varanasi ---
  { id: "fdog-28", name: "Ganga",    photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80",  country: "India",       city: "Varanasi",  age: "Adult",  gender: "female", description: "A spiritual soul who lives by the ghats of the holy river.",          latitude: 25.3176, longitude: 82.9739, last_fed: daysAgo(0) },
  { id: "fdog-29", name: "Baba",     photo_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&q=80",  country: "India",       city: "Varanasi",  age: "Senior", gender: "male",   description: "An old dog who has survived many monsoons, fed by temple priests.",  latitude: 25.3176, longitude: 82.9739, last_fed: daysAgo(0) },
  { id: "fdog-30", name: "Kashi",    photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "India",       city: "Varanasi",  age: "Young",  gender: "male",   description: "A playful pup who chases pigeons near Assi Ghat.",                    latitude: 25.3176, longitude: 82.9739, last_fed: daysAgo(1) },
  // --- India: Chennai ---
  { id: "fdog-31", name: "Chennai",  photo_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea2393?w=200&q=80",  country: "India",       city: "Chennai",   age: "Adult",  gender: "male",   description: "A beach-loving dog who spends his days at Marina Beach.",             latitude: 13.0827, longitude: 80.2707, last_fed: daysAgo(0) },
  { id: "fdog-32", name: "Pattu",    photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80",  country: "India",       city: "Chennai",   age: "Young",  gender: "female", description: "A silk-coated street dog adored by the temple visitors.",             latitude: 13.0827, longitude: 80.2707, last_fed: daysAgo(2) },
  { id: "fdog-33", name: "Kumar",    photo_url: "https://images.unsplash.com/photo-1553882809-a4f57e595701?w=200&q=80",  country: "India",       city: "Chennai",   age: "Adult",  gender: "male",   description: "Known to every auto-rickshaw driver on Mount Road.",                 latitude: 13.0827, longitude: 80.2707, last_fed: daysAgo(0) },
  // --- India: Kolkata ---
  { id: "fdog-34", name: "Kol",      photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "India",       city: "Kolkata",   age: "Adult",  gender: "male",   description: "A Howrah Bridge regular, surviving on kindness from commuters.",      latitude: 22.5726, longitude: 88.3639, last_fed: daysAgo(0) },
  { id: "fdog-35", name: "Misti",    photo_url: "https://images.unsplash.com/photo-1598136490941-1d39cc345781?w=200&q=80",  country: "India",       city: "Kolkata",   age: "Puppy",  gender: "female", description: "A sweet as mishti, this puppy lives near College Street.",             latitude: 22.5726, longitude: 88.3639, last_fed: daysAgo(0) },
  { id: "fdog-36", name: "Durga",    photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "India",       city: "Kolkata",   age: "Adult",  gender: "female", description: "A mother dog who protects her pups near the market.",                 latitude: 22.5726, longitude: 88.3639, last_fed: daysAgo(1) },
  // --- India: Bangalore ---
  { id: "fdog-37", name: "Nagu",     photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "India",       city: "Bangalore", age: "Young",  gender: "male",   description: "A tech city pup, seen near Cubbon Park every morning.",               latitude: 12.9716, longitude: 77.5946, last_fed: daysAgo(0) },
  { id: "fdog-38", name: "Bisi",     photo_url: "https://images.unsplash.com/photo-1546525841-0d2e937f13b7?w=200&q=80",  country: "India",       city: "Bangalore", age: "Adult",  gender: "female", description: "Loves lounging near the MG Road metro station entrance.",             latitude: 12.9716, longitude: 77.5946, last_fed: daysAgo(0) },
  { id: "fdog-39", name: "Ranga",    photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "India",       city: "Bangalore", age: "Adult",  gender: "male",   description: "A red-coated dog who roams Koramangala's food streets.",              latitude: 12.9716, longitude: 77.5946, last_fed: daysAgo(2) },
  // --- Thailand: Bangkok ---
  { id: "fdog-40", name: "Luna",     photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80",  country: "Thailand",    city: "Bangkok",   age: "Young",  gender: "female", description: "A friendly street dog from Bangkok, loves the local night market crowds!", latitude: 13.7563, longitude: 100.5018, last_fed: daysAgo(0) },
  { id: "fdog-41", name: "Somchai",  photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "Thailand",    city: "Bangkok",   age: "Adult",  gender: "male",   description: "A temple dog who lives at Wat Pho, fed by monks daily.",              latitude: 13.7563, longitude: 100.5018, last_fed: daysAgo(0) },
  { id: "fdog-42", name: "Thai",     photo_url: "https://images.unsplash.com/photo-1553882809-a4f57e595701?w=200&q=80",  country: "Thailand",    city: "Bangkok",   age: "Adult",  gender: "male",   description: "A loyal dog who stays near the same soi every night.",                latitude: 13.7563, longitude: 100.5018, last_fed: daysAgo(1) },
  { id: "fdog-43", name: "Namtan",   photo_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea2393?w=200&q=80",  country: "Thailand",    city: "Bangkok",   age: "Puppy",  gender: "female", description: "A sweet brown puppy found near Chatuchak market.",                    latitude: 13.7563, longitude: 100.5018, last_fed: daysAgo(0) },
  { id: "fdog-44", name: "Bua",      photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80",  country: "Thailand",    city: "Bangkok",   age: "Senior", gender: "female", description: "An elderly dog who spends her days napping by the canal.",            latitude: 13.7563, longitude: 100.5018, last_fed: daysAgo(3) },
  // --- Thailand: Chiang Mai ---
  { id: "fdog-45", name: "Buster",   photo_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&q=80",  country: "Thailand",    city: "Chiang Mai", age: "Adult",  gender: "male",   description: "Wanders near the temple grounds, fed daily by local monks and volunteers.", latitude: 18.7883, longitude: 98.9853, last_fed: daysAgo(0) },
  { id: "fdog-46", name: "Doi",      photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "Thailand",    city: "Chiang Mai", age: "Young",  gender: "male",   description: "A mountain pup who roams the Doi Suthep trail.",                      latitude: 18.7883, longitude: 98.9853, last_fed: daysAgo(0) },
  { id: "fdog-47", name: "Mali",     photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "Thailand",    city: "Chiang Mai", age: "Adult",  gender: "female", description: "A jasmine-sweet dog who visits the Sunday Walking Street.",            latitude: 18.7883, longitude: 98.9853, last_fed: daysAgo(1) },
  // --- Thailand: Phuket ---
  { id: "fdog-48", name: "Phuket",   photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "Thailand",    city: "Phuket",    age: "Adult",  gender: "male",   description: "A beach dog from Patong, enjoys the sea breeze and scraps.",          latitude: 7.8804,  longitude: 98.3923, last_fed: daysAgo(0) },
  { id: "fdog-49", name: "Sai",      photo_url: "https://images.unsplash.com/photo-1598136490941-1d39cc345781?w=200&q=80",  country: "Thailand",    city: "Phuket",    age: "Puppy",  gender: "female", description: "A sandy puppy found near Kata Beach, loves chasing waves.",           latitude: 7.8804,  longitude: 98.3923, last_fed: daysAgo(0) },
  { id: "fdog-50", name: "Andaman",  photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "Thailand",    city: "Phuket",    age: "Adult",  gender: "male",   description: "A strong swimmer who hangs around the pier waiting for fish scraps.", latitude: 7.8804,  longitude: 98.3923, last_fed: daysAgo(2) },
  // --- South Korea: Seoul ---
  { id: "fdog-51", name: "Rex",      photo_url: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=200&q=80",  country: "South Korea", city: "Seoul",     age: "Adult",  gender: "male",   description: "Rescued from a meat farm, now living happily at a sanctuary.",        latitude: 37.5665, longitude: 126.9780, last_fed: daysAgo(0) },
  { id: "fdog-52", name: "Seoul",    photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80",  country: "South Korea", city: "Seoul",     age: "Young",  gender: "female", description: "A gentle dog who waits for food near Bukchon Hanok Village.",          latitude: 37.5665, longitude: 126.9780, last_fed: daysAgo(0) },
  { id: "fdog-53", name: "Baechu",   photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "South Korea", city: "Seoul",     age: "Adult",  gender: "female", description: "A cabbage-white dog who lives near the Noryangjin fish market.",       latitude: 37.5665, longitude: 126.9780, last_fed: daysAgo(1) },
  { id: "fdog-54", name: "Tofu",     photo_url: "https://images.unsplash.com/photo-1553882809-a4f57e595701?w=200&q=80",  country: "South Korea", city: "Seoul",     age: "Puppy",  gender: "male",   description: "A soft-as-tofu puppy rescued from the streets of Hongdae.",           latitude: 37.5665, longitude: 126.9780, last_fed: daysAgo(0) },
  // --- South Korea: Busan ---
  { id: "fdog-55", name: "Busan",    photo_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea2393?w=200&q=80",  country: "South Korea", city: "Busan",     age: "Adult",  gender: "male",   description: "A sea-side dog who lives near Haeundae Beach.",                       latitude: 35.1796, longitude: 129.0756, last_fed: daysAgo(0) },
  { id: "fdog-56", name: "Haeun",    photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80",  country: "South Korea", city: "Busan",     age: "Young",  gender: "female", description: "A playful pup who runs along the sand dunes at dusk.",                latitude: 35.1796, longitude: 129.0756, last_fed: daysAgo(0) },
  { id: "fdog-57", name: "Gwang",    photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "South Korea", city: "Busan",     age: "Adult",  gender: "male",   description: "Lives near Gwangalli Bridge, fed by local restaurant owners.",        latitude: 35.1796, longitude: 129.0756, last_fed: daysAgo(2) },
  // --- South Korea: Daegu ---
  { id: "fdog-58", name: "Daegu",    photo_url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&q=80",  country: "South Korea", city: "Daegu",     age: "Adult",  gender: "male",   description: "A resilient dog surviving in Daegu's industrial district.",           latitude: 35.8714, longitude: 128.6014, last_fed: daysAgo(0) },
  { id: "fdog-59", name: "Apple",    photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "South Korea", city: "Daegu",     age: "Young",  gender: "female", description: "A sweet apple of a dog who roams near Seomun Market.",                latitude: 35.8714, longitude: 128.6014, last_fed: daysAgo(0) },
  // --- South Korea: Incheon ---
  { id: "fdog-60", name: "Incheon",  photo_url: "https://images.unsplash.com/photo-1546525841-0d2e937f13b7?w=200&q=80",  country: "South Korea", city: "Incheon",   age: "Adult",  gender: "male",   description: "A port district dog surviving on fish market scraps.",                latitude: 37.4563, longitude: 126.7052, last_fed: daysAgo(1) },
  { id: "fdog-61", name: "Songdo",   photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "South Korea", city: "Incheon",   age: "Young",  gender: "female", description: "Found near Songdo Central Park, a gentle soul looking for a friend.",  latitude: 37.4563, longitude: 126.7052, last_fed: daysAgo(0) },
];

const initialFeederProfiles = [
  { id: 'demo-fp-1', user_email: 'feeder-puja@example.com', feeder_name: 'Puja Lama', city: 'Kathmandu', country: 'Nepal', profile_photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80', registration_completed: true, total_meals_served: 284, rating: 4.9, joined_date: '2024-08-15' },
  { id: 'demo-fp-2', user_email: 'feeder-hari@example.com', feeder_name: 'Hari Shrestha', city: 'Pokhara', country: 'Nepal', profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', registration_completed: true, total_meals_served: 156, rating: 4.7, joined_date: '2024-10-01' },
  { id: 'demo-fp-3', user_email: 'feeder-ravi@example.com', feeder_name: 'Ravi Kumar', city: 'Delhi', country: 'India', profile_photo: null, registration_completed: true, total_meals_served: 412, rating: 4.8, joined_date: '2024-06-20' },
];

function genSocialPosts() {
  return [
    { id: 'post-1', user_email: 'demo@feedastray.org', user_name: 'Demo User', content: 'Just watched 5 ads and funded 1 meal for Coco in Kathmandu! 🐕🍚 Every view counts!', image_url: null, created_at: daysAgo(0), likes_count: 12, comments_count: 3 },
    { id: 'post-2', user_email: 'sarah@example.com', user_name: 'Sarah Chen', content: 'Two weeks streak! 🌟 14 days of watching ads = 3 meals provided. Feeling amazing!', image_url: null, created_at: daysAgo(1), likes_count: 24, comments_count: 5 },
    { id: 'post-3', user_email: 'marcus@example.com', user_name: 'Marcus Rivera', content: 'Check out this feeding update from our Delhi team! Bruno got his daily meal 🥰', image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80', created_at: daysAgo(2), likes_count: 31, comments_count: 7 },
    { id: 'post-4', user_email: 'demo@feedastray.org', user_name: 'Demo User', content: 'My adopted dog family is growing! Just adopted Bella from Manila 🇵🇭 Welcome to the pack! 🐾', image_url: null, created_at: daysAgo(3), likes_count: 18, comments_count: 4 },
    { id: 'post-5', user_email: 'emma@example.com', user_name: 'Emma Thompson', content: '1,000 ads watched milestone! 🎉 That\'s 200 meals for stray dogs across 3 countries. Thank you all!', image_url: null, created_at: daysAgo(4), likes_count: 67, comments_count: 12 },
    { id: 'post-6', user_email: 'raj@example.com', user_name: 'Raj Patel', content: 'Feeder Puja sent us photos from Kathmandu — 15 dogs fed today at the rescue shelter!', image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80', created_at: daysAgo(5), likes_count: 42, comments_count: 8 },
    { id: 'post-7', user_email: 'demo@feedastray.org', user_name: 'Demo User', content: 'New personal best: 14-day streak! 🔥 Consistency is key to making a real difference.', image_url: null, created_at: daysAgo(7), likes_count: 15, comments_count: 2 },
  ];
}

function genFeedingLogs() {
  const logs = [];
  const mealTypes = ['morning', 'afternoon', 'evening'];
  for (let day = 0; day < 30; day++) {
    const date = daysAgo(day);
    if (day % 3 === 0 || day < 7) {
      const dog = strayDogs[day % strayDogs.length];
      const feeder = initialFeederProfiles[day % initialFeederProfiles.length];
      logs.push({
        id: `flog-${day}`,
        stray_dog_id: dog.id,
        feeder_email: feeder.user_email,
        meal_type: mealTypes[day % 3],
        fed_at: date + 'T10:00:00Z',
        status: 'confirmed',
        photo_url: dog.photo_url,
        notes: `${dog.name} fed and happy!`,
      });
    }
  }
  return logs;
}

function genFeedingSessions() {
  const sessions = [];
  for (let day = 0; day < 30; day++) {
    const date = daysAgo(day);
    if (day % 2 === 0) {
      sessions.push({
        id: `fsess-${day}`,
        feeder_email: initialFeederProfiles[day % initialFeederProfiles.length].user_email,
        date: date,
        dogs_fed: Math.floor(Math.random() * 5) + 3,
        meals_served: Math.floor(Math.random() * 8) + 4,
        location_city: ['Kathmandu', 'Pokhara', 'Delhi'][day % 3],
        status: 'completed',
        notes: 'Regular feeding round completed.',
      });
    }
  }
  return sessions;
}

function genDailyLogs() {
  const logs = [];
  for (let day = 0; day < 14; day++) {
    const date = daysAgo(day);
    if (day < 7 || Math.random() > 0.5) {
      logs.push({
        id: `dlog-${day}`,
        user_email: 'demo@feedastray.org',
        date: date,
        ads_watched: Math.floor(Math.random() * 8) + 3,
        meals_funded: Math.floor(Math.random() * 3) + 1,
        dogs_interacted: Math.floor(Math.random() * 4) + 1,
      });
    }
  }
  return logs;
}

function genRewards() {
  const rewards = [];
  for (let i = 0; i < 20; i++) {
    const date = daysAgo(i * 2);
    const unlocked = i < 12;
    rewards.push({
      id: `reward-${i}`,
      user_email: 'demo@feedastray.org',
      title: ['Bronze Shield', 'Silver Supporter', 'Gold Guardian', 'Platinum Protector', 'Diamond Defender'][i % 5] + ` ${Math.floor(i / 5) + 1}`,
      type: i < 10 ? 'badge' : 'coupon',
      meals_required: (i + 1) * 5,
      is_unlocked: unlocked,
      unlocked_at: unlocked ? date : null,
      description: unlocked ? `Earned for providing ${(i + 1) * 5} meals!` : `Watch ${(i + 1) * 5} more ads to unlock`,
    });
  }
  return rewards;
}

function genAccessCodes() {
  return [
    { id: 'ac-1', code: 'WELCOME10', type: 'feeder_registration', is_used: false, created_at: '2024-01-01', expires_at: '2026-12-31' },
    { id: 'ac-2', code: 'FEED24', type: 'feeder_registration', is_used: false, created_at: '2024-06-01', expires_at: '2025-06-01' },
  ];
}

function genDevMessages() {
  return [
    { id: 'dm-1', title: '🎉 Welcome to Feed a Stray!', body: 'Watch ads to fund meals for stray dogs around the world. Every 5 ads = 1 real meal!', type: 'info', is_active: true, created_at: '2024-01-01' },
    { id: 'dm-2', title: '🔥 Streak Challenge', body: 'Maintain a 7-day streak to earn the Bronze Shield badge!', type: 'challenge', is_active: true, created_at: '2024-06-01' },
  ];
}

const seedData = {
  UserStats: [JSON.parse(JSON.stringify(initialStats))],
  UserDog: [],
  FeederProfile: JSON.parse(JSON.stringify(initialFeederProfiles)),
  PendingMeal: [],
  SocialPost: genSocialPosts(),
  PostLike: [],
  RewardAllocation: genRewards(),
  DailyFeedingLog: genDailyLogs(),
  DevMessage: genDevMessages(),
  Referral: [],
  FeedingMedia: [],
  FeedingFeedback: [],
  FeederBankDetails: [],
  AccessCode: genAccessCodes(),
  StrayDog: JSON.parse(JSON.stringify(feederDogs)),
  FeedingLog: genFeedingLogs(),
  FeedingSession: genFeedingSessions(),
  FeedingPhotoBacklog: [],
  SpecialGift: [],
};

function loadEntities(name) {
  try {
    const raw = localStorage.getItem(ENT_KEY + name);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveEntities(name, data) {
  localStorage.setItem(ENT_KEY + name, JSON.stringify(data));
}

function getEntities(name) {
  let data = loadEntities(name);
  if (!data) {
    data = seedData[name] ? JSON.parse(JSON.stringify(seedData[name])) : [];
    saveEntities(name, data);
  }
  return data;
}

function getNextId(name, data) {
  let max = 0;
  for (const item of data) {
    const m = item.id && item.id.match(/-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1]));
  }
  return `demo-${name.toLowerCase()}-${max + 1}`;
}

function matchesFilter(item, filter) {
  for (const key of Object.keys(filter)) {
    const val = filter[key];
    if (typeof val === 'string' && val.includes('*')) {
      const re = new RegExp('^' + val.replace(/\*/g, '.*') + '$', 'i');
      if (!re.test(String(item[key] || ''))) return false;
    } else if (item[key] !== val) {
      return false;
    }
  }
  return true;
}

function makeStore(name) {
  return {
    list: (sort, limit) => {
      let data = getEntities(name);
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        data = [...data].sort((a, b) => {
          const av = a[field] || '', bv = b[field] || '';
          return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
        });
      }
      if (limit) data = data.slice(0, limit);
      return Promise.resolve(data);
    },
    filter: (filterObj, sort, limit) => {
      let data = getEntities(name).filter(item => matchesFilter(item, filterObj));
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        data = [...data].sort((a, b) => {
          const av = a[field] || '', bv = b[field] || '';
          return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
        });
      }
      if (limit) data = data.slice(0, limit);
      return Promise.resolve(data);
    },
    create: (data) => {
      const store = getEntities(name);
      const id = getNextId(name, store);
      const item = { id, ...data };
      store.push(item);
      saveEntities(name, store);
      return Promise.resolve(item);
    },
    update: (id, data) => {
      const store = getEntities(name);
      const idx = store.findIndex(item => item.id === id);
      if (idx === -1) return Promise.reject(new Error(`Not found: ${id}`));
      store[idx] = { ...store[idx], ...data };
      saveEntities(name, store);
      return Promise.resolve(store[idx]);
    },
    delete: (id) => {
      const store = getEntities(name);
      const idx = store.findIndex(item => item.id === id);
      if (idx === -1) return Promise.reject(new Error(`Not found: ${id}`));
      store.splice(idx, 1);
      saveEntities(name, store);
      return Promise.resolve();
    },
  };
}

const AUTH_KEY = PREFIX + 'logged_in';

function isDemoLoggedIn() {
  return !!localStorage.getItem(AUTH_KEY);
}

export const demoClient = {
  auth: {
    me: () => {
      if (!isDemoLoggedIn()) return Promise.reject(new Error('Not authenticated'));
      return Promise.resolve({ ...DEMO_USER });
    },
    isAuthenticated: () => Promise.resolve(isDemoLoggedIn()),
    updateMe: (data) => {
      Object.assign(DEMO_USER, data);
      return Promise.resolve({ ...DEMO_USER });
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
    },
    redirectToLogin: (url) => {
      localStorage.setItem(AUTH_KEY, '1');
      if (url) window.location.href = url;
    },
    redirectToSignup: (url) => {
      localStorage.setItem(AUTH_KEY, '1');
      if (url) window.location.href = url;
    },
  },
  entities: {
    UserStats: makeStore('UserStats'),
    UserDog: makeStore('UserDog'),
    FeederProfile: makeStore('FeederProfile'),
    PendingMeal: makeStore('PendingMeal'),
    SocialPost: makeStore('SocialPost'),
    PostLike: makeStore('PostLike'),
    RewardAllocation: makeStore('RewardAllocation'),
    DailyFeedingLog: makeStore('DailyFeedingLog'),
    DevMessage: makeStore('DevMessage'),
    Referral: makeStore('Referral'),
    FeedingMedia: makeStore('FeedingMedia'),
    FeedingFeedback: makeStore('FeedingFeedback'),
    FeederBankDetails: makeStore('FeederBankDetails'),
    AccessCode: makeStore('AccessCode'),
    StrayDog: makeStore('StrayDog'),
    FeedingLog: makeStore('FeedingLog'),
    FeedingSession: makeStore('FeedingSession'),
    FeedingPhotoBacklog: makeStore('FeedingPhotoBacklog'),
    SpecialGift: makeStore('SpecialGift'),
  },
  appLogs: {
    logUserInApp: () => Promise.resolve(),
  },
  functions: {
    invoke: (name, payload) => {
      if (name === 'applixirReward') {
        return Promise.resolve({ data: { mealCompleted: Math.random() > 0.8 } });
      }
      return Promise.resolve({ data: {} });
    },
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        return Promise.resolve({ file_url: URL.createObjectURL(file) });
      },
    },
  },
};

export const demoDogs = strayDogs;
