import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AITrainingPlan from '@/components/training/AITrainingPlan';
import { Skeleton } from "@/components/ui/skeleton";

export default function Training() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  React.useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = createPageUrl('Home');
    }
  }, [user, userLoading]);

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ created_by: user.email });
      return stats[0];
    },
    enabled: !!user?.email,
  });

  const { data: exerciseResults } = useQuery({
    queryKey: ['exerciseResults', user?.email],
    queryFn: async () => {
      return await base44.entities.ExerciseResult.filter({ created_by: user.email }, '-created_date', 20);
    },
    enabled: !!user?.email,
  });

  if (!user || !userStats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          AI Training Plans
        </h1>
        <p className="text-sm text-muted-foreground">
          Get personalized training recommendations based on your performance
        </p>
      </div>

      <AITrainingPlan userStats={userStats} exerciseResults={exerciseResults} />
    </div>
  );
}