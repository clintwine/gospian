import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon } from 'lucide-react';

export default function CreateAssignmentForm({ open, onClose, classroomId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exerciseType, setExerciseType] = useState('intervals');
  const [difficulty, setDifficulty] = useState('beginner');
  const [targetAccuracy, setTargetAccuracy] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createAssignmentMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Assignment.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', classroomId] });
      resetForm();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setExerciseType('intervals');
    setDifficulty('beginner');
    setTargetAccuracy('');
    setDueDate('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const user = await base44.auth.me();

      const assignmentData = {
        classroom_id: classroomId,
        teacher_email: user.email,
        title: title.trim(),
        description: description.trim() || null,
        exercise_type: exerciseType,
        difficulty: difficulty,
        target_accuracy: targetAccuracy ? parseInt(targetAccuracy) : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        completed_by: [],
      };

      await createAssignmentMutation.mutateAsync(assignmentData);
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>
            Assign an exercise to your students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title *</label>
            <Input
              placeholder="Assignment title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              placeholder="Add instructions or notes for students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Exercise Type</label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intervals">Intervals</SelectItem>
                <SelectItem value="chords">Chords</SelectItem>
                <SelectItem value="scales">Scales</SelectItem>
                <SelectItem value="rhythm">Rhythm</SelectItem>
                <SelectItem value="melody">Melody</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
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

          <div>
            <label className="text-sm font-medium mb-2 block">Target Accuracy (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 80"
              value={targetAccuracy}
              onChange={(e) => setTargetAccuracy(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-[#E76F51]">{error}</p>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={createAssignmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#3E82FC]"
              disabled={createAssignmentMutation.isPending}
            >
              {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}