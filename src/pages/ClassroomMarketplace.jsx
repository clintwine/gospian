import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Users, 
  Star, 
  DollarSign, 
  BookOpen,
  Filter,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import JoinClassroomModal from '@/components/classroom/JoinClassroomModal';

export default function ClassroomMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: classrooms = [], isLoading } = useQuery({
    queryKey: ['publicClassrooms'],
    queryFn: async () => {
      const all = await base44.entities.Classroom.filter({ 
        is_public: true,
        active: true 
      });
      return all;
    },
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['myEnrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ClassroomEnrollment.filter({ 
        student_email: user.email 
      });
    },
    enabled: !!user?.email,
  });

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = classroom.classroom_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classroom.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || classroom.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || classroom.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleJoinClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    setShowJoinModal(true);
  };

  const isEnrolled = (classroomId) => {
    return myEnrollments.some(e => 
      e.classroom_id === classroomId && 
      (e.status === 'enrolled' || e.status === 'approved')
    );
  };

  const hasPendingRequest = (classroomId) => {
    return myEnrollments.some(e => 
      e.classroom_id === classroomId && 
      e.status === 'pending'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
          Classroom Marketplace
        </h1>
        <p className="text-muted-foreground">
          Discover and join music education classrooms
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search classrooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ear_training">Ear Training</SelectItem>
                <SelectItem value="music_theory">Music Theory</SelectItem>
                <SelectItem value="sight_reading">Sight Reading</SelectItem>
                <SelectItem value="rhythm">Rhythm</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="all_levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Classrooms</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="my">My Enrollments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredClassrooms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No classrooms found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClassrooms.map((classroom) => (
                <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{classroom.classroom_name}</CardTitle>
                      {classroom.is_paid && (
                        <Badge variant="outline" className="bg-[#E9C46A]/10 text-[#E9C46A] border-[#E9C46A]">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {classroom.price} {classroom.currency}
                        </Badge>
                      )}
                      {!classroom.is_paid && (
                        <Badge variant="outline" className="bg-[#2A9D8F]/10 text-[#2A9D8F]">
                          Free
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {classroom.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {classroom.student_emails?.length || 0} students
                      </div>
                      {classroom.rating > 0 && (
                        <div className="flex items-center gap-1 text-[#E9C46A]">
                          <Star className="w-4 h-4 fill-current" />
                          {classroom.rating.toFixed(1)} ({classroom.rating_count})
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {classroom.category?.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {classroom.level?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Instructor: {classroom.teacher_name || classroom.teacher_email}</p>
                    </div>

                    {isEnrolled(classroom.id) ? (
                      <Link to={createPageUrl(`ClassroomDetails?id=${classroom.id}`)}>
                        <Button className="w-full" variant="outline">
                          View Classroom
                        </Button>
                      </Link>
                    ) : hasPendingRequest(classroom.id) ? (
                      <Button className="w-full" disabled>
                        Request Pending
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-[#3E82FC]"
                        onClick={() => handleJoinClassroom(classroom)}
                      >
                        {classroom.requires_approval ? 'Request to Join' : 'Join Now'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="free">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClassrooms.filter(c => !c.is_paid).map((classroom) => (
              <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{classroom.classroom_name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {classroom.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-[#2A9D8F]"
                    onClick={() => handleJoinClassroom(classroom)}
                    disabled={isEnrolled(classroom.id) || hasPendingRequest(classroom.id)}
                  >
                    {isEnrolled(classroom.id) ? 'Enrolled' : 
                     hasPendingRequest(classroom.id) ? 'Pending' : 'Join Free'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paid">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClassrooms.filter(c => c.is_paid).map((classroom) => (
              <Card key={classroom.id} className="hover:shadow-lg transition-shadow border-[#E9C46A]/30">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{classroom.classroom_name}</CardTitle>
                    <Badge className="bg-[#E9C46A] text-white">
                      {classroom.price} {classroom.currency}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {classroom.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-[#E9C46A] hover:bg-[#E9C46A]/90 text-white"
                    onClick={() => handleJoinClassroom(classroom)}
                    disabled={isEnrolled(classroom.id)}
                  >
                    {isEnrolled(classroom.id) ? 'Enrolled' : `Enroll for ${classroom.price} ${classroom.currency}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEnrollments
              .filter(e => e.status === 'enrolled' || e.status === 'approved')
              .map((enrollment) => {
                const classroom = classrooms.find(c => c.id === enrollment.classroom_id);
                if (!classroom) return null;
                
                return (
                  <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{classroom.classroom_name}</CardTitle>
                      <CardDescription>{classroom.teacher_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link to={createPageUrl(`ClassroomDetails?id=${classroom.id}`)}>
                        <Button className="w-full" variant="outline">
                          Go to Classroom
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Join Modal */}
      {selectedClassroom && (
        <JoinClassroomModal
          open={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedClassroom(null);
          }}
          classroom={selectedClassroom}
          currentUser={user}
          onSuccess={() => {
            queryClient.invalidateQueries(['myEnrollments']);
            queryClient.invalidateQueries(['publicClassrooms']);
          }}
        />
      )}
    </div>
  );
}