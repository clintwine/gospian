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
import { Crown, Sparkles } from 'lucide-react';

export default function DailyLimitModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            You've completed today's free training! 🎵
          </DialogTitle>
          <DialogDescription className="text-center pt-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E9C46A] to-[#E76F51] flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <p className="text-base mb-4">
              You've used all 10 free exercises today. Come back tomorrow, or unlock unlimited sessions now!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Link to={createPageUrl('Pricing')}>
            <Button className="w-full bg-gradient-to-r from-[#3E82FC] to-[#243B73]" size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Unlock Unlimited with Pro
            </Button>
          </Link>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Maybe Tomorrow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}