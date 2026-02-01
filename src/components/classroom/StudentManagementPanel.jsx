import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddStudentModal from './AddStudentModal';

export default function StudentManagementPanel({
  students,
  onAddStudent,
  onRemoveStudent,
  onViewProgress,
  isLoading,
}) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3E82FC]" />
            <CardTitle>Students ({students?.length || 0})</CardTitle>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#3E82FC]"
            disabled={isLoading}
          >
            Add Student
          </Button>
        </CardHeader>
        <CardContent>
          {students && students.length > 0 ? (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.email}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-[#3E82FC] text-white">
                        {student.full_name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {student.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewProgress(student.email)}
                      className="text-[#3E82FC] hover:text-[#243B73]"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveStudent(student.email)}
                      className="text-[#E76F51] hover:text-[#E76F51]/80"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No students yet</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-[#3E82FC]"
              >
                Add First Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddStudent}
        isLoading={isLoading}
      />
    </>
  );
}