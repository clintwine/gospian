import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Target, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AITrainingPlan({ userStats, exerciseResults }) {
  const [goal, setGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: trainingPlans = [] } = useQuery({
    queryKey: ['trainingPlans'],
    queryFn: async () => {
      return await base44.entities.TrainingPlan.filter({}, '-created_date', 10);
    },
  });

  const activePlan = trainingPlans.find(p => p.active);

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.TrainingPlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['trainingPlans']);
      setGoal('');
      setGenerating(false);
    },
  });

  const generatePlan = async () => {
    if (!goal.trim()) return;
    
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert music theory and ear training coach. Based on the following user data, create a personalized training plan.

User Stats:
- Current Level: ${userStats?.level || 1}
- Total XP: ${userStats?.xp || 0}
- Exercises Completed: ${userStats?.exercises_completed || 0}
- Perfect Scores: ${userStats?.perfect_scores || 0}
- Current Streak: ${userStats?.streak || 0} days

Recent Performance:
${exerciseResults?.slice(0, 5).map(r => 
  `- ${r.exercise_type} (${r.difficulty}): ${r.accuracy}% accuracy, ${r.correct_answers}/${r.total_questions} correct`
).join('\n')}

User's Goal: ${goal}

Create a detailed training plan with:
1. A motivating plan name
2. Specific exercises with difficulty levels
3. Target accuracy goals
4. Weekly targets for exercises and XP
5. Recommended practice frequency

Focus on areas where the user needs improvement while keeping them motivated.`,
        response_json_schema: {
          type: "object",
          properties: {
            plan_name: { type: "string" },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exercise_type: { type: "string", enum: ["intervals", "chords", "scales"] },
                  difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                  target_accuracy: { type: "number" },
                  recommended_sessions: { type: "number" },
                  focus_area: { type: "string" }
                }
              }
            },
            weekly_targets: {
              type: "object",
              properties: {
                exercises_per_week: { type: "number" },
                total_xp_target: { type: "number" }
              }
            }
          }
        }
      });

      createPlanMutation.mutate({
        plan_name: response.plan_name,
        goal: goal,
        exercises: response.exercises,
        weekly_targets: response.weekly_targets,
        active: true,
        progress: 0,
      });

      // Deactivate other plans
      trainingPlans.forEach(async (plan) => {
        if (plan.active) {
          await base44.entities.TrainingPlan.update(plan.id, { active: false });
        }
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      setGenerating(false);
    }
  };

  if (activePlan) {
    const completedExercises = exerciseResults?.filter(r => 
      activePlan.exercises.some(e => 
        e.exercise_type === r.exercise_type && 
        e.difficulty === r.difficulty
      )
    ).length || 0;
    const totalExercises = activePlan.exercises.reduce((sum, e) => sum + (e.recommended_sessions || 1), 0);
    const progress = Math.min(100, Math.round((completedExercises / totalExercises) * 100));

    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-[#3E82FC]/10 to-[#2A9D8F]/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E9C46A]" />
            Your AI Training Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{activePlan.plan_name}</h3>
            <p className="text-sm text-muted-foreground mb-4">Goal: {activePlan.goal}</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-background/50">
                <Target className="w-4 h-4 mb-1 text-[#3E82FC]" />
                <p className="text-xs text-muted-foreground">Weekly Target</p>
                <p className="font-semibold">{activePlan.weekly_targets?.exercises_per_week || 0} exercises</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <TrendingUp className="w-4 h-4 mb-1 text-[#E9C46A]" />
                <p className="text-xs text-muted-foreground">XP Goal</p>
                <p className="font-semibold">{activePlan.weekly_targets?.total_xp_target || 0} XP</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Recommended Exercises</h4>
            <div className="space-y-2">
              {activePlan.exercises.map((exercise, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-medium capitalize">{exercise.exercise_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {exercise.difficulty} • Target: {exercise.target_accuracy}%
                    </p>
                  </div>
                  <Link to={createPageUrl(`Exercise?type=${exercise.exercise_type}&difficulty=${exercise.difficulty}`)}>
                    <Button size="sm">Start</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              base44.entities.TrainingPlan.update(activePlan.id, { active: false });
              queryClient.invalidateQueries(['trainingPlans']);
            }}
          >
            Generate New Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E9C46A]" />
          AI-Powered Training Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tell us your goal and we'll create a personalized training plan using AI based on your current stats and performance.
        </p>
        
        <Textarea
          placeholder="e.g., I want to master all intervals within 3 weeks, improve my chord recognition accuracy to 90%, prepare for a music theory exam..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={4}
        />

        <Button
          onClick={generatePlan}
          disabled={!goal.trim() || generating}
          className="w-full bg-gradient-to-r from-[#3E82FC] to-[#2A9D8F]"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Plan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}