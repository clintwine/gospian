/**
 * Drone Mode — tonic drone plays continuously at adjustable volume.
 * User picks key, practices anything over it.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX, Music } from 'lucide-react';
import { playDrone, stopDrone, midiToNoteName, ALL_ROOTS_MIDI } from '@/lib/audio/audioEngine';
import { useAudio } from '@/lib/audio/AudioProvider';

const KEY_NAMES = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];
const MIDI_4TH_OCTAVE = { C:60,'C#':61,Db:61,D:62,'D#':63,Eb:63,E:64,F:65,'F#':66,Gb:66,G:67,'G#':68,Ab:68,A:69,'A#':70,Bb:70,B:71 };

export default function DroneMode() {
  const { ready } = useAudio();
  const [key, setKey]       = useState('C');
  const [gain, setGain]     = useState(0.28);
  const [playing, setPlaying] = useState(false);

  const startDrone = () => {
    const midi = MIDI_4TH_OCTAVE[key] - 12; // one octave lower for warmth
    playDrone(midi, { gain });
    setPlaying(true);
  };

  const stop = () => {
    stopDrone();
    setPlaying(false);
  };

  // Restart drone when key changes
  useEffect(() => {
    if (playing) {
      stopDrone();
      const midi = MIDI_4TH_OCTAVE[key] - 12;
      playDrone(midi, { gain });
    }
  }, [key]);

  // Cleanup on unmount
  useEffect(() => () => stopDrone(), []);

  return (
    <div className="w-full max-w-lg mx-auto px-3 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Music className="w-6 h-6 text-[#3E82FC]" />
        <h1 className="text-2xl font-bold text-[#0A1A2F] dark:text-white">Drone Mode</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Pick a key and practice over a sustained tonic drone. Great for improvisation and ear training.
      </p>

      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle className="text-base">Select Key</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-6 gap-2">
            {KEY_NAMES.map(k => (
              <Button key={k} variant={key === k ? 'default' : 'outline'}
                onClick={() => setKey(k)}
                className={`h-10 text-sm font-medium ${key === k ? 'bg-[#243B73] text-white' : ''}`}>
                {k}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Volume: {Math.round(gain * 100)}%
            </Label>
            <Slider
              value={[Math.round(gain * 100)]}
              onValueChange={([v]) => {
                const newGain = v / 100;
                setGain(newGain);
              }}
              min={5} max={80} step={1}
            />
          </div>

          <Button
            onClick={playing ? stop : startDrone}
            disabled={!ready}
            size="lg"
            className={`w-full ${playing ? 'bg-[#E76F51] hover:bg-[#E76F51]/90' : 'bg-[#243B73] hover:bg-[#3E82FC]'} text-white`}>
            {playing ? (
              <><VolumeX className="w-5 h-5 mr-2" /> Stop Drone</>
            ) : (
              <><Volume2 className="w-5 h-5 mr-2" /> Start Drone — {key}</>
            )}
          </Button>

          {playing && (
            <div className="flex items-center justify-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-[#3E82FC] rounded-full" />
              <span className="text-sm text-muted-foreground">Drone active on {key}</span>
              <div className="w-2 h-2 bg-[#3E82FC] rounded-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}