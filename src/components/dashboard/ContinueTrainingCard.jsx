import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ContinueTrainingCard({ exerciseType, progress }) {
  const exerciseLabels = {
    intervals: 'Interval Recognition',
    chords: 'Chord Identification',
    scales: 'Scale Recognition',
  };

  if (!exerciseType) {
    return (
      <Card className="border-2 border-dashed border-[#D7E5FF] dark:border-slate-700 bg-gradient-to-br from-white to-[#D7E5FF]/20 dark:from-slate-800 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D7E5FF] dark:bg-slate-700 flex items-center justify-center">
              <Music2 className="w-7 h-7 text-[#243B73] dark:text-[#3E82FC]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Start Training</h3>
              <p className="text-sm text-muted-foreground">Begin your ear training journey</p>
            </div>
            <Link to={createPageUrl('Exercises')}>
              <Button className="bg-[#243B73] hover:bg-[#0A1A2F] text-white">
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-[#D7E5FF]/30 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#243B73] to-[#3E82FC] flex items-center justify-center">
              <Music2 className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2A9D8F] text-white flex items-center justify-center text-xs font-bold">
              {progress}%
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Continue Training</h3>
            <p className="text-sm text-muted-foreground mb-2">{exerciseLabels[exerciseType] || exerciseType}</p>
            <Progress value={progress} className="h-2 bg-[#D7E5FF] dark:bg-slate-700" />
          </div>
          <Link to={createPageUrl('Exercise') + `?type=${exerciseType}`}>
            <Button className="bg-[#243B73] hover:bg-[#0A1A2F] text-white shadow-lg">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}