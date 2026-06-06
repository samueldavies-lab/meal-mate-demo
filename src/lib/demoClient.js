const PREFIX = 'mm_demo_';
const ENT_KEY = PREFIX + 'entity_';
const ONBOARD_KEY = PREFIX + 'onboarding_done';

const DEMO_USER = {
  id: 'demo-user-1',
  email: 'demo@feedastray.org',
  full_name: 'Demo User',
  role: 'user',
};

const today = new Date().toISOString().split('T')[0];

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
  total_ads_watched: 0,
  total_meals_provided: 0,
  total_dogs_fed: 0,
  current_progress: 0,
  current_target: 5,
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: today,
  avatar_url: null,
};

const strayDogs = [
  { id: "dog-1",  name: "Coco",     photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Young",  gender: "female", description: "Living in a rescue shelter, Coco loves her cozy sweater and warm blankets!" },
  { id: "dog-2",  name: "Shadow",   photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Puppy",  gender: "male",   description: "A playful pup found on the streets, now thriving with daily meals!" },
  { id: "dog-3",  name: "Bruno",    photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "India",       city: "Delhi",     age: "Adult",  gender: "male",   description: "A friendly shelter dog with the sweetest smile, loves belly rubs!" },
  { id: "dog-4",  name: "Goldie",   photo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80",  country: "India",       city: "Jaipur",    age: "Adult",  gender: "female", description: "Lives near a local market, always eager for her daily meal!" },
  { id: "dog-5",  name: "Kalu",     photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Adult",  gender: "male",   description: "A gentle giant at the rescue shelter, loves lounging on the grass." },
  { id: "dog-6",  name: "Fluffy",   photo_url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Young",  gender: "female", description: "A sweet street dog with a fluffy tail, always wagging for treats!" },
  { id: "dog-7",  name: "Casper",   photo_url: "https://images.unsplash.com/photo-1553882809-a4f57e595701?w=200&q=80",  country: "India",       city: "Mumbai",    age: "Adult",  gender: "male",   description: "Found wandering the streets, now gets regular meals from our feeders." },
  { id: "dog-8",  name: "Patches",  photo_url: "https://images.unsplash.com/photo-1598136490941-1d39cc345781?w=200&q=80",  country: "Nepal",       city: "Bhaktapur", age: "Puppy",  gender: "male",   description: "An adorable puppy living on the streets, needs your help to grow strong!" },
  { id: "dog-9",  name: "Blackie",  photo_url: "https://images.unsplash.com/photo-1546525841-0d2e937f13b7?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Senior", gender: "male",   description: "Recovering at the shelter with a leg injury, needs nutritious meals." },
  { id: "dog-10", name: "Oreo",     photo_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea2393?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Adult",  gender: "male",   description: "A calm shelter resident with soulful eyes, waiting for his next meal." },
].map(d => ({ ...d, age: d.age, gender: d.gender }));

const feederDogs = [
  { id: "fdog-1", name: "Coco",     photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80",  country: "Nepal",       city: "Kathmandu", age: "Young",  gender: "female", description: "Living in a rescue shelter, Coco loves her cozy sweater and warm blankets!", latitude: 27.7172, longitude: 85.3240, last_fed: null },
  { id: "fdog-2", name: "Shadow",   photo_url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80",  country: "Nepal",       city: "Pokhara",   age: "Puppy",  gender: "male",   description: "A playful pup found on the streets, now thriving with daily meals!",   latitude: 28.2096, longitude: 83.9856, last_fed: null },
  { id: "fdog-3", name: "Bruno",    photo_url: "https://images.unsplash.com/photo-1534361960057-19f4434a4d70?w=200&q=80",  country: "India",       city: "Delhi",     age: "Adult",  gender: "male",   description: "A friendly shelter dog with the sweetest smile, loves belly rubs!",      latitude: 28.6139, longitude: 77.2090, last_fed: null },
];

const initialFeederProfiles = [
  { id: 'demo-fp-1', user_email: 'feeder-puja@example.com', feeder_name: 'Puja Lama', city: 'Kathmandu', country: 'Nepal', profile_photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80', registration_completed: true },
  { id: 'demo-fp-2', user_email: 'feeder-hari@example.com', feeder_name: 'Hari Shrestha', city: 'Pokhara', country: 'Nepal', profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', registration_completed: true },
  { id: 'demo-fp-3', user_email: 'feeder-ravi@example.com', feeder_name: 'Ravi Kumar', city: 'Delhi', country: 'India', profile_photo: null, registration_completed: true },
];

const seedData = {
  UserStats: [JSON.parse(JSON.stringify(initialStats))],
  UserDog: [],
  FeederProfile: JSON.parse(JSON.stringify(initialFeederProfiles)),
  PendingMeal: [],
  SocialPost: [],
  PostLike: [],
  RewardAllocation: [],
  DailyFeedingLog: [],
  DevMessage: [],
  Referral: [],
  FeedingMedia: [],
  FeedingFeedback: [],
  FeederBankDetails: [],
  AccessCode: [],
  StrayDog: JSON.parse(JSON.stringify(feederDogs)),
  FeedingLog: [],
  FeedingSession: [],
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

export const demoClient = {
  auth: {
    me: () => Promise.resolve({ ...DEMO_USER }),
    isAuthenticated: () => Promise.resolve(true),
    updateMe: (data) => {
      Object.assign(DEMO_USER, data);
      return Promise.resolve({ ...DEMO_USER });
    },
    logout: () => {},
    redirectToLogin: () => {},
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
