import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import XPBar from '@/components/ui/XPBar';
import StreakBadge from '@/components/ui/StreakBadge';
import ContinueTrainingCard from '@/components/dashboard/ContinueTrainingCard';
import DailyChallengeCard from '@/components/dashboard/DailyChallengeCard';
import ExerciseCard from '@/components/dashboard/ExerciseCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, Target } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const queryClient = useQueryClient();

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

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ created_by: user.email });
      return stats[0];
    },
    enabled: !!user?.email,
  });

  const createStatsMutation = useMutation({
    mutationFn: (data) => base44.entities.UserStats.create(data),
    onSuccess: () => queryClient.invalidateQueries(['userStats']),
  });

  // Create user stats if they don't exist
  useEffect(() => {
    if (user && !statsLoading && !userStats) {
      createStatsMutation.mutate({
        xp: 0,
        level: 1,
        streak: 0,
        freeze_tokens: 0,
        theme: 'light',
        exercises_completed: 0,
        perfect_scores: 0,
        quickstart_interval_beginner_progress: 0,
        quickstart_chord_beginner_progress: 0,
        quickstart_interval_intermediate_progress: 0,
        quickstart_scale_beginner_progress: 0,
      });
    }
  }, [user, userStats, statsLoading]);

  const { data: exerciseResults } = useQuery({
    queryKey: ['exerciseResults', user?.email],
    queryFn: async () => {
      return await base44.entities.ExerciseResult.filter({ created_by: user.email }, '-created_date', 10);
    },
    enabled: !!user?.email,
  });

  // Check if daily challenge completed today
  const dailyChallengeCompleted = exerciseResults?.some(r => {
    if (!r.is_daily_challenge) return false;
    const today = new Date().toDateString();
    const resultDate = new Date(r.created_date).toDateString();
    return today === resultDate;
  });

  const isLoading = userLoading || statsLoading;

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const stats = userStats || { xp: 0, level: 1, streak: 0, freeze_tokens: 0 };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Welcome Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-1 sm:mb-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Musician'}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Continue your ear training journey</p>
      </div>

      {/* Stats Overview - Mobile */}
      <div className="lg:hidden mb-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#0A1A2F] to-[#243B73]">
          <CardContent className="p-4">
            <div className="text-white">
              <XPBar xp={stats.xp} level={stats.level} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Actions */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <ContinueTrainingCard 
            exerciseType={stats.current_exercise_type}
            progress={stats.current_exercise_progress || 0}
          />
          
          <DailyChallengeCard completed={dailyChallengeCompleted} />

          {/* Quick Start Exercises */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#0A1A2F] dark:text-white">Quick Start</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ExerciseCard
                type="intervals"
                title="Interval Recognition"
                description="Identify the distance between two notes"
                difficulty="beginner"
                progress={stats.quickstart_interval_beginner_progress || 0}
                xpReward={10}
              />
              <ExerciseCard
                type="chords"
                title="Chord Identification"
                description="Recognize chord qualities by ear"
                difficulty="beginner"
                progress={stats.quickstart_chord_beginner_progress || 0}
                xpReward={10}
              />
              <ExerciseCard
                type="intervals"
                title="Advanced Intervals"
                description="Master all 12 chromatic intervals"
                difficulty="intermediate"
                progress={stats.quickstart_interval_intermediate_progress || 0}
                xpReward={15}
              />
              <ExerciseCard
                type="scales"
                title="Scale Recognition"
                description="Identify major and minor scales"
                difficulty="beginner"
                progress={stats.quickstart_scale_beginner_progress || 0}
                xpReward={10}
                locked={stats.level < 3}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Progress */}
        <div className="space-y-4 sm:space-y-6">
          {/* XP Card - Desktop */}
          <Card className="hidden lg:block border-0 shadow-lg bg-gradient-to-br from-[#0A1A2F] to-[#243B73]">
            <CardContent className="p-6">
              <div className="text-white">
                <XPBar xp={stats.xp} level={stats.level} />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3E82FC]" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-6">
              <div className="text-center p-2 sm:p-3 rounded-xl bg-[#D7E5FF]/50 dark:bg-slate-800">
                <p className="text-lg sm:text-2xl font-bold text-[#243B73] dark:text-[#3E82FC]">
                  {stats.exercises_completed || 0}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Exercises</p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-xl bg-[#2A9D8F]/10">
                <p className="text-lg sm:text-2xl font-bold text-[#2A9D8F]">
                  {stats.perfect_scores || 0}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Perfect</p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-xl bg-[#E9C46A]/20">
                <p className="text-lg sm:text-2xl font-bold text-[#E9C46A]">
                  {stats.streak || 0}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Badges */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E9C46A]" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#D7E5FF] dark:bg-slate-700 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#243B73] dark:text-[#3E82FC]" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#2A9D8F]/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#2A9D8F]" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center opacity-50">
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center opacity-50">
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 mb-4">
                Complete more exercises to earn badges
              </p>
              <Link to={createPageUrl('Leaderboard')}>
                <Button variant="outline" className="w-full text-xs">
                  View Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}