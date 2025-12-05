import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  User, 
  Volume2, 
  Moon, 
  Sun, 
  LogOut, 
  TrendingUp,
  Award,
  Flame,
  Target,
  Zap
} from 'lucide-react';
import XPBar from '@/components/ui/XPBar';
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ProfilePictureSelector from '@/components/profile/ProfilePictureSelector';

export default function Profile() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState('light');
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async ({ queryKey }) => {
      const userEmail = queryKey[1];
      if (!userEmail) return null;
      const stats = await base44.entities.UserStats.filter({ created_by: userEmail });
      return stats[0] || { xp: 0, level: 1, streak: 0, exercises_completed: 0, perfect_scores: 0, audio_type: 'piano', theme: 'light' };
    },
    enabled: !!user?.email,
  });
  
  // Update theme from userStats or localStorage
  React.useEffect(() => {
    const savedTheme = userStats?.theme || (typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light') || 'light';
    setTheme(savedTheme);
  }, [userStats?.theme]);

  const { data: exerciseResults } = useQuery({
    queryKey: ['exerciseResults', user?.email],
    queryFn: async ({ queryKey }) => {
      const userEmail = queryKey[1];
      if (!userEmail) return null;
      return await base44.entities.ExerciseResult.filter({ created_by: userEmail }, '-created_date', 30);
    },
    enabled: !!user?.email,
  });

  const updateStatsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserStats.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['userStats']),
  });

  const updateProfilePictureMutation = useMutation({
    mutationFn: (pictureUrl) => base44.auth.updateMe({ profile_picture: pictureUrl }),
    onSuccess: () => queryClient.invalidateQueries(['currentUser']),
  });

  const handleThemeChange = async (checked) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    if (userStats?.id) {
      await updateStatsMutation.mutateAsync({
        id: userStats.id,
        data: { theme: newTheme },
      });
    }
  };

  const handleAudioChange = async (value) => {
    if (userStats?.id) {
      await updateStatsMutation.mutateAsync({
        id: userStats.id,
        data: { audio_type: value },
      });
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Prepare XP history chart data
  const xpHistoryData = exerciseResults?.slice(0, 14).reverse().map((result, index) => ({
    name: `Day ${index + 1}`,
    xp: result.xp_earned || 0,
  })) || [];

  if (userLoading || statsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-32 w-full mb-6 rounded-2xl" />
        <Skeleton className="h-64 w-full mb-6 rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const stats = userStats || { xp: 0, level: 1, streak: 0 };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Profile Header */}
      <Card className="border-0 shadow-xl mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#0A1A2F] to-[#243B73]" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            <div className="relative w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center overflow-hidden">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[#243B73] dark:text-[#3E82FC]" />
              )}
              <ProfilePictureSelector 
                currentPicture={user?.profile_picture} 
                onUpdate={(url) => updateProfilePictureMutation.mutate(url)} 
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{user?.full_name || 'Musician'}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div className="w-full sm:w-64">
              <XPBar xp={stats.xp} level={stats.level} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-[#3E82FC]" />
            <p className="text-2xl font-bold">{stats.exercises_completed || 0}</p>
            <p className="text-xs text-muted-foreground">Exercises</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-[#2A9D8F]" />
            <p className="text-2xl font-bold">{stats.perfect_scores || 0}</p>
            <p className="text-xs text-muted-foreground">Perfect Scores</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto mb-2 text-[#E76F51]" />
            <p className="text-2xl font-bold">{stats.streak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-[#E9C46A]" />
            <p className="text-2xl font-bold">{stats.xp || 0}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
      </div>

      {/* XP History Chart */}
      {xpHistoryData.length > 0 && (
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3E82FC]" />
              Recent XP Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpHistoryData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#3E82FC" 
                    strokeWidth={2}
                    dot={{ fill: '#3E82FC' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-[#3E82FC]" />
              ) : (
                <Sun className="w-5 h-5 text-[#E9C46A]" />
              )}
              <div>
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark theme</p>
              </div>
            </div>
            <Switch 
              checked={theme === 'dark'} 
              onCheckedChange={handleThemeChange}
            />
          </div>

          {/* Audio Preference */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-[#2A9D8F]" />
              <div>
                <Label className="text-base">Sound Type</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred instrument sound</p>
              </div>
            </div>
            <Select 
              value={stats.audio_type || 'piano'} 
              onValueChange={handleAudioChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piano">Piano</SelectItem>
                <SelectItem value="guitar">Guitar</SelectItem>
                <SelectItem value="synth">Synth</SelectItem>
                <SelectItem value="sine">Pure Tone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logout */}
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-[#E76F51] hover:text-[#E76F51] hover:bg-[#E76F51]/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}