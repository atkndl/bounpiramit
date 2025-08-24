import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { useLikes } from "@/hooks/useLikes";
import { useFavorites } from "@/hooks/useFavorites";

interface PostCardProps {
  postId: string;
  authorName: string;
  authorAvatar?: string;
  authorEmail: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  imageUrls?: string[];
}

export function PostCard({
  postId,
  authorName,
  authorAvatar,
  authorEmail,
  content,
  timestamp,
  likes,
  comments,
  imageUrls,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  
  const { toggleLike, isLiked, getLikeCount } = useLikes();
  const { toggleFavorite, isFavorited } = useFavorites();

  useEffect(() => {
    const checkStatus = async () => {
      const [likedStatus, savedStatus, currentLikeCount] = await Promise.all([
        isLiked(postId),
        isFavorited(postId, 'post'),
        getLikeCount(postId)
      ]);
      
      setLiked(likedStatus);
      setSaved(savedStatus);
      setLikeCount(currentLikeCount);
    };
    
    checkStatus();
  }, [postId]);

  const handleLike = async () => {
    const result = await toggleLike(postId);
    if (result?.success) {
      const newLikeCount = await getLikeCount(postId);
      const newLikedStatus = await isLiked(postId);
      setLiked(newLikedStatus);
      setLikeCount(newLikeCount);
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
          <Avatar className="w-10 h-10">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback className="bg-primary text-white">
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{authorName}</h4>
            <p className="text-sm text-muted-foreground">{authorEmail}</p>
          </div>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{content}</p>
        
        {/* Display images if any */}
        {imageUrls && imageUrls.length > 0 && (
          <div className={`grid gap-2 ${imageUrls.length === 1 ? 'grid-cols-1' : imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} rounded-lg overflow-hidden`}>
            {imageUrls.slice(0, 4).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Post image ${index + 1}`}
                className="w-full h-32 object-contain bg-muted rounded-lg hover:opacity-90 transition-opacity"
              />
            ))}
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
      </CardContent>
    </Card>
  );
}