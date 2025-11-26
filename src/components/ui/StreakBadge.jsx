import React from 'react';
import { Flame, Snowflake } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function StreakBadge({ streak, freezeTokens = 0 }) {
  const getStreakColor = () => {
    if (streak >= 30) return 'from-orange-500 to-red-600';
    if (streak >= 14) return 'from-orange-400 to-orange-600';
    if (streak >= 7) return 'from-yellow-400 to-orange-500';
    return 'from-yellow-300 to-yellow-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getStreakColor()} text-white shadow-lg`}>
              <Flame className="w-4 h-4" />
              <span className="font-bold text-sm">{streak}</span>
            </div>
            {freezeTokens > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300">
                <Snowflake className="w-3 h-3" />
                <span className="text-xs font-medium">{freezeTokens}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{streak}-day streak!</p>
          {streak >= 7 && <p className="text-xs text-muted-foreground">+10 XP bonus active</p>}
          {freezeTokens > 0 && <p className="text-xs">{freezeTokens} freeze token{freezeTokens > 1 ? 's' : ''} available</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}