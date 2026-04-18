import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  playInterval as _playInterval,
  playChordMidi,
  playNote,
  playCadence,
  midiToNoteName,
  noteNameToMidi,
  ALL_KEYS_MIDI,
  FLAT_KEYS_MIDI,
  CHORD_TYPES,
  SCALES,
  weightedPick,
  delay,
} from '@/lib/audio/audioEngine';
import { subscribeNoteOn } from '@/lib/audio/midiInput';
import PianoKeyboard from '../audio/PianoKeyboard';
import { getRandomExercise, getExercisePool } from '@/components/data/exerciseData';
import { useItemMastery } from '@/lib/audio/useItemMastery';

function pickRootMidi(keyFilter = 'all') {
  const pool = keyFilter === 'flat' ? FLAT_KEYS_MIDI : ALL_KEYS_MIDI;
  const midi = pool[Math.floor(Math.random() * pool.length)];
  return midiToNoteName(midi);
}

// ─── Legacy shim helpers (avoid importing old AudioEngine.jsx) ────────────────
function playToneNote(midi, durationSec = 0.6) {
  playNote(Math.max(21, Math.min(108, midi)), { duration: `${durationSec}s`, velocity: 0.72 });
}

async function playChordByType(chordType, rootNote) {
  const rootMidi = noteNameToMidi(rootNote);
  const chord = CHORD_TYPES.find(c => c.name === chordType);
  if (!chord) return;
  playChordMidi(chord.intervals.map(s => rootMidi + s), { duration: '2n', velocity: 0.75, arpeggiate: true });
}

async function playScaleByType(scaleType, rootNote) {
  const rootMidi = noteNameToMidi(rootNote);
  const scale = SCALES.find(s => s.name === scaleType);
  if (!scale) return [];
  const notes = [];
  for (const s of scale.intervals) {
    playNote(rootMidi + s, { duration: '8n', velocity: 0.7 });
    notes.push(midiToNoteName(rootMidi + s));
    await delay(350);
  }
  return notes;
}

