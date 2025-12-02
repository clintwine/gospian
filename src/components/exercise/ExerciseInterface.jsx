import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  playInterval, 
  playChord, 
  playScale,
  initAudioContext,
  playTone,
  getNoteFrequency
} from '../audio/AudioEngine';
import PianoKeyboard from '../audio/PianoKeyboard';
import { getRandomExercise } from '@/components/data/exerciseData';

export default function ExerciseInterface({ 
  exerciseType = 'intervals',
  difficulty = 'beginner',
  audioType = 'sine',
  onComplete,
  onXPEarned,
  questionsCount = 10,
  isPracticeMode = false,
  questionSupplier = null
}) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [currentBaseNote, setCurrentBaseNote] = useState(null);
  const [currentScaleNotes, setCurrentScaleNotes] = useState([]);
  const [isReplayingCorrect, setIsReplayingCorrect] = useState(false);
  const [replayHighlight, setReplayHighlight] = useState(null); // 'first', 'second', 'both', or scale index
  const [showScaleNotes, setShowScaleNotes] = useState(false); // Only show full scale after correct answer
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false); // Block next during animation
  const [showNextButton, setShowNextButton] = useState(false); // Show next button after animation

  const generateQuestion = useCallback(() => {
    if (isPracticeMode && questionSupplier) {
      return questionSupplier();
    }
    const exercise = getRandomExercise(exerciseType, difficulty);
    if (!exercise) return null;
    
    // Transform exercise data to match expected format
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
  }, [exerciseType, difficulty, isPracticeMode, questionSupplier]);

  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, [generateQuestion]);

  const handlePlaySound = async () => {
    if (isPlaying || !currentQuestion) return;
    
    initAudioContext();
    setIsPlaying(true);
    setHasPlayed(true);

    // Use the baseNote from the exercise data, or fall back to stored/random
    const noteToUse = currentBaseNote || currentQuestion.baseNote;
    let baseNote;
    
    if (exerciseType === 'intervals') {
      const playMode = currentQuestion.playMode || 'melodic';
      baseNote = await playInterval(currentQuestion.semitones, audioType, playMode, noteToUse);
    } else if (exerciseType === 'chords') {
      baseNote = await playChord(currentQuestion.chordType, audioType, noteToUse);
    } else if (exerciseType === 'scales') {
      const { playedNotes, baseNote: scaleBaseNote } = await playScale(currentQuestion.scaleType, audioType, noteToUse);
      baseNote = scaleBaseNote;
      setCurrentScaleNotes(playedNotes);
    }
    
    // Always store the base note (only set once per question via noteToUse logic)
    if (!currentBaseNote) {
      setCurrentBaseNote(baseNote);
    }

    setTimeout(() => setIsPlaying(false), exerciseType === 'scales' ? 3500 : 1500);
  };

  const replayIntervalAnimation = async (semitones, baseNote, showFeedbackAfter = true) => {
    setIsPlayingAnimation(true);
    setIsReplayingCorrect(true);
    
    const baseFreq = getNoteFrequency(baseNote, 0);
    const secondFreq = getNoteFrequency(baseNote, semitones);
    
    // Small delay before starting
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Highlight and play first note simultaneously
    setReplayHighlight('first');
    playTone(baseFreq, 0.6, audioType);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Highlight and play second note simultaneously
    setReplayHighlight('second');
    playTone(secondFreq, 0.6, audioType);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Show both notes highlighted briefly
    setReplayHighlight('both');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsReplayingCorrect(false);
    setReplayHighlight(null);
    setIsPlayingAnimation(false);
    if (showFeedbackAfter) {
      setShowFeedback(true);
      setShowNextButton(true);
    }
  };

  const replayScaleAnimation = async (scaleType, baseNote, showFeedbackAfter = true) => {
    setIsPlayingAnimation(true);
    setIsReplayingCorrect(true);
    setShowScaleNotes(true);
    
    // Get scale intervals for synchronized playback
    const scale = await import('../audio/AudioEngine').then(m => m.SCALES.find(s => s.name === scaleType));
    if (!scale) return;
    
    const playedNotes = [];
    for (let i = 0; i < scale.intervals.length; i++) {
      const semitones = scale.intervals[i];
      const freq = getNoteFrequency(baseNote, semitones);
      
      // Get note name for display
      const allNotes = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
                        'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
                        'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5'];
      const baseIndex = allNotes.indexOf(baseNote);
      const noteName = allNotes[baseIndex + semitones];
      if (noteName) playedNotes.push(noteName);
      
      // Update notes and highlight simultaneously with sound
      setCurrentScaleNotes([...playedNotes]);
      setReplayHighlight(i);
      playTone(freq, 0.3, audioType);
      
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    setIsReplayingCorrect(false);
    setReplayHighlight(null);
    setIsPlayingAnimation(false);
    if (showFeedbackAfter) {
      setShowFeedback(true);
      setShowNextButton(true);
    }
  };

  const handleAnswer = (option) => {
    if (showFeedback || !hasPlayed || isReplayingCorrect) return;

    setSelectedAnswer(option);
    const correct = option.name === currentQuestion.correctAnswer.name;
    setIsCorrect(correct);

    if (correct) {
      if (!isPracticeMode) {
        setCorrectCount(prev => prev + 1);
        onXPEarned?.(10);
      }
      // Immediately show the second note highlight
      setReplayHighlight('both');
      // Replay animation before showing feedback
      if (exerciseType === 'intervals' && currentBaseNote) {
        replayIntervalAnimation(currentQuestion.semitones, currentBaseNote, true);
      } else if (exerciseType === 'scales' && currentBaseNote) {
        replayScaleAnimation(currentQuestion.scaleType, currentBaseNote, true);
      } else {
        setShowFeedback(true);
        setShowNextButton(true);
      }
    } else {
      setShowFeedback(true);
      setShowNextButton(true);
    }
  };

  const proceedToNext = () => {
    if (!isPracticeMode && questionNumber >= questionsCount) {
      const accuracy = Math.round((correctCount / questionsCount) * 100);
      const bonusXP = accuracy === 100 ? 10 : 0;
      onComplete?.({
        correct: correctCount,
        total: questionsCount,
        accuracy,
        xpEarned: correctCount * 10 + bonusXP,
      });
      return;
    }

    setQuestionNumber(prev => prev + 1);
    if (isPracticeMode && questionSupplier) {
      setCurrentQuestion(questionSupplier());
    } else {
      setCurrentQuestion(generateQuestion());
    }
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setHasPlayed(false);
    setCurrentBaseNote(null);
    setCurrentScaleNotes([]);
    setShowScaleNotes(false);
    setShowNextButton(false);
  };

  const handleNext = async () => {
    if (isPlayingAnimation) return;
    
    // If incorrect, play the correct answer animation first
    if (!isCorrect && currentBaseNote) {
      if (exerciseType === 'intervals') {
        await replayIntervalAnimation(currentQuestion.semitones, currentBaseNote, false);
      } else if (exerciseType === 'scales') {
        await replayScaleAnimation(currentQuestion.scaleType, currentBaseNote, false);
      }
    }
    
    proceedToNext();
  };

  if (!currentQuestion) return null;

  const progress = ((questionNumber - 1) / questionsCount) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-1">
      {/* Progress Header (hidden in practice mode) */}
      {!isPracticeMode && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium">Question {questionNumber} of {questionsCount}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">{correctCount} correct</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Audio Player */}
      <Card className="mb-3 sm:mb-4 border-0 shadow-xl bg-gradient-to-br from-[#0A1A2F] to-[#243B73]">
        <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-4">
          <div className="w-10 sm:w-12" /> {/* Spacer for centering */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handlePlaySound}
              disabled={isPlaying}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isPlaying 
                  ? 'bg-[#3E82FC] scale-110' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
              )}
            </motion.button>
            <div className="flex flex-col">
              <p className="text-white/90 text-sm font-medium">
                {hasPlayed ? 'Tap to replay' : 'Tap to play'}
              </p>
              {hasPlayed && (
                <button 
                  onClick={handlePlaySound}
                  className="text-white/60 hover:text-white text-xs flex items-center gap-1 mt-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Replay sound
                </button>
              )}
            </div>
          </div>
          {showNextButton ? (
            <Button
              onClick={handleNext}
              disabled={isPlayingAnimation}
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3E82FC] hover:bg-[#243B73] text-white flex-shrink-0 rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <div className="w-10 sm:w-12" /> {/* Spacer when no button */}
          )}
        </CardContent>
      </Card>

      {/* Piano Keyboard Visualization */}
      {(exerciseType === 'intervals' || exerciseType === 'scales') && hasPlayed && currentBaseNote && (
        <div className="mb-6 sm:mb-8 pb-6">
          <PianoKeyboard 
            baseNote={currentBaseNote} 
            semitones={exerciseType === 'intervals' ? currentQuestion?.semitones : undefined}
            scaleNotes={exerciseType === 'scales' && showScaleNotes ? currentScaleNotes : undefined}
            showSecondNote={exerciseType === 'intervals' && (showFeedback || replayHighlight === 'second' || replayHighlight === 'both' || (isCorrect && selectedAnswer))}
            highlightFirst={replayHighlight === 'first' || replayHighlight === 'both'}
            highlightSecond={replayHighlight === 'second' || replayHighlight === 'both'}
            highlightScaleNoteIndex={exerciseType === 'scales' && typeof replayHighlight === 'number' ? replayHighlight : undefined}
            isAnimating={isReplayingCorrect}
          />
        </div>
      )}

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <AnimatePresence>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer?.name === option.name;
            const isCorrectAnswer = showFeedback && option.name === currentQuestion.correctAnswer.name;
            const isWrongSelection = showFeedback && isSelected && !isCorrect;
            const isSelectedBeforeFeedback = isSelected && !showFeedback && !isReplayingCorrect;

            return (
              <motion.div
                key={option.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback || !hasPlayed || isReplayingCorrect}
                  className={`w-full h-12 sm:h-14 text-sm sm:text-base font-medium transition-all ${
                    !hasPlayed 
                      ? 'opacity-50 cursor-not-allowed'
                      : isCorrectAnswer
                        ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white hover:bg-[#2A9D8F]'
                        : isWrongSelection
                          ? 'bg-[#E76F51] border-[#E76F51] text-white hover:bg-[#E76F51]'
                          : isSelectedBeforeFeedback
                            ? 'bg-[#3E82FC] border-[#3E82FC] text-white'
                            : 'hover:border-[#3E82FC] hover:bg-[#3E82FC]/10'
                  }`}
                >
                  {option.name}
                  {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 ml-2" />}
                  {isWrongSelection && <XCircle className="w-5 h-5 ml-2" />}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Feedback & Next */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${isCorrect ? 'border-[#2A9D8F] bg-[#2A9D8F]/10' : 'border-[#E76F51] bg-[#E76F51]/10'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-[#2A9D8F]" />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#E76F51]" />
                    )}
                    <div>
                      <p className={`font-semibold ${isCorrect ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-muted-foreground">
                          The answer was: {currentQuestion.correctAnswer.name}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasPlayed && !showFeedback && (
        <p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
          Play the audio first to reveal answer options
        </p>
      )}
    </div>
  );
}