/**
 * Gospel Progression Recognition Exercise
 * - Plays realistic gospel voicings (shell: root+3+7)
 * - Identifies common gospel progressions by ear
 * - Includes "Play in context" cadence + drone
 * - SM-2 weighted question selection
 * - Space/1–9/Enter keyboard shortcuts
 * - Replay, Slow, Loop controls
 * - Instrument picker
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Music2, CheckCircle2, XCircle, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GOSPEL_PROGRESSIONS, CHORD_TYPES, ALL_KEYS_MIDI, FLAT_KEYS_MIDI,
  buildGospelVoicing, playCadence, playProgression, playDrone, stopDrone,
  midiToNoteName, weightedPick, delay
} from '@/lib/audio/audioEngine';
import { useItemMastery } from '@/lib/audio/useItemMastery';
import { useAudio } from '@/lib/audio/AudioProvider';

const DEGREE_OFFSETS = { 1:0, 2:2, 3:4, 4:5, 5:7, 6:9, 7:10 }; // major scale
const DOM7 = [0,4,7,10];
const MAJ7 = [0,4,7,11];
const MIN7 = [0,3,7,10];

function degreeChord(rootMidi, degree) {
  const offset = DEGREE_OFFSETS[degree] || 0;
  const note   = rootMidi + offset;
  // Use dominant 7ths for gospel feel
  return buildGospelVoicing(note, degree === 1 ? MAJ7 : degree === 4 ? MAJ7 : DOM7);
}

function buildProgressionChords(progDef, keyMidi) {
  if (progDef.name === 'Backdoor 2-5') {
    // bVII7 → I
    return [buildGospelVoicing(keyMidi+10, DOM7), buildGospelVoicing(keyMidi, MAJ7)];
  }
  if (progDef.name === 'Tritone Sub 2-5') {
    return [buildGospelVoicing(keyMidi+6, DOM7), buildGospelVoicing(keyMidi+7, DOM7), buildGospelVoicing(keyMidi, MAJ7)];
  }
  if (progDef.name === 'Chromatic Walk-up') {
    return [
      buildGospelVoicing(keyMidi,   MAJ7),
      buildGospelVoicing(keyMidi+1, [0,3,6,9]),  // #I dim7
      buildGospelVoicing(keyMidi+2, MIN7),
      buildGospelVoicing(keyMidi+5, MAJ7),
    ];
  }
  return progDef.degrees.map(d => degreeChord(keyMidi, d));
}

const INSTRUMENT_LABELS = { piano:'Grand Piano', rhodes:'Rhodes', organ:'Organ', upright:'Upright' };

export default function GospelProgressions() {
  const { ready, instrument, switchInstrument } = useAudio();
  const { recordAttempt, getWeight } = useItemMastery();

  const [keyMidi, setKeyMidi]           = useState(60); // C4
  const [keyFilter, setKeyFilter]       = useState('all');
  const [playInContext, setPlayInContext]= useState(true);
  const [question, setQuestion]         = useState(null);
  const [options, setOptions]           = useState([]);
  const [selected, setSelected]         = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect]       = useState(false);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [hasPlayed, setHasPlayed]       = useState(false);
  const [looping, setLooping]           = useState(false);
  const loopRef = useRef(false);

  const getKeyPool = () => {
    if (keyFilter === 'flat')  return FLAT_KEYS_MIDI;
    if (keyFilter === 'sharp') return [67,62,69,64,71,66];
    return ALL_KEYS_MIDI;
  };

  const generateQuestion = useCallback(() => {
    const pool = getKeyPool();
    const newKey = pool[Math.floor(Math.random() * pool.length)];
    setKeyMidi(newKey);

    const correct = weightedPick(
      GOSPEL_PROGRESSIONS,
      p => getWeight('progressions', p.name)
    );
    const wrongs = GOSPEL_PROGRESSIONS.filter(p => p.name !== correct.name)
      .sort(() => Math.random()-0.5).slice(0,3);
    setQuestion(correct);
    setOptions([correct, ...wrongs].sort(() => Math.random()-0.5));
    setSelected(null);
    setShowFeedback(false);
    setHasPlayed(false);
  }, [keyFilter]);

  useEffect(() => { generateQuestion(); }, [generateQuestion]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space') { e.preventDefault(); handlePlay(); }
      if (e.code === 'Enter' && showFeedback) { generateQuestion(); }
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= options.length && !showFeedback && hasPlayed) {
        handleAnswer(options[num - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showFeedback, hasPlayed, options, question]);

  const playQuestion = useCallback(async (speed = 1) => {
    if (!question || !ready) return;
    setIsPlaying(true);
    setHasPlayed(true);
    stopDrone();

    if (playInContext) {
      await playCadence(keyMidi - 12, 0.45); // one octave lower, soft
      await delay(300);
      playDrone(keyMidi - 12, { gain: 0.12 });
      await delay(200);
    }

    const chords = buildProgressionChords(question, keyMidi);
    await playProgression(chords, { bpm: Math.round(72 * speed), velocity: 0.78 });

    stopDrone();
    setIsPlaying(false);

    if (loopRef.current) {
      await delay(600);
      playQuestion(speed);
    }
  }, [question, keyMidi, playInContext, ready]);

  const handlePlay = () => {
    if (isPlaying) return;
    playQuestion(1);
  };

  const handleSlow = () => {
    if (isPlaying) return;
    playQuestion(0.5);
  };

  const toggleLoop = () => {
    const next = !looping;
    setLooping(next);
    loopRef.current = next;
    if (next && !isPlaying) playQuestion(1);
  };

  const handleAnswer = (prog) => {
    if (showFeedback || !hasPlayed) return;
    loopRef.current = false;
    setLooping(false);
    stopDrone();
    setSelected(prog.name);
    const correct = prog.name === question.name;
    setIsCorrect(correct);
    setShowFeedback(true);
    recordAttempt('progressions', question.name, correct);
  };

  const keyName = midiToNoteName(keyMidi).replace(/\d/, '');

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-[#0A1A2F] dark:text-white flex items-center gap-2">
          <Music2 className="w-6 h-6 text-[#3E82FC]" />
          Gospel Progressions
        </h1>
        <Badge className="bg-[#E9C46A]/20 text-[#0A1A2F] dark:text-white">Key of {keyName}</Badge>
      </div>

      {/* Controls */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Key filter:</Label>
            <Select value={keyFilter} onValueChange={setKeyFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All keys</SelectItem>
                <SelectItem value="flat">Flat keys</SelectItem>
                <SelectItem value="sharp">Sharp keys</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Instrument:</Label>
            <Select value={instrument} onValueChange={switchInstrument}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(INSTRUMENT_LABELS).map(([k,v])=>(
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={playInContext} onCheckedChange={setPlayInContext} id="ctx-tog" />
            <Label htmlFor="ctx-tog" className="text-sm cursor-pointer">Play in context</Label>
          </div>
        </CardContent>
      </Card>

      {/* Player */}
      <Card className="bg-gradient-to-br from-[#0A1A2F] to-[#243B73] border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-white font-semibold text-center mb-4">
            {hasPlayed ? 'Which progression did you hear?' : 'Press Play to start'}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Button onClick={handlePlay} disabled={isPlaying}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/40 gap-2">
              <Play className="w-4 h-4" /> Play
            </Button>
            <Button onClick={() => { if(!isPlaying) playQuestion(1); }} disabled={isPlaying}
              variant="ghost" className="text-white/80 hover:text-white gap-2">
              <RotateCcw className="w-4 h-4" /> Replay
            </Button>
            <Button onClick={handleSlow} disabled={isPlaying}
              variant="ghost" className="text-white/80 hover:text-white gap-2">
              🐢 Slow
            </Button>
            <Button onClick={toggleLoop}
              className={`gap-2 ${looping ? 'bg-[#E9C46A]/30 text-[#E9C46A]' : 'text-white/80'} hover:text-white`}
              variant="ghost">
              <Repeat className="w-4 h-4" /> Loop
            </Button>
          </div>
          <p className="text-white/40 text-xs text-center mt-3">Space = play · 1–4 = select · Enter = next</p>
        </CardContent>
      </Card>

      {/* Options */}
      {hasPlayed && (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {options.map((prog, idx) => {
              const isSelected  = selected === prog.name;
              const isCorrectAns= showFeedback && prog.name === question.name;
              const isWrong     = showFeedback && isSelected && !isCorrect;
              return (
                <motion.div key={prog.name} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: idx * 0.07 }}>
                  <Button variant="outline" onClick={() => handleAnswer(prog)}
                    disabled={showFeedback}
                    className={`w-full h-auto py-3 text-sm font-medium text-left transition-all ${
                      isCorrectAns ? 'bg-[#2A9D8F] border-[#2A9D8F] text-white' :
                      isWrong      ? 'bg-[#E76F51] border-[#E76F51] text-white' :
                      isSelected   ? 'bg-[#3E82FC] border-[#3E82FC] text-white' :
                      'hover:border-[#3E82FC]'
                    }`}>
                    <span className="mr-2 opacity-50">{idx+1}.</span>
                    {prog.name}
                    {isCorrectAns && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                    {isWrong      && <XCircle      className="w-4 h-4 ml-auto" />}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback + Next */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <Card className={`border-2 ${isCorrect ? 'border-[#2A9D8F] bg-[#2A9D8F]/10' : 'border-[#E76F51] bg-[#E76F51]/10'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCorrect ? <CheckCircle2 className="text-[#2A9D8F] w-5 h-5" /> : <XCircle className="text-[#E76F51] w-5 h-5" />}
                  <div>
                    <p className={`font-semibold ${isCorrect ? 'text-[#2A9D8F]' : 'text-[#E76F51]'}`}>
                      {isCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    {!isCorrect && <p className="text-sm text-muted-foreground">Answer: {question.name}</p>}
                  </div>
                </div>
                <Button onClick={generateQuestion} className="bg-[#3E82FC] text-white">Next →</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}