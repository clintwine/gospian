import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Award, 
  Flame, 
  Target, 
  Music, 
  Headphones, 
  Star, 
  Zap, 
  Trophy,
  Lock,
  CheckCircle2
} from 'lucide-react';

const ALL_BADGES = [
  {
    id: 'first_exercise',
    name: 'First Steps',
    description: 'Complete your first exercise',
    icon: Music,
    color: 'from-[#3E82FC] to-[#243B73]',
    requirement: (stats) => (stats?.exercises_completed || 0) >= 1,
    xpReward: 10,
  },
  {
    id: 'interval_novice',
    name: 'Interval Novice',
    description: 'Complete 10 interval exercises',
    icon: Headphones,
    color: 'from-[#2A9D8F] to-[#3E82FC]',
    requirement: (stats) => (stats?.exercises_completed || 0) >= 10,
    xpReward: 30,
  },
  {
    id: 'perfect_ten',
    name: 'Perfect Ten',
    description: 'Get 10 perfect scores',
    icon: Star,
    color: 'from-[#E9C46A] to-[#F4A261]',
    requirement: (stats) => (stats?.perfect_scores || 0) >= 10,
    xpReward: 50,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: Flame,
    color: 'from-[#E76F51] to-[#F4A261]',
    requirement: (stats) => (stats?.streak || 0) >= 7,
    xpReward: 40,
  },
  {
    id: 'streak_30',
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    icon: Flame,
    color: 'from-[#E76F51] to-[#E9C46A]',
    requirement: (stats) => (stats?.streak || 0) >= 30,
    xpReward: 100,
  },
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: Target,
    color: 'from-[#243B73] to-[#3E82FC]',
    requirement: (stats) => (stats?.level || 1) >= 5,
    xpReward: 50,
  },
  {
    id: 'level_10',
    name: 'Accomplished',
    description: 'Reach Level 10',
    icon: Award,
    color: 'from-[#E9C46A] to-[#243B73]',
    requirement: (stats) => (stats?.level || 1) >= 10,
    xpReward: 100,
  },
  {
    id: 'xp_500',
    name: 'XP Hunter',
    description: 'Earn 500 XP',
    icon: Zap,
    color: 'from-[#E9C46A] to-[#E76F51]',
    requirement: (stats) => (stats?.xp || 0) >= 500,
    xpReward: 25,
  },
  {
    id: 'xp_1000',
    name: 'XP Master',
    description: 'Earn 1000 XP',
    icon: Zap,
    color: 'from-[#E9C46A] to-[#2A9D8F]',
    requirement: (stats) => (stats?.xp || 0) >= 1000,
    xpReward: 50,
  },
  {
    id: 'daily_champion',
    name: 'Daily Champion',
    description: 'Complete 5 daily challenges',
    icon: Trophy,
    color: 'from-[#E9C46A] to-[#F4A261]',
    requirement: (stats, results) => {
      const dailyChallenges = results?.filter(r => r.is_daily_challenge) || [];
      return dailyChallenges.length >= 5;
    },
    xpReward: 75,
  },
  {
    id: 'exercises_50',
    name: 'Dedicated Learner',
    description: 'Complete 50 exercises',
    icon: Music,
    color: 'from-[#2A9D8F] to-[#243B73]',
    requirement: (stats) => (stats?.exercises_completed || 0) >= 50,
    xpReward: 100,
  },
  {
    id: 'exercises_100',
    name: 'Ear Training Expert',
    description: 'Complete 100 exercises',
    icon: Award,
    color: 'from-[#E9C46A] to-[#E76F51]',
    requirement: (stats) => (stats?.exercises_completed || 0) >= 100,
    xpReward: 200,
  },
];

export default function Badges() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ created_by: user.email });
      return stats[0] || { level: 1, xp: 0, streak: 0, exercises_completed: 0, perfect_scores: 0 };
    },
    enabled: !!user?.email,
  });

  const { data: exerciseResults } = useQuery({
    queryKey: ['exerciseResults', user?.email],
    queryFn: async () => {
      return await base44.entities.ExerciseResult.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const earnedBadges = ALL_BADGES.filter(badge => badge.requirement(userStats, exerciseResults));
  const lockedBadges = ALL_BADGES.filter(badge => !badge.requirement(userStats, exerciseResults));

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-1 sm:mb-2">
          Badges & Achievements
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {earnedBadges.length} of {ALL_BADGES.length} badges earned
        </p>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#2A9D8F]" />
            Earned ({earnedBadges.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {earnedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Card 
                  key={badge.id} 
                  className="border-2 border-[#2A9D8F] shadow-lg hover:shadow-xl transition-all"
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    <span className="text-xs font-medium text-[#E9C46A]">+{badge.xpReward} XP</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          Locked ({lockedBadges.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {lockedBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card 
                key={badge.id} 
                className="border-0 shadow-lg opacity-60"
              >
                <CardContent className="p-4 text-center relative">
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  <span className="text-xs font-medium text-muted-foreground">+{badge.xpReward} XP</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}