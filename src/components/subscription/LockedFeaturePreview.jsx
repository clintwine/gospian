import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Check } from 'lucide-react';

export default function LockedFeaturePreview({ 
  open, 
  onOpenChange, 
  featureName,
  featureDescription,
  requiredTier = 'pro',
  features = []
}) {
  const tierInfo = {
    pro: {
      name: 'Pro',
      color: 'from-[#3E82FC] to-[#243B73]',
      price: '$9.99/month'
    },
    pro_plus: {
      name: 'Pro Plus',
      color: 'from-[#E9C46A] to-[#E76F51]',
      price: '$14.99/month'
    }
  };

  const tier = tierInfo[requiredTier];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <DialogTitle className="text-2xl text-center">
            {featureName}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            <Badge className={`bg-gradient-to-r ${tier.color} mb-4`}>
              <Crown className="w-3 h-3 mr-1" />
              {tier.name} Feature
            </Badge>
            <p className="text-base mb-6">
              {featureDescription}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              This feature is available on {tier.name} {requiredTier === 'pro_plus' ? 'and Pro Plus' : ''}.
            </p>
          </DialogDescription>
        </DialogHeader>

        {features.length > 0 && (
          <div className="space-y-2 mb-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <Link to={createPageUrl('Pricing')}>
            <Button className={`w-full bg-gradient-to-r ${tier.color}`} size="lg">
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to {tier.name} - {tier.price}
            </Button>
          </Link>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}