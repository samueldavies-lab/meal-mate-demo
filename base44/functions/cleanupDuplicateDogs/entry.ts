import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all UserDog records for this user
    const allUserDogs = await base44.entities.UserDog.filter({
      user_email: user.email
    });

    // Group by dog_id to find duplicates
    const dogGroups = {};
    allUserDogs.forEach(dog => {
      if (!dogGroups[dog.dog_id]) {
        dogGroups[dog.dog_id] = [];
      }
      dogGroups[dog.dog_id].push(dog);
    });

    // Delete duplicates, keeping only the first one per dog
    let deletedCount = 0;
    for (const [dogId, dogs] of Object.entries(dogGroups)) {
      if (dogs.length > 1) {
        // Keep the first one, delete the rest
        for (let i = 1; i < dogs.length; i++) {
          await base44.entities.UserDog.delete(dogs[i].id);
          deletedCount++;
        }
      }
    }

    return Response.json({
      success: true,
      message: `Removed ${deletedCount} duplicate dog records`,
      duplicatesRemoved: deletedCount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});