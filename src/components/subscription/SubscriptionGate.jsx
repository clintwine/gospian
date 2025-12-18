import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from 'lucide-react';

export default function SubscriptionGate({ 
  requiredTier = 'pro', 
  featureName = 'this feature',
  children,
  userTier = 'free'
}) {
  const tierHierarchy = { free: 0, pro: 1, pro_plus: 2 };
  const hasAccess = tierHierarchy[userTier] >= tierHierarchy[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  const tierNames = {
    pro: 'Pro',
    pro_plus: 'Pro Plus'
  };

  return (
    <Card className="border-2 border-dashed border-[#3E82FC]/30 bg-gradient-to-br from-[#D7E5FF]/20 to-transparent">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3E82FC] to-[#243B73] flex items-center justify-center">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-[#0A1A2F] dark:text-white">
          Upgrade to Unlock
        </h3>
        <p className="text-muted-foreground mb-4">
          {featureName} is available in {tierNames[requiredTier] || 'Pro'}
        </p>
        <Link to={createPageUrl('Pricing')}>
          <Button className="bg-gradient-to-r from-[#3E82FC] to-[#243B73]">
            <Sparkles className="w-4 h-4 mr-2" />
            View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}