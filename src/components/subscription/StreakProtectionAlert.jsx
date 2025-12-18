import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Flame, Shield, Crown } from 'lucide-react';

export default function StreakProtectionAlert({ streak, userTier = 'free' }) {
  if (userTier !== 'free' || streak < 3) return null;

  return (
    <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20 mb-6">
      <Flame className="h-4 w-4 text-orange-500" />
      <AlertDescription className="ml-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Protect your {streak}-day streak!
            </p>
            <p className="text-sm text-muted-foreground">
              Free users lose their streak if they miss a day. Pro users keep their streak active automatically.
            </p>
          </div>
          <Link to={createPageUrl('Pricing')}>
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 shrink-0">
              <Crown className="w-4 h-4 mr-2" />
              Protect with Pro
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}