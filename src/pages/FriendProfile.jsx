import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Flame, Target, Award, ArrowLeft, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FriendProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const friendEmail = urlParams.get('email');

  const { data: friendData } = useQuery({
    queryKey: ['friendProfileData', friendEmail],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('friendProfileData', { friendEmail });
      return data;
    },
    enabled: !!friendEmail,
  });

  const friendUser = friendData?.friendUser;
  const friendStats = friendData?.friendStats || { xp: 0, level: 1, streak: 0 };
  const friendResults = friendData?.friendResults || [];

  if (!friendEmail || !friendUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const recentActivity = friendResults?.slice(0, 7).reverse().map(r => ({
    date: new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    xp: r.xp_earned || 0,
  })) || [];

  const totalExercises = friendResults?.length || 0;
  const totalCorrect = friendResults?.reduce((sum, r) => sum + (r.correct_answers || 0), 0) || 0;
  const totalQuestions = friendResults?.reduce((sum, r) => sum + (r.total_questions || 0), 0) || 0;
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <Link to={createPageUrl('Friends')}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Friends
        </Button>
      </Link>

      {/* Profile Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-[#0A1A2F] to-[#243B73] text-white mb-6">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E9C46A] to-[#F4A261] flex items-center justify-center">
              <span className="text-white font-bold text-4xl">
                {friendUser.full_name?.[0] || friendEmail[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{friendUser.full_name || friendEmail.split('@')[0]}</h1>
              <p className="text-white/70 mb-4">{friendEmail}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-white/20 text-white border-0">
                  Level {friendStats?.level || 1}
                </Badge>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#E9C46A]" />
                  <span>{friendStats?.xp || 0} XP</span>
                </div>
                {friendStats?.streak > 0 && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>{friendStats.streak} day streak</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-[#3E82FC]" />
            <p className="text-3xl font-bold mb-1">{avgAccuracy}%</p>
            <p className="text-sm text-muted-foreground">Average Accuracy</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-[#E9C46A]" />
            <p className="text-3xl font-bold mb-1">{totalExercises}</p>
            <p className="text-sm text-muted-foreground">Exercises Completed</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-[#2A9D8F]" />
            <p className="text-3xl font-bold mb-1">{friendResults?.filter(r => r.accuracy === 100).length || 0}</p>
            <p className="text-sm text-muted-foreground">Perfect Scores</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#3E82FC]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={recentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="xp" stroke="#3E82FC" strokeWidth={3} dot={{ fill: '#3E82FC', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Exercises */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          {friendResults?.length > 0 ? (
            <div className="space-y-3">
              {friendResults.slice(0, 5).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium capitalize">{result.exercise_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#3E82FC]">{result.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">+{result.xp_earned} XP</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No exercises completed yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}