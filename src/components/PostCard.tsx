import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { ImageGallery } from "@/components/ImageGallery";
import { CommentSection } from "@/components/CommentSection";
import { ProfilePopover } from "@/components/ProfilePopover";
import { useLikes } from "@/hooks/useLikes";
import { useFavorites } from "@/hooks/useFavorites";
import { useDisplayName } from "@/hooks/useDisplayName";
import { supabase } from "@/integrations/supabase/client";

interface PostCardProps {
  postId: string;
  authorId: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  imageUrls?: string[] | null;
}

export function PostCard({
  postId,
  authorId,
  content,
  timestamp,
  likes,
  comments,
  imageUrls,
}: PostCardProps) {
  const { displayName, showEmail, avatarUrl, email, isLoading } = useDisplayName(authorId);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [showComments, setShowComments] = useState(false);
  
  const { toggleLike, isLiked, getLikeCount } = useLikes();
  const { toggleFavorite, isFavorited } = useFavorites();

  useEffect(() => {
    const checkStatus = async () => {
      const [likedStatus, savedStatus] = await Promise.all([
        isLiked(postId),
        isFavorited(postId, 'post'),
      ]);

      setLiked(likedStatus);
      setSaved(savedStatus);
      // İlk yüklemede props'tan gelen değeri kullan (0'dan başlasın)
      setLikeCount(likes || 0);
    };

    checkStatus();
  }, [postId, likes]);

  // Set up real-time subscription for likes
  useEffect(() => {
    const channel = supabase
      .channel(`post-${postId}-updates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          // Refresh like count and status when likes change
          const [newLikeCount, newLikedStatus] = await Promise.all([
            getLikeCount(postId),
            isLiked(postId)
          ]);
          setLikeCount(newLikeCount);
          setLiked(newLikedStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, getLikeCount, isLiked]);

  const handleLike = async () => {
    // Optimistic update for better UX
    const wasLiked = liked;
    const currentCount = likeCount;
    
    // Update UI immediately
    setLiked(!wasLiked);
    setLikeCount(wasLiked ? currentCount - 1 : currentCount + 1);
    
    // Make API call
    const result = await toggleLike(postId);
    if (!result?.success) {
      // Revert on failure
      setLiked(wasLiked);
      setLikeCount(currentCount);
    }
  };

  const handleSave = async () => {
    await toggleFavorite(postId, 'post');
    const newSavedStatus = await isFavorited(postId, 'post');
    setSaved(newSavedStatus);
  };

  return (
    <Card className="hover:shadow-card transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <ProfilePopover userId={authorId}>
            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <AvatarImage src={avatarUrl || "/placeholder-avatar.png"} />
              <AvatarFallback className="bg-primary text-white">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </ProfilePopover>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{displayName}</h4>
            {showEmail && email && (
              <p className="text-sm text-muted-foreground">{email}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{content}</p>
        
        {/* Display images if any */}
        {imageUrls && imageUrls.length > 0 && (
          <div className="max-w-md mx-auto">
            <ImageGallery images={imageUrls} title="Post görseli" />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                liked ? "text-success hover:text-success" : "text-muted-foreground"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-muted-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`${
              saved ? "text-success hover:text-success" : "text-muted-foreground"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-4 border-t">
            <CommentSection postId={postId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}