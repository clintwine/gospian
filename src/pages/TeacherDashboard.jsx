import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, Plus, Copy, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function TeacherDashboard() {
  const [newClassroomName, setNewClassroomName] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: classrooms = [] } = useQuery({
    queryKey: ['classrooms', user?.email],
    queryFn: async () => {
      return await base44.entities.Classroom.filter({ teacher_email: user.email });
    },
    enabled: !!user?.email,
  });

  const createClassroomMutation = useMutation({
    mutationFn: async (name) => {
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return await base44.entities.Classroom.create({
        classroom_name: name,
        teacher_email: user.email,
        teacher_name: user.full_name,
        description: '',
        join_code: joinCode,
        student_emails: [],
        active: true,
        is_public: true,
        is_paid: false,
        rating: 0,
        rating_count: 0,
        total_enrollments: 0,
        requires_approval: false,
        category: 'general',
        level: 'all_levels',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['classrooms']);
      setNewClassroomName('');
      toast.success('Classroom created successfully!');
    },
  });

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Join code copied!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleCreateClassroom = () => {
    if (!newClassroomName.trim()) return;
    createClassroomMutation.mutate(newClassroomName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your classrooms and track student progress
        </p>
      </div>

      <Tabs defaultValue="classrooms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="classrooms">
            <Users className="w-4 h-4 mr-2" />
            Classrooms
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BookOpen className="w-4 h-4 mr-2" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classrooms" className="space-y-6">
          {/* Create Classroom */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Classroom</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Classroom name (e.g., Music Theory 101)"
                  value={newClassroomName}
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateClassroom()}
                />
                <Button
                  onClick={handleCreateClassroom}
                  disabled={!newClassroomName.trim() || createClassroomMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Classrooms List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => (
              <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    {classroom.classroom_name}
                    <Badge variant="outline">
                      {classroom.student_emails?.length || 0} students
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-[#D7E5FF] dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Join Code</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold text-[#243B73] dark:text-[#3E82FC]">
                        {classroom.join_code}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyJoinCode(classroom.join_code)}
                      >
                        {copiedCode === classroom.join_code ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = createPageUrl(`ClassroomDetails?id=${classroom.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {classrooms.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No classrooms yet. Create your first classroom to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Assignment management coming soon. Create a classroom first!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}