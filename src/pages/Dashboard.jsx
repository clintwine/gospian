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
import { Award, TrendingUp, Target, Lock, Crown } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from "@/components/ui/alert";
import PlateauDetectionAlert from '@/components/subscription/PlateauDetectionAlert';
import StreakProtectionAlert from '@/components/subscription/StreakProtectionAlert';
import BlurredProgressChart from '@/components/subscription/BlurredProgressChart';
import { useAchievementTracker } from '@/components/achievements/AchievementTracker';
import { useQuestManager } from '@/components/quests/QuestManager';
import DailyQuestCard from '@/components/quests/DailyQuestCard';
import { useDifficultyAdjuster, generateRecommendations } from '@/components/adaptive/DifficultyAdjuster';
import ChallengeFriendModal from '@/components/challenges/ChallengeFriendModal';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showPlateauAlert, setShowPlateauAlert] = React.useState(false);
  const [showChallengeModal, setShowChallengeModal] = React.useState(false);

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

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ created_by: user.email });
      return subs[0] || { tier: 'free', status: 'active' };
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
      return await base44.entities.ExerciseResult.filter({ created_by: user.email }, '-created_date', 100);
    },
    enabled: !!user?.email,
  });

  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: async () => {
      return await base44.entities.Achievement.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: dailyQuests } = useQuery({
    queryKey: ['dailyQuests', user?.email],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return await base44.entities.DailyQuest.filter({ quest_date: today });
    },
    enabled: !!user?.email,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: async () => {
      const sent = await base44.entities.Friend.filter({ user_email: user.email });
      const received = await base44.entities.Friend.filter({ friend_email: user.email });
      return [...sent, ...received];
    },
    enabled: !!user?.email,
  });

  // Initialize achievement tracker and quest manager
  useAchievementTracker(userStats, exerciseResults, friends);
  useQuestManager(user);

  // Get adaptive recommendations
  const recommendations = React.useMemo(() => {
    return generateRecommendations(exerciseResults, null);
  }, [exerciseResults]);

  const tier = subscription?.tier || 'free';

  // Detect skill plateau (no improvement in 7 days)
  React.useEffect(() => {
    if (exerciseResults && tier === 'free') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentResults = exerciseResults.filter(r => new Date(r.created_date) > sevenDaysAgo);
      
      if (recentResults.length >= 5) {
        const avgAccuracy = recentResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / recentResults.length;
        const firstHalf = recentResults.slice(0, Math.floor(recentResults.length / 2));
        const secondHalf = recentResults.slice(Math.floor(recentResults.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, r) => sum + (r.accuracy || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + (r.accuracy || 0), 0) / secondHalf.length;
        
        if (secondAvg <= firstAvg + 2) { // No significant improvement
          setShowPlateauAlert(true);
        }
      }
    }
  }, [exerciseResults, tier]);

  // Check if daily challenge completed today
  const dailyChallengeCompleted = exerciseResults?.some(r => {
    if (!r.is_daily_challenge) return false;
    const today = new Date().toDateString();
    const resultDate = new Date(r.created_date).toDateString();
    return today === resultDate;
  });

  // Calculate Quick Start progress from exercise results
  const calculateQuickStartProgress = (type, difficulty) => {
    if (!exerciseResults) return 0;
    const matching = exerciseResults.filter(
      r => r.exercise_type === type && r.difficulty === difficulty
    );
    if (matching.length === 0) return 0;
    // Return average accuracy of all matching exercises
    const avgAccuracy = matching.reduce((sum, r) => sum + (r.accuracy || 0), 0) / matching.length;
    return Math.round(avgAccuracy);
  };

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

  const stats = userStats || { xp: 0, level: 1, streak: 0, freeze_tokens: 0, daily_exercises_used: 0 };
  const dailyLimit = tier === 'free' ? 10 : null;
  const exercisesRemaining = dailyLimit ? Math.max(0, dailyLimit - (stats.daily_exercises_used || 0)) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Welcome Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Musician'}!
          </h1>
          {tier === 'free' && (
            <Link to={createPageUrl('Pricing')}>
              <Button size="sm" className="bg-gradient-to-r from-[#E9C46A] to-[#E76F51]">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">Continue your ear training journey</p>
      </div>

      {/* Free Tier Limit Warning */}
      {tier === 'free' && exercisesRemaining !== null && (
        <Alert className="mb-6 border-[#E9C46A] bg-[#E9C46A]/10">
          <AlertDescription className="flex items-center justify-between">
            <span>
              {exercisesRemaining > 0 
                ? `${exercisesRemaining} free exercises remaining today` 
                : 'Daily exercise limit reached'}
            </span>
            <Link to={createPageUrl('Pricing')}>
              <Button size="sm" variant="outline" className="border-[#E9C46A] text-[#E9C46A]">
                Upgrade for Unlimited
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

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

          {/* Daily Quests */}
          {dailyQuests && dailyQuests.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#0A1A2F] dark:text-white">Daily Quests</h2>
              <div className="space-y-3">
                {dailyQuests.map((quest) => (
                  <DailyQuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <Card className="border-[#3E82FC] bg-[#3E82FC]/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#3E82FC]" />
                  Recommendations for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-[#3E82FC] shrink-0">•</span>
                    <p className="text-muted-foreground">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Start Exercises */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#0A1A2F] dark:text-white">Quick Start</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ExerciseCard
                type="intervals"
                title="Interval Recognition"
                description="Identify the distance between two notes"
                difficulty="beginner"
                progress={calculateQuickStartProgress('intervals', 'beginner')}
                xpReward={10}
                locked={tier === 'free' && exercisesRemaining === 0}
              />
              <ExerciseCard
                type="chords"
                title="Chord Identification"
                description="Recognize chord qualities by ear"
                difficulty="beginner"
                progress={calculateQuickStartProgress('chords', 'beginner')}
                xpReward={10}
                locked={tier === 'free' && (exercisesRemaining === 0 || stats.level < 2)}
                requiredTier={stats.level < 2 ? 'pro' : null}
              />
              <ExerciseCard
                type="intervals"
                title="Advanced Intervals"
                description="Master all 12 chromatic intervals"
                difficulty="intermediate"
                progress={calculateQuickStartProgress('intervals', 'intermediate')}
                xpReward={15}
                locked={tier === 'free' || stats.level < 3}
                requiredTier="pro"
              />
              <ExerciseCard
                type="scales"
                title="Scale Recognition"
                description="Identify major and minor scales"
                difficulty="beginner"
                progress={calculateQuickStartProgress('scales', 'beginner')}
                xpReward={10}
                locked={tier === 'free' || stats.level < 3}
                requiredTier="pro"
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

          {/* Progress Chart */}
          <BlurredProgressChart userTier={tier} />

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

          {/* Recent Achievements */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E9C46A]" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {achievements && achievements.length > 0 ? (
                  achievements.slice(0, 4).map((ach) => (
                    <div
                      key={ach.id}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        ach.rarity === 'legendary' ? 'bg-gradient-to-br from-[#E9C46A] to-[#E76F51]' :
                        ach.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                        ach.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                        'bg-[#D7E5FF] dark:bg-slate-700'
                      }`}
                      title={ach.title}
                    >
                      <Award className={`w-6 h-6 ${
                        ach.rarity === 'common' ? 'text-[#243B73] dark:text-[#3E82FC]' : 'text-white'
                      }`} />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center opacity-50">
                      <Award className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center opacity-50">
                      <Award className="w-6 h-6 text-gray-400" />
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 mb-4">
                {achievements && achievements.length > 0 
                  ? `${achievements.length} achievements unlocked!`
                  : 'Complete exercises to unlock achievements'}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => setShowChallengeModal(true)}
                  className="w-full text-xs bg-[#3E82FC]"
                >
                  Challenge a Friend
                </Button>
                <Link to={createPageUrl('Leaderboard')}>
                  <Button variant="outline" className="w-full text-xs">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Challenge Friend Modal */}
      <ChallengeFriendModal
        open={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        currentUser={user}
      />
    </div>
  );
}