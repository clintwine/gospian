import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageEnrollments() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: classrooms = [] } = useQuery({
    queryKey: ['teacherClassrooms', user?.email],
    queryFn: async () => {
      return await base44.entities.Classroom.filter({ teacher_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollmentRequests', user?.email],
    queryFn: async () => {
      return await base44.entities.ClassroomEnrollment.filter({ 
        teacher_email: user.email 
      });
    },
    enabled: !!user?.email,
  });

  const handleEnrollmentMutation = useMutation({
    mutationFn: async ({ enrollmentId, status, classroomId, studentEmail }) => {
      await base44.entities.ClassroomEnrollment.update(enrollmentId, { status });

      if (status === 'approved') {
        const classroom = classrooms.find(c => c.id === classroomId);
        if (classroom) {
          const updatedEmails = [...(classroom.student_emails || []), studentEmail];
          await base44.entities.Classroom.update(classroomId, {
            student_emails: updatedEmails,
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['enrollmentRequests']);
      queryClient.invalidateQueries(['teacherClassrooms']);
      toast.success(variables.status === 'approved' ? 'Student approved!' : 'Request rejected');
    },
    onError: () => {
      toast.error('Failed to update enrollment');
    },
  });

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const approvedEnrollments = enrollments.filter(e => e.status === 'approved' || e.status === 'enrolled');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Manage Enrollments
        </h1>
        <p className="text-muted-foreground">
          Review and approve student join requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingEnrollments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingEnrollments.map((enrollment) => {
              const classroom = classrooms.find(c => c.id === enrollment.classroom_id);
              return (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{enrollment.student_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{enrollment.student_email}</p>
                      </div>
                      <Badge variant="outline" className="text-[#E9C46A]">
                        {classroom?.classroom_name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {enrollment.message && (
                      <div className="bg-[#D7E5FF] dark:bg-slate-800 rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">Message:</p>
                        <p className="text-sm text-muted-foreground">{enrollment.message}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#2A9D8F]"
                        onClick={() => handleEnrollmentMutation.mutate({
                          enrollmentId: enrollment.id,
                          status: 'approved',
                          classroomId: enrollment.classroom_id,
                          studentEmail: enrollment.student_email,
                        })}
                        disabled={handleEnrollmentMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-[#E76F51] border-[#E76F51]"
                        onClick={() => handleEnrollmentMutation.mutate({
                          enrollmentId: enrollment.id,
                          status: 'rejected',
                          classroomId: enrollment.classroom_id,
                          studentEmail: enrollment.student_email,
                        })}
                        disabled={handleEnrollmentMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {approvedEnrollments.map((enrollment) => {
              const classroom = classrooms.find(c => c.id === enrollment.classroom_id);
              return (
                <Card key={enrollment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{enrollment.student_name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.student_email}</p>
                        <p className="text-xs text-muted-foreground mt-1">{classroom?.classroom_name}</p>
                      </div>
                      <Badge variant="outline" className="bg-[#2A9D8F]/10 text-[#2A9D8F]">
                        Enrolled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}