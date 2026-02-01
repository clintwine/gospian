import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Link as LinkIcon } from 'lucide-react';

export default function AddResourceForm({ open, onClose, classroomId }) {
  const [resourceType, setResourceType] = useState('link');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createResourceMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Resource.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', classroomId] });
      resetForm();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLinkUrl('');
    setFile(null);
    setTags('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (resourceType === 'link' && !linkUrl.trim()) {
      setError('URL is required for link resources');
      return;
    }

    if (resourceType === 'file' && !file) {
      setError('File is required for file resources');
      return;
    }

    try {
      let fileUrl = null;

      if (file) {
        const { url: uploadedUrl } = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploadedUrl;
      }

      const resourceData = {
        title: title.trim(),
        description: description.trim() || null,
        classroom_id: classroomId,
        teacher_email: (await base44.auth.me()).email,
        resource_type: resourceType,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t),
      };

      if (resourceType === 'link') {
        resourceData.link_url = linkUrl.trim();
      } else if (resourceType === 'file') {
        resourceData.file_url = fileUrl;
      }

      await createResourceMutation.mutateAsync(resourceData);
    } catch (err) {
      setError(err.message || 'Failed to create resource');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>
            Share a file or link with your students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Resource Type</label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Title *</label>
            <Input
              placeholder="Resource title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {resourceType === 'link' && (
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                URL *
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  setError('');
                }}
              />
            </div>
          )}

          {resourceType === 'file' && (
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Upload className="w-4 h-4" />
                File *
              </label>
              <input
                type="file"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError('');
                }}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
            <Input
              placeholder="theory, practice, advanced"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-[#E76F51]">{error}</p>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={createResourceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#3E82FC]"
              disabled={createResourceMutation.isPending}
            >
              {createResourceMutation.isPending ? 'Adding...' : 'Add Resource'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}