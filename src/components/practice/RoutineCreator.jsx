import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Save } from 'lucide-react';
import { toast } from "sonner";

export default function RoutineCreator({ onClose }) {
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState([]);
  const queryClient = useQueryClient();

  const createRoutineMutation = useMutation({
    mutationFn: (routineData) => base44.entities.PracticeRoutine.create(routineData),
    onSuccess: () => {
      queryClient.invalidateQueries(['practiceRoutines']);
      toast.success('Routine created!');
      onClose();
    },
  });

  const addExercise = () => {
    setExercises([
      ...exercises,
      { exercise_type: 'intervals', difficulty: 'beginner', duration_minutes: 5, order: exercises.length },
    ]);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!routineName.trim() || exercises.length === 0) {
      toast.error('Please add a name and at least one exercise');
      return;
    }

    const totalDuration = exercises.reduce((sum, e) => sum + (parseInt(e.duration_minutes) || 0), 0);

    createRoutineMutation.mutate({
      routine_name: routineName,
      exercises,
      total_duration: totalDuration,
      active: true,
      times_completed: 0,
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Create Practice Routine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Routine Name</Label>
          <Input
            placeholder="e.g., Morning Warm-up"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Exercises</Label>
            <Button size="sm" onClick={addExercise}>
              <Plus className="w-4 h-4 mr-1" />
              Add Exercise
            </Button>
          </div>

          <div className="space-y-3">
            {exercises.map((exercise, idx) => (
              <div key={idx} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Exercise {idx + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExercise(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={exercise.exercise_type}
                      onValueChange={(val) => updateExercise(idx, 'exercise_type', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intervals">Intervals</SelectItem>
                        <SelectItem value="chords">Chords</SelectItem>
                        <SelectItem value="scales">Scales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Difficulty</Label>
                    <Select
                      value={exercise.difficulty}
                      onValueChange={(val) => updateExercise(idx, 'difficulty', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.duration_minutes}
                      onChange={(e) => updateExercise(idx, 'duration_minutes', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Routine
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}