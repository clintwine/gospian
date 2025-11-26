import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AccuracyChallenge() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to={createPageUrl('Challenges')}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenges
        </Button>
      </Link>

      <Card className="border-0 shadow-2xl overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-[#2A9D8F] to-[#3E82FC]" />
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Perfect Pitch Challenge</h1>
          <p className="text-muted-foreground mb-6">
            This challenge is available for users at Level 4 and above.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#E9C46A] mb-6">
            <Target className="w-5 h-5" />
            <span className="font-semibold">+40 XP Reward</span>
          </div>
          <Link to={createPageUrl('Exercises')}>
            <Button className="bg-[#243B73] hover:bg-[#0A1A2F]">
              Practice to Level Up
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}