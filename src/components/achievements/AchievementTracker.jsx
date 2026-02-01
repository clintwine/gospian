import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementDefinitions } from '@/components/data/expandedExerciseData';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function useAchievementTracker(userStats, exerciseResults, friends) {
  const queryClient = useQueryClient();

  const createAchievementMutation = useMutation({
    mutationFn: (achievement) => base44.entities.Achievement.create(achievement),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['achievements']);
      // Show toast with achievement
      toast.success(`🏆 Achievement Unlocked: ${data.title}`, {
        description: data.description,
        duration: 5000,
      });
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    },
  });

  useEffect(() => {
    if (!userStats || !exerciseResults) return;

    const checkAchievements = async () => {
      const existingAchievements = await base44.entities.Achievement.filter({});
      const earnedIds = new Set(existingAchievements.map(a => a.achievement_id));

      // Check each achievement
      for (const def of achievementDefinitions) {
        if (earnedIds.has(def.id)) continue;

        let earned = false;

        // Milestone achievements
        if (def.id === 'first_exercise' && userStats.exercises_completed >= 1) earned = true;
        if (def.id === 'exercise_10' && userStats.exercises_completed >= 10) earned = true;
        if (def.id === 'exercise_50' && userStats.exercises_completed >= 50) earned = true;
        if (def.id === 'exercise_100' && userStats.exercises_completed >= 100) earned = true;
        if (def.id === 'exercise_500' && userStats.exercises_completed >= 500) earned = true;

        // Streak achievements
        if (def.id === 'streak_3' && userStats.streak >= 3) earned = true;
        if (def.id === 'streak_7' && userStats.streak >= 7) earned = true;
        if (def.id === 'streak_30' && userStats.streak >= 30) earned = true;
        if (def.id === 'streak_100' && userStats.streak >= 100) earned = true;

        // Accuracy achievements
        if (def.id === 'perfect_1' && userStats.perfect_scores >= 1) earned = true;
        if (def.id === 'perfect_10' && userStats.perfect_scores >= 10) earned = true;
        if (def.id === 'perfect_50' && userStats.perfect_scores >= 50) earned = true;

        // Speed achievements
        if (def.id === 'speed_demon') {
          const fastResults = exerciseResults.filter(r => r.time_taken_seconds && r.time_taken_seconds < 30);
          if (fastResults.length > 0) earned = true;
        }

        if (def.id === 'lightning_fast') {
          const totalTime = exerciseResults.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0);
          const avgTime = totalTime / exerciseResults.length;
          if (avgTime < 2 && exerciseResults.length >= 10) earned = true;
        }

        // Mastery achievements
        if (def.id === 'interval_master') {
          const intervalResults = exerciseResults.filter(r => r.exercise_type === 'intervals' && r.accuracy >= 90);
          if (intervalResults.length >= 50) earned = true;
        }
        if (def.id === 'chord_master') {
          const chordResults = exerciseResults.filter(r => r.exercise_type === 'chords' && r.accuracy >= 90);
          if (chordResults.length >= 50) earned = true;
        }
        if (def.id === 'scale_master') {
          const scaleResults = exerciseResults.filter(r => r.exercise_type === 'scales' && r.accuracy >= 90);
          if (scaleResults.length >= 50) earned = true;
        }

        // Social achievements
        if (def.id === 'social_butterfly' && friends && friends.length >= 5) earned = true;

        // Level achievements
        if (def.id === 'level_10' && userStats.level >= 10) earned = true;
        if (def.id === 'level_25' && userStats.level >= 25) earned = true;
        if (def.id === 'level_50' && userStats.level >= 50) earned = true;

        // Time-based achievements
        if (def.id === 'early_bird' || def.id === 'night_owl') {
          const now = new Date();
          const hour = now.getHours();
          if (def.id === 'early_bird' && hour < 7 && exerciseResults.length > 0) {
            const recentResult = exerciseResults[0];
            const resultHour = new Date(recentResult.created_date).getHours();
            if (resultHour < 7) earned = true;
          }
          if (def.id === 'night_owl' && hour >= 23 && exerciseResults.length > 0) {
            const recentResult = exerciseResults[0];
            const resultHour = new Date(recentResult.created_date).getHours();
            if (resultHour >= 23) earned = true;
          }
        }

        if (earned) {
          createAchievementMutation.mutate({
            achievement_id: def.id,
            title: def.title,
            description: def.description,
            icon: def.icon,
            category: def.category,
            rarity: def.rarity,
            earned_date: new Date().toISOString(),
          });
        }
      }
    };

    checkAchievements();
  }, [userStats, exerciseResults, friends]);

  return null;
}