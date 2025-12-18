import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Pricing() {
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  React.useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = createPageUrl('Home');
    }
  }, [user, userLoading]);

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ created_by: user.email });
      return subs[0] || { tier: 'free', status: 'active' };
    },
    enabled: !!user?.email,
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ tier, billingCycle }) => {
      if (subscription?.id) {
        await base44.entities.Subscription.update(subscription.id, {
          tier,
          billing_cycle: billingCycle,
          status: 'active',
          started_date: new Date().toISOString().split('T')[0],
          expires_date: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else {
        await base44.entities.Subscription.create({
          tier,
          billing_cycle: billingCycle,
          status: 'active',
          started_date: new Date().toISOString().split('T')[0],
          expires_date: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
    },
  });

  const plans = [
    {
      name: 'Free',
      tier: 'free',
      icon: Zap,
      color: 'from-gray-400 to-gray-500',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Basic interval recognition',
        'Pitch identification exercises',
        '10 exercises per day',
        'Basic progress tracking',
        'Community support'
      ],
      limitations: [
        'No chord progressions',
        'No melodic dictation',
        'No adaptive training',
        'No advanced analytics',
        'No offline access'
      ]
    },
    {
      name: 'Pro',
      tier: 'pro',
      icon: Sparkles,
      color: 'from-[#3E82FC] to-[#243B73]',
      monthlyPrice: 9.99,
      yearlyPrice: 59.99,
      recommended: true,
      features: [
        'Unlimited daily exercises',
        'Full interval, chord & scale libraries',
        'Personalized training plans',
        'Full progress tracking & analytics',
        'Offline access',
        'Priority support',
        'Custom practice routines',
        'Advanced ear training exercises'
      ]
    },
    {
      name: 'Pro Plus',
      tier: 'pro_plus',
      icon: Crown,
      color: 'from-[#E9C46A] to-[#E76F51]',
      monthlyPrice: 14.99,
      yearlyPrice: 89.99,
      features: [
        'Everything in Pro, plus:',
        'Melodic dictation exercises',
        'Real-music context training',
        'Custom exercise builder',
        'Advanced analytics dashboard',
        'Accuracy over time tracking',
        'Speed & retention metrics',
        'Exportable progress reports',
        'Exclusive masterclasses'
      ]
    }
  ];

  if (userLoading || subLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mx-auto mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const currentTier = subscription?.tier || 'free';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Unlock your full musical potential
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={yearlyBilling ? 'text-muted-foreground' : 'font-semibold'}>
            Monthly
          </span>
          <Switch
            checked={yearlyBilling}
            onCheckedChange={setYearlyBilling}
          />
          <span className={yearlyBilling ? 'font-semibold' : 'text-muted-foreground'}>
            Yearly
          </span>
          <Badge className="bg-[#2A9D8F] ml-2">Save up to 40%</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = yearlyBilling ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrentPlan = currentTier === plan.tier;
          const canUpgrade = currentTier === 'free' || 
                            (currentTier === 'pro' && plan.tier === 'pro_plus');

          return (
            <Card
              key={plan.tier}
              className={`relative border-2 ${
                plan.recommended ? 'border-[#3E82FC] shadow-2xl scale-105' : 'border-border'
              } ${isCurrentPlan ? 'bg-[#D7E5FF]/20' : ''}`}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#3E82FC] to-[#243B73]">
                  Recommended
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-[#2A9D8F]">
                  Current Plan
                </Badge>
              )}

              <CardHeader>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                <div className="text-center mt-4">
                  <div className="text-4xl font-bold">
                    ${price}
                    {plan.tier !== 'free' && (
                      <span className="text-base font-normal text-muted-foreground">
                        /{yearlyBilling ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {plan.tier !== 'free' && yearlyBilling && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(plan.yearlyPrice / 12).toFixed(2)}/month
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#2A9D8F] shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-sm line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={isCurrentPlan || !canUpgrade || upgradeMutation.isPending}
                  onClick={() => upgradeMutation.mutate({ 
                    tier: plan.tier, 
                    billingCycle: yearlyBilling ? 'yearly' : 'monthly' 
                  })}
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  {isCurrentPlan ? 'Current Plan' : 
                   canUpgrade ? 'Get Started' : 'Downgrade Not Available'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Can I switch plans anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade your plan at any time. Your new benefits will be available immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground">
              The Free tier lets you try core features. Upgrade anytime to unlock unlimited access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}