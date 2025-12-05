import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ExerciseInterface from '@/components/exercise/ExerciseInterface';
import { getRandomExercise } from '@/components/data/exerciseData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, Music, Headphones, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AdaptiveChordSelector } from '@/components/audio/AdaptiveChordSelector';
import { CHORD_TYPES } from '@/components/audio/AudioEngine';

export default function PracticeMode() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialExerciseType = urlParams.get('exerciseType') || 'intervals';
  const initialDifficulty = urlParams.get('difficulty') || 'beginner';

  const [exerciseType, setExerciseType] = useState(initialExerciseType);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [forceSameRoot, setForceSameRoot] = useState(true);
  const adaptiveChordSelector = useRef(null);
  const fixedChordRoot = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Initialize adaptive chord selector
  useEffect(() => {
    if (exerciseType === 'chords' && user?.email) {
      if (!adaptiveChordSelector.current) {
        adaptiveChordSelector.current = new AdaptiveChordSelector();
      }
      adaptiveChordSelector.current.initialize(user.email);
    }
  }, [exerciseType, user?.email]);

  const questionSupplier = () => {
    // Use adaptive logic for chords
    if (exerciseType === 'chords' && adaptiveChordSelector.current) {
      // Set fixed root on first chord if forceSameRoot is enabled
      if (forceSameRoot && !fixedChordRoot.current) {
        const roots = ['C4', 'D4', 'E4', 'F4', 'G4'];
        fixedChordRoot.current = roots[Math.floor(Math.random() * roots.length)];
      } else if (!forceSameRoot) {
        fixedChordRoot.current = null;
      }
      
      const { type: chordType, root } = adaptiveChordSelector.current.selectNextChord(
        forceSameRoot, 
        fixedChordRoot.current
      );
      const chord = CHORD_TYPES.find(c => c.name === chordType);
      
      if (chord) {
        return {
          correctAnswer: { name: chord.name },
          options: CHORD_TYPES.map(c => ({ name: c.name })).sort(() => Math.random() - 0.5),
          chordType: chord.name,
          baseNote: root,
        };
      }
    }
    
    // Fallback to random for other types
    const exercise = getRandomExercise(exerciseType, difficulty);
    if (!exercise) return null;
    
    return {
      ...exercise,
      correctAnswer: { name: exercise.answer },
      options: exercise.options.map(opt => ({ name: opt })),
      semitones: exercise.semitones,
      chordType: exercise.chordType,
      scaleType: exercise.scaleType,
      playMode: exercise.playMode || 'melodic',
      baseNote: exercise.baseNote,
    };
  };

  const handleChordAttempt = (chordType, isCorrect) => {
    if (exerciseType === 'chords' && adaptiveChordSelector.current && user?.email) {
      adaptiveChordSelector.current.recordAttempt(user.email, chordType, isCorrect);
    }
  };

  const getTitle = () => {
    switch (exerciseType) {
      case 'intervals': return 'Interval Practice';
      case 'chords': return 'Chord Practice';
      case 'scales': return 'Scale Practice';
      default: return 'Practice Mode';
    }
  };

  const getIcon = () => {
    switch (exerciseType) {
      case 'intervals': return Music;
      case 'chords': return Headphones;
      case 'scales': return Waves;
      default: return Music;
    }
  };

  const Icon = getIcon();

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to={createPageUrl('PracticeSelection')}>
          <Button variant="ghost" className="text-muted-foreground hover:text-[#243B73]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice
          </Button>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-[#243B73]">
              <Settings className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Practice Settings</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 mt-8">
              <div>
                <p className="text-sm font-medium mb-2">Exercise Type</p>
                <Select value={exerciseType} onValueChange={setExerciseType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intervals">Intervals</SelectItem>
                    <SelectItem value="chords">Chords</SelectItem>
                    <SelectItem value="scales">Scales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Difficulty</p>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {exerciseType === 'chords' && (
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">Force Same Root</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All chords use the same root note
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setForceSameRoot(!forceSameRoot);
                      fixedChordRoot.current = null;
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      forceSameRoot ? 'bg-[#3E82FC]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        forceSameRoot ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Changes will apply to the next question.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Icon className="w-6 h-6 text-[#243B73]" />
        <h1 className="text-2xl font-bold text-[#0A1A2F] dark:text-white">{getTitle()}</h1>
      </div>

      <ExerciseInterface
        exerciseType={exerciseType}
        difficulty={difficulty}
        isPracticeMode={true}
        questionSupplier={questionSupplier}
        onChordAttempt={handleChordAttempt}
      />
    </div>
  );
}