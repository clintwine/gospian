import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from 'lucide-react';
import { toast } from "sonner";

const INSTRUMENTS = ['Piano', 'Guitar', 'Bass', 'Drums', 'Violin', 'Saxophone', 'Trumpet', 'Flute', 'Vocals', 'Cello'];
const GENRES = ['Classical', 'Jazz', 'Rock', 'Pop', 'Blues', 'Electronic', 'Hip Hop', 'R&B', 'Country', 'Metal'];

export default function ProfileEditor({ user, onClose }) {
  const [bio, setBio] = useState(user?.bio || '');
  const [instruments, setInstruments] = useState(user?.favorite_instruments || []);
  const [genres, setGenres] = useState(user?.favorite_genres || []);
  const [customInstrument, setCustomInstrument] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Profile updated!');
      onClose();
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      bio,
      favorite_instruments: instruments,
      favorite_genres: genres,
    });
  };

  const addInstrument = (instrument) => {
    if (!instruments.includes(instrument)) {
      setInstruments([...instruments, instrument]);
    }
  };

  const addGenre = (genre) => {
    if (!genres.includes(genre)) {
      setGenres([...genres, genre]);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <Label>Bio</Label>
        <Textarea
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">{bio.length}/200</p>
      </div>

      <div>
        <Label>Favorite Instruments</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {instruments.map((inst) => (
            <Badge key={inst} className="gap-1">
              {inst}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setInstruments(instruments.filter(i => i !== inst))}
              />
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.filter(i => !instruments.includes(i)).map((inst) => (
            <Button
              key={inst}
              variant="outline"
              size="sm"
              onClick={() => addInstrument(inst)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {inst}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Custom instrument"
            value={customInstrument}
            onChange={(e) => setCustomInstrument(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customInstrument.trim()) {
                addInstrument(customInstrument.trim());
                setCustomInstrument('');
              }
            }}
          />
        </div>
      </div>

      <div>
        <Label>Favorite Genres</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {genres.map((genre) => (
            <Badge key={genre} className="gap-1">
              {genre}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setGenres(genres.filter(g => g !== genre))}
              />
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.filter(g => !genres.includes(g)).map((genre) => (
            <Button
              key={genre}
              variant="outline"
              size="sm"
              onClick={() => addGenre(genre)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {genre}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Custom genre"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customGenre.trim()) {
                addGenre(customGenre.trim());
                setCustomGenre('');
              }
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">Save Changes</Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}