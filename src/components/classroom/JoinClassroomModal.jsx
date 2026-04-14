import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DollarSign, Users, Star, Lock, Key } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function JoinClassroomModal({ open, onClose, classroom, currentUser, onSuccess }) {
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const [joinMethod, setJoinMethod] = useState(classroom?.requires_approval ? 'request' : 'join_code');

  const createEnrollmentMutation = useMutation({
    mutationFn: async (data) => {
      // Verify join code if required
      if (joinMethod === 'join_code' && !classroom.requires_approval) {
        if (joinCode.toUpperCase() !== classroom.join_code) {
          throw new Error('Invalid join code');
        }
      }

      const existingEnrollments = await base44.entities.ClassroomEnrollment.filter({
        classroom_id: classroom.id,
        student_email: currentUser.email
      });

      if (existingEnrollments.some(e => ['pending', 'approved', 'enrolled'].includes(e.status))) {
        throw new Error('You already have an active enrollment or request for this classroom');
      }

      const enrollment = await base44.entities.ClassroomEnrollment.create({
        classroom_id: classroom.id,
        student_email: currentUser.email,
        student_name: currentUser.full_name,
        teacher_email: classroom.teacher_email,
        status: classroom.requires_approval ? 'pending' : 'enrolled',
        join_method: joinMethod,
        payment_status: classroom.is_paid ? 'pending' : 'not_required',
        amount_paid: classroom.is_paid ? classroom.price : 0,
        message: message || '',
      });

      // If free and no approval required, add student directly
      if (!classroom.requires_approval && !classroom.is_paid) {
        const updatedEmails = [...(classroom.student_emails || []), currentUser.email];
        await base44.entities.Classroom.update(classroom.id, {
          student_emails: updatedEmails,
          total_enrollments: (classroom.total_enrollments || 0) + 1,
        });
      }

      // If paid, create payment record
      if (classroom.is_paid) {
        const settings = await base44.entities.PlatformSettings.filter({
          setting_key: 'marketplace_fee_percentage'
        });
        const feePercentage = settings[0]?.setting_value ? parseFloat(settings[0].setting_value) : 10;
        const platformFee = (classroom.price * feePercentage) / 100;
        const teacherPayout = classroom.price - platformFee;

        await base44.entities.ClassroomPayment.create({
          classroom_id: classroom.id,
          enrollment_id: enrollment.id,
          student_email: currentUser.email,
          teacher_email: classroom.teacher_email,
          amount: classroom.price,
          platform_fee: platformFee,
          teacher_payout: teacherPayout,
          currency: classroom.currency || 'USD',
          payment_status: 'pending',
          payment_method: 'card',
        });
      }

      return enrollment;
    },
    onSuccess: () => {
      if (classroom.requires_approval) {
        toast.success('Join request sent! Waiting for teacher approval.');
      } else if (classroom.is_paid) {
        toast.success('Enrollment created! Complete payment to access classroom.');
      } else {
        toast.success('Successfully joined classroom!');
      }
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to join classroom');
    },
  });

  const handleSubmit = () => {
    if (joinMethod === 'join_code' && !classroom.requires_approval && !joinCode.trim()) {
      toast.error('Please enter the join code');
      return;
    }
    createEnrollmentMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Join {classroom?.classroom_name}</DialogTitle>
          <DialogDescription>
            Instructor: {classroom?.teacher_name || classroom?.teacher_email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Classroom Info */}
          <div className="bg-[#D7E5FF] dark:bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>{classroom?.student_emails?.length || 0} students</span>
              </div>
              {classroom?.rating > 0 && (
                <div className="flex items-center gap-1 text-[#E9C46A]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm">{classroom.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {classroom?.is_paid && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#243B73]/20">
                <DollarSign className="w-5 h-5 text-[#E9C46A]" />
                <span className="font-bold text-lg">
                  {classroom.price} {classroom.currency}
                </span>
              </div>
            )}

            {classroom?.requires_approval && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-[#243B73]/20">
                <Lock className="w-4 h-4" />
                <span>Requires teacher approval</span>
              </div>
            )}
          </div>

          {/* Join Method */}
          {!classroom?.requires_approval ? (
            <div className="space-y-2">
              <Label htmlFor="joinCode">Enter Join Code</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="joinCode"
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="pl-10 uppercase"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="message">Message to Instructor (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell the instructor why you'd like to join..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Payment Notice */}
          {classroom?.is_paid && (
            <div className="bg-[#E9C46A]/10 border border-[#E9C46A] rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Payment Required</p>
              <p className="text-muted-foreground">
                After joining, you'll need to complete payment to access the classroom.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createEnrollmentMutation.isPending}
              className="flex-1 bg-[#3E82FC]"
            >
              {createEnrollmentMutation.isPending ? 'Joining...' : 
               classroom?.requires_approval ? 'Send Request' : 'Join Classroom'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}