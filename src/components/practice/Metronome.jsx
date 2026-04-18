import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Music } from 'lucide-react';
import * as Tone from 'tone';

/**
 * Metronome using Tone.js MembraneSynth.
 * Woodblock click for regular beats, accented cowbell-style for downbeat.
 * NO createOscillator. NO new AudioContext.
 */
function makeClickSynth(isDownbeat) {
  return new Tone.MembraneSynth({
    pitchDecay:  isDownbeat ? 0.015 : 0.008,
    octaves:     isDownbeat ? 5 : 2.5,
    envelope: {
      attack:  0.001,
      decay:   isDownbeat ? 0.12 : 0.07,
      sustain: 0,
      release: 0.1,
    },
  }).toDestination();
}

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm]             = useState(120);
  const [beat, setBeat]           = useState(0);
  const loopRef    = useRef(null);
  const beatRef    = useRef(0);
  const downSynth  = useRef(null);
  const clickSynth = useRef(null);

  const stop = useCallback(() => {
    if (loopRef.current) { loopRef.current.stop(); loopRef.current.dispose(); loopRef.current = null; }
    Tone.getTransport().stop();
    setIsPlaying(false);
    setBeat(0);
    beatRef.current = 0;
  }, []);

  const start = useCallback(async () => {
    await Tone.start();

    // Build synths fresh each start
    if (downSynth.current)  downSynth.current.dispose();
    if (clickSynth.current) clickSynth.current.dispose();
    downSynth.current  = makeClickSynth(true);
    clickSynth.current = makeClickSynth(false);

    beatRef.current = 0;
    Tone.getTransport().bpm.value = bpm;

    loopRef.current = new Tone.Sequence(
      (time, step) => {
        const isDown = step === 0;
        const synth  = isDown ? downSynth.current : clickSynth.current;
        const note   = isDown ? 'G2' : 'C2';
        const vel    = isDown ? 1.0 : 0.6; // downbeat +6dB equiv
        synth.triggerAttackRelease(note, '32n', time, vel);
        // Schedule UI update
        Tone.getDraw().schedule(() => {
          setBeat(step);
        }, time);
      },
      [0, 1, 2, 3],
      '4n'
    );

    loopRef.current.start(0);
    Tone.getTransport().start();
    setIsPlaying(true);
  }, [bpm]);

  const togglePlay = () => {
    if (isPlaying) { stop(); } else { start(); }
  };

  const handleBpmChange = (val) => {
    setBpm(val[0]);
    if (isPlaying) Tone.getTransport().bpm.value = val[0];
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
          onValueChange={handleBpmChange}
          min={40}
          max={220}
          step={1}
        />

        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isPlaying && beat === i
                  ? i === 0
                    ? 'bg-[#E9C46A] scale-125'
                    : 'bg-[#3E82FC] scale-110'
                  : 'bg-muted'
              }`}
            >
              <span className="text-lg font-bold">{i + 1}</span>
            </div>
          ))}
        </div>

        <Button onClick={togglePlay} className="w-full" size="lg">
          {isPlaying ? (
            <><Pause className="w-5 h-5 mr-2" />Stop</>
          ) : (
            <><Play className="w-5 h-5 mr-2" />Start</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}