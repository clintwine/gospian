import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Volume2, ArrowRight, Trophy, Clock, Target, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { initAudioContext, playTone, getNoteFrequency } from '@/components/audio/AudioEngine';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NOTES_NATURAL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTES_WITH_ACCIDENTALS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = ['3', '4', '5'];

export default function PerfectPitchChallenge() {
  const queryClient = useQueryClient();
  const [difficulty, setDifficulty] = useState('beginner');
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(10);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentNote, setCurrentNote] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [responseTimes, setResponseTimes] = useState([]);
  const [hasPlayed, setHasPlayed] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createResultMutation = useMutation({
    mutationFn: (data) => base44.entities.ExerciseResult.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseResults'] });
    },
  });

  const generateQuestion = () => {
    const notePool = difficulty === 'beginner' ? NOTES_NATURAL : NOTES_WITH_ACCIDENTALS;
    const octave = OCTAVES[Math.floor(Math.random() * OCTAVES.length)];
    const note = notePool[Math.floor(Math.random() * notePool.length)];
    return `${note}${octave}`;
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(1);
    setCorrectCount(0);
    setResponseTimes([]);
    playNextNote();
  };

  const playNextNote = () => {
    const note = generateQuestion();
    setCurrentNote(note);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setHasPlayed(false);
    setStartTime(Date.now());
  };

  const handlePlaySound = () => {
    if (isPlaying || !currentNote) return;
    
    initAudioContext();
    setIsPlaying(true);
    setHasPlayed(true);

    const baseNote = currentNote.slice(0, -1);
    const octave = currentNote.slice(-1);
    const noteWithOctave = `${baseNote}${octave}`;
    
    const freq = getNoteFrequency('C4', 0);
    const targetFreq = getNoteFrequency(noteWithOctave, 0);
    playTone(targetFreq, 1.0, 'piano');

    setTimeout(() => setIsPlaying(false), 1200);
  };

  const handleAnswer = (answer) => {
    if (showFeedback || !hasPlayed) return;

    const responseTime = Date.now() - startTime;
    setResponseTimes([...responseTimes, responseTime]);
    
    setSelectedAnswer(answer);
    const correct = answer === currentNote;
    setShowFeedback(true);

    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion >= totalQuestions) {
      finishGame();
    } else {
      setCurrentQuestion(prev => prev + 1);
      playNextNote();
    }
  };

  const finishGame = async () => {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
    
    if (user?.email) {
      await createResultMutation.mutateAsync({
        exercise_type: 'intervals',
        difficulty: difficulty,
        correct_answers: correctCount,
        total_questions: totalQuestions,
        accuracy: accuracy,
        time_taken_seconds: Math.round(responseTimes.reduce((a, b) => a + b, 0) / 1000),
        xp_earned: correctCount * 15,
      });
    }

    setGameState('finished');
  };

  const getAnswerOptions = () => {
    const notePool = difficulty === 'beginner' ? NOTES_NATURAL : NOTES_WITH_ACCIDENTALS;
    const currentNoteBase = currentNote.slice(0, -1);
    const currentOctave = currentNote.slice(-1);

    const options = [currentNote];
    
    while (options.length < 4) {
      const randomNote = notePool[Math.floor(Math.random() * notePool.length)];
      const randomOctave = currentOctave;
      const option = `${randomNote}${randomOctave}`;
      
      if (!options.includes(option)) {
        options.push(option);
      }
    }

    return options.sort(() => Math.random() - 0.5);
  };

  const progress = ((currentQuestion - 1) / totalQuestions) * 100;

  if (gameState === 'ready') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Challenges')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </Link>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-[#0A1A2F] to-[#243B73] text-white">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-[#E9C46A]" />
            <h1 className="text-3xl font-bold mb-4">Perfect Pitch Challenge</h1>
            <p className="text-white/80 mb-8 text-lg">
              Test your perfect pitch! Identify notes by ear.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-2">Select Difficulty</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={difficulty === 'beginner' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('beginner')}
                    className={difficulty === 'beginner' ? 'bg-[#3E82FC]' : 'bg-white/10 text-white border-white/30'}
                  >
                    Beginner
                    <span className="ml-2 text-xs">(Natural Notes)</span>
                  </Button>
                  <Button
                    variant={difficulty === 'intermediate' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('intermediate')}
                    className={difficulty === 'intermediate' ? 'bg-[#3E82FC]' : 'bg-white/10 text-white border-white/30'}
                  >
                    Advanced
                    <span className="ml-2 text-xs">(Sharps/Flats)</span>
                  </Button>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={startGame}
              className="bg-[#E9C46A] text-[#0A1A2F] hover:bg-[#E9C46A]/90 font-bold text-lg px-8"
            >
              Start Challenge
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);

    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-[#E9C46A]" />
            <h2 className="text-3xl font-bold mb-2">Challenge Complete!</h2>
            <p className="text-muted-foreground mb-8">Your Perfect Pitch Results</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#3E82FC]/10 to-[#3E82FC]/5 rounded-xl p-4">
                <Target className="w-6 h-6 mx-auto mb-2 text-[#3E82FC]" />
                <p className="text-2xl font-bold">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="bg-gradient-to-br from-[#2A9D8F]/10 to-[#2A9D8F]/5 rounded-xl p-4">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-[#2A9D8F]" />
                <p className="text-2xl font-bold">{correctCount}/{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="bg-gradient-to-br from-[#E9C46A]/10 to-[#E9C46A]/5 rounded-xl p-4">
                <Clock className="w-6 h-6 mx-auto mb-2 text-[#E9C46A]" />
                <p className="text-2xl font-bold">{(avgResponseTime / 1000).toFixed(1)}s</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setGameState('ready');
                }}
                variant="outline"
              >
                Try Again
              </Button>
              <Link to={createPageUrl('Challenges')}>
                <Button className="bg-[#3E82FC]">
                  Back to Challenges
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Question {currentQuestion} of {totalQuestions}</span>
          <span className="text-sm text-muted-foreground">{correctCount} correct</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-[#0A1A2F] to-[#243B73] mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <motion.button
              onClick={handlePlaySound}
              disabled={isPlaying}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'bg-[#3E82FC] scale-110' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Volume2 className="w-8 h-8 text-white animate-pulse" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <AnimatePresence>
          {hasPlayed && getAnswerOptions().map((note, index) => {
            const isSelected = selectedAnswer === note;
            const isCorrect = showFeedback && note === currentNote;
            const isWrong = showFeedback && isSelected && note !== currentNote;

            return (
              <motion.div
                key={note}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(note)}
                  disabled={showFeedback}
                  className={`w-full h-16 text-lg font-medium transition-all ${
                    isCorrect
                      ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white'
                      : isWrong
                        ? 'bg-[#E76F51] border-[#E76F51] text-white'
                        : isSelected
                          ? 'bg-[#3E82FC] border-[#3E82FC] text-white'
                          : ''
                  }`}
                >
                  {note}
                  {isCorrect && <CheckCircle2 className="w-5 h-5 ml-2" />}
                  {isWrong && <XCircle className="w-5 h-5 ml-2" />}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 ${selectedAnswer === currentNote ? 'border-[#2A9D8F] bg-[#2A9D8F]/10' : 'border-[#E76F51] bg-[#E76F51]/10'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className={`font-semibold ${selectedAnswer === currentNote ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                  {selectedAnswer === currentNote ? 'Correct!' : `Not quite - it was ${currentNote}`}
                </p>
              </div>
              <Button onClick={handleNext} className="bg-[#3E82FC]">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!hasPlayed && (
        <p className="text-center text-muted-foreground text-sm">
          Play the note first to reveal answer options
        </p>
      )}
    </div>
  );
}