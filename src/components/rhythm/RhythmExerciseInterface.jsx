import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from 'lucide-react';
import { rhythmPatterns } from '@/components/data/expandedExerciseData';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';

// Woodblock click using Tone.js MembraneSynth — no createOscillator
function createClickSynth(isDownbeat = false) {
  return new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: isDownbeat ? 4 : 2,
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
  }).toDestination();
}

export default function RhythmExerciseInterface({ difficulty, onComplete }) {
  const [currentPattern, setCurrentPattern] = useState(null);
  const [options, setOptions]               = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback]     = useState(false);
  const [isCorrect, setIsCorrect]           = useState(false);
  const [hasPlayed, setHasPlayed]           = useState(false);
  const [isPlaying, setIsPlaying]           = useState(false);
  const synthsRef = useRef([]);

  const generateExercise = useCallback(() => {
    const patterns = rhythmPatterns[difficulty] || rhythmPatterns.beginner;
    const correctPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const wrongOptions = patterns
      .filter(p => p.name !== correctPattern.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setCurrentPattern(correctPattern);
    setOptions([correctPattern, ...wrongOptions].sort(() => 0.5 - Math.random()));
    setSelectedAnswer(null);
    setShowFeedback(false);
    setHasPlayed(false);
  }, [difficulty]);

  useEffect(() => { generateExercise(); }, [generateExercise]);

  const playRhythm = useCallback(async () => {
    if (!currentPattern || isPlaying) return;
    setIsPlaying(true);
    setHasPlayed(true);

    // Dispose old synths
    synthsRef.current.forEach(s => s.dispose());
    synthsRef.current = [];

    await Tone.start();
    const now = Tone.now() + 0.1;
    let t = now;

    currentPattern.pattern.forEach((duration, idx) => {
      const isDownbeat = idx === 0;
      const synth = createClickSynth(isDownbeat);
      synthsRef.current.push(synth);
      const note  = isDownbeat ? 'G2' : 'C2';
      const vel   = isDownbeat ? 0.9 : 0.6;
      synth.triggerAttackRelease(note, '16n', t, vel);
      t += duration;
    });

    const totalMs = (t - now + 0.1) * 1000;
    setTimeout(() => setIsPlaying(false), totalMs);
  }, [currentPattern, isPlaying]);

  const handleAnswer = (pattern) => {
    if (showFeedback) return;
    setSelectedAnswer(pattern.name);
    const correct = pattern.name === currentPattern.name;
    setIsCorrect(correct);
    setShowFeedback(true);
    setTimeout(() => { onComplete(correct); generateExercise(); }, 1500);
  };

  if (!currentPattern) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#243B73] to-[#3E82FC] border-0">
        <CardContent className="p-8 text-center">
          <Button onClick={playRhythm} disabled={isPlaying} size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full w-24 h-24">
            {isPlaying ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                <Play className="w-12 h-12 fill-current" />
              </motion.div>
            ) : (
              <Play className="w-12 h-12 fill-current" />
            )}
          </Button>
          <div className="mt-4">
            <p className="text-white font-semibold text-base">What rhythm pattern do you hear?</p>
            {hasPlayed && (
              <button onClick={playRhythm} disabled={isPlaying}
                className="text-white/70 hover:text-white text-xs flex items-center gap-1 mt-2 mx-auto">
                <RotateCcw className="w-3 h-3" /> Tap to replay
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {hasPlayed && (
        <div className="flex justify-center gap-2">
          {currentPattern.pattern.map((duration, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: i * 0.1 }} className="bg-[#3E82FC] rounded"
              style={{ width: `${duration * 40}px`, height: '40px' }} />
          ))}
        </div>
      )}

      {hasPlayed && (
        <>
          <p className="text-center text-sm font-medium">Choose the correct rhythm pattern:</p>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {options.map(pattern => (
                <motion.div key={pattern.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <Button onClick={() => handleAnswer(pattern)} disabled={showFeedback}
                    className={`w-full h-auto py-4 text-base ${
                      showFeedback && pattern.name === currentPattern.name
                        ? 'bg-[#2A9D8F] hover:bg-[#2A9D8F] border-2 border-[#2A9D8F]'
                        : showFeedback && selectedAnswer === pattern.name
                        ? 'bg-[#E76F51] hover:bg-[#E76F51] border-2 border-[#E76F51]'
                        : 'bg-white dark:bg-slate-800 hover:bg-[#D7E5FF] dark:hover:bg-slate-700'
                    }`} variant={showFeedback ? 'default' : 'outline'}>
                    {pattern.name}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {!hasPlayed && <p className="text-center text-muted-foreground text-sm">Play the audio to hear the rhythm pattern</p>}

      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className={`border-2 ${isCorrect ? 'border-[#2A9D8F] bg-[#2A9D8F]/5' : 'border-[#E76F51] bg-[#E76F51]/5'}`}>
              <CardContent className="p-4 text-center">
                <p className={`font-semibold ${isCorrect ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                  {isCorrect ? '✓ Correct!' : `✗ The correct answer was: ${currentPattern.name}`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}