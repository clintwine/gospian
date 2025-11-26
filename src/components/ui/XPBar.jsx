import React from 'react';
import { Progress } from "@/components/ui/progress";

export default function XPBar({ xp, level }) {
  // Level formula: Level = floor(√(XP / 20))
  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 20)) || 1;
  const currentLevel = level || calculateLevel(xp);
  
  // XP needed for current and next level
  const xpForCurrentLevel = currentLevel * currentLevel * 20;
  const xpForNextLevel = (currentLevel + 1) * (currentLevel + 1) * 20;
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#243B73] to-[#3E82FC] flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {currentLevel}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Level {currentLevel}</p>
            <p className="text-sm font-semibold">{xp.toLocaleString()} XP</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {xpNeededForNextLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}
        </span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-3 bg-[#D7E5FF] dark:bg-slate-700" />
        <div 
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-[#243B73] to-[#3E82FC] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}