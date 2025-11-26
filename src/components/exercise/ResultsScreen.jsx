import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Zap, RotateCcw, Home, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ResultsScreen({ 
  correct, 
  total, 
  accuracy, 
  xpEarned,
  exerciseType,
  difficulty,
  onRetry
}) {
  const getPerformanceMessage = () => {
    if (accuracy === 100) return { text: 'Perfect Score!', icon: Star, color: 'text-[#E9C46A]' };
    if (accuracy >= 80) return { text: 'Excellent Work!', icon: Trophy, color: 'text-[#2A9D8F]' };
    if (accuracy >= 60) return { text: 'Good Progress!', icon: Target, color: 'text-[#3E82FC]' };
    return { text: 'Keep Practicing!', icon: Target, color: 'text-[#E76F51]' };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0A1A2F] to-[#243B73] p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center"
            >
              <PerformanceIcon className={`w-10 h-10 ${performance.color}`} />
            </motion.div>
            <h2 className={`text-2xl font-bold ${performance.color}`}>{performance.text}</h2>
            <p className="text-white/60 mt-1 capitalize">{exerciseType} - {difficulty}</p>
          </div>

          {/* Stats */}
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-[#D7E5FF]/50 dark:bg-slate-800">
                <p className="text-3xl font-bold text-[#243B73] dark:text-[#3E82FC]">{correct}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#D7E5FF]/50 dark:bg-slate-800">
                <p className="text-3xl font-bold text-[#243B73] dark:text-[#3E82FC]">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#E9C46A]/20 dark:bg-[#E9C46A]/10">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5 text-[#E9C46A]" />
                  <p className="text-3xl font-bold text-[#E9C46A]">{xpEarned}</p>
                </div>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
            </div>

            {accuracy === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-lg bg-[#E9C46A]/20 text-center"
              >
                <p className="text-sm font-medium text-[#E9C46A]">
                  +10 Bonus XP for perfect accuracy!
                </p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onRetry}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link to={createPageUrl('Dashboard')} className="flex-1">
                <Button className="w-full bg-[#243B73] hover:bg-[#0A1A2F]">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}