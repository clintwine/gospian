import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Zap } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentProgressView({
  open,
  onClose,
  studentEmail,
  studentName,
  stats,
  exerciseResults,
  isLoading,
}) {
  const totalExercises = exerciseResults?.length || 0;
  const avgAccuracy = totalExercises > 0
    ? Math.round(
        exerciseResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / totalExercises
      )
    : 0;

  const exercisesByType = (type) => {
    return exerciseResults?.filter(r => r.exercise_type === type).length || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{studentName} - Progress Report</DialogTitle>
          <DialogDescription>{studentEmail}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-0 bg-gradient-to-br from-[#3E82FC]/10 to-[#243B73]/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#3E82FC]">
                    {stats?.level || 1}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Level</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-[#E9C46A]/10 to-[#E76F51]/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#E9C46A]">
                    {stats?.xp || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total XP</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-[#2A9D8F]/10 to-[#2A9D8F]/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#2A9D8F]">
                    {stats?.streak || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#3E82FC]" />
                      Average Accuracy
                    </label>
                    <span className="font-bold text-[#3E82FC]">{avgAccuracy}%</span>
                  </div>
                  <Progress value={avgAccuracy} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Intervals</p>
                    <p className="text-lg font-semibold">{exercisesByType('intervals')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Chords</p>
                    <p className="text-lg font-semibold">{exercisesByType('chords')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Scales</p>
                    <p className="text-lg font-semibold">{exercisesByType('scales')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div>
              <p className="text-sm font-semibold mb-3">Recent Exercises</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {exerciseResults?.slice(0, 5).map((result, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">
                        {result.exercise_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.difficulty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{result.accuracy}%</p>
                      <p className="text-xs text-[#E9C46A]">+{result.xp_earned} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}