import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TrendingDown, Sparkles } from 'lucide-react';

export default function PlateauDetectionAlert({ show, onDismiss }) {
  if (!show) return null;

  return (
    <Alert className="border-[#E76F51] bg-[#E76F51]/10 mb-6">
      <TrendingDown className="h-4 w-4 text-[#E76F51]" />
      <AlertDescription className="ml-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold mb-1">Skill plateau detected</p>
            <p className="text-sm text-muted-foreground">
              Your accuracy hasn't improved in the past 7 days. Pro users get adaptive training to break through plateaus.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to={createPageUrl('Pricing')}>
              <Button size="sm" className="bg-[#3E82FC]">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}