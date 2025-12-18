import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Music2, Headphones, Trophy, Zap, Users, TrendingUp, Target, Award, ArrowRight, CheckCircle2, Sparkles, Crown, Check, Play, Flame, Brain, GraduationCap, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (err) {
        return null;
      }
    },
    retry: false,
  });

  React.useEffect(() => {
    if (!isLoading && user) {
      window.location.href = createPageUrl('Dashboard');
    }
  }, [user, isLoading]);

  const handleSignUp = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Dashboard'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Dashboard'));
  };

  if (isLoading) {
    return null;
  }

  const features = [
    {
      icon: Brain,
      title: 'AI Plateau Detection',
      description: 'Smart algorithms detect when you\'re stuck and automatically adjust your training to break through.',
      gradient: 'from-[#3E82FC] to-[#2A9D8F]',
    },
    {
      icon: Trophy,
      title: 'Global Leaderboards',
      description: 'Compete with friends or worldwide musicians. Track your rank in real-time across all exercises.',
      gradient: 'from-[#E9C46A] to-[#F4A261]',
    },
    {
      icon: BarChart3,
      title: 'XP & Mastery Tracking',
      description: 'Level up as you train. Track mastery percentages for every chord, interval, and scale.',
      gradient: 'from-[#2A9D8F] to-[#264653]',
    },
    {
      icon: GraduationCap,
      title: 'Real-Music Context',
      description: 'Move beyond drills. Train with real musical arrangements to bridge practice and performance.',
      gradient: 'from-[#E76F51] to-[#E9C46A]',
    },
  ];

  const benefits = [
    'Develop perfect pitch and relative pitch',
    'Train anywhere, anytime on any device',
    'Track your progress with detailed analytics',
    'Gamified learning that keeps you motivated',
    'Join a community of passionate musicians',
    'Unlock achievements and earn XP',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#D7E5FF] dark:from-[#0A1A2F] dark:to-[#243B73]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-xl border-b border-[#D7E5FF] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#243B73] to-[#3E82FC] flex items-center justify-center">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#0A1A2F] dark:text-white">GOSPIAN</span>
            </div>
            <Button onClick={handleLogin} variant="outline">
              Log In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-[#3E82FC] text-white border-0 text-sm px-4 py-2">
            🎵 The Future of Ear Training
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A1A2F] dark:text-white mb-6 leading-tight">
            Master Your Musical Ear
            <br />
            <span className="bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F] bg-clip-text text-transparent">
              Like Never Before
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your musical abilities with AI-powered training, competitive challenges, 
            and a vibrant community of musicians. Perfect pitch is just the beginning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              onClick={handleSignUp}
              className="bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F] hover:opacity-90 text-white text-lg px-8 py-6 shadow-xl"
            >
              Start Training Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="text-lg px-8 py-6"
            >
              I Already Have an Account
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Active Musicians', value: '10K+' },
              { label: 'Exercises Completed', value: '500K+' },
              { label: 'Avg. Accuracy Gain', value: '+45%' },
              { label: 'Daily Active Users', value: '2K+' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#3E82FC] dark:text-[#3E82FC]">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0A1A2F]">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F]">
            Try It Now
          </Badge>
          <h2 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-4">
            Test Your Ear in 5 Seconds
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience our studio-quality sound engine before you sign up. Can you identify this interval?
          </p>
          <Card className="border-2 border-[#3E82FC] bg-gradient-to-br from-[#D7E5FF]/30 to-white dark:from-[#243B73]/20 dark:to-slate-900 max-w-md mx-auto">
            <CardContent className="p-8">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F] text-lg py-6"
                onClick={() => alert('Demo: Perfect 5th played! Full exercise library available after signup.')}
              >
                <Play className="w-5 h-5 mr-2" />
                Play a Perfect 5th
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Full library of intervals, chords, and scales available inside
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0A1A2F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed by musicians, for musicians
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#0A1A2F] dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Growth Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">
              Track Your Musical Growth
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              More than drills—a complete mastery system
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3E82FC] to-[#2A9D8F] flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#0A1A2F] dark:text-white">Streak Protection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build consistency with daily streaks. Pro users get automatic streak protection to maintain momentum.
                </p>
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                  <p className="text-2xl font-bold text-orange-600">🔥 7 Days</p>
                  <p className="text-xs text-muted-foreground">Your streak grows with you</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E9C46A] to-[#E76F51] flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#0A1A2F] dark:text-white">XP & Levels</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Every exercise earns XP. Level up to unlock advanced training modes and compete globally.
                </p>
                <div className="bg-[#D7E5FF] dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-2xl font-bold text-[#3E82FC]">Level 12</p>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full mt-2">
                    <div className="w-3/4 bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F] h-2 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#264653] flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#0A1A2F] dark:text-white">Chord Mastery</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Track accuracy for every chord type. See exactly where you need more practice.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Major</span>
                    <span className="text-xs font-bold text-[#2A9D8F]">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Minor7</span>
                    <span className="text-xs font-bold text-[#E9C46A]">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Dim7</span>
                    <span className="text-xs font-bold text-[#E76F51]">62%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0A1A2F]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-6">
                Why Musicians Choose GOSPIAN
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2A9D8F]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                    </div>
                    <p className="text-base text-[#0A1A2F] dark:text-white/90">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-[#3E82FC] to-[#2A9D8F] text-white">
              <CardContent className="p-8">
                <Trophy className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Start Your Journey Today</h3>
                <p className="mb-6 text-white/90 leading-relaxed">
                  Join thousands of musicians who are transforming their musical abilities. 
                  No credit card required. Start training in under 60 seconds.
                </p>
                <Button 
                  onClick={handleSignUp}
                  className="w-full bg-white text-[#3E82FC] hover:bg-white/90 font-bold py-6"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#D7E5FF]/30 dark:from-[#0A1A2F] dark:to-[#243B73]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-[#E9C46A] to-[#E76F51] mb-4">
              Founders Pricing – Limited Time
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground">
              Train your ear with plans designed for every musician
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Free Plan */}
            <div className="relative border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-8 bg-white dark:bg-slate-900 hover:scale-105 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Free</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 min-h-[40px]">
                Train your ear every day — free.
              </p>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold">$0</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                  <span className="text-sm">Basic interval & pitch training</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                  <span className="text-sm">10 exercises per day</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                  <span className="text-sm">Limited progress tracking</span>
                </li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={handleSignUp}
              >
                Start Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative border-2 border-[#3E82FC] rounded-2xl p-8 bg-white dark:bg-slate-900 shadow-2xl scale-105 hover:scale-110 hover:shadow-2xl transition-all duration-300">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#3E82FC] to-[#243B73]">
                Most Popular
              </Badge>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#3E82FC] to-[#243B73] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Pro</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 min-h-[40px]">
                Progress faster with unlimited, personalized ear training.
              </p>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold">$9.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <p className="text-xs text-[#2A9D8F] font-semibold mt-1">or $59.99/year (save $60)</p>
              </div>
              <TooltipProvider>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited exercises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm cursor-help underline decoration-dotted">Full interval, chord & scale library</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">50+ intervals, 20+ chord types, 15+ scales. From basics to jazz extensions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm cursor-help underline decoration-dotted">Personalized practice plans</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">AI analyzes your weak spots (like Minor 6ths) and prioritizes them in your daily queue.</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <span className="text-sm">Progress analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <span className="text-sm">Offline access</span>
                  </li>
                </ul>
              </TooltipProvider>
              <Button
                className="w-full bg-gradient-to-r from-[#3E82FC] to-[#243B73]"
                size="lg"
                onClick={handleSignUp}
              >
                Upgrade to Pro
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">Cancel anytime.</p>
            </div>

            {/* Pro Plus Plan */}
            <div className="relative border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-8 bg-white dark:bg-slate-900 hover:scale-105 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E9C46A] to-[#E76F51] flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Pro Plus</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 min-h-[40px]">
                Master real musical hearing — not just drills.
              </p>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold">$14.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <p className="text-xs text-[#2A9D8F] font-semibold mt-1">or $89.99/year (save $90)</p>
              </div>
              <TooltipProvider>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Everything in Pro, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <span className="text-sm">Melodic dictation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm cursor-help underline decoration-dotted">Real-music context exercises</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Train with actual musical arrangements, not just isolated piano notes. Bridge the gap between practice and performance.</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <span className="text-sm">Custom exercise builder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced analytics & exportable reports</span>
                  </li>
                </ul>
              </TooltipProvider>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={handleSignUp}
              >
                Go Pro Plus
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">Cancel anytime.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0A1A2F]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-6">
            Ready to Elevate Your Musical Skills?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the community and start your journey to musical mastery today.
          </p>
          <Button 
            onClick={handleSignUp}
            className="bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F] hover:opacity-90 text-white text-lg px-12 py-6 shadow-xl"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[#D7E5FF] dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground mb-4">
            <p>© 2025 GOSPIAN. All rights reserved. Made with ♪ for musicians.</p>
            <div className="flex items-center gap-6">
              <Link 
                to={createPageUrl('PrivacyPolicy')} 
                className="hover:text-[#3E82FC] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to={createPageUrl('TermsOfService')} 
                className="hover:text-[#3E82FC] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-[#D7E5FF] dark:border-slate-800">
            <p className="text-xs text-muted-foreground mb-2">
              <GraduationCap className="w-4 h-4 inline mr-1" />
              Running a music school or teaching studio?
            </p>
            <a 
              href="mailto:educators@gospian.com" 
              className="text-xs text-[#3E82FC] hover:underline"
            >
              Contact us for classroom dashboards and team pricing →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}