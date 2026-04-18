/**
 * SingBack — Real-time vocal pitch detection exercise.
 * Users hear an interval/note and must sing it back.
 * Uses the `pitchy` library for microphone pitch detection.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, RotateCcw, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { PitchDetector } from 'pitchy';
import {
  playNote,
  midiToNoteName,
  noteNameToMidi,
  ALL_KEYS_MIDI,
  INTERVALS,
  delay,
  playInterval as _playInterval,
} from '@/lib/audio/audioEngine';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const TOTAL_ROUNDS = 8;
const LISTEN_DURATION = 3000; // ms to listen after target plays
const TOLERANCE_SEMITONES = 1.5; // how many semitones off is still "close enough"

const INTERVAL_POOL = INTERVALS.filter(i => i.semitones >= 0 && i.semitones <= 7);

function randomRoot() {
  const idx = Math.floor(Math.random() * ALL_KEYS_MIDI.length);
  return ALL_KEYS_MIDI[idx] + 48; // mid-range octave
}

function midiFromFreq(freq) {
  if (!freq || freq <= 0) return null;
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

function semitoneError(targetMidi, detectedMidi) {
  return Math.abs(targetMidi - detectedMidi);
}

export default function SingBack() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const [phase, setPhase] = useState('intro'); // intro | playing | listening | feedback | done
  const [round, setRound] = useState(0);
  const [rootMidi, setRootMidi] = useState(null);
  const [targetMidi, setTargetMidi] = useState(null);
  const [targetInterval, setTargetInterval] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectedMidi, setDetectedMidi] = useState(null);
  const [detectedNote, setDetectedNote] = useState(null);
  const [results, setResults] = useState([]);
  const [micAllowed, setMicAllowed] = useState(null);
  const [listenProgress, setListenProgress] = useState(0);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const listenTimerRef = useRef(null);
  const bestMidiRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (listenTimerRef.current) {
      clearInterval(listenTimerRef.current);
      clearTimeout(listenTimerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  };

  const generateRound = useCallback(() => {
    const root = randomRoot();
    const interval = INTERVAL_POOL[Math.floor(Math.random() * INTERVAL_POOL.length)];
    const target = root + interval.semitones;
    setRootMidi(root);
    setTargetMidi(target);
    setTargetInterval(interval);
    setDetectedMidi(null);
    setDetectedNote(null);
    bestMidiRef.current = null;
    return { root, target, interval };
  }, []);

  const playTarget = async (root, target) => {
    setIsPlaying(true);
    // Play root then target to show the interval
    await _playInterval(root, target - root, { mode: 'melodic-asc' });
    setIsPlaying(false);
  };

  const startRound = async () => {
    setPhase('playing');
    const { root, target } = generateRound();
    await delay(400);
    await playTarget(root, target);
    await delay(300);
    setPhase('listening');
    startMicListening(target);
  };

  const startMicListening = async (target) => {
    setIsListening(true);
    setListenProgress(0);
    bestMidiRef.current = null;

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicAllowed(true);
    } catch {
      setMicAllowed(false);
      setIsListening(false);
      setPhase('feedback');
      return;
    }

    streamRef.current = stream;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyserRef.current = analyser;

    const detector = PitchDetector.forFloat32Array(analyser.fftSize);
    detectorRef.current = detector;
    const input = new Float32Array(analyser.fftSize);

    const startTime = Date.now();
    let bestCandidateMidi = null;
    let bestClarity = 0;

    const tick = () => {
      analyser.getFloatTimeDomainData(input);
      const [pitch, clarity] = detector.findPitch(input, ctx.sampleRate);
      if (clarity > 0.85 && pitch > 60 && pitch < 1200) {
        const midi = midiFromFreq(pitch);
        if (clarity > bestClarity) {
          bestClarity = clarity;
          bestCandidateMidi = midi;
          bestMidiRef.current = midi;
          setDetectedMidi(midi);
          setDetectedNote(midiToNoteName(midi));
        }
      }

      const elapsed = Date.now() - startTime;
      setListenProgress(Math.min(100, (elapsed / LISTEN_DURATION) * 100));

      if (elapsed < LISTEN_DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Done listening
        stopListening();
        const finalMidi = bestMidiRef.current;
        const isCorrect = finalMidi !== null && semitoneError(target, finalMidi) <= TOLERANCE_SEMITONES;
        setResults(prev => [...prev, { correct: isCorrect, detectedMidi: finalMidi, targetMidi: target }]);
        setPhase('feedback');
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const handleNext = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= TOTAL_ROUNDS) {
      setPhase('done');
    } else {
      startRound();
    }
  };

  const restart = () => {
    stopListening();
    setRound(0);
    setResults([]);
    setPhase('intro');
  };

  const score = results.filter(r => r.correct).length;
  const accuracy = results.length ? Math.round((score / results.length) * 100) : 0;

  // ─── INTRO ────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#243B73] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E76F51] to-[#E9C46A] flex items-center justify-center">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Sing-Back</h1>
            <p className="text-white/70 text-lg">Hear an interval — then sing it back. We detect your pitch in real-time.</p>
          </div>

          <Card className="bg-white/10 border-white/20 mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center text-white">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-2xl font-bold">{TOTAL_ROUNDS}</p>
                  <p className="text-xs text-white/60">Rounds</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-2xl font-bold">🎤</p>
                  <p className="text-xs text-white/60">Mic needed</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-2xl font-bold">±{TOLERANCE_SEMITONES}</p>
                  <p className="text-xs text-white/60">Semitone tolerance</p>
                </div>
              </div>
              <p className="text-white/60 text-sm text-center">Listen to each interval, then sing the top note back. Your microphone detects your pitch.</p>
              <Button
                onClick={startRound}
                className="w-full h-12 bg-gradient-to-r from-[#E76F51] to-[#E9C46A] text-[#0A1A2F] font-bold text-lg hover:opacity-90"
              >
                Start Singing
              </Button>
              <div className="text-center">
                <Link to={createPageUrl('Dashboard')} className="text-white/40 text-sm hover:text-white/60 transition-colors">
                  Back to Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── DONE ─────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#243B73] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-md">
          <div className="text-6xl mb-4">{accuracy >= 75 ? '🎤' : accuracy >= 50 ? '🎵' : '🎯'}</div>
          <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
          <p className="text-white/70 mb-6">{score}/{TOTAL_ROUNDS} correct · {accuracy}% accuracy</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {results.map((r, i) => (
              <div key={i} className={`rounded-xl p-3 text-center ${r.correct ? 'bg-[#2A9D8F]/30' : 'bg-[#E76F51]/30'}`}>
                <span className="text-white text-sm font-medium">Round {i + 1}</span>
                <div className="mt-1">
                  {r.correct
                    ? <CheckCircle2 className="w-5 h-5 text-[#2A9D8F] mx-auto" />
                    : <XCircle className="w-5 h-5 text-[#E76F51] mx-auto" />
                  }
                </div>
                {r.detectedMidi && (
                  <p className="text-white/50 text-xs mt-1">Sung: {midiToNoteName(r.detectedMidi)}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={restart} className="flex-1 bg-[#3E82FC] hover:bg-[#243B73]">
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Link to={createPageUrl('Dashboard')} className="flex-1">
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── ACTIVE GAME ──────────────────────────────────────────────────────────
  const lastResult = results[results.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] to-[#243B73] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Round {Math.min(round + 1, TOTAL_ROUNDS)} of {TOTAL_ROUNDS}</span>
            <span className="text-[#E9C46A] text-sm">{score} correct</span>
          </div>
          <Progress value={(round / TOTAL_ROUNDS) * 100} className="h-2 bg-white/10" />
        </div>

        {/* Target info */}
        {targetInterval && (
          <Card className="bg-white/5 border-white/20 mb-4">
            <CardContent className="p-6 text-center">
              <p className="text-white/50 text-sm mb-2">
                {phase === 'playing' ? 'Listen carefully…' :
                 phase === 'listening' ? 'Now sing the top note!' :
                 phase === 'feedback' ? 'Result' : ''}
              </p>
              <p className="text-white text-2xl font-bold mb-1">{targetInterval.name}</p>
              <p className="text-white/40 text-sm">Root: {midiToNoteName(rootMidi)} → Target: {midiToNoteName(targetMidi)}</p>
            </CardContent>
          </Card>
        )}

        {/* Listening state */}
        {phase === 'listening' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-white/10 border-[#E76F51] mb-4">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#E76F51]/30 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-[#E76F51] animate-pulse" />
                </div>
                <p className="text-white font-semibold mb-1">Listening for your voice…</p>
                {detectedNote && (
                  <p className="text-[#E9C46A] text-lg font-bold">Detected: {detectedNote}</p>
                )}
                <Progress value={listenProgress} className="h-1 mt-3 bg-white/10" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Feedback state */}
        {phase === 'feedback' && lastResult && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`border-2 mb-4 ${lastResult.correct ? 'border-[#2A9D8F] bg-[#2A9D8F]/10' : 'border-[#E76F51] bg-[#E76F51]/10'}`}>
                <CardContent className="p-6 text-center">
                  {lastResult.correct
                    ? <CheckCircle2 className="w-12 h-12 text-[#2A9D8F] mx-auto mb-2" />
                    : <XCircle className="w-12 h-12 text-[#E76F51] mx-auto mb-2" />
                  }
                  <p className={`text-xl font-bold mb-1 ${lastResult.correct ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                    {lastResult.correct ? 'Great match!' : 'Not quite'}
                  </p>
                  {lastResult.detectedMidi ? (
                    <p className="text-white/60 text-sm">
                      You sang: <span className="font-semibold text-white">{midiToNoteName(lastResult.detectedMidi)}</span>
                      {' · '}Target: <span className="font-semibold text-white">{midiToNoteName(lastResult.targetMidi)}</span>
                    </p>
                  ) : (
                    <p className="text-white/60 text-sm">No pitch detected — try singing louder</p>
                  )}
                  <Button
                    onClick={handleNext}
                    className="mt-4 w-full bg-[#3E82FC] hover:bg-[#243B73] text-white"
                  >
                    {round + 1 >= TOTAL_ROUNDS ? 'See Results' : 'Next Round →'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Mic denied warning */}
        {micAllowed === false && (
          <Card className="bg-[#E76F51]/20 border-[#E76F51] mb-4">
            <CardContent className="p-4 flex items-center gap-3">
              <MicOff className="w-5 h-5 text-[#E76F51] shrink-0" />
              <p className="text-white/80 text-sm">Microphone access denied. Please allow mic access to use Sing-Back.</p>
            </CardContent>
          </Card>
        )}

        {/* Playing state */}
        {phase === 'playing' && (
          <div className="text-center">
            <Volume2 className="w-8 h-8 text-[#E9C46A] mx-auto animate-pulse" />
            <p className="text-white/60 text-sm mt-2">Playing interval…</p>
          </div>
        )}
      </div>
    </div>
  );
}