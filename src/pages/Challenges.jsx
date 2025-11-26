import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Zap, Timer, Target, Award, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CHALLENGES = [
  {
    id: 'daily',
    title: 'Daily Challenge',
    description: 'Test your skills with a mix of intervals and chords',
    xpReward: 50,
    timeLimit: '90 seconds',
    icon: Trophy,
    color: 'from-[#E9C46A] to-[#F4A261]',
    path: 'DailyChallenge',
    requiresLevel: 1,
  },
  {
    id: 'weekly',
    title: 'Weekly Challenge',
    description: 'Extended challenge with advanced content',
    xpReward: 150,
    timeLimit: '5 minutes',
    icon: Award,
    color: 'from-[#3E82FC] to-[#243B73]',
    path: 'WeeklyChallenge',
    requiresLevel: 5,
  },
  {
    id: 'speed',
    title: 'Speed Run',
    description: 'Answer as many questions as you can before time runs out',
    xpReward: 30,
    timeLimit: '60 seconds',
    icon: Timer,
    color: 'from-[#E76F51] to-[#F4A261]',
    path: 'SpeedChallenge',
    requiresLevel: 3,
  },
  {
    id: 'accuracy',
    title: 'Perfect Pitch',
    description: 'No mistakes allowed - how far can you go?',
    xpReward: 40,
    timeLimit: 'Unlimited',
    icon: Target,
    color: 'from-[#2A9D8F] to-[#3E82FC]',
    path: 'AccuracyChallenge',
    requiresLevel: 4,
  },
];

export default function Challenges() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ created_by: user.email });
      return stats[0] || { level: 1 };
    },
    enabled: !!user?.email,
  });

  const { data: exerciseResults } = useQuery({
    queryKey: ['exerciseResults', user?.email],
    queryFn: async () => {
      return await base44.entities.ExerciseResult.filter({ created_by: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email,
  });

  const userLevel = userStats?.level || 1;

  // Check if daily challenge completed today
  const dailyChallengeCompleted = exerciseResults?.some(r => {
    if (!r.is_daily_challenge) return false;
    const today = new Date().toDateString();
    const resultDate = new Date(r.created_date).toDateString();
    return today === resultDate;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-1 sm:mb-2">
          Challenges
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Test your skills and earn bonus XP
        </p>
      </div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {CHALLENGES.map((challenge) => {
          const isLocked = userLevel < challenge.requiresLevel;
          const isCompleted = challenge.id === 'daily' && dailyChallengeCompleted;
          const Icon = challenge.icon;

          return (
            <Card 
              key={challenge.id}
              className={`relative overflow-hidden border-0 shadow-xl transition-all duration-300 ${
                isLocked ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-2xl'
              }`}
            >
              {isLocked && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Unlock at Level {challenge.requiresLevel}
                    </p>
                  </div>
                </div>
              )}

              <div className={`h-2 bg-gradient-to-r ${challenge.color}`} />
              
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${challenge.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{challenge.title}</h3>
                      {isCompleted && (
                        <Badge className="bg-[#2A9D8F] text-white">Completed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-[#E9C46A]">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">+{challenge.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.timeLimit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {isCompleted ? (
                    <Button disabled className="w-full">
                      Completed Today
                    </Button>
                  ) : (
                    <Link to={createPageUrl(challenge.path)}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${challenge.color} hover:opacity-90`}
                        disabled={isLocked}
                      >
                        Start Challenge
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard Teaser */}
      <Card className="mt-8 border-0 shadow-lg bg-gradient-to-br from-[#0A1A2F] to-[#243B73] text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Weekly Leaderboard</h3>
              <p className="text-white/60 text-sm">
                Compete with other musicians and climb the ranks
              </p>
            </div>
            <Link to={createPageUrl('Leaderboard')}>
              <Button variant="secondary">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}