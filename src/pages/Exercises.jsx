import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import ExerciseCard from '@/components/dashboard/ExerciseCard';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Headphones, Waves, Filter } from 'lucide-react';

const EXERCISES = [
  {
    type: 'intervals',
    title: 'Interval Recognition - Beginner',
    description: 'Learn to identify basic intervals: unison, 2nds, 3rds, 4ths, 5ths, and octaves',
    difficulty: 'beginner',
    xpReward: 10,
    category: 'intervals',
  },
  {
    type: 'intervals',
    title: 'Interval Recognition - Intermediate',
    description: 'Add minor 2nds and minor 3rds to your interval vocabulary',
    difficulty: 'intermediate',
    xpReward: 15,
    category: 'intervals',
  },
  {
    type: 'intervals',
    title: 'Interval Recognition - Advanced',
    description: 'Master all 12 chromatic intervals including tritones and 7ths',
    difficulty: 'advanced',
    xpReward: 20,
    category: 'intervals',
  },
  {
    type: 'chords',
    title: 'Chord Quality - Beginner',
    description: 'Identify major and minor chord qualities',
    difficulty: 'beginner',
    xpReward: 10,
    category: 'chords',
  },
  {
    type: 'chords',
    title: 'Chord Quality - Intermediate',
    description: 'Add diminished and augmented chords to your repertoire',
    difficulty: 'intermediate',
    xpReward: 15,
    category: 'chords',
  },
  {
    type: 'scales',
    title: 'Major vs Minor Scales',
    description: 'Distinguish between major and minor scale patterns',
    difficulty: 'beginner',
    xpReward: 10,
    category: 'scales',
  },
  {
    type: 'scales',
    title: 'Modal Scales',
    description: 'Identify Dorian, Mixolydian, and other modes',
    difficulty: 'advanced',
    xpReward: 20,
    category: 'scales',
  },
];

export default function Exercises() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  React.useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = createPageUrl('Home');
    }
  }, [user, userLoading]);

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ created_by: user.email });
      return stats[0] || { level: 1 };
    },
    enabled: !!user?.email,
  });

  const { data: exerciseResults } = useQuery({
    queryKey: ['exerciseResults', user?.email],
    queryFn: async () => {
      return await base44.entities.ExerciseResult.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  if (userLoading || !user) return null;

  const getExerciseProgress = (type, difficulty) => {
    const results = exerciseResults?.filter(
      r => r.exercise_type === type && r.difficulty === difficulty
    ) || [];
    if (results.length === 0) return 0;
    const avgAccuracy = results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / results.length;
    return Math.round(avgAccuracy);
  };

  const filteredExercises = EXERCISES.filter(exercise => {
    const categoryMatch = categoryFilter === 'all' || exercise.category === categoryFilter;
    const difficultyMatch = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    return categoryMatch && difficultyMatch;
  });

  const userLevel = userStats?.level || 1;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-1 sm:mb-2">
          Exercises
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Practice and improve your ear training skills
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full sm:w-auto overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex bg-[#D7E5FF]/50 dark:bg-slate-800 min-w-max">
            <TabsTrigger value="all" className="text-[10px] sm:text-xs md:text-sm px-2 sm:px-3">All</TabsTrigger>
            <TabsTrigger value="intervals" className="text-[10px] sm:text-xs md:text-sm flex items-center gap-1 px-2 sm:px-3">
              <Music className="w-3 h-3 hidden sm:block" />
              Intervals
            </TabsTrigger>
            <TabsTrigger value="chords" className="text-[10px] sm:text-xs md:text-sm flex items-center gap-1 px-2 sm:px-3">
              <Headphones className="w-3 h-3 hidden sm:block" />
              Chords
            </TabsTrigger>
            <TabsTrigger value="scales" className="text-[10px] sm:text-xs md:text-sm flex items-center gap-1 px-2 sm:px-3">
              <Waves className="w-3 h-3 hidden sm:block" />
              Scales
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredExercises.map((exercise, index) => {
          const isLocked = 
            (exercise.difficulty === 'intermediate' && userLevel < 3) ||
            (exercise.difficulty === 'advanced' && userLevel < 6) ||
            (exercise.category === 'scales' && userLevel < 2);

          return (
            <ExerciseCard
              key={index}
              type={exercise.type}
              title={exercise.title}
              description={exercise.description}
              difficulty={exercise.difficulty}
              progress={getExerciseProgress(exercise.type, exercise.difficulty)}
              xpReward={exercise.xpReward}
              locked={isLocked}
            />
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No exercises match your filters</p>
        </div>
      )}
    </div>
  );
}