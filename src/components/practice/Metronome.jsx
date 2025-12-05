import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Music } from 'lucide-react';

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [beat, setBeat] = useState(0);
  const audioContextRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const timerIdRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClick = (time, isDownbeat = false) => {
    const audioContext = audioContextRef.current;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = isDownbeat ? 1000 : 800;
    gain.gain.value = 0.3;

    osc.start(time);
    osc.stop(time + 0.05);
  };

  const scheduleNote = () => {
    const audioContext = audioContextRef.current;
    const secondsPerBeat = 60.0 / bpm;

    while (nextNoteTimeRef.current < audioContext.currentTime + 0.1) {
      playClick(nextNoteTimeRef.current, beat % 4 === 0);
      nextNoteTimeRef.current += secondsPerBeat;
      setBeat((prev) => (prev + 1) % 4);
    }

    timerIdRef.current = setTimeout(scheduleNote, 25);
  };

  const start = () => {
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    nextNoteTimeRef.current = audioContextRef.current.currentTime;
    scheduleNote();
    setIsPlaying(true);
  };

  const stop = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
    }
    setIsPlaying(false);
    setBeat(0);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Metronome
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{bpm}</div>
          <p className="text-sm text-muted-foreground">BPM</p>
        </div>

        <Slider
          value={[bpm]}
          onValueChange={(val) => setBpm(val[0])}
          min={40}
          max={220}
          step={1}
          disabled={isPlaying}
        />

        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isPlaying && beat % 4 === i
                  ? 'bg-[#3E82FC] scale-110'
                  : 'bg-muted'
              }`}
            >
              <span className="text-lg font-bold">{i + 1}</span>
            </div>
          ))}
        </div>

        <Button onClick={togglePlay} className="w-full" size="lg">
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}