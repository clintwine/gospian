import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock } from 'lucide-react';

export default function UpgradePrompt({ 
  requiredTier = 'pro',
  compact = false,
  className = ''
}) {
  const tierNames = {
    pro: 'Pro',
    pro_plus: 'Pro Plus'
  };

  if (compact) {
    return (
      <Badge variant="outline" className={`border-[#E9C46A] text-[#E9C46A] ${className}`}>
        <Lock className="w-3 h-3 mr-1" />
        {tierNames[requiredTier]}
      </Badge>
    );
  }

  return (
    <Link to={createPageUrl('Pricing')}>
      <Button size="sm" variant="outline" className={`border-[#3E82FC] text-[#3E82FC] hover:bg-[#3E82FC]/10 ${className}`}>
        <Sparkles className="w-4 h-4 mr-2" />
        Upgrade to {tierNames[requiredTier]}
      </Button>
    </Link>
  );
}