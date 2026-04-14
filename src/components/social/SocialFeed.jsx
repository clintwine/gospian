import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Trophy, User, Send } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function SocialFeed({ currentUser, friends }) {
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState({});
  const queryClient = useQueryClient();

  const friendEmails = friends?.map(f => 
    f.user_email === currentUser?.email ? f.friend_email : f.user_email
  ) || [];

  const { data: posts = [] } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: async () => {
      const myPosts = await base44.entities.SocialPost.filter({ created_by: currentUser.email }, '-created_date', 50);
      const friendPostsArrays = await Promise.all(
        friendEmails.map((email) => base44.entities.SocialPost.filter({ created_by: email }, '-created_date', 20))
      );
      const allPosts = [...myPosts, ...friendPostsArrays.flat()];
      return allPosts
        .filter((post, index, arr) => arr.findIndex((p) => p.id === post.id) === index)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!currentUser?.email,
    refetchInterval: 10000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listUsers');
      return data.users || [];
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.SocialPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries(['socialPosts']);
      setNewPost('');
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async ({ postId, likes }) => {
      await base44.entities.SocialPost.update(postId, { likes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['socialPosts']);
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, comments }) => {
      await base44.entities.SocialPost.update(postId, { comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['socialPosts']);
      setCommentText({});
    },
  });

  const handleLike = (post) => {
    const likes = post.likes || [];
    const newLikes = likes.includes(currentUser.email)
      ? likes.filter(email => email !== currentUser.email)
      : [...likes, currentUser.email];
    likePostMutation.mutate({ postId: post.id, likes: newLikes });
  };

  const handleComment = (post) => {
    const text = commentText[post.id];
    if (!text?.trim()) return;

    const comments = post.comments || [];
    commentMutation.mutate({
      postId: post.id,
      comments: [
        ...comments,
        {
          user_email: currentUser.email,
          comment: text.trim(),
          created_at: new Date().toISOString(),
        },
      ],
    });
  };

  const getUsername = (email) => {
    const user = allUsers.find(u => u.email === email);
    return user?.full_name || email.split('@')[0];
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <Textarea
            placeholder="Share your musical journey..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="mb-3"
          />
          <Button
            onClick={() => createPostMutation.mutate({ content: newPost, type: 'status' })}
            disabled={!newPost.trim()}
            className="w-full"
          >
            Post
          </Button>
        </CardContent>
      </Card>

      {/* Feed */}
      {posts.map((post) => {
        const isLiked = (post.likes || []).includes(currentUser?.email);
        const likeCount = (post.likes || []).length;
        const comments = post.comments || [];

        return (
          <Card key={post.id} className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D7E5FF] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#243B73]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{getUsername(post.created_by)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_date).toLocaleString()}
                  </p>
                </div>
                {post.type !== 'status' && (
                  <Badge className="bg-[#E9C46A]">
                    <Trophy className="w-3 h-3 mr-1" />
                    {post.type}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post)}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount > 0 && likeCount}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {comments.length > 0 && comments.length}
                </Button>
              </div>

              {/* Comments */}
              {comments.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  {comments.map((comment, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-semibold mr-2">
                        {getUsername(comment.user_email)}
                      </span>
                      <span>{comment.comment}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText[post.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post)}
                />
                <Button size="icon" onClick={() => handleComment(post)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}