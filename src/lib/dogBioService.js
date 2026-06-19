import { base44 } from '@/api/base44Client';

const FUNCTIONS_BASE = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

export async function fetchDogBio(dogId) {
  try {
    const bios = await base44.entities.DogBio.filter({ dog_id: dogId });
    return bios.length > 0 ? bios[0].bio : null;
  } catch {
    return null;
  }
}

export async function fetchDogBios(dogIds) {
  try {
    const allBios = await base44.entities.DogBio.list();
    const bioMap = {};
    for (const record of allBios) {
      if (dogIds.includes(record.dog_id)) {
        bioMap[record.dog_id] = record.bio;
      }
    }
    return bioMap;
  } catch {
    return {};
  }
}

export async function saveDogBio(dogId, dogName, bio) {
  try {
    const existing = await base44.entities.DogBio.filter({ dog_id: dogId });
    if (existing.length > 0) {
      await base44.entities.DogBio.update(existing[0].id, { bio, updated_at: new Date().toISOString() });
    } else {
      await base44.entities.DogBio.create({ dog_id: dogId, dog_name: dogName, bio });
    }
    return true;
  } catch {
    return false;
  }
}

export async function generateDogBio(dogInfo) {
  const { id: dog_id, name, country, city, age, gender } = dogInfo;

  const stored = await fetchDogBio(dog_id);
  if (stored) return stored;

  try {
    const response = await fetch(`${FUNCTIONS_BASE}/generate-dog-bio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dog_id, name, country, city, age, gender }),
    });

    if (!response.ok) {
      throw new Error(`Function returned ${response.status}`);
    }

    const data = await response.json();
    if (data.bio) {
      await saveDogBio(dog_id, name, data.bio);
      return data.bio;
    }
    throw new Error('No bio in response');
  } catch (err) {
    return null;
  }
}
