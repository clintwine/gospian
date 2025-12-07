import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Search, Zap, Flame, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listUsers');
      return data.users || [];
    },
  });

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', currentUser?.email],
    queryFn: async () => {
      const sent = await base44.entities.Friend.filter({ user_email: currentUser.email });
      const received = await base44.entities.Friend.filter({ friend_email: currentUser.email });
      return [...sent, ...received];
    },
    enabled: !!currentUser?.email,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friendRequests', currentUser?.email],
    queryFn: async () => {
      return await base44.entities.FriendRequest.filter({ 
        receiver_email: currentUser.email,
        status: 'pending'
      });
    },
    enabled: !!currentUser?.email,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ['sentRequests', currentUser?.email],
    queryFn: async () => {
      return await base44.entities.FriendRequest.filter({ 
        sender_email: currentUser.email,
        status: 'pending'
      });
    },
    enabled: !!currentUser?.email,
  });

  const { data: allStats = [] } = useQuery({
    queryKey: ['allUserStats'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.UserStats.list();
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (receiverEmail) => {
      await base44.entities.FriendRequest.create({
        sender_email: currentUser.email,
        receiver_email: receiverEmail,
        status: 'pending'
      });
      
      // Send notification
      await base44.functions.invoke('createNotification', {
        recipientEmail: receiverEmail,
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${currentUser.full_name || currentUser.email} sent you a friend request`,
        actionUrl: createPageUrl('Friends')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentRequests'] });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.FriendRequest.update(request.id, { status: 'accepted' });
      await base44.entities.Friend.create({
        user_email: request.sender_email,
        friend_email: request.receiver_email,
        status: 'active'
      });
      await base44.entities.Friend.create({
        user_email: request.receiver_email,
        friend_email: request.sender_email,
        status: 'active'
      });
      
      // Send notification
      await base44.functions.invoke('createNotification', {
        recipientEmail: request.sender_email,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `${currentUser.full_name || currentUser.email} accepted your friend request`,
        actionUrl: createPageUrl('Friends')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (requestId) => base44.entities.FriendRequest.update(requestId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendEmail) => {
      const friendship1 = friends.find(f => 
        f.user_email === currentUser.email && f.friend_email === friendEmail
      );
      const friendship2 = friends.find(f => 
        f.user_email === friendEmail && f.friend_email === currentUser.email
      );
      if (friendship1) await base44.entities.Friend.delete(friendship1.id);
      if (friendship2) await base44.entities.Friend.delete(friendship2.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const getFriendEmails = () => {
    if (!friends || !currentUser) return [];
    const friendEmails = friends.map(f => 
      f.user_email === currentUser.email ? f.friend_email : f.user_email
    );
    // Remove duplicates by converting to Set and back to array
    return [...new Set(friendEmails)];
  };

  const getUserStats = (email) => {
    return allStats?.find(s => s.created_by === email) || { xp: 0, level: 1, streak: 0 };
  };

  const filteredUsers = React.useMemo(() => {
    if (!allUsers || !currentUser) return [];
    
    // Remove duplicates by email and exclude current user
    const uniqueUsers = Array.from(
      new Map(allUsers.map(u => [u.email, u])).values()
    ).filter(user => user.email !== currentUser.email);
    
    if (!searchQuery.trim()) return uniqueUsers;
    
    const query = searchQuery.toLowerCase().trim();
    return uniqueUsers.filter(user => 
      user.email?.toLowerCase().includes(query) || 
      user.full_name?.toLowerCase().includes(query)
    );
  }, [allUsers, currentUser, searchQuery]);

  React.useEffect(() => {
    if (!userLoading && !currentUser) {
      window.location.href = createPageUrl('Home');
    }
  }, [currentUser, userLoading]);

  const friendEmails = getFriendEmails();
  const pendingReceiverEmails = sentRequests?.map(r => r.receiver_email) || [];

  if (userLoading || !currentUser) return null;

  if (friendsLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Friends
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect with other musicians and compete together
        </p>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="w-4 h-4" />
            Friends ({friendEmails.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Requests
            {friendRequests?.length > 0 && (
              <Badge className="ml-1 bg-[#E76F51]">{friendRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            Find Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          {friendEmails.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground mb-6">
                  Search for musicians and send friend requests to connect
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friendEmails.map(email => {
                const user = allUsers?.find(u => u.email === email);
                const stats = getUserStats(email);
                
                return (
                  <Card key={email} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3E82FC] to-[#2A9D8F] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user?.full_name?.[0] || email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{user?.full_name || email.split('@')[0]}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Level {stats.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-[#E9C46A]" />
                              {stats.xp} XP
                            </span>
                            {stats.streak > 0 && (
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                {stats.streak} day streak
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={createPageUrl(`FriendProfile?email=${email}`)}>
                            <Button variant="outline" size="sm">View Profile</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFriendMutation.mutate(email)}
                            className="text-[#E76F51] hover:text-[#E76F51]"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {friendRequests?.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  You'll see friend requests here when someone wants to connect
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friendRequests?.map(request => {
                const user = allUsers?.find(u => u.email === request.sender_email);
                const stats = getUserStats(request.sender_email);
                
                return (
                  <Card key={request.id} className="border-2 border-[#3E82FC]/30 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3E82FC] to-[#2A9D8F] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user?.full_name?.[0] || request.sender_email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{user?.full_name || request.sender_email.split('@')[0]}</h3>
                          <p className="text-xs text-muted-foreground">{request.sender_email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>Level {stats.level}</span>
                            <span>•</span>
                            <span>{stats.xp} XP</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRequestMutation.mutate(request)}
                            className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectRequestMutation.mutate(request.id)}
                            className="text-[#E76F51] hover:text-[#E76F51]"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="search">
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {usersLoading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : filteredUsers.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground">
                    Try a different search term
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map(user => {
                const isFriend = friendEmails.includes(user.email);
                const hasPendingRequest = pendingReceiverEmails.includes(user.email);
                const stats = getUserStats(user.email);
                
                return (
                  <Card key={user.email} className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#243B73] to-[#3E82FC] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{user.full_name || user.email.split('@')[0]}</h3>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>Level {stats.level}</span>
                            <span>•</span>
                            <span>{stats.xp} XP</span>
                          </div>
                        </div>
                        {isFriend ? (
                          <Badge className="bg-[#2A9D8F]">Friends</Badge>
                        ) : hasPendingRequest ? (
                          <Badge variant="outline">Request Sent</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => sendRequestMutation.mutate(user.email)}
                            disabled={sendRequestMutation.isPending}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add Friend
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}