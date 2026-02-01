import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from 'lucide-react';
import { melodyPatterns } from '@/components/data/expandedExerciseData';
import { motion, AnimatePresence } from 'framer-motion';

export default function MelodyExerciseInterface({ difficulty, audioType, onComplete }) {
  const [currentMelody, setCurrentMelody] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate melody exercise
  const generateExercise = useCallback(() => {
    const patterns = melodyPatterns[difficulty] || melodyPatterns.beginner;
    const correctMelody = patterns[Math.floor(Math.random() * patterns.length)];
    
    const wrongOptions = patterns
      .filter(p => p.name !== correctMelody.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const allOptions = [correctMelody, ...wrongOptions]
      .sort(() => 0.5 - Math.random());

    setCurrentMelody(correctMelody);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setHasPlayed(false);
  }, [difficulty]);

  useEffect(() => {
    generateExercise();
  }, [generateExercise]);

  // Play melody using Web Audio API
  const playMelody = useCallback(() => {
    if (!currentMelody || isPlaying) return;

    setIsPlaying(true);
    setHasPlayed(true);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const baseFreq = 261.63; // C4
    const now = audioContext.currentTime;
    let currentTime = now + 0.1;

    currentMelody.notes.forEach((semitone) => {
      const frequency = baseFreq * Math.pow(2, semitone / 12);
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure oscillator based on audio type
      oscillator.type = audioType === 'sine' ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.5);

      currentTime += 0.5; // Half second per note
    });

    setTimeout(() => setIsPlaying(false), (currentTime - now + 0.2) * 1000);
  }, [currentMelody, audioType, isPlaying]);

  const handleAnswer = (melody) => {
    if (showFeedback) return;

    setSelectedAnswer(melody.name);
    const correct = melody.name === currentMelody.name;
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      onComplete(correct);
      generateExercise();
    }, 1500);
  };

  if (!currentMelody) return null;

  return (
    <div className="space-y-6">
      {/* Play Button */}
      <Card className="bg-gradient-to-br from-[#243B73] to-[#3E82FC] border-0">
        <CardContent className="p-8 text-center">
          <Button
            onClick={playMelody}
            disabled={isPlaying}
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full w-24 h-24"
          >
            {isPlaying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Play className="w-12 h-12 fill-current" />
              </motion.div>
            ) : (
              <Play className="w-12 h-12 fill-current" />
            )}
          </Button>
          
          <div className="mt-4">
            <p className="text-white font-semibold text-base">
              What melodic pattern do you hear?
            </p>
            {hasPlayed && (
              <button 
                onClick={playMelody}
                disabled={isPlaying}
                className="text-white/70 hover:text-white text-xs flex items-center gap-1 mt-2 mx-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Tap to replay
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual melody representation */}
      {hasPlayed && (
        <div className="flex justify-center items-end gap-1 h-24">
          {currentMelody.notes.map((semitone, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className="bg-[#3E82FC] w-6 rounded-t origin-bottom"
              style={{
                height: `${(semitone / 12) * 100 + 30}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Answer Options */}
      {hasPlayed && (
        <>
          <p className="text-center text-sm font-medium">
            Choose the correct melodic pattern:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {options.map((melody) => (
                <motion.div
                  key={melody.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Button
                    onClick={() => handleAnswer(melody)}
                    disabled={showFeedback}
                    className={`w-full h-auto py-4 text-base ${
                      showFeedback && melody.name === currentMelody.name
                        ? 'bg-[#2A9D8F] hover:bg-[#2A9D8F] border-2 border-[#2A9D8F]'
                        : showFeedback && selectedAnswer === melody.name
                        ? 'bg-[#E76F51] hover:bg-[#E76F51] border-2 border-[#E76F51]'
                        : 'bg-white dark:bg-slate-800 hover:bg-[#D7E5FF] dark:hover:bg-slate-700'
                    }`}
                    variant={showFeedback ? 'default' : 'outline'}
                  >
                    {melody.name}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {!hasPlayed && (
        <p className="text-center text-muted-foreground text-sm">
          Play the audio to hear the melodic pattern
        </p>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${isCorrect ? 'border-[#2A9D8F] bg-[#2A9D8F]/5' : 'border-[#E76F51] bg-[#E76F51]/5'}`}>
              <CardContent className="p-4 text-center">
                <p className={`font-semibold ${isCorrect ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                  {isCorrect ? '✓ Correct!' : `✗ The correct answer was: ${currentMelody.name}`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}