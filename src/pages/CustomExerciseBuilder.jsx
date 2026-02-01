import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function CustomExerciseBuilder() {
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseType, setExerciseType] = useState('intervals');
  const [difficulty, setDifficulty] = useState('beginner');
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState([
    { correct_answer: '', options: ['', '', '', ''], audio_data: {} }
  ]);
  const queryClient = useQueryClient();

  const createExerciseMutation = useMutation({
    mutationFn: (exercise) => base44.entities.CustomExercise.create(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries(['customExercises']);
      toast.success('Custom exercise created!');
      window.location.href = createPageUrl('Exercises');
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, { correct_answer: '', options: ['', '', '', ''], audio_data: {} }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSave = () => {
    if (!exerciseName.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }

    const validQuestions = questions.filter(q => 
      q.correct_answer && q.options.every(o => o.trim())
    );

    if (validQuestions.length === 0) {
      toast.error('Please add at least one complete question');
      return;
    }

    createExerciseMutation.mutate({
      exercise_name: exerciseName,
      exercise_type: exerciseType,
      difficulty,
      is_public: isPublic,
      questions: validQuestions,
      times_completed: 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Custom Exercise Builder
        </h1>
        <p className="text-muted-foreground">
          Create your own custom ear training exercises
        </p>
      </div>

      <div className="space-y-6">
        {/* Exercise Details */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Exercise Name</label>
              <Input
                placeholder="My Custom Exercise"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
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
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Make Public</p>
                <p className="text-sm text-muted-foreground">
                  Allow other users to practice this exercise
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.map((question, qIndex) => (
          <Card key={qIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeQuestion(qIndex)}
                  disabled={questions.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Correct Answer</label>
                <Input
                  placeholder="e.g., Perfect 5th"
                  value={question.correct_answer}
                  onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Answer Options</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {question.options.map((option, oIndex) => (
                    <Input
                      key={oIndex}
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={addQuestion} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
          <Button
            onClick={handleSave}
            disabled={createExerciseMutation.isPending}
            className="flex-1 bg-[#3E82FC]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Exercise
          </Button>
        </div>
      </div>
    </div>
  );
}