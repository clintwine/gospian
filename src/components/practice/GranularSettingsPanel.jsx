import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { INTERVALS, SCALES, CHORD_TYPES } from '@/lib/audio/audioEngine';

export default function GranularSettingsPanel({ 
  exerciseType, 
  enabledIntervals = [],
  enabledScales = [],
  enabledChords = [],
  onToggleInterval,
  onToggleScale,
  onToggleChord
}) {
  const allIntervals = INTERVALS.map(i => i.name);
  const allScales = SCALES.map(s => s.name);
  const allChords = CHORD_TYPES.map(c => c.name);

  const toggleAll = (items, toggleFn, enable) => {
    if (enable) {
      toggleFn(items, true);
    } else {
      toggleFn([], false);
    }
  };

  if (exerciseType === 'intervals') {
    const allEnabled = allIntervals.every(i => enabledIntervals.includes(i));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Select Intervals</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleInterval(allIntervals, true)}
              className="text-xs text-[#3E82FC] hover:underline"
            >
              All
            </button>
            <span className="text-xs text-muted-foreground">|</span>
            <button
              onClick={() => onToggleInterval([], false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              None
            </button>
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {allIntervals.map((interval) => (
              <div key={interval} className="flex items-center space-x-2">
                <Checkbox
                  id={interval}
                  checked={enabledIntervals.includes(interval)}
                  onCheckedChange={(checked) => onToggleInterval(interval, checked)}
                />
                <label
                  htmlFor={interval}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {interval}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          {enabledIntervals.length} of {allIntervals.length} selected
        </p>
      </div>
    );
  }

  if (exerciseType === 'scales') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Select Scales</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleScale(allScales, true)}
              className="text-xs text-[#3E82FC] hover:underline"
            >
              All
            </button>
            <span className="text-xs text-muted-foreground">|</span>
            <button
              onClick={() => onToggleScale([], false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              None
            </button>
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {allScales.map((scale) => (
              <div key={scale} className="flex items-center space-x-2">
                <Checkbox
                  id={scale}
                  checked={enabledScales.includes(scale)}
                  onCheckedChange={(checked) => onToggleScale(scale, checked)}
                />
                <label
                  htmlFor={scale}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {scale}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          {enabledScales.length} of {allScales.length} selected
        </p>
      </div>
    );
  }

  if (exerciseType === 'chords') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Select Chord Types</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleChord(allChords, true)}
              className="text-xs text-[#3E82FC] hover:underline"
            >
              All
            </button>
            <span className="text-xs text-muted-foreground">|</span>
            <button
              onClick={() => onToggleChord([], false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              None
            </button>
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {allChords.map((chord) => (
              <div key={chord} className="flex items-center space-x-2">
                <Checkbox
                  id={chord}
                  checked={enabledChords.includes(chord)}
                  onCheckedChange={(checked) => onToggleChord(chord, checked)}
                />
                <label
                  htmlFor={chord}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {chord}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          {enabledChords.length} of {allChords.length} selected
        </p>
      </div>
    );
  }

  return null;
}