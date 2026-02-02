import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ClassroomPricingSettings({ classroom, onUpdate, isLoading }) {
  const [isPaid, setIsPaid] = useState(classroom.is_paid || false);
  const [price, setPrice] = useState(classroom.price?.toString() || '');
  const [currency, setCurrency] = useState(classroom.currency || 'USD');
  const [isPublic, setIsPublic] = useState(classroom.is_public !== false);
  const [requiresApproval, setRequiresApproval] = useState(classroom.requires_approval || false);
  const [category, setCategory] = useState(classroom.category || 'general');
  const [level, setLevel] = useState(classroom.level || 'all_levels');
  const [maxStudents, setMaxStudents] = useState(classroom.max_students?.toString() || '');

  const handleSave = () => {
    if (isPaid && (!price || parseFloat(price) <= 0)) {
      toast.error('Please enter a valid price');
      return;
    }

    onUpdate({
      is_paid: isPaid,
      price: isPaid ? parseFloat(price) : null,
      currency: currency,
      is_public: isPublic,
      requires_approval: requiresApproval,
      category: category,
      level: level,
      max_students: maxStudents ? parseInt(maxStudents) : null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Classroom Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Public/Private */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Marketplace Visibility</Label>
            <p className="text-sm text-muted-foreground">
              Show this classroom in the marketplace
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPublic ? <Eye className="w-4 h-4 text-[#2A9D8F]" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        {/* Paid/Free */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Paid Enrollment</Label>
            <p className="text-sm text-muted-foreground">
              Charge students to join this classroom
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className={`w-4 h-4 ${isPaid ? 'text-[#E9C46A]' : 'text-muted-foreground'}`} />
            <Switch
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
          </div>
        </div>

        {/* Price Input */}
        {isPaid && (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Approval Required */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Require Approval</Label>
            <p className="text-sm text-muted-foreground">
              Manually approve student join requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Lock className={`w-4 h-4 ${requiresApproval ? 'text-[#3E82FC]' : 'text-muted-foreground'}`} />
            <Switch
              checked={requiresApproval}
              onCheckedChange={setRequiresApproval}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ear_training">Ear Training</SelectItem>
              <SelectItem value="music_theory">Music Theory</SelectItem>
              <SelectItem value="sight_reading">Sight Reading</SelectItem>
              <SelectItem value="rhythm">Rhythm</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger id="level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="all_levels">All Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Students */}
        <div className="space-y-2">
          <Label htmlFor="maxStudents">Maximum Students (Optional)</Label>
          <Input
            id="maxStudents"
            type="number"
            min="1"
            value={maxStudents}
            onChange={(e) => setMaxStudents(e.target.value)}
            placeholder="Unlimited"
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-[#3E82FC]"
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}