import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Music, Headphones, Waves } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PracticeSelection() {
  const practiceModes = [
    {
      type: 'intervals',
      title: 'Intervals',
      description: 'Train your ear to recognize melodic and harmonic intervals.',
      icon: Music,
      path: createPageUrl('PracticeMode') + '?exerciseType=intervals&difficulty=beginner',
    },
    {
      type: 'chords',
      title: 'Chords',
      description: 'Learn to identify different chord qualities and voicings.',
      icon: Headphones,
      path: createPageUrl('PracticeMode') + '?exerciseType=chords&difficulty=beginner',
    },
    {
      type: 'scales',
      title: 'Scales',
      description: 'Master various scale types and their unique sounds.',
      icon: Waves,
      path: createPageUrl('PracticeMode') + '?exerciseType=scales&difficulty=beginner',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-1 sm:mb-2">
          Practice Modes
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Choose a mode to focus on specific ear training skills without pressure.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {practiceModes.map((mode) => (
          <Card key={mode.type} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#D7E5FF] dark:bg-slate-800 flex items-center justify-center mb-4">
                <mode.icon className="w-6 h-6 text-[#243B73]" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-[#0A1A2F] dark:text-white">{mode.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
              <Link to={mode.path} className="w-full">
                <Button className="w-full bg-[#243B73] hover:bg-[#0A1A2F] text-white">
                  Start Practice
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}