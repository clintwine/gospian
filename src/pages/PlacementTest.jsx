/**
 * Placement Test — shown on first login.
 * Adaptive 10-question quiz: intervals, chord qualities.
 * Writes placement_level + placement_completed to UserStats.
 */
import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, XCircle, Music2 } from 'lucide-react';
import {
  playInterval as _playInterval,
  playChordMidi,
  noteNameToMidi,
  CHORD_TYPES,
  INTERVALS,
  ALL_KEYS_MIDI,
  midiToNoteName,
  delay,
} from '@/lib/audio/audioEngine';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const TOTAL = 10;

const INTERVAL_POOL = INTERVALS.filter(i => i.semitones > 0 && i.semitones <= 9);
const CHORD_POOL = CHORD_TYPES.filter(c =>
  ['Major', 'Minor', 'Dominant7', 'Major7', 'Minor7', 'Diminished'].includes(c.name)
);

function pickRoot() {
  return ALL_KEYS_MIDI[Math.floor(Math.random() * ALL_KEYS_MIDI.length)] + 48;
}

function makeIntervalQ(difficulty) {
  const pool = difficulty === 'beginner'
    ? INTERVAL_POOL.filter(i => i.semitones <= 5)
    : difficulty === 'intermediate'
      ? INTERVAL_POOL
      : INTERVALS.filter(i => i.semitones <= 12);
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const distractors = pool.filter(i => i.name !== correct.name).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  return { type: 'interval', correct, options, rootMidi: pickRoot() };
}

function makeChordQ(difficulty) {
  const pool = difficulty === 'beginner'
    ? CHORD_POOL.filter(c => ['Major', 'Minor'].includes(c.name))
    : difficulty === 'intermediate'
      ? CHORD_POOL.slice(0, 5)
      : CHORD_POOL;
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const distractors = pool.filter(c => c.name !== correct.name).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  return { type: 'chord', correct, options, rootMidi: pickRoot() };
}

function generateQuestion(qIndex, difficulty) {
  return qIndex % 3 === 2 ? makeChordQ(difficulty) : makeIntervalQ(difficulty);
}

