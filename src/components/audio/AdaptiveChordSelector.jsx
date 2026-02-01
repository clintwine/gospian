import { base44 } from '@/api/base44Client';

// Chord difficulty tiers
const CHORD_TIERS = {
  beginner: ['Major', 'Minor'],
  intermediate: ['Major', 'Minor', 'Diminished', 'Augmented'],
  advanced: ['Major', 'Minor', 'Diminished', 'Augmented', 'Dominant7', 'Major7', 'Minor7', 'HalfDiminished7', 'Diminished7']
};

const MASTERY_THRESHOLD = 75; // 75% accuracy to consider mastered
const MIN_ATTEMPTS_FOR_MASTERY = 5;

export class AdaptiveChordSelector {
  constructor() {
    this.recentChords = [];
    this.masteryData = [];
    this.currentTier = 'beginner';
  }

  async initialize(userEmail) {
    if (!userEmail) return;
    
    // Load mastery data from database
    this.masteryData = await base44.entities.ChordMastery.filter({ 
      created_by: userEmail 
    });
    
    // Determine current tier based on mastery
    this.currentTier = this.determineTier();
  }

  determineTier() {
    // Count mastered chords in each tier
    const beginnerMastered = this.getMasteredChords(CHORD_TIERS.beginner).length;
    const intermediateMastered = this.getMasteredChords(CHORD_TIERS.intermediate).length;
    
    // If mastered all beginner chords, move to intermediate
    if (beginnerMastered >= CHORD_TIERS.beginner.length) {
      // If mastered all intermediate, move to advanced
      if (intermediateMastered >= CHORD_TIERS.intermediate.length) {
        return 'advanced';
      }
      return 'intermediate';
    }
    return 'beginner';
  }

  getMasteredChords(chordList) {
    return chordList.filter(chordType => {
      const mastery = this.masteryData.find(m => m.chord_type === chordType);
      return mastery && 
             mastery.total_count >= MIN_ATTEMPTS_FOR_MASTERY && 
             mastery.mastery_level >= MASTERY_THRESHOLD;
    });
  }

  getStrugglingChords(chordList) {
    return chordList.filter(chordType => {
      const mastery = this.masteryData.find(m => m.chord_type === chordType);
      return mastery && 
             mastery.total_count >= 3 && 
             mastery.mastery_level < 50;
    });
  }

  getUntriedChords(chordList) {
    return chordList.filter(chordType => {
      const mastery = this.masteryData.find(m => m.chord_type === chordType);
      return !mastery || mastery.total_count === 0;
    });
  }

  selectNextChord(forceSameRoot = false, fixedRoot = null) {
    const availableChords = CHORD_TIERS[this.currentTier];
    
    // When using fixed root, prevent same chord from appearing more than twice consecutively
    let nonRecentChords;
    if (forceSameRoot && this.recentChords.length >= 2) {
      const last = this.recentChords[this.recentChords.length - 1];
      const secondLast = this.recentChords[this.recentChords.length - 2];
      
      // If last 2 chords were the same, exclude it
      if (last === secondLast) {
        nonRecentChords = availableChords.filter(chord => chord !== last);
      } else {
        nonRecentChords = availableChords.filter(chord => !this.recentChords.includes(chord));
      }
    } else {
      // Normal case: filter out recently used chords (last 3)
      nonRecentChords = availableChords.filter(chord => !this.recentChords.includes(chord));
    }
    
    const chordsToConsider = nonRecentChords.length > 0 ? nonRecentChords : availableChords;
    
    // Priority 1: Untried chords (50% chance)
    const untriedChords = this.getUntriedChords(chordsToConsider);
    if (untriedChords.length > 0 && Math.random() < 0.5) {
      return this.selectRandomChord(untriedChords, forceSameRoot, fixedRoot);
    }
    
    // Priority 2: Struggling chords (40% chance)
    const strugglingChords = this.getStrugglingChords(chordsToConsider);
    if (strugglingChords.length > 0 && Math.random() < 0.4) {
      return this.selectRandomChord(strugglingChords, forceSameRoot, fixedRoot);
    }
    
    // Priority 3: Random from available chords
    return this.selectRandomChord(chordsToConsider, forceSameRoot, fixedRoot);
  }

  selectRandomChord(chordList, forceSameRoot = false, fixedRoot = null) {
    const selectedType = chordList[Math.floor(Math.random() * chordList.length)];
    
    // Track recent chord types
    this.recentChords.push(selectedType);
    if (this.recentChords.length > 3) {
      this.recentChords.shift();
    }
    
    // Return chord type and root
    return {
      type: selectedType,
      root: fixedRoot || this.getRandomRoot()
    };
  }

  getRandomRoot() {
    const roots = ['C4', 'D4', 'E4', 'F4', 'G4'];
    return roots[Math.floor(Math.random() * roots.length)];
  }

  async recordAttempt(userEmail, chordType, isCorrect) {
    if (!userEmail) return;
    
    // Find existing mastery record
    let mastery = this.masteryData.find(m => m.chord_type === chordType);
    
    if (mastery) {
      // Update existing record
      const newCorrectCount = mastery.correct_count + (isCorrect ? 1 : 0);
      const newTotalCount = mastery.total_count + 1;
      const newMasteryLevel = Math.round((newCorrectCount / newTotalCount) * 100);
      
      await base44.entities.ChordMastery.update(mastery.id, {
        correct_count: newCorrectCount,
        total_count: newTotalCount,
        mastery_level: newMasteryLevel,
        last_attempt_date: new Date().toISOString()
      });
      
      mastery.correct_count = newCorrectCount;
      mastery.total_count = newTotalCount;
      mastery.mastery_level = newMasteryLevel;
    } else {
      // Create new record
      const newMastery = await base44.entities.ChordMastery.create({
        chord_type: chordType,
        correct_count: isCorrect ? 1 : 0,
        total_count: 1,
        mastery_level: isCorrect ? 100 : 0,
        last_attempt_date: new Date().toISOString()
      });
      
      this.masteryData.push(newMastery);
    }
    
    // Re-evaluate tier after each attempt
    this.currentTier = this.determineTier();
  }

  getCurrentTier() {
    return this.currentTier;
  }

  getAvailableChords() {
    return CHORD_TIERS[this.currentTier];
  }
}