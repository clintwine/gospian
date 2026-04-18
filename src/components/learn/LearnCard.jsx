/**
 * LearnCard — shown when a user encounters a brand-new item for the first time.
 * Plays the sound, shows a description, and lets the user dismiss to practice.
 */
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  playInterval as _playInterval,
  playChordMidi,
  CHORD_TYPES,
  INTERVALS,
  SCALES,
  playNote,
  noteNameToMidi,
  midiToNoteName,
  delay,
} from '@/lib/audio/audioEngine';

const INTERVAL_DESCRIPTIONS = {
  'Minor 2nd':  'Half step — very tense, dissonant (e.g. C→D♭)',
  'Major 2nd':  'Whole step — bright and open (e.g. C→D)',
  'Minor 3rd':  'Sad, melancholic feel (e.g. C→E♭)',
  'Major 3rd':  'Bright, happy feel (e.g. C→E)',
  'Perfect 4th':'Stable, strong (e.g. C→F)',
  'Tritone':    'Very tense — the devil interval (e.g. C→F#)',
  'Perfect 5th':'Open, powerful — power chords (e.g. C→G)',
  'Minor 6th':  'Somewhat dark (e.g. C→A♭)',
  'Major 6th':  'Sweet, uplifting (e.g. C→A)',
  'Minor 7th':  'Bluesy, unresolved (e.g. C→B♭)',
  'Major 7th':  'Dreamy, jazzy tension (e.g. C→B)',
  'Octave':     'Same note, doubled (e.g. C→C)',
  'Unison':     'Same pitch — identical',
};

const CHORD_DESCRIPTIONS = {
  'Major':       'Bright and happy. 1-3-5 (root + major 3rd + 5th)',
  'Minor':       'Darker, sadder. 1-b3-5 (root + minor 3rd + 5th)',
  'Diminished':  'Very tense, unstable. 1-b3-b5',
  'Augmented':   'Dreamy, unresolved. 1-3-#5',
  'Dominant7':   'Bluesy tension wanting to resolve. 1-3-5-b7',
  'Major7':      'Lush, jazzy warmth. 1-3-5-7',
  'Minor7':      'Mellow, soulful. 1-b3-5-b7',
  'Diminished7': 'Maximum tension — symmetrical. 1-b3-b5-bb7',
  'Half Diminished': 'Jazzy tension. 1-b3-b5-b7',
  'Sus2':        'Open, airy. Replaces 3rd with 2nd',
  'Sus4':        'Suspended, unresolved. Replaces 3rd with 4th',
};

const SCALE_DESCRIPTIONS = {
  'Major':      'The classic bright, happy scale (do-re-mi)',
  'Natural Minor': 'Darker, sadder feel. Relative of major',
  'Harmonic Minor': 'Minor with raised 7th — dramatic, eastern',
  'Melodic Minor': 'Minor going up, natural coming down',
  'Dorian':     'Minor-ish but with a raised 6th — jazzy, modal',
  'Phrygian':   'Dark, flamenco-like — Spanish/Arabic feel',
  'Lydian':     'Major with raised 4th — dreamy, ethereal',
  'Mixolydian': 'Major with flat 7th — rock and blues feel',
  'Locrian':    'The most unstable mode — rarely used',
  'Pentatonic Major': '5-note bright scale (no 4th or 7th)',
  'Pentatonic Minor': '5-note dark scale — blues, rock solos',
  'Blues':      'Pentatonic minor + blue note (b5)',
  'Whole Tone': 'All whole steps — dreamlike, no tension',
  'Diminished': 'Alternating half/whole steps — tense, symmetric',
};

export default function LearnCard({ item, exerciseType, rootMidi, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const rootNote = midiToNoteName(rootMidi);

  const description =
    exerciseType === 'intervals' ? INTERVAL_DESCRIPTIONS[item.name] :
    exerciseType === 'chords'    ? CHORD_DESCRIPTIONS[item.name] :
    exerciseType === 'scales'    ? SCALE_DESCRIPTIONS[item.name] :
    null;

  const playSound = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setHasPlayed(true);

    if (exerciseType === 'intervals' && item.semitones !== undefined) {
      await _playInterval(rootMidi, item.semitones, { mode: 'melodic-asc' });
    } else if (exerciseType === 'chords') {
      const chord = CHORD_TYPES.find(c => c.name === item.name);
      if (chord) {
        playChordMidi(chord.intervals.map(s => rootMidi + s), { duration: '2n', velocity: 0.75, arpeggiate: true });
      }
    } else if (exerciseType === 'scales') {
      const scale = SCALES.find(s => s.name === item.name);
      if (scale) {
        for (const s of scale.intervals) {
          playNote(rootMidi + s, { duration: '8n', velocity: 0.7 });
          await delay(350);
        }
      }
    }

    setTimeout(() => setIsPlaying(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-2 border-[#3E82FC] bg-gradient-to-br from-[#D7E5FF]/60 to-white dark:from-[#243B73]/40 dark:to-[#0A1A2F] shadow-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3E82FC] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#3E82FC] uppercase tracking-wide">New Item — Learn First</p>
              <h2 className="text-xl font-bold text-[#0A1A2F] dark:text-white">{item.name}</h2>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed bg-white/60 dark:bg-white/5 rounded-lg p-3">
              {description}
            </p>
          )}

          {/* Root note info */}
          <p className="text-xs text-muted-foreground mb-4 text-center">
            Playing from root: <span className="font-semibold text-foreground">{rootNote}</span>
          </p>

          {/* Play Button */}
          <Button
            onClick={playSound}
            disabled={isPlaying}
            className="w-full h-12 bg-[#3E82FC] hover:bg-[#243B73] text-white font-semibold mb-3 gap-2"
          >
            <Play className="w-5 h-5" />
            {isPlaying ? 'Playing…' : hasPlayed ? 'Play Again' : 'Listen to this sound'}
          </Button>

          {/* Proceed */}
          {hasPlayed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={onComplete}
                variant="outline"
                className="w-full h-11 border-[#3E82FC] text-[#3E82FC] gap-2"
              >
                Got it — let me practice it
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}