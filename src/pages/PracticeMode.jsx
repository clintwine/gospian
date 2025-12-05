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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdaptiveChordSelector } from '@/components/audio/AdaptiveChordSelector';
import { CHORD_TYPES, INTERVALS, SCALES } from '@/components/audio/AudioEngine';
import GranularSettingsPanel from '@/components/practice/GranularSettingsPanel';
import { Separator } from "@/components/ui/separator";

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
  const fixedIntervalRoot = useRef(null);

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: practiceSettings } = useQuery({
    queryKey: ['practiceSettings', user?.email],
    queryFn: async () => {
      const currentUser = user;
      if (!currentUser?.email) return null;
      
      const settings = await base44.entities.PracticeSettings.filter({ created_by: currentUser.email });
      if (settings && settings[0]) return settings[0];
      
      // Create default settings if none exist
      const defaultSettings = {
        enabled_intervals: ['Unison', 'Major 3rd', 'Perfect 5th', 'Octave'],
        enabled_scales: ['Major', 'Natural Minor'],
        enabled_chords: ['Major', 'Minor']
      };
      const created = await base44.entities.PracticeSettings.create(defaultSettings);
      return created;
    },
    enabled: !userLoading && !!user?.email,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (practiceSettings?.id) {
        return base44.entities.PracticeSettings.update(practiceSettings.id, data);
      } else {
        return base44.entities.PracticeSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceSettings'] });
    },
  });

  // Initialize adaptive chord selector
  useEffect(() => {
    const currentUser = user;
    if (exerciseType === 'chords' && currentUser?.email) {
      if (!adaptiveChordSelector.current) {
        adaptiveChordSelector.current = new AdaptiveChordSelector();
      }
      adaptiveChordSelector.current.initialize(currentUser.email);
    }
  }, [exerciseType, user]);

  const questionSupplier = () => {
    const enabledIntervals = practiceSettings?.enabled_intervals || INTERVALS.map(i => i.name);
    const enabledScales = practiceSettings?.enabled_scales || SCALES.map(s => s.name);
    const enabledChords = practiceSettings?.enabled_chords || CHORD_TYPES.map(c => c.name);

    // Use adaptive logic for chords
    if (exerciseType === 'chords' && adaptiveChordSelector.current) {
      // Filter available chords by enabled list
      const availableChordTypes = CHORD_TYPES.filter(c => enabledChords.includes(c.name));
      if (availableChordTypes.length === 0) return null;

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
      
      // Make sure selected chord is in enabled list
      if (!enabledChords.includes(chordType)) {
        const fallbackChord = availableChordTypes[Math.floor(Math.random() * availableChordTypes.length)];
        return {
          correctAnswer: { name: fallbackChord.name },
          options: availableChordTypes.map(c => ({ name: c.name })).sort(() => Math.random() - 0.5),
          chordType: fallbackChord.name,
          baseNote: root,
        };
      }
      
      return {
        correctAnswer: { name: chordType },
        options: availableChordTypes.map(c => ({ name: c.name })).sort(() => Math.random() - 0.5),
        chordType: chordType,
        baseNote: root,
      };
    }

    // For intervals - filter by enabled
    if (exerciseType === 'intervals') {
      const availableIntervals = INTERVALS.filter(i => enabledIntervals.includes(i.name));
      if (availableIntervals.length === 0) return null;
      
      // Set fixed root on first interval if forceSameRoot is enabled
      if (forceSameRoot && !fixedIntervalRoot.current) {
        const roots = ['C4', 'D4', 'E4', 'F4', 'G4'];
        fixedIntervalRoot.current = roots[Math.floor(Math.random() * roots.length)];
      } else if (!forceSameRoot) {
        fixedIntervalRoot.current = null;
      }
      
      const interval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
      
      // Ensure correct answer is always in options
      const otherOptions = availableIntervals
        .filter(i => i.name !== interval.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(i => ({ name: i.name }));
      
      const options = [{ name: interval.name }, ...otherOptions].sort(() => Math.random() - 0.5);
      
      return {
        correctAnswer: { name: interval.name },
        options: options,
        semitones: interval.semitones,
        playMode: Math.random() > 0.5 ? 'melodic' : 'harmonic',
        baseNote: fixedIntervalRoot.current,
      };
    }

    // For scales - filter by enabled
    if (exerciseType === 'scales') {
      const availableScales = SCALES.filter(s => enabledScales.includes(s.name));
      if (availableScales.length === 0) return null;
      
      const scale = availableScales[Math.floor(Math.random() * availableScales.length)];
      return {
        correctAnswer: { name: scale.name },
        options: availableScales.map(s => ({ name: s.name })).sort(() => Math.random() - 0.5).slice(0, 4),
        scaleType: scale.name,
      };
    }
    
    // Fallback to random
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
    const currentUser = user;
    if (exerciseType === 'chords' && adaptiveChordSelector.current && currentUser?.email) {
      adaptiveChordSelector.current.recordAttempt(currentUser.email, chordType, isCorrect);
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
                <Select value={difficulty} onValueChange={(value) => {
                  setDifficulty(value);
                  // Auto-set intervals based on difficulty
                  if (exerciseType === 'intervals') {
                    let defaultIntervals = [];
                    if (value === 'beginner') {
                      defaultIntervals = ['Unison', 'Major 3rd', 'Perfect 5th', 'Octave'];
                    } else if (value === 'intermediate') {
                      defaultIntervals = ['Unison', 'Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Major 6th', 'Major 7th', 'Octave'];
                    } else {
                      defaultIntervals = INTERVALS.map(i => i.name);
                    }
                    updateSettingsMutation.mutate({ enabled_intervals: defaultIntervals });
                  }
                }}>
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
              {(exerciseType === 'chords' || exerciseType === 'intervals') && (
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">Force Same Root</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exerciseType === 'chords' ? 'All chords use the same root note' : 'All intervals start from the same root note'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setForceSameRoot(!forceSameRoot);
                      fixedChordRoot.current = null;
                      fixedIntervalRoot.current = null;
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
              
              <Separator />

              <GranularSettingsPanel
                exerciseType={exerciseType}
                enabledIntervals={practiceSettings?.enabled_intervals || INTERVALS.map(i => i.name)}
                enabledScales={practiceSettings?.enabled_scales || SCALES.map(s => s.name)}
                enabledChords={practiceSettings?.enabled_chords || CHORD_TYPES.map(c => c.name)}
                onToggleInterval={(interval, enabled) => {
                  const current = practiceSettings?.enabled_intervals || INTERVALS.map(i => i.name);
                  let updated;
                  if (Array.isArray(interval)) {
                    // Bulk update (All/None)
                    updated = enabled ? interval : [];
                  } else {
                    // Single toggle
                    updated = enabled 
                      ? [...current, interval]
                      : current.filter(i => i !== interval);
                  }
                  updateSettingsMutation.mutate({ enabled_intervals: updated });
                }}
                onToggleScale={(scale, enabled) => {
                  const current = practiceSettings?.enabled_scales || SCALES.map(s => s.name);
                  let updated;
                  if (Array.isArray(scale)) {
                    // Bulk update (All/None)
                    updated = enabled ? scale : [];
                  } else {
                    // Single toggle
                    updated = enabled 
                      ? [...current, scale]
                      : current.filter(s => s !== scale);
                  }
                  updateSettingsMutation.mutate({ enabled_scales: updated });
                }}
                onToggleChord={(chord, enabled) => {
                  const current = practiceSettings?.enabled_chords || CHORD_TYPES.map(c => c.name);
                  let updated;
                  if (Array.isArray(chord)) {
                    // Bulk update (All/None)
                    updated = enabled ? chord : [];
                  } else {
                    // Single toggle
                    updated = enabled 
                      ? [...current, chord]
                      : current.filter(c => c !== chord);
                  }
                  updateSettingsMutation.mutate({ enabled_chords: updated });
                }}
              />

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