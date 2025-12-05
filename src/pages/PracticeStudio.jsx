import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import RoutineCreator from '@/components/practice/RoutineCreator';
import Metronome from '@/components/practice/Metronome';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PracticeStudio() {
  const [showCreator, setShowCreator] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['practiceRoutines'],
    queryFn: async () => {
      return await base44.entities.PracticeRoutine.filter({}, '-created_date', 20);
    },
    enabled: !!currentUser?.email,
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: (id) => base44.entities.PracticeRoutine.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['practiceRoutines']);
    },
  });

  const completeRoutineMutation = useMutation({
    mutationFn: ({ id, timesCompleted }) => 
      base44.entities.PracticeRoutine.update(id, { times_completed: timesCompleted + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['practiceRoutines']);
    },
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
              Practice Studio
            </h1>
            <p className="text-sm text-muted-foreground">
              Create custom routines and use practice tools
            </p>
          </div>
          <Dialog open={showCreator} onOpenChange={setShowCreator}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Routine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <RoutineCreator onClose={() => setShowCreator(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Routines */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Your Routines</h2>
          {routines.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Plus className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No routines yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            routines.map((routine) => (
              <Card key={routine.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{routine.routine_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {routine.total_duration} min
                        </Badge>
                        <Badge variant="outline">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {routine.times_completed} completed
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRoutineMutation.mutate(routine.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {routine.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div>
                        <p className="font-medium capitalize text-sm">{exercise.exercise_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.difficulty} • {exercise.duration_minutes} min
                        </p>
                      </div>
                      <Link to={createPageUrl(`Exercise?type=${exercise.exercise_type}&difficulty=${exercise.difficulty}`)}>
                        <Button size="sm" variant="outline">
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      </Link>
                    </div>
                  ))}
                  <Button
                    className="w-full mt-3"
                    onClick={() => completeRoutineMutation.mutate({
                      id: routine.id,
                      timesCompleted: routine.times_completed || 0
                    })}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Tools */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Practice Tools</h2>
          <Metronome />
        </div>
      </div>
    </div>
  );
}