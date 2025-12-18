import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Target, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsAdmin() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  React.useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      window.location.href = createPageUrl('Dashboard');
    }
  }, [user, userLoading]);

  const { data: allSubscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.Subscription.list();
    },
    enabled: user?.role === 'admin',
  });

  const { data: allMetrics = [] } = useQuery({
    queryKey: ['conversionMetrics'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.ConversionMetric.list('-created_date', 1000);
    },
    enabled: user?.role === 'admin',
  });

  const { data: allExerciseResults = [] } = useQuery({
    queryKey: ['allExerciseResults'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.ExerciseResult.list('-created_date', 5000);
    },
    enabled: user?.role === 'admin',
  });

  const metrics = useMemo(() => {
    if (!allSubscriptions.length || !allMetrics.length) return null;

    const totalUsers = allSubscriptions.length;
    const freeUsers = allSubscriptions.filter(s => s.tier === 'free').length;
    const proUsers = allSubscriptions.filter(s => s.tier === 'pro').length;
    const proPlusUsers = allSubscriptions.filter(s => s.tier === 'pro_plus').length;

    const upgradeToPro = allMetrics.filter(m => m.event_type === 'upgrade_to_pro').length;
    const freeToProConversion = freeUsers > 0 ? (upgradeToPro / (freeUsers + upgradeToPro)) * 100 : 0;

    const day7Events = allMetrics.filter(m => m.event_type === 'day_7');
    const day7Upgrades = day7Events.filter(m => m.to_tier !== 'free').length;
    const day7ConversionRate = day7Events.length > 0 ? (day7Upgrades / day7Events.length) * 100 : 0;

    const completedExercises = allExerciseResults.length;
    const totalAttempts = completedExercises; 
    const exerciseCompletionRate = totalAttempts > 0 ? (completedExercises / totalAttempts) * 100 : 0;

    const churnEvents = allMetrics.filter(m => m.event_type === 'churn');
    const churnRate = totalUsers > 0 ? (churnEvents.length / totalUsers) * 100 : 0;

    return {
      totalUsers,
      freeUsers,
      proUsers,
      proPlusUsers,
      freeToProConversion: freeToProConversion.toFixed(2),
      day7ConversionRate: day7ConversionRate.toFixed(2),
      exerciseCompletionRate: exerciseCompletionRate.toFixed(2),
      churnRate: churnRate.toFixed(2),
    };
  }, [allSubscriptions, allMetrics, allExerciseResults]);

  const tierDistribution = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Free', value: metrics.freeUsers, color: '#94a3b8' },
      { name: 'Pro', value: metrics.proUsers, color: '#3E82FC' },
      { name: 'Pro Plus', value: metrics.proPlusUsers, color: '#E9C46A' },
    ];
  }, [metrics]);

  const conversionFunnel = useMemo(() => {
    if (!allMetrics.length) return [];
    
    const signups = allMetrics.filter(m => m.event_type === 'signup').length;
    const firstExercise = allMetrics.filter(m => m.event_type === 'first_exercise').length;
    const day7 = allMetrics.filter(m => m.event_type === 'day_7').length;
    const limitReached = allMetrics.filter(m => m.event_type === 'daily_limit_reached').length;
    const upgrades = allMetrics.filter(m => m.event_type === 'upgrade_to_pro' || m.event_type === 'upgrade_to_pro_plus').length;

    return [
      { stage: 'Signups', count: signups },
      { stage: 'First Exercise', count: firstExercise },
      { stage: 'Day 7', count: day7 },
      { stage: 'Limit Reached', count: limitReached },
      { stage: 'Upgraded', count: upgrades },
    ];
  }, [allMetrics]);

  if (userLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Loading metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Admin Metrics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Subscription conversion and user engagement metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3E82FC]" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Free: {metrics.freeUsers} | Pro: {metrics.proUsers} | Pro+: {metrics.proPlusUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2A9D8F]" />
              Free → Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.freeToProConversion}%</div>
            <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-[#E9C46A]" />
              Day 7 Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.day7ConversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Week 1 upgrade rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E76F51]" />
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churnRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">User churn</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="mb-8">
        <TabsList>
          <TabsTrigger value="distribution">Tier Distribution</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>User Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionFunnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3E82FC" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Exercise Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2A9D8F]" />
            Exercise Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{metrics.exerciseCompletionRate}%</div>
          <p className="text-sm text-muted-foreground">
            {allExerciseResults.length} total exercises completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}