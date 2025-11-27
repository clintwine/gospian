import React from 'react';
import { cn } from "@/lib/utils";

// White keys in order
const WHITE_KEYS = [
  { note: 'C4', label: 'C' },
  { note: 'D4', label: 'D' },
  { note: 'E4', label: 'E' },
  { note: 'F4', label: 'F' },
  { note: 'G4', label: 'G' },
  { note: 'A4', label: 'A' },
  { note: 'B4', label: 'B' },
  { note: 'C5', label: 'C' },
  { note: 'D5', label: 'D' },
  { note: 'E5', label: 'E' },
  { note: 'F5', label: 'F' },
  { note: 'G5', label: 'G' },
];

// Black keys with their position (which white key they're after)
const BLACK_KEYS = [
  { note: 'C#4', label: 'C#', afterWhiteIndex: 0 },
  { note: 'D#4', label: 'D#', afterWhiteIndex: 1 },
  // No black key after E (index 2)
  { note: 'F#4', label: 'F#', afterWhiteIndex: 3 },
  { note: 'G#4', label: 'G#', afterWhiteIndex: 4 },
  { note: 'A#4', label: 'A#', afterWhiteIndex: 5 },
  // No black key after B (index 6)
  { note: 'C#5', label: 'C#', afterWhiteIndex: 7 },
  { note: 'D#5', label: 'D#', afterWhiteIndex: 8 },
  // No black key after E5 (index 9)
  { note: 'F#5', label: 'F#', afterWhiteIndex: 10 },
  { note: 'G#5', label: 'G#', afterWhiteIndex: 11 },
];

// Map base note + semitones to actual note
const getNoteFromInterval = (baseNote, semitones) => {
  const allNotes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 
                    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'];
  const baseIndex = allNotes.indexOf(baseNote);
  if (baseIndex === -1) return null;
  return allNotes[baseIndex + semitones] || null;
};

export default function PianoKeyboard({ baseNote, semitones, showSecondNote = false }) {
  const secondNote = baseNote && semitones !== undefined ? getNoteFromInterval(baseNote, semitones) : null;
  
  const whiteKeyWidth = 36; // px for mobile
  const whiteKeyWidthSm = 44; // px for larger screens

  return (
    <div className="relative flex justify-center my-4">
      <div className="relative flex">
        {/* White keys */}
        {WHITE_KEYS.map((key, index) => {
          const isFirstNote = key.note === baseNote;
          const isSecondNote = showSecondNote && key.note === secondNote;
          
          return (
            <div
              key={key.note}
              className={cn(
                "relative w-9 sm:w-11 h-28 sm:h-36 border border-gray-300 rounded-b-md transition-all duration-300",
                isFirstNote 
                  ? "bg-[#3E82FC] border-[#243B73] shadow-lg z-10" 
                  : isSecondNote 
                    ? "bg-[#2A9D8F] border-[#1a6b61] shadow-lg z-10"
                    : "bg-white"
              )}
            >
              {(isFirstNote || isSecondNote) && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-white animate-pulse">
                  {key.label}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Black keys */}
        {BLACK_KEYS.map((key) => {
          const isFirstNote = key.note === baseNote;
          const isSecondNote = showSecondNote && key.note === secondNote;
          
          // Position: right edge of the white key it's after, minus half black key width
          const leftPosition = (key.afterWhiteIndex + 1) * 36 - 10; // 36px = w-9, 10px = half of black key
          
          return (
            <div
              key={key.note}
              style={{ 
                left: `${leftPosition}px`,
              }}
              className={cn(
                "absolute top-0 w-5 sm:w-6 h-16 sm:h-20 rounded-b-md z-20 transition-all duration-300",
                "sm:left-[calc(var(--idx)*2.75rem+2.75rem-0.75rem)]",
                isFirstNote 
                  ? "bg-[#243B73] shadow-lg" 
                  : isSecondNote 
                    ? "bg-[#1a6b61] shadow-lg"
                    : "bg-gray-900"
              )}
              style={{ left: `calc(${key.afterWhiteIndex + 1} * 2.25rem - 0.625rem)` }}
            >
              {(isFirstNote || isSecondNote) && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white animate-pulse">
                  {key.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      {baseNote && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#3E82FC]"></div>
            <span className="text-muted-foreground">1st Note</span>
          </div>
          {showSecondNote && secondNote && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#2A9D8F]"></div>
              <span className="text-muted-foreground">2nd Note</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}