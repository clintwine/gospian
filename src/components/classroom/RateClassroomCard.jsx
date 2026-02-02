import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RateClassroomCard({ classroom, studentEmail }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const queryClient = useQueryClient();

  const { data: existingRating } = useQuery({
    queryKey: ['myClassroomRating', classroom.id, studentEmail],
    queryFn: async () => {
      const ratings = await base44.entities.ClassroomRating.filter({
        classroom_id: classroom.id,
        student_email: studentEmail,
      });
      return ratings[0] || null;
    },
    enabled: !!classroom?.id && !!studentEmail,
  });

  React.useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setReview(existingRating.review || '');
    }
  }, [existingRating]);

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      if (rating === 0) {
        throw new Error('Please select a rating');
      }

      if (existingRating) {
        // Update existing rating
        await base44.entities.ClassroomRating.update(existingRating.id, {
          rating,
          review,
        });
      } else {
        // Create new rating
        await base44.entities.ClassroomRating.create({
          classroom_id: classroom.id,
          student_email: studentEmail,
          rating,
          review,
        });
      }

      // Update classroom average rating
      const allRatings = await base44.entities.ClassroomRating.filter({
        classroom_id: classroom.id,
      });
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      
      await base44.entities.Classroom.update(classroom.id, {
        rating: avgRating,
        rating_count: allRatings.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myClassroomRating']);
      queryClient.invalidateQueries(['classroom']);
      queryClient.invalidateQueries(['publicClassrooms']);
      toast.success(existingRating ? 'Rating updated!' : 'Thank you for your rating!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit rating');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rate This Classroom</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-[#E9C46A] text-[#E9C46A]'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        )}

        <div className="space-y-2">
          <Textarea
            placeholder="Share your experience (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={() => submitRatingMutation.mutate()}
          disabled={submitRatingMutation.isPending || rating === 0}
          className="w-full bg-[#E9C46A] hover:bg-[#E9C46A]/90 text-white"
        >
          {existingRating ? 'Update Rating' : 'Submit Rating'}
        </Button>

        {existingRating && (
          <p className="text-xs text-center text-muted-foreground">
            You rated this classroom on {new Date(existingRating.created_date).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}