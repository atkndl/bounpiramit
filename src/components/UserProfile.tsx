import { useDisplayName } from '@/hooks/useDisplayName';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// User Profile Component for cards
export function UserProfile({ userId }: { userId: string }) {
  const { displayName, avatarUrl, isLoading } = useDisplayName(userId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
        <div className="w-16 h-3 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-6 h-6">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-xs">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-muted-foreground font-medium">
        {displayName}
      </span>
    </div>
  );
}