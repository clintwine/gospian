import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Target, Flame, Users, Zap } from 'lucide-react';

const questIcons = {
  complete_exercises: Target,
  perfect_accuracy: CheckCircle2,
  practice_streak: Flame,
  friend_challenge: Users,
  specific_exercise: Zap,
};

export default function DailyQuestCard({ quest }) {
  const Icon = questIcons[quest.quest_type] || Target;
  const progress = Math.min((quest.current_progress / quest.target_value) * 100, 100);

  return (
    <Card className={`border-2 transition-all ${
      quest.completed 
        ? 'border-[#2A9D8F] bg-[#2A9D8F]/5' 
        : 'border-[#D7E5FF] dark:border-slate-800 hover:border-[#3E82FC]'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              quest.completed ? 'bg-[#2A9D8F]' : 'bg-[#D7E5FF] dark:bg-slate-800'
            }`}>
              <Icon className={`w-5 h-5 ${quest.completed ? 'text-white' : 'text-[#243B73] dark:text-[#3E82FC]'}`} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                {quest.quest_description}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {quest.current_progress} / {quest.target_value}
              </p>
            </div>
          </div>
          {quest.completed ? (
            <CheckCircle2 className="w-5 h-5 text-[#2A9D8F]" />
          ) : (
            <Badge className="bg-[#E9C46A]">+{quest.reward_xp} XP</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
}