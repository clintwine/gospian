import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Avatar } from "@/components/ui/avatar";
import { User, Music2, Zap } from 'lucide-react';

export default function ChallengeFriendModal({ open, onClose, currentUser }) {
  const [selectedFriend, setSelectedFriend] = useState('');
  const [exerciseType, setExerciseType] = useState('intervals');
  const [difficulty, setDifficulty] = useState('beginner');
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', currentUser?.email],
    queryFn: async () => {
      const sent = await base44.entities.Friend.filter({ user_email: currentUser.email });
      const received = await base44.entities.Friend.filter({ friend_email: currentUser.email });
      return [...sent, ...received];
    },
    enabled: !!currentUser?.email,
  });

  const createChallengeMutation = useMutation({
    mutationFn: (challenge) => base44.entities.FriendChallenge.create(challenge),
    onSuccess: async (challenge) => {
      queryClient.invalidateQueries(['friendChallenges']);
      
      // Create notification for challenged friend
      await base44.entities.Notification.create({
        recipient_email: selectedFriend,
        type: 'challenge',
        title: 'New Challenge!',
        message: `${currentUser.full_name} challenged you to a ${exerciseType} exercise!`,
        action_url: `/challenges/${challenge.id}`,
        sender_email: currentUser.email,
      });

      onClose();
      setSelectedFriend('');
    },
  });

  const handleChallenge = () => {
    if (!selectedFriend) return;

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 3); // 3 days to accept

    createChallengeMutation.mutate({
      challenger_email: currentUser.email,
      challenged_email: selectedFriend,
      exercise_type: exerciseType,
      difficulty,
      status: 'pending',
      expires_date: expiresDate.toISOString(),
    });
  };

  const getFriendEmail = (friend) => {
    return friend.user_email === currentUser?.email ? friend.friend_email : friend.user_email;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#E9C46A]" />
            Challenge a Friend
          </DialogTitle>
          <DialogDescription>
            Choose a friend and exercise type for your challenge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Friend Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Friend</label>
            <Select value={selectedFriend} onValueChange={setSelectedFriend}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a friend" />
              </SelectTrigger>
              <SelectContent>
                {friends.map((friend) => {
                  const friendEmail = getFriendEmail(friend);
                  return (
                    <SelectItem key={friend.id} value={friendEmail}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {friendEmail.split('@')[0]}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Exercise Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exercise Type</label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intervals">Intervals</SelectItem>
                <SelectItem value="chords">Chords</SelectItem>
                <SelectItem value="scales">Scales</SelectItem>
                <SelectItem value="rhythm">Rhythm</SelectItem>
                <SelectItem value="melody">Melody</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleChallenge}
            disabled={!selectedFriend || createChallengeMutation.isPending}
            className="flex-1 bg-[#3E82FC]"
          >
            Send Challenge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}