import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Trash2, Clock, CheckCircle2, Music, Headphones, Waves } from 'lucide-react';
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

  const practiceModes = [
    {
      type: 'intervals',
      title: 'Intervals',
      description: 'Train your ear to recognize melodic and harmonic intervals.',
      icon: Music,
      path: createPageUrl('PracticeMode') + '?exerciseType=intervals&difficulty=beginner',
      gradient: 'from-[#3E82FC] to-[#2A9D8F]',
      bgColor: 'bg-[#3E82FC]/10',
    },
    {
      type: 'chords',
      title: 'Chords',
      description: 'Learn to identify different chord qualities and voicings.',
      icon: Headphones,
      path: createPageUrl('PracticeMode') + '?exerciseType=chords&difficulty=beginner',
      gradient: 'from-[#E9C46A] to-[#F4A261]',
      bgColor: 'bg-[#E9C46A]/10',
    },
    {
      type: 'scales',
      title: 'Scales',
      description: 'Master various scale types and their unique sounds.',
      icon: Waves,
      path: createPageUrl('PracticeMode') + '?exerciseType=scales&difficulty=beginner',
      gradient: 'from-[#2A9D8F] to-[#264653]',
      bgColor: 'bg-[#2A9D8F]/10',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
              Practice Studio
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Practice modes, custom routines, and tools
            </p>
          </div>
          <Dialog open={showCreator} onOpenChange={setShowCreator}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F] hover:opacity-90 transition-opacity">
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

      {/* Practice Modes */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-5 text-[#0A1A2F] dark:text-white">Practice Modes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {practiceModes.map((mode) => (
            <Card key={mode.type} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden ${mode.bgColor}`}>
              <CardContent className="p-6 flex flex-col items-center text-center relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <mode.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#0A1A2F] dark:text-white">{mode.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{mode.description}</p>
                <Link to={mode.path} className="w-full">
                  <Button className={`w-full bg-gradient-to-r ${mode.gradient} hover:opacity-90 transition-opacity shadow-md`}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Routines */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-xl font-bold text-[#0A1A2F] dark:text-white">Your Routines</h2>
          {routines.length === 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-muted/50 to-transparent">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3E82FC]/20 to-[#2A9D8F]/20 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-[#3E82FC]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No routines yet</h3>
                <p className="text-sm text-muted-foreground">Create your first practice routine to get started!</p>
              </CardContent>
            </Card>
          ) : (
            routines.map((routine) => (
              <Card key={routine.id} className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-3">{routine.routine_name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-[#3E82FC]/10 text-[#3E82FC] border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {routine.total_duration} min
                        </Badge>
                        <Badge className="bg-[#2A9D8F]/10 text-[#2A9D8F] border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {routine.times_completed} completed
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRoutineMutation.mutate(routine.id)}
                      className="hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {routine.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/50 to-transparent hover:from-muted/70 transition-all">
                      <div className="flex-1">
                        <p className="font-semibold capitalize text-sm">{exercise.exercise_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.difficulty} • {exercise.duration_minutes} min
                        </p>
                      </div>
                      <Link to={createPageUrl(`Exercise?type=${exercise.exercise_type}&difficulty=${exercise.difficulty}`)}>
                        <Button size="sm" className="bg-[#3E82FC] hover:bg-[#2A9D8F]">
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      </Link>
                    </div>
                  ))}
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-[#2A9D8F] to-[#264653] hover:opacity-90 transition-opacity shadow-md"
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
          <h2 className="text-xl font-bold mb-5 text-[#0A1A2F] dark:text-white">Practice Tools</h2>
          <Metronome />
        </div>
      </div>
    </div>
  );
}