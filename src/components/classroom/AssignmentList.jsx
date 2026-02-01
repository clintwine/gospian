import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import CreateAssignmentForm from './CreateAssignmentForm';

export default function AssignmentList({
  assignments,
  onDelete,
  isLoading,
  classroomId,
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExerciseTypeIcon = (type) => {
    switch (type) {
      case 'intervals': return '🎵';
      case 'chords': return '🎸';
      case 'scales': return '📈';
      default: return '🎶';
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assignments</CardTitle>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#3E82FC]"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </CardHeader>
        <CardContent>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const completedCount = assignment.completed_by?.length || 0;
                const completionPercent = assignment.student_count 
                  ? Math.round((completedCount / assignment.student_count) * 100) 
                  : 0;

                return (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getExerciseTypeIcon(assignment.exercise_type)}</span>
                          <h4 className="font-semibold">{assignment.title}</h4>
                        </div>
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {assignment.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          <Badge variant="outline" className={getDifficultyColor(assignment.difficulty)}>
                            {assignment.difficulty}
                          </Badge>
                          {assignment.target_accuracy && (
                            <Badge variant="outline" className="bg-[#3E82FC]/10 text-[#3E82FC]">
                              {assignment.target_accuracy}% required
                            </Badge>
                          )}
                          {assignment.due_date && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                        <div className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                            <span>{completedCount} of {assignment.student_count || 0} students completed</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2A9D8F] transition-all"
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(assignment.id)}
                        className="text-[#E76F51] hover:text-[#E76F51]/80 shrink-0"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No assignments yet</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#3E82FC]"
              >
                Create First Assignment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAssignmentForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        classroomId={classroomId}
      />
    </>
  );
}