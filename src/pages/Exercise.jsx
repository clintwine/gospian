import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ExerciseInterface from '@/components/exercise/ExerciseInterface';
import ResultsScreen from '@/components/exercise/ResultsScreen';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Exercise() {
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseType = urlParams.get('type') || 'intervals';
  const initialDifficulty = urlParams.get('difficulty') || 'beginner';

  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [audioType, setAudioType] = useState('piano');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [exerciseKey, setExerciseKey] = useState(0);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ created_by: user.email });
      return stats[0];
    },
    enabled: !!user?.email,
  });

  const updateStatsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserStats.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['userStats']),
  });

  const saveResultMutation = useMutation({
    mutationFn: (data) => base44.entities.ExerciseResult.create(data),
    onSuccess: () => queryClient.invalidateQueries(['exerciseResults']),
  });

  const handleComplete = async (exerciseResults) => {
    setResults(exerciseResults);
    setShowResults(true);

    // Save exercise result
    await saveResultMutation.mutateAsync({
      exercise_type: exerciseType,
      difficulty,
      correct_answers: exerciseResults.correct,
      total_questions: exerciseResults.total,
      accuracy: exerciseResults.accuracy,
      xp_earned: exerciseResults.xpEarned,
      is_daily_challenge: false,
    });

    // Update user stats
    if (userStats) {
      const newXP = (userStats.xp || 0) + exerciseResults.xpEarned;
      const newLevel = Math.floor(Math.sqrt(newXP / 20)) || 1;
      const newExercisesCompleted = (userStats.exercises_completed || 0) + 1;
      const newPerfectScores = exerciseResults.accuracy === 100 
        ? (userStats.perfect_scores || 0) + 1 
        : (userStats.perfect_scores || 0);

      // Update streak if first exercise today
      const today = new Date().toDateString();
      const lastActivity = userStats.last_activity_date 
        ? new Date(userStats.last_activity_date).toDateString() 
        : null;
      
      let newStreak = userStats.streak || 0;
      if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastActivity === yesterday.toDateString()) {
          newStreak += 1;
        } else if (lastActivity !== today) {
          newStreak = 1;
        }
      }

      await updateStatsMutation.mutateAsync({
        id: userStats.id,
        data: {
          xp: newXP,
          level: newLevel,
          exercises_completed: newExercisesCompleted,
          perfect_scores: newPerfectScores,
          streak: newStreak,
          last_activity_date: new Date().toISOString().split('T')[0],
          current_exercise_type: exerciseType,
          current_exercise_progress: exerciseResults.accuracy,
        },
      });

      // Update Quick Start progress if applicable
      let quickStartProgressField = null;
      if (exerciseType === 'intervals' && difficulty === 'beginner') {
        quickStartProgressField = 'quickstart_interval_beginner_progress';
      } else if (exerciseType === 'chords' && difficulty === 'beginner') {
        quickStartProgressField = 'quickstart_chord_beginner_progress';
      } else if (exerciseType === 'intervals' && difficulty === 'intermediate') {
        quickStartProgressField = 'quickstart_interval_intermediate_progress';
      } else if (exerciseType === 'scales' && difficulty === 'beginner') {
        quickStartProgressField = 'quickstart_scale_beginner_progress';
      }

      if (quickStartProgressField) {
        await updateStatsMutation.mutateAsync({
          id: userStats.id,
          data: {
            [quickStartProgressField]: 100,
          },
        });
      }
    }
  };

  const handleRetry = () => {
    setShowResults(false);
    setResults(null);
    setExerciseKey(prev => prev + 1);
  };

  const exerciseLabels = {
    intervals: 'Interval Recognition',
    chords: 'Chord Identification',
    scales: 'Scale Recognition',
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Exercises')}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0A1A2F] dark:text-white">
              {exerciseLabels[exerciseType] || exerciseType}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">{difficulty} Level</p>
          </div>
        </div>

        {!showResults && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Exercise Settings</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={difficulty} onValueChange={(val) => {
                    setDifficulty(val);
                    setExerciseKey(prev => prev + 1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sound Type</label>
                  <Select value={audioType} onValueChange={setAudioType}>
                    <SelectTrigger>
                      <Volume2 className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="guitar">Guitar</SelectItem>
                      <SelectItem value="synth">Synth</SelectItem>
                      <SelectItem value="sine">Pure Tone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Exercise Content */}
      {showResults ? (
        <ResultsScreen
          correct={results.correct}
          total={results.total}
          accuracy={results.accuracy}
          xpEarned={results.xpEarned}
          exerciseType={exerciseType}
          difficulty={difficulty}
          onRetry={handleRetry}
        />
      ) : (
        <ExerciseInterface
          key={exerciseKey}
          exerciseType={exerciseType}
          difficulty={difficulty}
          audioType={audioType}
          onComplete={handleComplete}
          questionsCount={10}
        />
      )}
    </div>
  );
}