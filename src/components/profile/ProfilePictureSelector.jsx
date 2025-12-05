import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=c7f3d4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffe4e1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=e3f2fd',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy&backgroundColor=fff4e6',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=smile&backgroundColor=e8f5e9',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cool&backgroundColor=f3e5f5',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=laugh&backgroundColor=e1f5fe',
  'https://api.dicebear.com/7.x/bottts/svg?seed=robot1&backgroundColor=ffebee',
  'https://api.dicebear.com/7.x/bottts/svg?seed=robot2&backgroundColor=f1f8e9',
  'https://api.dicebear.com/7.x/bottts/svg?seed=robot3&backgroundColor=fce4ec',
  'https://api.dicebear.com/7.x/shapes/svg?seed=shape1&backgroundColor=fff9c4',
  'https://api.dicebear.com/7.x/shapes/svg?seed=shape2&backgroundColor=e0f2f1',
  'https://api.dicebear.com/7.x/shapes/svg?seed=shape3&backgroundColor=f8bbd0',
  'https://api.dicebear.com/7.x/identicon/svg?seed=pixel1&backgroundColor=ede7f6',
  'https://api.dicebear.com/7.x/identicon/svg?seed=pixel2&backgroundColor=fff3e0',
];

export default function ProfilePictureSelector({ currentPicture, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await onUpdate(file_url);
      setOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectDefault = async (url) => {
    await onUpdate(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#3E82FC] rounded-full flex items-center justify-center hover:bg-[#243B73] transition-colors shadow-lg">
          <Upload className="w-4 h-4 text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Upload Custom Image</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1 text-sm border rounded-lg p-2"
              />
              {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Or Choose a Default</label>
            <div className="grid grid-cols-5 gap-3">
              {DEFAULT_AVATARS.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectDefault(url)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 hover:border-[#3E82FC] transition-all hover:scale-105 ${
                    currentPicture === url ? 'border-[#3E82FC] ring-2 ring-[#3E82FC] ring-offset-2' : 'border-gray-200'
                  }`}
                >
                  <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}