export default function PlacementTest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const s = await base44.entities.UserStats.filter({ created_by: user.email });
      return s[0] || null;
    },
    enabled: !!user?.email,
  });

  const updateStatsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserStats.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['userStats']),
  });

  const createStatsMutation = useMutation({
    mutationFn: (data) => base44.entities.UserStats.create(data),
    onSuccess: () => queryClient.invalidateQueries(['userStats']),
  });

  const [phase, setPhase] = useState('intro');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [results, setResults] = useState([]);

  const startTest = () => {
    setPhase('quiz');
    setQIndex(0);
    setResults([]);
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    const q = generateQuestion(0, 'intermediate');
    setQuestion(q);
    setSelected(null);
    setShowFeedback(false);
    setHasPlayed(false);
  };

  const playQuestion = async () => {
    if (isPlaying || !question) return;
    setIsPlaying(true);
    setHasPlayed(true);
    if (question.type === 'interval') {
      await _playInterval(question.rootMidi, question.correct.semitones, { mode: 'melodic-asc' });
    } else {
      playChordMidi(
        question.correct.intervals.map(s => question.rootMidi + s),
        { duration: '2n', velocity: 0.75, arpeggiate: true }
      );
    }
    setTimeout(() => setIsPlaying(false), 1500);
  };

  const handleAnswer = async (opt) => {
    if (showFeedback || !hasPlayed) return;
    setSelected(opt);
    const correct = opt.name === question.correct.name;
    setIsCorrect(correct);
    setShowFeedback(true);

    const newResults = [...results, correct];
    setResults(newResults);

    let newCC = correct ? consecutiveCorrect + 1 : 0;
    let newCW = correct ? 0 : consecutiveWrong + 1;
    let newDiff = difficulty;

    if (newCC >= 3 && difficulty !== 'advanced') {
      newDiff = difficulty === 'beginner' ? 'intermediate' : 'advanced';
      newCC = 0;
    } else if (newCW >= 2 && difficulty !== 'beginner') {
      newDiff = difficulty === 'advanced' ? 'intermediate' : 'beginner';
      newCW = 0;
    }

    setConsecutiveCorrect(newCC);
    setConsecutiveWrong(newCW);
    setDifficulty(newDiff);

    if (newResults.length >= TOTAL) {
      setTimeout(() => finalize(newResults, newDiff), 1000);
    }
  };

  const handleNext = () => {
    if (results.length >= TOTAL) return;
    const nextIdx = qIndex + 1;
    setQIndex(nextIdx);
    const q = generateQuestion(nextIdx, difficulty);
    setQuestion(q);
    setSelected(null);
    setShowFeedback(false);
    setHasPlayed(false);
  };

  const finalize = async (finalResults, finalDiff) => {
    const correct = finalResults.filter(Boolean).length;
    const accuracy = (correct / TOTAL) * 100;
    let level = 'beginner';
    if (accuracy >= 70 || finalDiff === 'intermediate') level = 'intermediate';
    if (accuracy >= 85 || finalDiff === 'advanced') level = 'advanced';

    if (userStats?.id) {
      await updateStatsMutation.mutateAsync({
        id: userStats.id,
        data: { placement_completed: true, placement_level: level },
      });
    } else {
      await createStatsMutation.mutateAsync({
        placement_completed: true,
        placement_level: level,
        xp: 0, level: 1, streak: 0, freeze_tokens: 1,
        exercises_completed: 0, perfect_scores: 0,
      });
    }

    setPhase('done');
    setTimeout(() => navigate(createPageUrl('Dashboard')), 2500);
  };

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#243B73] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E9C46A] to-[#E76F51] flex items-center justify-center">
              <Music2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome to Gospian</h1>
            <p className="text-white/70 text-lg">Let's find your starting level with a quick 10-question ear test.</p>
          </div>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center text-white">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-2xl font-bold">10</p>
                  <p className="text-xs text-white/60">Questions</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-2xl font-bold">~3</p>
                  <p className="text-xs text-white/60">Minutes</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-2xl font-bold">🎵</p>
                  <p className="text-xs text-white/60">Adaptive</p>
                </div>
              </div>
              <p className="text-white/60 text-sm text-center">
                Covers intervals and chord qualities. Gets harder or easier based on your answers.
              </p>
              <Button
                onClick={startTest}
                className="w-full h-12 bg-gradient-to-r from-[#E9C46A] to-[#E76F51] text-[#0A1A2F] font-bold text-lg hover:opacity-90"
              >
                Start Placement Test
              </Button>
              <button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="w-full text-center text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Skip for now
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (phase === 'done') {
    const correct = results.filter(Boolean).length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#243B73] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="w-16 h-16 text-[#2A9D8F] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Placement Complete!</h2>
          <p className="text-white/70 mb-4">
            {correct}/{TOTAL} correct · Starting at{' '}
            <span className="font-bold text-[#E9C46A] capitalize">{difficulty}</span>
          </p>
          <p className="text-white/40 text-sm">Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#243B73] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Question {Math.min(qIndex + 1, TOTAL)} of {TOTAL}</span>
            <span className="text-[#E9C46A] text-sm capitalize">{difficulty}</span>
          </div>
          <Progress value={(qIndex / TOTAL) * 100} className="h-2 bg-white/10" />
        </div>

        <Card className="bg-white/5 border-white/20 mb-4">
          <CardContent className="p-8 text-center">
            <p className="text-white/60 text-sm mb-4">
              {question?.type === 'interval' ? 'Identify the interval' : 'Identify the chord quality'}
            </p>
            <motion.button
              onClick={playQuestion}
              disabled={isPlaying}
              whileTap={{ scale: 0.95 }}
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all ${
                isPlaying ? 'bg-[#3E82FC]' : 'bg-gradient-to-br from-[#E9C46A] to-[#E76F51]'
              }`}
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </motion.button>
            {!hasPlayed && <p className="text-white/40 text-xs mt-3">Press play to hear the sound</p>}
          </CardContent>
        </Card>

        {hasPlayed && (
          <div className="grid grid-cols-2 gap-3">
            {question?.options.map((opt) => {
              const isSelectedOpt = selected?.name === opt.name;
              const isCorrectOpt = showFeedback && opt.name === question.correct.name;
              const isWrong = showFeedback && isSelectedOpt && !isCorrect;
              return (
                <Button
                  key={opt.name}
                  variant="outline"
                  onClick={() => handleAnswer(opt)}
                  disabled={showFeedback}
                  className={`h-14 font-medium text-sm transition-all ${
                    isCorrectOpt ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white' :
                    isWrong ? 'bg-[#E76F51] border-[#E76F51] text-white' :
                    'bg-white/5 border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {opt.name}
                  {isCorrectOpt && <CheckCircle2 className="w-4 h-4 ml-2" />}
                  {isWrong && <XCircle className="w-4 h-4 ml-2" />}
                </Button>
              );
            })}
          </div>
        )}

        {showFeedback && results.length < TOTAL && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <Button onClick={handleNext} className="w-full bg-[#3E82FC] hover:bg-[#243B73] text-white">
              Next Question →
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}