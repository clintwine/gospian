import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, X, Users, Trophy, MessageCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotificationBell({ userEmail }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: async () => {
      return await base44.entities.Notification.filter(
        { recipient_email: userEmail },
        '-created_date',
        50
      );
    },
    enabled: !!userEmail,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const getIcon = (type) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return <Users className="w-5 h-5 text-[#3E82FC]" />;
      case 'milestone':
      case 'achievement':
        return <Trophy className="w-5 h-5 text-[#E9C46A]" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-[#2A9D8F]" />;
      case 'challenge':
        return <Award className="w-5 h-5 text-[#E76F51]" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#E76F51]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border transition-all ${
                  notif.read ? 'bg-background' : 'bg-[#D7E5FF]/20 border-[#3E82FC]/30'
                }`}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.created_date).toLocaleString()}
                      </span>
                      {notif.action_url && (
                        <Link
                          to={notif.action_url}
                          onClick={() => {
                            markAsReadMutation.mutate(notif.id);
                            setOpen(false);
                          }}
                        >
                          <Button size="sm" variant="link" className="h-auto p-0 text-xs">
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => deleteNotificationMutation.mutate(notif.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}