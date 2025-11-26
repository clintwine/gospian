import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DailyChallengeCard({ completed = false }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (completed) {
    return (
      <Card className="border-2 border-[#E9C46A] bg-gradient-to-br from-[#E9C46A]/10 to-[#E9C46A]/5 dark:from-[#E9C46A]/20 dark:to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E9C46A] to-[#F4A261] flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 text-[#E9C46A]">Challenge Complete!</h3>
              <p className="text-sm text-muted-foreground">Come back tomorrow for a new challenge</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Resets in {timeRemaining}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#E9C46A] bg-gradient-to-br from-white to-[#E9C46A]/10 dark:from-slate-800 dark:to-[#E9C46A]/10 shadow-lg shadow-[#E9C46A]/20">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#E9C46A] to-[#F4A261] flex items-center justify-center shadow-lg shrink-0">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-base sm:text-lg">Daily Challenge</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#E9C46A]/20 text-[#E9C46A] text-[10px] sm:text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                +50 XP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Test your skills in a timed challenge</p>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{timeRemaining} remaining</span>
            </div>
          </div>
          <Link to={createPageUrl('DailyChallenge')} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-[#E9C46A] to-[#F4A261] hover:from-[#F4A261] hover:to-[#E9C46A] text-white shadow-lg text-sm">
              Start Challenge
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}