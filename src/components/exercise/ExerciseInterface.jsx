import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  playInterval, 
  generateIntervalQuestion, 
  playChord, 
  generateChordQuestion,
  initAudioContext 
} from '../audio/AudioEngine';
import PianoKeyboard from '../audio/PianoKeyboard';

export default function ExerciseInterface({ 
  exerciseType = 'intervals',
  difficulty = 'beginner',
  audioType = 'sine',
  onComplete,
  onXPEarned,
  questionsCount = 10
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
  const [isReplayingCorrect, setIsReplayingCorrect] = useState(false);
  const [replayHighlight, setReplayHighlight] = useState(null); // 'first', 'second', or null

  const generateQuestion = useCallback(() => {
    if (exerciseType === 'intervals') {
      return generateIntervalQuestion(difficulty);
    } else if (exerciseType === 'chords') {
      return generateChordQuestion();
    }
    return generateIntervalQuestion(difficulty);
  }, [exerciseType, difficulty]);

  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, [generateQuestion]);

  const handlePlaySound = async () => {
    if (isPlaying || !currentQuestion) return;
    
    initAudioContext();
    setIsPlaying(true);
    setHasPlayed(true);

    let baseNote;
    if (exerciseType === 'intervals') {
      baseNote = await playInterval(currentQuestion.semitones, audioType, 'melodic', currentBaseNote);
    } else if (exerciseType === 'chords') {
      baseNote = await playChord(currentQuestion.chordType, audioType, currentBaseNote);
    }
    
    // Store the base note for replay
    if (!currentBaseNote) {
      setCurrentBaseNote(baseNote);
    }

    setTimeout(() => setIsPlaying(false), 1500);
  };

  const replayIntervalAnimation = async () => {
    setIsReplayingCorrect(true);
    
    // Highlight and play first note
    setReplayHighlight('first');
    await playInterval(0, audioType, 'melodic', currentBaseNote); // Play just the base note
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Highlight and play second note
    setReplayHighlight('second');
    await playInterval(currentQuestion.semitones, audioType, 'melodic', currentBaseNote);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Show both notes highlighted
    setReplayHighlight('both');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setIsReplayingCorrect(false);
    setReplayHighlight(null);
    setShowFeedback(true);
  };

  const handleAnswer = (option) => {
    if (showFeedback || !hasPlayed || isReplayingCorrect) return;

    setSelectedAnswer(option);
    const correct = option.name === currentQuestion.correctAnswer.name;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      onXPEarned?.(10);
      // Replay the interval animation before showing feedback
      if (exerciseType === 'intervals' && currentBaseNote) {
        replayIntervalAnimation();
      } else {
        setShowFeedback(true);
      }
    } else {
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (questionNumber >= questionsCount) {
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
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setHasPlayed(false);
    setCurrentBaseNote(null);
  };

  if (!currentQuestion) return null;

  const progress = ((questionNumber - 1) / questionsCount) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-1">
      {/* Progress Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium">Question {questionNumber} of {questionsCount}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">{correctCount} correct</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Audio Player */}
      <Card className="mb-4 sm:mb-6 border-0 shadow-xl bg-gradient-to-br from-[#0A1A2F] to-[#243B73]">
        <CardContent className="p-6 sm:p-8 flex flex-col items-center">
          <motion.button
            onClick={handlePlaySound}
            disabled={isPlaying}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-[#3E82FC] scale-110' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <Volume2 className="w-10 h-10 text-white animate-pulse" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" />
            )}
          </motion.button>
          <p className="text-white/70 mt-4 text-sm">
            {hasPlayed ? 'Click to replay' : 'Click to play'}
          </p>
          {hasPlayed && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePlaySound}
              className="text-white/60 hover:text-white mt-2"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Replay
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Piano Keyboard Visualization (only for intervals) */}
      {exerciseType === 'intervals' && hasPlayed && currentBaseNote && (
        <div className="mb-6 sm:mb-8 pb-6">
          <PianoKeyboard 
            baseNote={currentBaseNote} 
            semitones={currentQuestion?.semitones}
            showSecondNote={showFeedback || replayHighlight === 'second' || replayHighlight === 'both'}
            highlightFirst={replayHighlight === 'first' || replayHighlight === 'both'}
            highlightSecond={replayHighlight === 'second' || replayHighlight === 'both'}
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
                  disabled={showFeedback || !hasPlayed}
                  className={`w-full h-12 sm:h-14 text-sm sm:text-base font-medium transition-all ${
                    !hasPlayed 
                      ? 'opacity-50 cursor-not-allowed'
                      : isCorrectAnswer
                        ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white hover:bg-[#2A9D8F]'
                        : isWrongSelection
                          ? 'bg-[#E76F51] border-[#E76F51] text-white hover:bg-[#E76F51]'
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
                  <Button onClick={handleNext} className="bg-[#243B73] hover:bg-[#0A1A2F]">
                    {questionNumber >= questionsCount ? 'See Results' : 'Next'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
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