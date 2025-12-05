import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft } from 'lucide-react';

export default function ChatWindow({ friendEmail, friendName, currentUserEmail, onClose }) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages', friendEmail],
    queryFn: async () => {
      const sent = await base44.entities.ChatMessage.filter({ 
        sender_email: currentUserEmail,
        receiver_email: friendEmail 
      });
      const received = await base44.entities.ChatMessage.filter({ 
        sender_email: friendEmail,
        receiver_email: currentUserEmail 
      });
      return [...sent, ...received].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );
    },
    enabled: !!friendEmail && !!currentUserEmail,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msg) => base44.entities.ChatMessage.create(msg),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatMessages']);
      setMessage('');
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      sender_email: currentUserEmail,
      receiver_email: friendEmail,
      message: message.trim(),
      read: false,
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    messages.forEach(async (msg) => {
      if (msg.receiver_email === currentUserEmail && !msg.read) {
        await base44.entities.ChatMessage.update(msg.id, { read: true });
      }
    });
  }, [messages, currentUserEmail]);

  return (
    <Card className="border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          Chat with {friendName}
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_email === currentUserEmail;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    isMe
                      ? 'bg-[#3E82FC] text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.created_date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <CardContent className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}