import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackAdmin() {
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.Feedback.list('-created_date', 100);
    },
    enabled: user?.role === 'admin',
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.asServiceRole.entities.Feedback.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
  });

  const filteredFeedbacks = statusFilter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.status === statusFilter);

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-500',
      'High': 'bg-orange-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-blue-500',
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': Clock,
      'reviewed': Lightbulb,
      'in_progress': AlertCircle,
      'completed': CheckCircle2,
      'rejected': XCircle,
    };
    return icons[status] || Clock;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You need admin access to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Feedback Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and manage user suggestions
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({feedbacks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({feedbacks.filter(f => f.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No feedback yet</h3>
              <p className="text-muted-foreground">
                User suggestions will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedbacks.map((feedback) => {
            const StatusIcon = getStatusIcon(feedback.status);
            
            return (
              <Card key={feedback.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getPriorityColor(feedback.priority)} text-white border-0`}>
                          {feedback.priority}
                        </Badge>
                        <Badge variant="outline">{feedback.category}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {feedback.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{feedback.summary}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        From page: <span className="font-semibold">{feedback.page}</span> • 
                        By: {feedback.created_by} • 
                        {new Date(feedback.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Select 
                      value={feedback.status} 
                      onValueChange={(status) => updateStatusMutation.mutate({ id: feedback.id, status })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Original Suggestion:</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{feedback.suggestion}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">AI Analysis:</p>
                      <p className="text-sm text-muted-foreground">{feedback.analysis}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}