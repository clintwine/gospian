import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Lock, Crown } from 'lucide-react';

const dummyData = [
  { day: 'Mon', accuracy: 65 },
  { day: 'Tue', accuracy: 70 },
  { day: 'Wed', accuracy: 68 },
  { day: 'Thu', accuracy: 75 },
  { day: 'Fri', accuracy: 73 },
  { day: 'Sat', accuracy: 78 },
  { day: 'Sun', accuracy: 80 },
];

export default function BlurredProgressChart({ userTier = 'free' }) {
  if (userTier !== 'free') {
    return null; // Show actual chart for pro users
  }

  return (
    <Card className="border-2 border-dashed border-[#3E82FC]/30 relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Progress History</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Blurred Chart */}
        <div className="blur-sm opacity-50 pointer-events-none">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dummyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Line type="monotone" dataKey="accuracy" stroke="#3E82FC" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3E82FC] to-[#243B73] flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Unlock your full progress history
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track your improvement over time with detailed analytics
            </p>
            <Link to={createPageUrl('Pricing')}>
              <Button className="bg-gradient-to-r from-[#3E82FC] to-[#243B73]">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}