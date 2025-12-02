import React from 'react';
import { cn } from "@/lib/utils";

// One octave pattern: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
// Black keys appear BETWEEN: C-D, D-E, F-G, G-A, A-B
// NO black keys between: E-F, B-C

// White keys in order (two octaves)
const WHITE_KEYS = [
  { note: 'C4', label: 'C', index: 0 },
  { note: 'D4', label: 'D', index: 1 },
  { note: 'E4', label: 'E', index: 2 },
  { note: 'F4', label: 'F', index: 3 },
  { note: 'G4', label: 'G', index: 4 },
  { note: 'A4', label: 'A', index: 5 },
  { note: 'B4', label: 'B', index: 6 },
  { note: 'C5', label: 'C', index: 7 },
  { note: 'D5', label: 'D', index: 8 },
  { note: 'E5', label: 'E', index: 9 },
  { note: 'F5', label: 'F', index: 10 },
  { note: 'G5', label: 'G', index: 11 },
  { note: 'A5', label: 'A', index: 12 },
  { note: 'B5', label: 'B', index: 13 },
];

// Black keys positioned between white keys
// afterWhiteIndex means the black key sits between that white key and the next
const BLACK_KEYS = [
  { note: 'C#4', label: 'C#', afterWhiteIndex: 0 }, // between C4 and D4
  { note: 'D#4', label: 'D#', afterWhiteIndex: 1 }, // between D4 and E4
  // NO black key between E4-F4 (index 2)
  { note: 'F#4', label: 'F#', afterWhiteIndex: 3 }, // between F4 and G4
  { note: 'G#4', label: 'G#', afterWhiteIndex: 4 }, // between G4 and A4
  { note: 'A#4', label: 'A#', afterWhiteIndex: 5 }, // between A4 and B4
  // NO black key between B4-C5 (index 6)
  { note: 'C#5', label: 'C#', afterWhiteIndex: 7 }, // between C5 and D5
  { note: 'D#5', label: 'D#', afterWhiteIndex: 8 }, // between D5 and E5
  // NO black key between E5-F5 (index 9)
  { note: 'F#5', label: 'F#', afterWhiteIndex: 10 }, // between F5 and G5
  { note: 'G#5', label: 'G#', afterWhiteIndex: 11 }, // between G5 and A5
  { note: 'A#5', label: 'A#', afterWhiteIndex: 12 }, // between A5 and B5
];

// Map base note + semitones to actual note
const getNoteFromInterval = (baseNote, semitones) => {
  const allNotes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 
                    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'];
  const baseIndex = allNotes.indexOf(baseNote);
  if (baseIndex === -1) return null;
  return allNotes[baseIndex + semitones] || null;
};

export default function PianoKeyboard({ 
  baseNote, 
  semitones, 
  scaleNotes = [],
  showSecondNote = false,
  highlightFirst = false,
  highlightSecond = false,
  highlightScaleNoteIndex,
  isAnimating = false
}) {
  const secondNote = baseNote && semitones !== undefined ? getNoteFromInterval(baseNote, semitones) : null;
  
  // Responsive key widths - smaller on mobile
  const whiteKeyWidth = 20; // smaller for mobile
  const blackKeyWidth = 12;

  return (
    <div className="relative flex justify-center my-4 overflow-x-auto">
      <div className="relative flex">
        {/* White keys */}
        {WHITE_KEYS.map((key) => {
          const isFirstNote = key.note === baseNote;
          const isSecondNote = showSecondNote && key.note === secondNote;
          const isScaleNote = scaleNotes.includes(key.note);
          const scaleNoteIdx = scaleNotes.indexOf(key.note);
          const isCurrentScaleHighlight = isAnimating && highlightScaleNoteIndex !== undefined && scaleNoteIdx === highlightScaleNoteIndex;
          const isFirstHighlighted = isAnimating && highlightFirst && isFirstNote;
          const isSecondHighlighted = isAnimating && highlightSecond && isSecondNote;
          
          const isHighlighted = isFirstHighlighted || isSecondHighlighted || isCurrentScaleHighlight;
          const isActive = isFirstNote || isSecondNote || isScaleNote;
          
          return (
            <div
              key={key.note}
              className={cn(
                "relative w-5 h-16 sm:w-6 sm:h-20 border border-gray-300 rounded-b-md transition-all duration-200",
                isHighlighted
                  ? "bg-[#3E82FC] border-[#243B73] shadow-xl z-10 scale-105"
                  : isFirstNote 
                    ? "bg-[#3E82FC] border-[#243B73] shadow-lg z-10" 
                    : isSecondNote 
                      ? "bg-[#2A9D8F] border-[#1a6b61] shadow-lg z-10"
                      : isScaleNote
                        ? "bg-[#E9C46A] border-[#d4a84a] shadow-lg z-10"
                        : "bg-white"
              )}
            >
              {isActive && (
                <div className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold",
                  isScaleNote && !isFirstNote ? "text-[#0A1A2F]" : "text-white",
                  isHighlighted ? "animate-bounce" : "animate-pulse"
                )}>
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
          const isScaleNote = scaleNotes.includes(key.note);
          const scaleNoteIdx = scaleNotes.indexOf(key.note);
          const isCurrentScaleHighlight = isAnimating && highlightScaleNoteIndex !== undefined && scaleNoteIdx === highlightScaleNoteIndex;
          const isFirstHighlighted = isAnimating && highlightFirst && isFirstNote;
          const isSecondHighlighted = isAnimating && highlightSecond && isSecondNote;
          
          const isHighlighted = isFirstHighlighted || isSecondHighlighted || isCurrentScaleHighlight;
          const isActive = isFirstNote || isSecondNote || isScaleNote;
          
          // Position black key at the boundary between two white keys
          const leftPos = (key.afterWhiteIndex + 1) * whiteKeyWidth - (blackKeyWidth / 2);
          
          return (
            <div
              key={key.note}
              className={cn(
                "absolute top-0 w-3 h-9 sm:w-4 sm:h-12 rounded-b-md z-20 transition-all duration-200",
                isHighlighted
                  ? "bg-[#243B73] shadow-xl scale-105"
                  : isFirstNote 
                    ? "bg-[#243B73] shadow-lg" 
                    : isSecondNote 
                      ? "bg-[#1a6b61] shadow-lg"
                      : isScaleNote
                        ? "bg-[#E9C46A] shadow-lg"
                        : "bg-gray-900"
              )}
              style={{ left: `${leftPos}px` }}
            >
              {isActive && (
                <div className={cn(
                  "absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white",
                  isHighlighted ? "animate-bounce" : "animate-pulse"
                )}>
                  {key.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      {(baseNote || scaleNotes.length > 0) && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4 text-xs">
          {baseNote && scaleNotes.length === 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#3E82FC]"></div>
              <span className="text-muted-foreground">1st Note</span>
            </div>
          )}
          {showSecondNote && secondNote && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#2A9D8F]"></div>
              <span className="text-muted-foreground">2nd Note</span>
            </div>
          )}
          {scaleNotes.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#E9C46A]"></div>
              <span className="text-muted-foreground">Scale Notes</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}