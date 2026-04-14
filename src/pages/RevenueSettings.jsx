import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Settings, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function RevenueSettings() {
  const [feePercentage, setFeePercentage] = useState('10');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      return await base44.entities.PlatformSettings.list();
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['allPayments'],
    queryFn: async () => {
      return await base44.entities.ClassroomPayment.list();
    },
  });

  // Load existing fee percentage
  useEffect(() => {
    const feeSetting = settings.find(s => s.setting_key === 'marketplace_fee_percentage');
    if (feeSetting) {
      setFeePercentage(feeSetting.setting_value);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (percentage) => {
      const existing = settings.find(s => s.setting_key === 'marketplace_fee_percentage');
      
      if (existing) {
        return await base44.entities.PlatformSettings.update(existing.id, {
          setting_value: percentage.toString(),
        });
      } else {
        return await base44.entities.PlatformSettings.create({
          setting_key: 'marketplace_fee_percentage',
          setting_value: percentage.toString(),
          description: 'Platform fee percentage for marketplace classroom payments',
          category: 'revenue_share',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platformSettings']);
      toast.success('Revenue share settings updated');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleSave = () => {
    const percentage = parseFloat(feePercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error('Please enter a valid percentage (0-100)');
      return;
    }
    updateSettingsMutation.mutate(percentage);
  };

  // Only admins can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Shield className="w-4 h-4" />
          <AlertDescription>
            Access denied. Only platform administrators can view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate revenue stats
  const totalRevenue = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const platformRevenue = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + (p.platform_fee || 0), 0);
  
  const teacherRevenue = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + (p.teacher_payout || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Revenue Share Settings
        </h1>
        <p className="text-muted-foreground">
          Configure platform marketplace revenue distribution
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#3E82FC] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Platform Share</p>
                <p className="text-2xl font-bold text-[#E9C46A]">${platformRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#E9C46A] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Teacher Share</p>
                <p className="text-2xl font-bold text-[#2A9D8F]">${teacherRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#2A9D8F] opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Fee Configuration
          </CardTitle>
          <CardDescription>
            Set the percentage fee that the platform takes from each paid classroom enrollment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feePercentage">Platform Fee Percentage</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  id="feePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <Button 
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
                className="bg-[#3E82FC]"
              >
                Save
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Teachers will receive {100 - parseFloat(feePercentage || 0)}% of each enrollment payment
            </p>
          </div>

          {/* Example Calculation */}
          <div className="bg-[#D7E5FF] dark:bg-slate-800 rounded-lg p-4">
            <p className="font-medium mb-2">Example Calculation:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student pays:</span>
                <span className="font-medium">$100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee ({feePercentage}%):</span>
                <span className="font-medium text-[#E9C46A]">
                  ${((100 * parseFloat(feePercentage || 0)) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#243B73]/20 pt-1 mt-1">
                <span className="text-muted-foreground">Teacher receives:</span>
                <span className="font-bold text-[#2A9D8F]">
                  ${(100 - (100 * parseFloat(feePercentage || 0)) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Changes to the fee percentage will only apply to new enrollments. Existing payments are not affected.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}