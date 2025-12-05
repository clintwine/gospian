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
      <div className="min-h-screen w-full bg-gradient-to-br from-[#0A1A2F] via-[#243B73] to-[#0A1A2F] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <Link to={createPageUrl('Challenges')} className="mb-8 inline-block">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#E9C46A] to-[#F4A261] flex items-center justify-center shadow-2xl">
                <Trophy className="w-14 h-14 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Perfect Pitch Challenge
            </h1>
            <p className="text-white/70 text-lg md:text-xl mb-12 max-w-xl mx-auto">
              Test your ability to identify musical notes by ear. Train your perfect pitch skills!
            </p>

            <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-white font-semibold text-lg mb-6">Choose Your Difficulty</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() => setDifficulty('beginner')}
                      className={`w-full p-6 rounded-2xl border-2 transition-all ${
                        difficulty === 'beginner'
                          ? 'bg-gradient-to-br from-[#3E82FC] to-[#2A9D8F] border-transparent shadow-lg shadow-[#3E82FC]/50'
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Target className="w-6 h-6 text-white" />
                        <span className="text-white font-bold text-xl">Beginner</span>
                      </div>
                      <p className="text-white/70 text-sm">Natural notes only (C, D, E, F, G, A, B)</p>
                      <div className="mt-4 text-xs text-white/50">Perfect for building foundation</div>
                    </button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() => setDifficulty('intermediate')}
                      className={`w-full p-6 rounded-2xl border-2 transition-all ${
                        difficulty === 'intermediate'
                          ? 'bg-gradient-to-br from-[#E76F51] to-[#F4A261] border-transparent shadow-lg shadow-[#E76F51]/50'
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Trophy className="w-6 h-6 text-white" />
                        <span className="text-white font-bold text-xl">Advanced</span>
                      </div>
                      <p className="text-white/70 text-sm">All notes including sharps & flats</p>
                      <div className="mt-4 text-xs text-white/50">For experienced musicians</div>
                    </button>
                  </motion.div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#E9C46A]" />
                    Challenge Format
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white mb-1">{totalQuestions}</p>
                      <p className="text-white/60 text-xs">Questions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#E9C46A] mb-1">15 XP</p>
                      <p className="text-white/60 text-xs">Per Correct</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#2A9D8F] mb-1">∞</p>
                      <p className="text-white/60 text-xs">No Time Limit</p>
                    </div>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={startGame}
                    className="w-full h-14 bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-[#0A1A2F] hover:opacity-90 font-bold text-xl shadow-xl"
                  >
                    Start Challenge
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
    const performanceLevel = accuracy >= 90 ? 'Excellent' : accuracy >= 70 ? 'Great' : accuracy >= 50 ? 'Good' : 'Keep Practicing';
    const performanceColor = accuracy >= 90 ? 'text-[#E9C46A]' : accuracy >= 70 ? 'text-[#2A9D8F]' : accuracy >= 50 ? 'text-[#3E82FC]' : 'text-[#E76F51]';

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#0A1A2F] via-[#243B73] to-[#0A1A2F] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="inline-block mb-6"
            >
              <div className={`w-32 h-32 mx-auto rounded-3xl ${
                accuracy >= 90 
                  ? 'bg-gradient-to-br from-[#E9C46A] to-[#F4A261]'
                  : accuracy >= 70
                    ? 'bg-gradient-to-br from-[#2A9D8F] to-[#3E82FC]'
                    : 'bg-gradient-to-br from-[#3E82FC] to-[#243B73]'
              } flex items-center justify-center shadow-2xl`}>
                <Trophy className="w-20 h-20 text-white" />
              </div>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Challenge Complete!</h2>
            <p className={`text-2xl font-semibold mb-8 ${performanceColor}`}>{performanceLevel}</p>

            <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl mb-6">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-[#3E82FC]/20 to-transparent rounded-2xl p-6 border border-white/10"
                  >
                    <Target className="w-8 h-8 mx-auto mb-3 text-[#3E82FC]" />
                    <p className="text-4xl font-bold text-white mb-1">{accuracy}%</p>
                    <p className="text-white/60 text-sm">Accuracy</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#2A9D8F]/20 to-transparent rounded-2xl p-6 border border-white/10"
                  >
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-[#2A9D8F]" />
                    <p className="text-4xl font-bold text-white mb-1">{correctCount}<span className="text-xl text-white/60">/{totalQuestions}</span></p>
                    <p className="text-white/60 text-sm">Correct Answers</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-[#E9C46A]/20 to-transparent rounded-2xl p-6 border border-white/10"
                  >
                    <Clock className="w-8 h-8 mx-auto mb-3 text-[#E9C46A]" />
                    <p className="text-4xl font-bold text-white mb-1">{(avgResponseTime / 1000).toFixed(1)}<span className="text-xl text-white/60">s</span></p>
                    <p className="text-white/60 text-sm">Avg Response Time</p>
                  </motion.div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                  <p className="text-white/80 text-sm mb-2">XP Earned</p>
                  <p className="text-3xl font-bold text-[#E9C46A]">+{correctCount * 15} XP</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      onClick={() => setGameState('ready')}
                      variant="outline"
                      className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
                    >
                      Try Again
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Link to={createPageUrl('Challenges')} className="block">
                      <Button className="w-full h-12 bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-[#0A1A2F] hover:opacity-90 font-semibold">
                        Back to Challenges
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A1A2F] via-[#243B73] to-[#0A1A2F] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm font-medium">Question {currentQuestion} of {totalQuestions}</span>
              <span className="text-[#E9C46A] text-sm font-semibold">{correctCount} correct</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/10" />
          </div>

          <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl mb-6">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <h3 className="text-white/60 text-lg mb-2">Listen to the note</h3>
                <p className="text-white/40 text-sm">Click the play button below</p>
              </div>
              <div className="flex items-center justify-center">
                <motion.button
                  onClick={handlePlaySound}
                  disabled={isPlaying}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                    isPlaying 
                      ? 'bg-gradient-to-br from-[#3E82FC] to-[#2A9D8F] shadow-[#3E82FC]/50' 
                      : 'bg-gradient-to-br from-[#E9C46A] to-[#F4A261] hover:shadow-[#E9C46A]/50'
                  }`}
                >
                  {isPlaying ? (
                    <Volume2 className="w-12 h-12 text-white animate-pulse" />
                  ) : (
                    <Play className="w-12 h-12 text-white ml-1" />
                  )}
                </motion.button>
              </div>
            </CardContent>
          </Card>

          {hasPlayed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white/60 text-center mb-4 text-sm">What note did you hear?</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <AnimatePresence>
                  {getAnswerOptions().map((note, index) => {
                    const isSelected = selectedAnswer === note;
                    const isCorrect = showFeedback && note === currentNote;
                    const isWrong = showFeedback && isSelected && note !== currentNote;

                    return (
                      <motion.div
                        key={note}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: showFeedback ? 1 : 1.05 }}
                        whileTap={{ scale: showFeedback ? 1 : 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => handleAnswer(note)}
                          disabled={showFeedback}
                          className={`w-full h-20 text-2xl font-bold transition-all border-2 ${
                            isCorrect
                              ? 'bg-gradient-to-br from-[#2A9D8F] to-[#3E82FC] border-transparent text-white shadow-lg'
                              : isWrong
                                ? 'bg-gradient-to-br from-[#E76F51] to-[#F4A261] border-transparent text-white shadow-lg'
                                : isSelected
                                  ? 'bg-white/10 border-white/30 text-white'
                                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          {note}
                          {isCorrect && <CheckCircle2 className="w-6 h-6 ml-3" />}
                          {isWrong && <XCircle className="w-6 h-6 ml-3" />}
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border-2 shadow-xl ${
                selectedAnswer === currentNote 
                  ? 'border-[#2A9D8F] bg-gradient-to-r from-[#2A9D8F]/20 to-transparent' 
                  : 'border-[#E76F51] bg-gradient-to-r from-[#E76F51]/20 to-transparent'
              }`}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAnswer === currentNote ? (
                      <CheckCircle2 className="w-8 h-8 text-[#2A9D8F]" />
                    ) : (
                      <XCircle className="w-8 h-8 text-[#E76F51]" />
                    )}
                    <div>
                      <p className={`font-bold text-lg ${selectedAnswer === currentNote ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                        {selectedAnswer === currentNote ? 'Perfect!' : 'Not quite'}
                      </p>
                      {selectedAnswer !== currentNote && (
                        <p className="text-sm text-white/60">The correct answer was <span className="font-bold text-white">{currentNote}</span></p>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleNext} className="bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-[#0A1A2F] hover:opacity-90 font-semibold">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!hasPlayed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/40 text-sm"
            >
              Play the note first to reveal answer options
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}