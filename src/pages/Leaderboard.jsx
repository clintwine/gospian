import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Crown, User, Flame, Target, Zap, Users } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const [timePeriod, setTimePeriod] = useState('all-time');
  const [sortBy, setSortBy] = useState('xp');
  const [exerciseType, setExerciseType] = useState('all');
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  React.useEffect(() => {
    if (!userLoading && !currentUser) {
      window.location.href = createPageUrl('Home');
    }
  }, [currentUser, userLoading]);

  const { data: apiData, isLoading: dataLoading } = useQuery({
    queryKey: ['leaderboardData'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('leaderboardData');
      return data;
    },
  });

  const allStats = apiData?.allStats || [];
  const allResults = apiData?.allResults || [];

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const sent = await base44.entities.Friend.filter({ user_email: currentUser.email });
      const received = await base44.entities.Friend.filter({ friend_email: currentUser.email });
      return [...sent, ...received];
    },
    enabled: !!currentUser?.email,
  });

  const getFriendEmails = () => {
    if (!friends || !currentUser) return [];
    const friendEmails = friends.map(f => 
      f.user_email === currentUser.email ? f.friend_email : f.user_email
    );
    return [...friendEmails, currentUser.email]; // Include current user
  };

  // Calculate leaderboard data based on filters
  const filteredLeaderboardData = useMemo(() => {
    if (!allStats || !allResults || allStats.length === 0) return [];

    // Filter results by time period and exercise type
    const now = new Date();
    const filteredResults = allResults.filter(r => {
      // Time period filter
      if (timePeriod !== 'all-time') {
        const resultDate = new Date(r.created_date);
        if (timePeriod === 'daily') {
          if (resultDate.toDateString() !== now.toDateString()) return false;
        }
        if (timePeriod === 'weekly') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (resultDate < weekAgo) return false;
        }
      }
      
      // Exercise type filter
      if (exerciseType !== 'all') {
        return r.exercise_type === exerciseType;
      }
      
      return true;
    });

    // Aggregate by user - initialize all users from allStats
    const userAggregates = {};
    
    allStats.forEach(stat => {
      userAggregates[stat.created_by] = {
        email: stat.created_by,
        xp: 0,
        streak: stat.streak || 0,
        level: stat.level || 1,
        correctAnswers: 0,
        totalQuestions: 0,
        exercisesCompleted: 0,
      };
    });
    
    // Aggregate exercise results from filtered data
    filteredResults.forEach(r => {
      if (!userAggregates[r.created_by]) {
        const userStat = allStats.find(s => s.created_by === r.created_by);
        userAggregates[r.created_by] = {
          email: r.created_by,
          xp: 0,
          streak: userStat?.streak || 0,
          level: userStat?.level || 1,
          correctAnswers: 0,
          totalQuestions: 0,
          exercisesCompleted: 0,
        };
      }
      const user = userAggregates[r.created_by];
      user.xp += r.xp_earned || 0;
      user.correctAnswers += r.correct_answers || 0;
      user.totalQuestions += r.total_questions || 0;
      user.exercisesCompleted += 1;
    });
    
    // For all-time + all exercises view, use total XP from stats
    if (timePeriod === 'all-time' && exerciseType === 'all') {
      allStats.forEach(stat => {
        if (userAggregates[stat.created_by]) {
          userAggregates[stat.created_by].xp = stat.xp || 0;
          userAggregates[stat.created_by].exercisesCompleted = stat.exercises_completed || 0;
        }
      });
    }

    // Convert to array and sort
    let sorted = Object.values(userAggregates);
    
    // Calculate average response time for tie-breaking
    sorted.forEach(user => {
      const userResults = filteredResults.filter(r => r.created_by === user.email);
      const totalTime = userResults.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0);
      user.avgTime = userResults.length > 0 ? totalTime / userResults.length : 999999;
      user.lastActivity = userResults.length > 0 ? new Date(Math.max(...userResults.map(r => new Date(r.created_date)))) : new Date(0);
    });

    // Sort: highest score, then fastest time, then recent activity
    if (sortBy === 'xp') {
      sorted.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (a.avgTime !== b.avgTime) return a.avgTime - b.avgTime;
        return b.lastActivity - a.lastActivity;
      });
    } else if (sortBy === 'streak') {
      sorted.sort((a, b) => {
        if (b.streak !== a.streak) return b.streak - a.streak;
        if (a.avgTime !== b.avgTime) return a.avgTime - b.avgTime;
        return b.lastActivity - a.lastActivity;
      });
    } else if (sortBy === 'accuracy') {
      sorted.sort((a, b) => {
        const accA = a.totalQuestions > 0 ? (a.correctAnswers / a.totalQuestions) : 0;
        const accB = b.totalQuestions > 0 ? (b.correctAnswers / b.totalQuestions) : 0;
        if (accB !== accA) return accB - accA;
        if (a.avgTime !== b.avgTime) return a.avgTime - b.avgTime;
        return b.lastActivity - a.lastActivity;
      });
    }

    // Show users with activity matching the current filters
    let filtered = sorted.filter(u => u.exercisesCompleted > 0);
    
    // Filter by friends only if enabled
    if (showFriendsOnly) {
      const friendEmails = getFriendEmails();
      filtered = filtered.filter(u => friendEmails.includes(u.email));
    }
    
    return filtered;
  }, [allStats, allResults, timePeriod, sortBy, exerciseType, showFriendsOnly, friends, currentUser]);

  const getDisplayValue = (user) => {
    if (sortBy === 'xp') return { value: user.xp, label: 'XP' };
    if (sortBy === 'streak') return { value: user.streak, label: 'days' };
    if (sortBy === 'accuracy') {
      const acc = user.totalQuestions > 0 ? Math.round((user.correctAnswers / user.totalQuestions) * 100) : 0;
      return { value: `${acc}%`, label: 'accuracy' };
    }
    return { value: user.xp, label: 'XP' };
  };

  const getSortIcon = () => {
    if (sortBy === 'xp') return <Zap className="w-4 h-4" />;
    if (sortBy === 'streak') return <Flame className="w-4 h-4" />;
    if (sortBy === 'accuracy') return <Target className="w-4 h-4" />;
    return <Trophy className="w-4 h-4" />;
  };

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

  const isLoading = dataLoading || userLoading || !currentUser;

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

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-1 sm:mb-2">
              Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              See how you rank against other musicians
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Tabs value={timePeriod} onValueChange={setTimePeriod}>
            <TabsList className="bg-[#D7E5FF]/50 dark:bg-slate-800 h-9">
              <TabsTrigger value="daily" className="text-xs sm:text-sm px-2 sm:px-3">Today</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs sm:text-sm px-2 sm:px-3">This Week</TabsTrigger>
              <TabsTrigger value="all-time" className="text-xs sm:text-sm px-2 sm:px-3">All Time</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant={showFriendsOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFriendsOnly(!showFriendsOnly)}
            className={`h-9 ${showFriendsOnly ? 'bg-[#3E82FC]' : ''}`}
          >
            <Users className="w-4 h-4 mr-2" />
            Friends Only
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xp">
                <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> XP</span>
              </SelectItem>
              <SelectItem value="streak">
                <span className="flex items-center gap-2"><Flame className="w-3 h-3" /> Streak</span>
              </SelectItem>
              <SelectItem value="accuracy">
                <span className="flex items-center gap-2"><Target className="w-3 h-3" /> Accuracy</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={exerciseType} onValueChange={setExerciseType}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Exercise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exercises</SelectItem>
              <SelectItem value="intervals">Intervals</SelectItem>
              <SelectItem value="chords">Chords</SelectItem>
              <SelectItem value="scales">Scales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {filteredLeaderboardData.length >= 3 && filteredLeaderboardData[0] && filteredLeaderboardData[1] && filteredLeaderboardData[2] && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {/* 2nd Place */}
          <Card className="border-2 border-gray-300 dark:border-gray-600 mt-6 sm:mt-8">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </div>
              <Medal className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-gray-400" />
              <p className="font-semibold text-xs sm:text-sm truncate">
                {filteredLeaderboardData[1].email?.split('@')[0] || 'User'}
              </p>
              <p className="text-base sm:text-lg font-bold text-[#3E82FC]">
                {getDisplayValue(filteredLeaderboardData[1]).value} <span className="text-xs font-normal text-muted-foreground">{getDisplayValue(filteredLeaderboardData[1]).label}</span>
              </p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-2 border-[#E9C46A] bg-gradient-to-b from-[#E9C46A]/10 to-transparent">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-full bg-[#E9C46A]/20 flex items-center justify-center">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-[#E9C46A]" />
              </div>
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 text-[#E9C46A]" />
              <p className="font-semibold text-xs sm:text-base truncate">
                {filteredLeaderboardData[0].email?.split('@')[0] || 'User'}
              </p>
              <p className="text-lg sm:text-xl font-bold text-[#E9C46A]">
                {getDisplayValue(filteredLeaderboardData[0]).value} <span className="text-xs font-normal text-muted-foreground">{getDisplayValue(filteredLeaderboardData[0]).label}</span>
              </p>
              <Badge className="bg-[#E9C46A] text-white mt-2 text-[10px] sm:text-xs">Champion</Badge>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="border-2 border-amber-500 dark:border-amber-600 mt-6 sm:mt-8">
            <CardContent className="p-2 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <Medal className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-amber-600" />
              <p className="font-semibold text-xs sm:text-sm truncate">
                {filteredLeaderboardData[2].email?.split('@')[0] || 'User'}
              </p>
              <p className="text-base sm:text-lg font-bold text-amber-600">
                {getDisplayValue(filteredLeaderboardData[2]).value} <span className="text-xs font-normal text-muted-foreground">{getDisplayValue(filteredLeaderboardData[2]).label}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {getSortIcon()}
            <span className="text-[#E9C46A]">Rankings</span>
            <Badge variant="outline" className="ml-auto text-xs">
              {timePeriod === 'daily' ? 'Today' : timePeriod === 'weekly' ? 'This Week' : 'All Time'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {filteredLeaderboardData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rankings yet for this period. Start training to get on the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(() => {
                if (!filteredLeaderboardData || filteredLeaderboardData.length === 0) return null;
                
                const currentUserIndex = filteredLeaderboardData.findIndex(u => u.email === currentUser?.email);
                const showFromIndex = currentUserIndex > 3 ? Math.max(0, currentUserIndex - 3) : 0;
                const visibleData = currentUserIndex > 3 ? filteredLeaderboardData.slice(showFromIndex, currentUserIndex + 5) : filteredLeaderboardData;
                
                return visibleData.map((user) => {
                  const index = filteredLeaderboardData.indexOf(user);
                  const rank = index + 1;
                  const isCurrentUser = user.email === currentUser?.email;
                  const displayValue = getDisplayValue(user);

                  return (
                    <div
                      key={user.email}
                      className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl transition-all ${
                        isCurrentUser ? 'bg-[#3E82FC]/10 border-2 border-[#3E82FC]' : getRankBackground(rank)
                      } ${rank <= 3 ? 'border-2' : 'hover:bg-muted/50'}`}
                    >
                      <div className="w-6 sm:w-8 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D7E5FF] dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#243B73] dark:text-[#3E82FC]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate text-sm sm:text-base ${isCurrentUser ? 'text-[#3E82FC]' : ''}`}>
                          {user.email?.split('@')[0] || 'Anonymous'}
                          {isCurrentUser && <span className="text-[10px] sm:text-xs ml-1 sm:ml-2">(You)</span>}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                          <span>Level {user.level || 1}</span>
                          {user.streak > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {user.streak}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#243B73] dark:text-[#3E82FC] text-sm sm:text-base">{displayValue.value}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{displayValue.label}</p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}