import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Home as Feed, Users } from 'lucide-react';
import SocialFeed from '@/components/social/SocialFeed';
import ChatWindow from '@/components/social/ChatWindow';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Social() {
  const [selectedFriend, setSelectedFriend] = useState(null);

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  useEffect(() => {
    if (!userLoading && !currentUser) {
      window.location.href = createPageUrl('Home');
    }
  }, [currentUser, userLoading]);

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', currentUser?.email],
    queryFn: async () => {
      const sent = await base44.entities.Friend.filter({ user_email: currentUser.email });
      const received = await base44.entities.Friend.filter({ friend_email: currentUser.email });
      return [...sent, ...received];
    },
    enabled: !!currentUser?.email,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listUsers');
      return data.users || [];
    },
  });

  if (userLoading || !currentUser) return null;

  const getFriendEmails = () => {
    if (!friends || !currentUser) return [];
    const emails = friends.map(f => 
      f.user_email === currentUser.email ? f.friend_email : f.user_email
    );
    return [...new Set(emails)];
  };

  const friendEmails = getFriendEmails();

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Social Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect with friends and share your musical journey
        </p>
      </div>

      {selectedFriend ? (
        <ChatWindow
          friendEmail={selectedFriend.email}
          friendName={selectedFriend.name}
          currentUserEmail={currentUser?.email}
          onClose={() => setSelectedFriend(null)}
        />
      ) : (
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="feed" className="gap-2">
              <Feed className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <SocialFeed currentUser={currentUser} friends={friends} />
          </TabsContent>

          <TabsContent value="messages">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Friends</h3>
                {friendEmails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No friends to chat with yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friendEmails.map(email => {
                      const user = allUsers.find(u => u.email === email);
                      return (
                        <Button
                          key={email}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setSelectedFriend({
                            email,
                            name: user?.full_name || email.split('@')[0]
                          })}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {user?.full_name || email.split('@')[0]}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}