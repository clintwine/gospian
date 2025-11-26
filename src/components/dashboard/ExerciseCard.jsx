import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Headphones, Waves, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const exerciseIcons = {
  intervals: Music,
  chords: Headphones,
  scales: Waves,
};

const difficultyColors = {
  beginner: 'bg-[#2A9D8F]/10 text-[#2A9D8F] border-[#2A9D8F]',
  intermediate: 'bg-[#E9C46A]/10 text-[#E9C46A] border-[#E9C46A]',
  advanced: 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]',
};

export default function ExerciseCard({ 
  type, 
  title, 
  description, 
  difficulty, 
  progress = 0, 
  xpReward = 10,
  locked = false,
  mastered = false 
}) {
  const Icon = exerciseIcons[type] || Music;

  const content = (
    <Card className={`group relative overflow-hidden transition-all duration-300 ${
      locked 
        ? 'opacity-60 cursor-not-allowed' 
        : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    } ${mastered ? 'border-[#2A9D8F] border-2' : 'border-0 shadow-lg'}`}>
      <CardContent className="p-6">
        {mastered && (
          <div className="absolute top-3 right-3">
            <CheckCircle2 className="w-6 h-6 text-[#2A9D8F]" />
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            mastered 
              ? 'bg-[#2A9D8F] text-white' 
              : 'bg-[#D7E5FF] dark:bg-slate-700 text-[#243B73] dark:text-[#3E82FC] group-hover:bg-[#243B73] group-hover:text-white'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{title}</h3>
              <Badge variant="outline" className={`text-xs ${difficultyColors[difficulty]}`}>
                {difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-[#D7E5FF] dark:bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#243B73] to-[#3E82FC] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
              <span className="text-xs font-medium text-[#E9C46A]">+{xpReward} XP</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (locked) {
    return content;
  }

  return (
    <Link to={createPageUrl('Exercise') + `?type=${type}&difficulty=${difficulty}`}>
      {content}
    </Link>
  );
}