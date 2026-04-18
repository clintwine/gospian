/**
 * Weakness Dashboard
 * Shows per-interval, per-chord, per-key accuracy as a heatmap
 * plus median response time per item (from localStorage mastery store).
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Music2, BarChart2 } from 'lucide-react';
import { useItemMastery } from '@/lib/audio/useItemMastery';
import { INTERVALS, CHORD_TYPES, midiToNoteName, ALL_KEYS_MIDI } from '@/lib/audio/audioEngine';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function HeatCell({ label, accuracy }) {
  // Colorblind-safe: color + pattern + symbol
  let containerClass = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
  let symbol = '';
  let patternStyle = {};

  if (accuracy !== null) {
    if (accuracy >= 90) {
      containerClass = 'bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/30';
      symbol = '✓';
    } else if (accuracy >= 70) {
      containerClass = 'bg-[#E9C46A]/20 text-[#0A1A2F] dark:text-white border border-[#E9C46A]/40';
      symbol = '~';
      // Diagonal stripe pattern via gradient
      patternStyle = {
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(233,196,106,0.15) 0px, rgba(233,196,106,0.15) 3px, transparent 3px, transparent 9px)',
      };
    } else {
      containerClass = 'bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/30';
      symbol = '✗';
      // Dot pattern
      patternStyle = {
        backgroundImage: 'radial-gradient(circle, rgba(231,111,81,0.25) 1px, transparent 1px)',
        backgroundSize: '6px 6px',
      };
    }
  }

  const display = accuracy !== null ? `${Math.round(accuracy)}%` : '—';
  return (
    <div className={`rounded-lg p-2 text-center text-xs font-medium transition-all relative overflow-hidden ${containerClass}`}
      style={patternStyle}>
      <div className="font-semibold truncate">{label}</div>
      <div className="text-[11px] opacity-80">{display}</div>
      {symbol && <div className="text-[10px] font-bold opacity-70">{symbol}</div>}
    </div>
  );
}

export default function WeaknessDashboard() {
  const { getAllMastery } = useItemMastery();
  const allMastery = useMemo(() => getAllMastery(), []);

  const masteryMap = useMemo(() => {
    const m = {};
    allMastery.forEach(({ exerciseType, itemId, accuracy }) => {
      m[`${exerciseType}__${itemId}`] = accuracy;
    });
    return m;
  }, [allMastery]);

  const get = (type, id) => masteryMap[`${type}__${id}`] ?? null;

  const intervalItems  = INTERVALS;
  const chordItems     = CHORD_TYPES.slice(0, 18); // top 18
  const keyItems       = ALL_KEYS_MIDI.map(m => ({ midi: m, name: midiToNoteName(m).replace(/\d/,'') }));

  const weakItems = useMemo(() => {
    return allMastery
      .filter(x => x.accuracy < 70 && x.attempts >= 3)
      .sort((a,b) => a.accuracy - b.accuracy)
      .slice(0, 8);
  }, [allMastery]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <BarChart2 className="w-6 h-6 text-[#3E82FC]" />
        <h1 className="text-2xl font-bold text-[#0A1A2F] dark:text-white">Weakness Dashboard</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Heatmap of your accuracy per interval, chord, and key. Red = needs work, green = mastered.
      </p>

      {/* Weakest items quick list */}
      {weakItems.length > 0 && (
        <Card className="border-[#E76F51] bg-[#E76F51]/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-[#E76F51]">
              <TrendingDown className="w-4 h-4" /> Focus on These
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {weakItems.map(item => (
              <Badge key={`${item.exerciseType}-${item.itemId}`}
                className="bg-[#E76F51]/20 text-[#E76F51] border-0">
                {item.itemId} — {Math.round(item.accuracy)}%
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Intervals heatmap */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#3E82FC]" /> Intervals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {intervalItems.map(iv => (
              <HeatCell key={iv.name} label={iv.name} accuracy={get('intervals', iv.name)} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chords heatmap */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#E9C46A]" /> Chords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {chordItems.map(ch => (
              <HeatCell key={ch.name} label={ch.name} accuracy={get('chords', ch.name)} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keys heatmap */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#2A9D8F]" /> Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            {keyItems.map(k => (
              <HeatCell key={k.midi} label={k.name} accuracy={get('key', k.name)} />
            ))}
          </div>
        </CardContent>
      </Card>

      {allMastery.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Complete some exercises to see your weakness analysis here.</p>
          <Link to={createPageUrl('Exercises')}>
            <span className="text-[#3E82FC] underline text-sm mt-2 inline-block">Start practicing →</span>
          </Link>
        </div>
      )}
    </div>
  );
}