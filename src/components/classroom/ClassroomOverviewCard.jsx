import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Copy, Check } from 'lucide-react';

export default function ClassroomOverviewCard({ classroom, onUpdate, isLoading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    classroom_name: classroom?.classroom_name || '',
    description: classroom?.description || '',
  });
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom?.join_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Classroom Details</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Classroom Name</label>
              <Input
                value={editData.classroom_name}
                onChange={(e) => setEditData({ ...editData, classroom_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#3E82FC]"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Classroom Name</p>
              <p className="text-lg font-semibold">{classroom?.classroom_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p>
              <p className="text-sm text-muted-foreground">{classroom?.description || 'No description'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Join Code</p>
              <div className="flex items-center gap-2 p-3 bg-[#D7E5FF]/30 dark:bg-slate-800 rounded-lg">
                <code className="flex-1 font-mono text-sm font-bold">{classroom?.join_code}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#2A9D8F]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}