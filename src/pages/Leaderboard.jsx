import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const [tab, setTab] = useState('global');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allStats, isLoading } = useQuery({
    queryKey: ['allUserStats'],
    queryFn: async () => {
      // In a real app, this would be a server-side aggregation
      // For demo, we'll show current user's position
      const stats = await base44.entities.UserStats.list('-xp', 50);
      return stats;
    },
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-[#E9C46A]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-[#E9C46A]/20 to-transparent border-[#E9C46A]';
    if (rank === 2) return 'bg-gradient-to-r from-gray-200/50 to-transparent border-gray-300 dark:from-gray-700/50 dark:border-gray-600';
    if (rank === 3) return 'bg-gradient-to-r from-amber-100/50 to-transparent border-amber-300 dark:from-amber-900/20 dark:border-amber-700';
    return '';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const leaderboardData = allStats || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you rank against other musicians
          </p>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-[#D7E5FF]/50 dark:bg-slate-800">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <Card className="border-2 border-gray-300 dark:border-gray-600 mt-8">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <Medal className="w-6 h-6 mx-auto mb-1 text-gray-400" />
              <p className="font-semibold text-sm truncate">
                {leaderboardData[1]?.created_by?.split('@')[0] || 'User'}
              </p>
              <p className="text-lg font-bold text-[#3E82FC]">{leaderboardData[1]?.xp || 0} XP</p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-2 border-[#E9C46A] bg-gradient-to-b from-[#E9C46A]/10 to-transparent">
            <CardContent className="p-4 text-center">
              <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-[#E9C46A]/20 flex items-center justify-center">
                <User className="w-7 h-7 text-[#E9C46A]" />
              </div>
              <Crown className="w-8 h-8 mx-auto mb-1 text-[#E9C46A]" />
              <p className="font-semibold truncate">
                {leaderboardData[0]?.created_by?.split('@')[0] || 'User'}
              </p>
              <p className="text-xl font-bold text-[#E9C46A]">{leaderboardData[0]?.xp || 0} XP</p>
              <Badge className="bg-[#E9C46A] text-white mt-2">Champion</Badge>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="border-2 border-amber-500 dark:border-amber-600 mt-8">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <User className="w-6 h-6 text-amber-600" />
              </div>
              <Medal className="w-6 h-6 mx-auto mb-1 text-amber-600" />
              <p className="font-semibold text-sm truncate">
                {leaderboardData[2]?.created_by?.split('@')[0] || 'User'}
              </p>
              <p className="text-lg font-bold text-amber-600">{leaderboardData[2]?.xp || 0} XP</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#E9C46A]" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rankings yet. Start training to get on the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardData.map((stat, index) => {
                const rank = index + 1;
                const isCurrentUser = stat.created_by === currentUser?.email;

                return (
                  <div
                    key={stat.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      isCurrentUser ? 'bg-[#3E82FC]/10 border-2 border-[#3E82FC]' : getRankBackground(rank)
                    } ${rank <= 3 ? 'border-2' : 'hover:bg-muted/50'}`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#D7E5FF] dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#243B73] dark:text-[#3E82FC]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${isCurrentUser ? 'text-[#3E82FC]' : ''}`}>
                        {stat.created_by?.split('@')[0] || 'Anonymous'}
                        {isCurrentUser && <span className="text-xs ml-2">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Level {stat.level || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#243B73] dark:text-[#3E82FC]">{stat.xp || 0}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}