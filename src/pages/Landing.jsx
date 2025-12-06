import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music2, Headphones, Trophy, Zap, Users, TrendingUp, Target, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const handleSignUp = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Dashboard'));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Dashboard'));
  };

  const features = [
    {
      icon: Headphones,
      title: 'Ear Training Excellence',
      description: 'Master intervals, chords, and scales with our scientifically-designed exercises.',
      gradient: 'from-[#3E82FC] to-[#2A9D8F]',
    },
    {
      icon: Trophy,
      title: 'Competitive Challenges',
      description: 'Test your skills in daily, weekly, and speed challenges. Climb the leaderboard!',
      gradient: 'from-[#E9C46A] to-[#F4A261]',
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Progress',
      description: 'Get personalized training plans that adapt to your skill level and goals.',
      gradient: 'from-[#2A9D8F] to-[#264653]',
    },
    {
      icon: Users,
      title: 'Social Learning',
      description: 'Connect with musicians worldwide, share achievements, and learn together.',
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

      {/* Benefits Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 GOSPIAN. All rights reserved. Made with ♪ for musicians.</p>
        </div>
      </footer>
    </div>
  );
}