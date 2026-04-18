import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Trophy, Zap, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  playInterval as _playInterval,
  playChordMidi,
  playNote,
  midiToNoteName,
  noteNameToMidi,
  CHORD_TYPES,
  INTERVALS,
  ALL_KEYS_MIDI,
  delay,
} from '@/lib/audio/audioEngine';
import PianoKeyboard from '@/components/audio/PianoKeyboard';

export default function DailyChallenge() {
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [timeLeft, setTimeLeft] = useState(90);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentBaseNote, setCurrentBaseNote] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [replayHighlight, setReplayHighlight] = useState(null);

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

  const generateQuestion = useCallback(() => {
    const isChord = Math.random() > 0.6;
    if (isChord) {
      const chords = ['Major', 'Minor', 'Dominant7', 'Major7', 'Minor7', 'Diminished'];
      const chordType = chords[Math.floor(Math.random() * chords.length)];
      const chord = CHORD_TYPES.find(c => c.name === chordType);
      const options = chords.map(n => ({ name: n })).sort(() => Math.random() - 0.5);
      return { type: 'chords', chordType, correctAnswer: { name: chordType }, options };
    }
    const intervals = INTERVALS.filter(i => i.semitones >= 1 && i.semitones <= 9);
    const iv = intervals[Math.floor(Math.random() * intervals.length)];
    const pool = intervals.map(i => ({ name: i.name })).sort(() => Math.random() - 0.5).slice(0, 4);
    if (!pool.find(o => o.name === iv.name)) pool[0] = { name: iv.name };
    return { type: 'intervals', semitones: iv.semitones, correctAnswer: { name: iv.name }, options: pool.sort(() => Math.random() - 0.5) };
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(90);
    setScore(0);
    setQuestionsAnswered(0);
    setCurrentQuestion(generateQuestion());
    setHasPlayed(false);
    setFeedback(null);
    setCurrentBaseNote(null);
    setIsAnimating(false);
    setReplayHighlight(null);
  };

  const handlePlaySound = async () => {
    if (isPlaying || !currentQuestion) return;

    setIsPlaying(true);
    setHasPlayed(true);

    // Use stored base note for replays, or let the function pick one
    const noteToUse = currentBaseNote;
    let baseNote;

    const rootMidi = noteToUse ? noteNameToMidi(noteToUse) : ALL_KEYS_MIDI[Math.floor(Math.random() * ALL_KEYS_MIDI.length)];
    baseNote = midiToNoteName(rootMidi);
    if (currentQuestion.type === 'chords') {
      const chord = CHORD_TYPES.find(c => c.name === currentQuestion.chordType);
      if (chord) playChordMidi(chord.intervals.map(s => rootMidi + s), { duration: '2n', velocity: 0.75, arpeggiate: true });
    } else {
      await _playInterval(rootMidi, currentQuestion.semitones, { mode: 'melodic-asc' });
    }

    // Store the base note for consistent replays
    if (!currentBaseNote) {
      setCurrentBaseNote(baseNote);
    }

    setTimeout(() => setIsPlaying(false), 1500);
  };

  const replayIntervalAnimation = async (semitones, baseNote) => {
    setIsAnimating(true);
    const rootMidi = noteNameToMidi(baseNote);
    await delay(200);
    setReplayHighlight('first');
    playNote(rootMidi, { duration: '0.5s', velocity: 0.7 });
    await delay(600);
    setReplayHighlight('second');
    playNote(rootMidi + semitones, { duration: '0.5s', velocity: 0.7 });
    await delay(600);
    setReplayHighlight('both');
    await delay(400);
    setIsAnimating(false);
    setReplayHighlight(null);
  };

  const handleAnswer = async (option) => {
    if (feedback || !hasPlayed || isAnimating) return;

    const isCorrect = option.name === currentQuestion.correctAnswer.name;
    setFeedback({ isCorrect, correctAnswer: currentQuestion.correctAnswer.name });
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Play animation for correct interval answers
      if (currentQuestion.type === 'intervals' && currentBaseNote) {
        await replayIntervalAnimation(currentQuestion.semitones, currentBaseNote);
      }
    }
    setQuestionsAnswered(prev => prev + 1);

    // Quick feedback then next question
    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestion(generateQuestion());
      setHasPlayed(false);
      setCurrentBaseNote(null);
      setReplayHighlight(null);
    }, isCorrect && currentQuestion.type === 'intervals' ? 200 : 800);
  };

  const finishChallenge = async () => {
    const xpEarned = 50 + (score * 5);
    const accuracy = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;

    // Save result
    await saveResultMutation.mutateAsync({
      exercise_type: 'mixed',
      difficulty: 'intermediate',
      correct_answers: score,
      total_questions: questionsAnswered,
      accuracy,
      xp_earned: xpEarned,
      is_daily_challenge: true,
    });

    // Update user stats
    if (userStats) {
      const newXP = (userStats.xp || 0) + xpEarned;
      const newLevel = Math.floor(Math.sqrt(newXP / 20)) || 1;

      await updateStatsMutation.mutateAsync({
        id: userStats.id,
        data: {
          xp: newXP,
          level: newLevel,
          exercises_completed: (userStats.exercises_completed || 0) + 1,
          last_activity_date: new Date().toISOString().split('T')[0],
        },
      });
    }
  };

  useEffect(() => {
    if (gameState === 'finished' && questionsAnswered > 0) {
      finishChallenge();
    }
  }, [gameState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'ready') {
    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <Link to={createPageUrl('Challenges')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </Link>

        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#E9C46A] to-[#F4A261]" />
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#E9C46A] to-[#F4A261] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Daily Challenge</h1>
            <p className="text-muted-foreground mb-6">
              90 seconds to answer as many questions as possible. Mix of intervals and chords.
            </p>

            <div className="flex justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#E9C46A]">
                  <Zap className="w-5 h-5" />
                  <span className="text-2xl font-bold">50+</span>
                </div>
                <p className="text-xs text-muted-foreground">Base XP</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#3E82FC]">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">90s</span>
                </div>
                <p className="text-xs text-muted-foreground">Time Limit</p>
              </div>
            </div>

            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-[#E9C46A] to-[#F4A261] hover:opacity-90 text-white px-8 py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Challenge
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    const xpEarned = 50 + (score * 5);
    const accuracy = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;

    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-[#E9C46A] to-[#F4A261] p-8 text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Challenge Complete!</h1>
          </div>
          <CardContent className="p-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-xl bg-[#D7E5FF]/50 dark:bg-slate-800">
                <p className="text-3xl font-bold text-[#243B73] dark:text-[#3E82FC]">{score}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#D7E5FF]/50 dark:bg-slate-800">
                <p className="text-3xl font-bold text-[#243B73] dark:text-[#3E82FC]">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#E9C46A]/20">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5 text-[#E9C46A]" />
                  <p className="text-3xl font-bold text-[#E9C46A]">{xpEarned}</p>
                </div>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to={createPageUrl('Dashboard')} className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl('Challenges')} className="flex-1">
                <Button className="w-full bg-[#243B73] hover:bg-[#0A1A2F]">
                  More Challenges
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing state
  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header with Timer */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-2xl font-bold text-[#243B73] dark:text-[#3E82FC]">{score}</p>
        </div>
        <div className={`px-6 py-3 rounded-full ${timeLeft <= 10 ? 'bg-[#E76F51] animate-pulse' : 'bg-[#243B73]'} text-white`}>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Questions</p>
          <p className="text-2xl font-bold">{questionsAnswered}</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(timeLeft / 90) * 100} className="h-2 mb-6" />

      {/* Audio Player */}
      <Card className="mb-4 border-0 shadow-xl bg-gradient-to-br from-[#0A1A2F] to-[#243B73]">
        <CardContent className="p-6 flex flex-col items-center">
          <motion.button
            onClick={handlePlaySound}
            disabled={isPlaying}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isPlaying ? 'bg-[#3E82FC] scale-110' : 'bg-white/10 hover:bg-white/20'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </motion.button>
          <p className="text-white/60 mt-3 text-sm">
            {currentQuestion?.type === 'chords' ? 'Chord' : 'Interval'}
          </p>
        </CardContent>
      </Card>

      {/* Piano Keyboard for Intervals */}
      {currentQuestion?.type === 'intervals' && hasPlayed && currentBaseNote && (
        <div className="mb-6 pb-4">
          <PianoKeyboard 
            baseNote={currentBaseNote} 
            semitones={currentQuestion?.semitones}
            showSecondNote={feedback?.isCorrect || replayHighlight === 'second' || replayHighlight === 'both'}
            highlightFirst={replayHighlight === 'first' || replayHighlight === 'both'}
            highlightSecond={replayHighlight === 'second' || replayHighlight === 'both'}
            isAnimating={isAnimating}
          />
        </div>
      )}

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3">
        {currentQuestion?.options.map((option, index) => {
          const isCorrectAnswer = feedback && option.name === feedback.correctAnswer;
          const isWrongSelection = feedback && option.name === currentQuestion.correctAnswer.name === false && 
                                   feedback.isCorrect === false;

          return (
            <Button
              key={option.name}
              variant="outline"
              onClick={() => handleAnswer(option)}
              disabled={!!feedback || !hasPlayed}
              className={`h-14 text-base font-medium transition-all ${
                !hasPlayed
                  ? 'opacity-50'
                  : isCorrectAnswer
                    ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white'
                    : feedback && !feedback.isCorrect && option.name !== feedback.correctAnswer
                      ? 'bg-[#E76F51]/20 border-[#E76F51]'
                      : 'hover:border-[#3E82FC] hover:bg-[#3E82FC]/10'
              }`}
            >
              {option.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}