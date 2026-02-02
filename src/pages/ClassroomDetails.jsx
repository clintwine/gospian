import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ClassroomOverviewCard from '@/components/classroom/ClassroomOverviewCard';
import StudentManagementPanel from '@/components/classroom/StudentManagementPanel';
import StudentProgressView from '@/components/classroom/StudentProgressView';
import ResourceList from '@/components/classroom/ResourceList';
import AssignmentList from '@/components/classroom/AssignmentList';
import ClassroomPricingSettings from '@/components/classroom/ClassroomPricingSettings';
import RateClassroomCard from '@/components/classroom/RateClassroomCard';

export default function ClassroomDetails() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const classroomId = urlParams.get('id');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const queryClient = useQueryClient();

  // Fetch classroom data
  const { data: classroom, isLoading: classroomLoading } = useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: async () => {
      if (!classroomId) return null;
      const result = await base44.entities.Classroom.filter({ id: classroomId });
      return result[0] || null;
    },
    enabled: !!classroomId,
  });

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Fetch student details
  const { data: students = [] } = useQuery({
    queryKey: ['classroomStudents', classroom?.student_emails],
    queryFn: async () => {
      if (!classroom?.student_emails || classroom.student_emails.length === 0) {
        return [];
      }

      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => classroom.student_emails.includes(u.email));
    },
    enabled: !!classroom?.student_emails,
  });

  // Fetch student stats for selected student
  const { data: selectedStudentStats } = useQuery({
    queryKey: ['studentStats', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const stats = await base44.entities.UserStats.filter({ created_by: selectedStudent });
      return stats[0] || null;
    },
    enabled: !!selectedStudent,
  });

  // Fetch selected student's exercise results
  const { data: selectedStudentResults = [] } = useQuery({
    queryKey: ['studentResults', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return [];
      return await base44.entities.ExerciseResult.filter(
        { created_by: selectedStudent },
        '-created_date',
        50
      );
    },
    enabled: !!selectedStudent,
  });

  // Fetch resources
  const { data: resources = [] } = useQuery({
    queryKey: ['resources', classroomId],
    queryFn: async () => {
      if (!classroomId) return [];
      return await base44.entities.Resource.filter({ classroom_id: classroomId });
    },
    enabled: !!classroomId,
  });

  // Fetch assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', classroomId],
    queryFn: async () => {
      if (!classroomId) return [];
      const results = await base44.entities.Assignment.filter({ classroom_id: classroomId });
      return results.map(a => ({
        ...a,
        student_count: classroom?.student_emails?.length || 0,
      }));
    },
    enabled: !!classroomId,
  });

  // Update classroom mutation
  const updateClassroomMutation = useMutation({
    mutationFn: async (data) => {
      if (!classroom?.id) return null;
      return base44.entities.Classroom.update(classroom.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
    },
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentEmail) => {
      if (!classroom?.id) return null;
      const updatedEmails = [...(classroom.student_emails || []), studentEmail];
      return base44.entities.Classroom.update(classroom.id, {
        student_emails: updatedEmails,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['classroomStudents'] });
    },
  });

  // Remove student mutation
  const removeStudentMutation = useMutation({
    mutationFn: async (studentEmail) => {
      if (!classroom?.id) return null;
      const updatedEmails = (classroom.student_emails || []).filter(
        e => e !== studentEmail
      );
      return base44.entities.Classroom.update(classroom.id, {
        student_emails: updatedEmails,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
      queryClient.invalidateQueries({ queryKey: ['classroomStudents'] });
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId) => {
      return base44.entities.Resource.delete(resourceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', classroomId] });
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId) => {
      return base44.entities.Assignment.delete(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', classroomId] });
    },
  });

  const selectedStudentData = useMemo(() => {
    return students.find(s => s.email === selectedStudent);
  }, [students, selectedStudent]);

  const isLoading =
    classroomLoading ||
    userLoading ||
    updateClassroomMutation.isPending ||
    addStudentMutation.isPending ||
    removeStudentMutation.isPending;

  if (classroomLoading || userLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">Classroom not found</p>
        <Link to={createPageUrl('TeacherDashboard')}>
          <Button className="bg-[#3E82FC]">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Check if user is the teacher or enrolled student
  const isTeacher = user?.email === classroom.teacher_email;
  const isEnrolledStudent = classroom.student_emails?.includes(user?.email);

  if (!isTeacher && !isEnrolledStudent) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">
          You don't have permission to view this classroom
        </p>
        <Link to={createPageUrl('ClassroomMarketplace')}>
          <Button className="bg-[#3E82FC]">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={createPageUrl(isTeacher ? 'TeacherDashboard' : 'ClassroomMarketplace')}>
          <Button variant="ghost" className="text-muted-foreground hover:text-[#243B73] mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {isTeacher ? 'Dashboard' : 'Marketplace'}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#0A1A2F] dark:text-white">
          {classroom.classroom_name}
        </h1>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          <ClassroomOverviewCard
            classroom={classroom}
            onUpdate={isTeacher ? (data) => updateClassroomMutation.mutate(data) : undefined}
            isLoading={isLoading}
          />

          {isTeacher && (
            <StudentManagementPanel
              students={students}
              onAddStudent={(email) => addStudentMutation.mutate(email)}
              onRemoveStudent={(email) => removeStudentMutation.mutate(email)}
              onViewProgress={(email) => setSelectedStudent(email)}
              isLoading={isLoading}
            />
          )}

          <ResourceList
            resources={resources}
            onDelete={isTeacher ? (id) => deleteResourceMutation.mutate(id) : undefined}
            isLoading={deleteResourceMutation.isPending}
          />
        </div>

        {/* Right Column - Assignments & Settings */}
        <div className="space-y-6">
          <AssignmentList
            assignments={assignments}
            onDelete={isTeacher ? (id) => deleteAssignmentMutation.mutate(id) : undefined}
            isLoading={deleteAssignmentMutation.isPending}
            classroomId={classroomId}
          />

          {isTeacher ? (
            <ClassroomPricingSettings
              classroom={classroom}
              onUpdate={(data) => updateClassroomMutation.mutate(data)}
              isLoading={isLoading}
            />
          ) : (
            <RateClassroomCard
              classroom={classroom}
              studentEmail={user?.email}
            />
          )}
        </div>
      </div>

      {/* Student Progress Modal */}
      <StudentProgressView
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        studentEmail={selectedStudent}
        studentName={selectedStudentData?.full_name || 'Student'}
        stats={selectedStudentStats}
        exerciseResults={selectedStudentResults}
        isLoading={false}
      />
    </div>
  );
}