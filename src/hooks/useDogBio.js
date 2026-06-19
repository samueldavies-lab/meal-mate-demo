import { useQuery } from '@tanstack/react-query';
import { generateDogBio, fetchDogBio } from '@/lib/dogBioService';
import { useState } from 'react';

const fallbackBios = {
  'dog-1': { bio: 'Coco lives in a rescue shelter in Kathmandu and loves her cozy sweater and warm blankets. She is playful and friendly with everyone she meets.', feeder: 'Puja Lama' },
  'dog-2': { bio: 'Shadow was found on the streets of Pokhara as a young puppy. He is now thriving with daily meals and loves to play with anyone who visits.', feeder: 'Hari Shrestha' },
  'dog-3': { bio: 'Bruno is a friendly shelter dog in Delhi with the sweetest smile. He loves belly rubs and greets every visitor with a wagging tail.', feeder: 'Ravi Kumar' },
  'dog-4': { bio: 'Goldie lives near a local market in Jaipur and is always eager for her daily meal. She is well known by the local traders who look out for her.', feeder: 'Priya Sharma' },
  'dog-5': { bio: 'Kalu is a gentle giant at the rescue shelter in Kathmandu. He loves lounging on the grass and is very calm around other dogs and people.', feeder: 'Puja Lama' },
  'dog-6': { bio: 'Fluffy is a sweet street dog in Pokhara with a fluffy tail that never stops wagging. She is young, healthy and full of energy.', feeder: 'Hari Shrestha' },
  'dog-7': { bio: 'Casper was found wandering the streets of Mumbai and is now getting regular meals from our feeders. He is gentle and loves attention.', feeder: 'Anita Patel' },
  'dog-8': { bio: 'Patches lives around a metal workshop in Bhaktapur and is the only surviving puppy of a litter of 6. He is currently healthy, vaccinated and being fed on a regular basis.', feeder: 'Puja Lama' },
  'dog-9': { bio: 'Blackie is a senior dog recovering at the shelter in Kathmandu with a leg injury. He needs nutritious meals to help him regain his strength.', feeder: 'Puja Lama' },
  'dog-10': { bio: 'Oreo is a calm shelter resident in Pokhara with soulful eyes. He is patient, well-behaved and always grateful for his next meal.', feeder: 'Hari Shrestha' },
  'dog-11': { bio: 'Ginger was rescued and is recovering at a shelter in Varanasi. She is grateful for every meal she receives and is slowly regaining her health.', feeder: 'Sunita Singh' },
  'dog-12': { bio: 'Marigold is celebrated during local festivals in Kathmandu and is loved by the community. She is a well-known and well-loved street dog.', feeder: 'Puja Lama' },
  'dog-13': { bio: 'Rusty is a happy-go-lucky street dog in Bali who loves greeting tourists and following locals on their morning walks. He is young, healthy and full of energy.', feeder: 'Ketut Sujana' },
  'dog-14': { bio: 'Hope was severely malnourished when found in Chennai and is now recovering with regular meals. She is gentle and trusting despite her difficult start.', feeder: 'Meena Rajan' },
  'dog-15': { bio: 'Biscuit is a hungry street pup in Kolkata who depends on community feeders for survival. He is young, energetic and loves to run around.', feeder: 'Debashis Roy' },
  'dog-16': { bio: 'Mama is a street mother in Lalitpur caring for her pup. She needs extra nutrition to keep herself and her baby healthy and strong.', feeder: 'Puja Lama' },
  'dog-17': { bio: 'Sunny is a street mum watching over her puppies at a local market in Bangalore. She is protective and devoted to keeping her family safe.', feeder: 'Kavya Nair' },
  'dog-18': { bio: 'Luna is a beautiful white dog found in the countryside near Seoul. She is now getting regular meals from local feeders and is thriving.', feeder: 'Ji-young Park' },
  'dog-19': { bio: 'Midnight is a sweet black dog living on the streets of Seoul. She loves her daily meals and has become a familiar face to local feeders.', feeder: 'Ji-young Park' },
};

export function useDogBio(dogId, dogInfo) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: bio, isLoading, refetch } = useQuery({
    queryKey: ['dogBio', dogId],
    queryFn: async () => {
      const stored = await fetchDogBio(dogId);
      if (stored) return { bio: stored, source: 'db' };
      const fallback = fallbackBios[dogId];
      if (fallback) return { ...fallback, source: 'fallback' };
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const generate = async () => {
    if (!dogInfo || isGenerating) return;
    setIsGenerating(true);
    try {
      const newBio = await generateDogBio(dogInfo);
      if (newBio) refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    bio: bio?.bio || null,
    feeder: bio?.feeder || null,
    source: bio?.source || null,
    isLoading,
    isGenerating,
    generate,
  };
}

export function useDogBios(dogs) {
  const bioQueries = {};
  for (const dog of (dogs || [])) {
    bioQueries[dog.dog_id || dog.id] = useDogBio(dog.dog_id || dog.id, dog);
  }
  return bioQueries;
}
