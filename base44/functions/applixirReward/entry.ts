import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reward_amount } = await req.json();
    
    if (!reward_amount || reward_amount < 1) {
      return Response.json({ error: 'Invalid reward amount' }, { status: 400 });
    }

    // Get or create user stats
    const stats = await base44.entities.UserStats.filter({ user_email: user.email });
    let userStats = stats[0];

    if (!userStats) {
      // Create if doesn't exist
      userStats = await base44.entities.UserStats.create({
        user_email: user.email,
        user_name: user.full_name,
        registration_completed: true,
        total_ads_watched: 0,
        current_progress: 0,
        current_target: 5,
        current_streak: 0,
        longest_streak: 0
      });
    }

    // Update stats with AppLixir reward
    const newProgress = (userStats.current_progress || 0) + reward_amount;
    const currentTarget = userStats.current_target || 5;
    const completedMeal = newProgress >= currentTarget;
    const today = new Date().toISOString().split('T')[0];

    const updates = {
      total_ads_watched: (userStats.total_ads_watched || 0) + 1,
      current_progress: completedMeal ? 0 : newProgress,
      last_activity_date: today,
    };

    if (completedMeal) {
      const lastMealDate = userStats.last_meal_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let newStreak = userStats.current_streak || 0;
      if (lastMealDate !== today) {
        if (lastMealDate === yesterday) {
          newStreak = newStreak + 1;
        } else {
          newStreak = 1;
        }
      }

      updates.current_streak = newStreak;
      updates.longest_streak = Math.max(userStats.longest_streak || 0, newStreak);
      updates.last_meal_date = today;
      updates.total_meals_provided = (userStats.total_meals_provided || 0) + 1;
      updates.current_target = 5;
    }

    await base44.entities.UserStats.update(userStats.id, updates);

    return Response.json({
      success: true,
      mealCompleted: completedMeal,
      newProgress: updates.current_progress,
      totalMeals: updates.total_meals_provided || (userStats.total_meals_provided || 0)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});