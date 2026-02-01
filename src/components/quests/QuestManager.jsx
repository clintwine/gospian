import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useQuestManager(user) {
  const queryClient = useQueryClient();

  const createQuestMutation = useMutation({
    mutationFn: (quest) => base44.entities.DailyQuest.create(quest),
    onSuccess: () => queryClient.invalidateQueries(['dailyQuests']),
  });

  useEffect(() => {
    if (!user) return;

    const generateDailyQuests = async () => {
      const today = new Date().toISOString().split('T')[0];
      const existingQuests = await base44.entities.DailyQuest.filter({ quest_date: today });

      if (existingQuests.length === 0) {
        // Generate 3 random daily quests
        const questTemplates = [
          {
            quest_type: 'complete_exercises',
            target_value: 5,
            quest_description: 'Complete 5 exercises today',
            reward_xp: 50,
          },
          {
            quest_type: 'perfect_accuracy',
            target_value: 2,
            quest_description: 'Achieve 100% accuracy on 2 exercises',
            reward_xp: 75,
          },
          {
            quest_type: 'practice_streak',
            target_value: 1,
            quest_description: 'Maintain your daily streak',
            reward_xp: 30,
          },
          {
            quest_type: 'specific_exercise',
            target_value: 3,
            quest_description: 'Complete 3 interval exercises',
            reward_xp: 40,
          },
          {
            quest_type: 'friend_challenge',
            target_value: 1,
            quest_description: 'Complete a friend challenge',
            reward_xp: 100,
          },
        ];

        // Select 3 random quests
        const shuffled = questTemplates.sort(() => 0.5 - Math.random());
        const selectedQuests = shuffled.slice(0, 3);

        for (const template of selectedQuests) {
          await createQuestMutation.mutateAsync({
            ...template,
            quest_date: today,
            current_progress: 0,
            completed: false,
          });
        }
      }
    };

    generateDailyQuests();
  }, [user]);

  return null;
}