export default function ExerciseInterface({
  exerciseType = 'intervals',
  difficulty = 'beginner',
  audioType = 'piano',
  onComplete,
  onXPEarned,
  questionsCount = 10,
  isPracticeMode = false,
  questionSupplier = null,
  onChordAttempt = null,
  playInContext = false,
  keyFilter = 'all',
}) {
  const { recordAttempt, getWeight } = useItemMastery();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [firstLoad, setFirstLoad] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [currentBaseNote, setCurrentBaseNote] = useState(null);
  const [currentScaleNotes, setCurrentScaleNotes] = useState([]);
  const [isReplayingCorrect, setIsReplayingCorrect] = useState(false);
  const [replayHighlight, setReplayHighlight] = useState(null);
  const [showScaleNotes, setShowScaleNotes] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [highlightChordIndex, setHighlightChordIndex] = useState(null);
  const [highlightAllChord, setHighlightAllChord] = useState(false);

  // ─── Adaptive weighted question generation ────────────────────────────────
  const generateQuestion = useCallback(() => {
    if (isPracticeMode && questionSupplier) return questionSupplier();

    // Try to get a weighted pool; fall back to random if pool unavailable
    let exercise;
    const pool = getExercisePool ? getExercisePool(exerciseType, difficulty) : null;
    if (pool && pool.length > 0) {
      exercise = weightedPick(pool, (item) => {
        const itemId = item.chordType || item.scaleType ||
          (item.semitones !== undefined ? `${item.semitones}st` : String(item.answer));
        return getWeight(exerciseType, itemId);
      });
    } else {
      exercise = getRandomExercise(exerciseType, difficulty);
    }

    if (!exercise) return null;
    const baseNote = pickRootMidi(keyFilter);

    return {
      ...exercise,
      correctAnswer: { name: exercise.answer },
      options: exercise.options.map(opt => ({ name: opt })),
      semitones: exercise.semitones,
      chordType: exercise.chordType,
      scaleType: exercise.scaleType,
      playMode: exercise.playMode || 'melodic',
      baseNote,
    };
  }, [exerciseType, difficulty, isPracticeMode, questionSupplier, keyFilter, getWeight]);

  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, [generateQuestion]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space') { e.preventDefault(); handlePlaySound(); }
      if (e.code === 'Enter' && showFeedback) handleNext();
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && currentQuestion?.options) {
        const opt = currentQuestion.options[num - 1];
        if (opt && !showFeedback && hasPlayed) handleAnswer(opt);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showFeedback, hasPlayed, currentQuestion]);

  // ─── MIDI input wiring ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion || showFeedback || !hasPlayed) return;

    let pendingNotes = [];

    const unsub = subscribeNoteOn(({ midi }) => {
      if (showFeedback || !hasPlayed) return;

      if (exerciseType === 'intervals') {
        pendingNotes.push(midi);
        if (pendingNotes.length === 2) {
          const semitones = Math.abs(pendingNotes[1] - pendingNotes[0]);
          const match = currentQuestion.options.find(o => {
            const iv = INTERVALS_MAP[o.name];
            return iv !== undefined && iv === semitones;
          });
          if (match) handleAnswer(match);
          pendingNotes = [];
        }
      } else if (exerciseType === 'chords') {
        pendingNotes.push(midi % 12);
        clearTimeout(pendingNotes._timer);
        pendingNotes._timer = setTimeout(() => {
          if (pendingNotes.length >= 3) {
            const pcs = new Set(pendingNotes.map(n => n % 12));
            const match = currentQuestion.options.find(o => {
              const chord = CHORD_TYPES.find(c => c.name === o.name);
              if (!chord) return false;
              const rootPc = noteNameToMidi(currentBaseNote) % 12;
              return chord.intervals.every(s => pcs.has((rootPc + s) % 12));
            });
            if (match) handleAnswer(match);
          }
          pendingNotes = [];
        }, 600);
      }
    });

    return unsub;
  }, [currentQuestion, showFeedback, hasPlayed, exerciseType, currentBaseNote]);

  // ─── Auto-play first question ─────────────────────────────────────────────
  useEffect(() => {
    if (firstLoad && currentQuestion && questionNumber === 1) {
      const t = setTimeout(() => { handlePlaySound(); setFirstLoad(false); }, 500);
      return () => clearTimeout(t);
    }
  }, [firstLoad, currentQuestion, questionNumber]);

  const handlePlaySound = async () => {
    if (isPlaying || !currentQuestion) return;
    setIsPlaying(true);
    setHasPlayed(true);

    if (playInContext && currentBaseNote) {
      const rootMidi = noteNameToMidi(currentBaseNote || currentQuestion.baseNote);
      await playCadence(rootMidi - 12, 0.45);
      await delay(200);
    }

    const noteToUse = currentBaseNote || currentQuestion.baseNote;
    let baseNote = noteToUse;

    if (exerciseType === 'intervals') {
      const rootMidi = noteNameToMidi(noteToUse);
      const mode = currentQuestion.playMode === 'harmonic' ? 'harmonic' : 'melodic-asc';
      await _playInterval(rootMidi, currentQuestion.semitones, { mode });
    } else if (exerciseType === 'chords') {
      await playChordByType(currentQuestion.chordType, noteToUse);
    } else if (exerciseType === 'scales') {
      const notes = await playScaleByType(currentQuestion.scaleType, noteToUse);
      setCurrentScaleNotes(notes);
    }

    if (!currentBaseNote) setCurrentBaseNote(baseNote);
    setTimeout(() => setIsPlaying(false), exerciseType === 'scales' ? 3500 : 1500);
  };

  // ─── Answer replay animations ─────────────────────────────────────────────
  const replayIntervalAnimation = async (semitones, baseNote, showFeedbackAfter = true) => {
    setIsPlayingAnimation(true);
    setIsReplayingCorrect(true);
    const rootMidi = noteNameToMidi(baseNote);
    const topMidi  = rootMidi + semitones;

    await delay(300);
    setReplayHighlight('first');  playToneNote(rootMidi, 0.6); await delay(700);
    setReplayHighlight('second'); playToneNote(topMidi, 0.6);  await delay(700);
    setReplayHighlight(null); await delay(400);
    setReplayHighlight('second'); playToneNote(topMidi, 0.6);  await delay(700);
    setReplayHighlight('first');  playToneNote(rootMidi, 0.6); await delay(700);
    setReplayHighlight(null); await delay(400);
    setReplayHighlight('both');
    playToneNote(rootMidi, 1.2); playToneNote(topMidi, 1.2);
    await delay(1200);
    setIsReplayingCorrect(false); setReplayHighlight(null); setIsPlayingAnimation(false);
    if (showFeedbackAfter) { setShowFeedback(true); setShowNextButton(true); }
  };

  const replayChordAnimation = async (chordType, baseNote, showFeedbackAfter = true) => {
    setIsPlayingAnimation(true);
    setIsReplayingCorrect(true);
    const chord = CHORD_TYPES.find(c => c.name === chordType);
    if (!chord) {
      setIsPlayingAnimation(false); setIsReplayingCorrect(false);
      if (showFeedbackAfter) { setShowFeedback(true); setShowNextButton(true); }
      return;
    }
    const rootMidi = noteNameToMidi(baseNote);
    await delay(300);
    for (let i = 0; i < chord.intervals.length; i++) {
      setHighlightChordIndex(i);
      playToneNote(rootMidi + chord.intervals[i], 0.5);
      await delay(500);
    }
    setHighlightChordIndex(null); await delay(300);
    setHighlightAllChord(true);
    chord.intervals.forEach(s => playToneNote(rootMidi + s, 1.2));
    await delay(1000);
    setHighlightAllChord(false); setHighlightChordIndex(null);
    setIsReplayingCorrect(false); setIsPlayingAnimation(false);
    if (showFeedbackAfter) { setShowFeedback(true); setShowNextButton(true); }
  };

  const replayScaleAnimation = async (scaleType, baseNote, showFeedbackAfter = true) => {
    setIsPlayingAnimation(true);
    setIsReplayingCorrect(true);
    setShowScaleNotes(true);
    const scale = SCALES.find(s => s.name === scaleType);
    if (!scale) { setIsPlayingAnimation(false); setIsReplayingCorrect(false); return; }
    const rootMidi = noteNameToMidi(baseNote);
    const played = [];
    for (let i = 0; i < scale.intervals.length; i++) {
      played.push(midiToNoteName(rootMidi + scale.intervals[i]));
      setCurrentScaleNotes([...played]);
      setReplayHighlight(i);
      playToneNote(rootMidi + scale.intervals[i], 0.3);
      await delay(350);
    }
    await delay(200);
    setIsReplayingCorrect(false); setReplayHighlight(null); setIsPlayingAnimation(false);
    if (showFeedbackAfter) { setShowFeedback(true); setShowNextButton(true); }
  };

  // ─── Answer handling ──────────────────────────────────────────────────────
  const handleAnswer = (option) => {
    if (showFeedback || !hasPlayed || isReplayingCorrect) return;
    setSelectedAnswer(option);
    const correct = option.name === currentQuestion.correctAnswer.name;
    setIsCorrect(correct);

    if (exerciseType === 'chords' && onChordAttempt && currentQuestion.chordType)
      onChordAttempt(currentQuestion.chordType, correct);

    const itemId = currentQuestion.chordType || currentQuestion.scaleType ||
      (currentQuestion.semitones !== undefined ? `${currentQuestion.semitones}st` : 'unknown');
    recordAttempt(exerciseType, itemId, correct);

    if (correct) {
      if (!isPracticeMode) { setCorrectCount(prev => prev + 1); onXPEarned?.(10); }
      setReplayHighlight('both');
      if (exerciseType === 'intervals' && currentBaseNote)
        replayIntervalAnimation(currentQuestion.semitones, currentBaseNote, true);
      else if (exerciseType === 'scales' && currentBaseNote)
        replayScaleAnimation(currentQuestion.scaleType, currentBaseNote, true);
      else if (exerciseType === 'chords' && currentBaseNote)
        replayChordAnimation(currentQuestion.chordType, currentBaseNote, true);
      else { setShowFeedback(true); setShowNextButton(true); }
    } else {
      setShowFeedback(true); setShowNextButton(true);
    }
  };

  const proceedToNext = async () => {
    if (!isPracticeMode && questionNumber >= questionsCount) {
      const accuracy = Math.round((correctCount / questionsCount) * 100);
      onComplete?.({ correct: correctCount, total: questionsCount, accuracy, xpEarned: correctCount * 10 + (accuracy === 100 ? 10 : 0) });
      return;
    }
    setQuestionNumber(prev => prev + 1);
    setCurrentQuestion(isPracticeMode && questionSupplier ? questionSupplier() : generateQuestion());
    setSelectedAnswer(null); setIsCorrect(null); setShowFeedback(false);
    setHasPlayed(false); setCurrentBaseNote(null); setCurrentScaleNotes([]);
    setShowScaleNotes(false); setShowNextButton(false);
    setHighlightChordIndex(null); setHighlightAllChord(false);
    if (exerciseType === 'intervals') { await delay(300); handlePlaySound(); }
  };

  const handleNext = async () => {
    if (isPlayingAnimation) return;
    if (!isCorrect && currentBaseNote) {
      if (exerciseType === 'intervals') await replayIntervalAnimation(currentQuestion.semitones, currentBaseNote, false);
      else if (exerciseType === 'scales') await replayScaleAnimation(currentQuestion.scaleType, currentBaseNote, false);
      else if (exerciseType === 'chords') await replayChordAnimation(currentQuestion.chordType, currentBaseNote, false);
    }
    proceedToNext();
  };

  if (!currentQuestion) return null;
  const progress = ((questionNumber - 1) / questionsCount) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-1">
      {!isPracticeMode && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium">Question {questionNumber} of {questionsCount}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">{correctCount} correct</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Card className="mb-3 sm:mb-4 border-0 shadow-xl bg-gradient-to-br from-[#0A1A2F] to-[#243B73]">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handlePlaySound}
                disabled={isPlaying}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isPlaying ? 'bg-[#3E82FC] scale-110' : 'bg-white/10 hover:bg-white/20'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying
                  ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                  : <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />}
              </motion.button>
              <div className="flex flex-col">
                <p className="text-white font-semibold text-base">
                  {exerciseType === 'intervals' ? 'What interval do you hear?' :
                   exerciseType === 'chords'    ? 'What chord do you hear?' :
                   exerciseType === 'scales'    ? 'What scale do you hear?' : 'Listen and identify:'}
                </p>
                {hasPlayed && (
                  <button onClick={handlePlaySound} className="text-white/70 hover:text-white text-xs flex items-center gap-1 mt-1">
                    <RotateCcw className="w-3 h-3" /> Tap to replay
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(exerciseType === 'intervals' || exerciseType === 'scales' || exerciseType === 'chords') && hasPlayed && currentBaseNote && (
        <div className="mb-6 sm:mb-8 pb-6">
          <PianoKeyboard
            baseNote={currentBaseNote}
            semitones={exerciseType === 'intervals' ? currentQuestion?.semitones : undefined}
            scaleNotes={exerciseType === 'scales' && showScaleNotes ? currentScaleNotes : undefined}
            chordType={exerciseType === 'chords' ? currentQuestion?.chordType : undefined}
            showSecondNote={exerciseType === 'intervals' && (showFeedback || replayHighlight === 'second' || replayHighlight === 'both' || (isCorrect && selectedAnswer))}
            showChordNotes={exerciseType === 'chords' && (showFeedback || isCorrect || highlightChordIndex !== null || highlightAllChord)}
            highlightFirst={replayHighlight === 'first' || replayHighlight === 'both'}
            highlightSecond={replayHighlight === 'second' || replayHighlight === 'both'}
            highlightScaleNoteIndex={exerciseType === 'scales' && typeof replayHighlight === 'number' ? replayHighlight : undefined}
            highlightChordNoteIndex={highlightChordIndex}
            highlightAllChordNotes={highlightAllChord}
            isAnimating={isReplayingCorrect}
          />
        </div>
      )}

      <div className="text-center mb-3">
        <p className="text-sm sm:text-base font-medium text-[#0A1A2F] dark:text-white">
          Choose the correct {exerciseType === 'intervals' ? 'interval' : exerciseType === 'chords' ? 'chord' : exerciseType === 'scales' ? 'scale' : 'answer'}:
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <AnimatePresence>
          {currentQuestion.options.map((option, index) => {
            const isSelected      = selectedAnswer?.name === option.name;
            const isCorrectAnswer = showFeedback && option.name === currentQuestion.correctAnswer.name;
            const isWrongSel      = showFeedback && isSelected && !isCorrect;
            const isPreFeedback   = isSelected && !showFeedback && !isReplayingCorrect;
            return (
              <motion.div key={option.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback || !hasPlayed || isReplayingCorrect}
                  className={`w-full h-12 sm:h-14 text-sm sm:text-base font-medium transition-all ${
                    !hasPlayed        ? 'opacity-50 cursor-not-allowed' :
                    isCorrectAnswer   ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white hover:bg-[#2A9D8F]' :
                    isWrongSel        ? 'bg-[#E76F51] border-[#E76F51] text-white hover:bg-[#E76F51]' :
                    isPreFeedback     ? 'bg-[#3E82FC] border-[#3E82FC] text-white' :
                    'hover:border-[#3E82FC] hover:bg-[#3E82FC]/10'
                  }`}
                >
                  {option.name}
                  {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 ml-2" />}
                  {isWrongSel      && <XCircle className="w-5 h-5 ml-2" />}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className={`border-2 ${isCorrect ? 'border-[#2A9D8F] bg-[#2A9D8F]/10' : 'border-[#E76F51] bg-[#E76F51]/10'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCorrect ? <CheckCircle2 className="w-6 h-6 text-[#2A9D8F]" /> : <XCircle className="w-6 h-6 text-[#E76F51]" />}
                    <div>
                      <p className={`font-semibold ${isCorrect ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite'}
                      </p>
                      {!isCorrect && <p className="text-sm text-muted-foreground">The answer was: {currentQuestion.correctAnswer.name}</p>}
                    </div>
                  </div>
                  <Button onClick={handleNext} disabled={isPlayingAnimation} className="bg-[#3E82FC] hover:bg-[#243B73] text-white">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasPlayed && !showFeedback && (
        <p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
          {questionNumber === 1 ? 'Sound will play automatically...' : 'Tap play to hear the next question'}
        </p>
      )}
    </div>
  );
}

// Interval semitone lookup for MIDI matching
const INTERVALS_MAP = {
  'Unison': 0, 'Minor 2nd': 1, 'Major 2nd': 2, 'Minor 3rd': 3, 'Major 3rd': 4,
  'Perfect 4th': 5, 'Tritone': 6, 'Perfect 5th': 7, 'Minor 6th': 8,
  'Major 6th': 9, 'Minor 7th': 10, 'Major 7th': 11, 'Octave': 12,
};