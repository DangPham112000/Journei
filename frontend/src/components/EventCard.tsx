import type { GetEventsQuery } from '../__generated__/graphql';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

type EventType = GetEventsQuery['events'][0];

interface EventCardProps {
  event: EventType;
  currentUserId: string;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  onFollow?: (id: string) => void;
  onUnfollow?: (id: string) => void;
  onClick?: (event: EventType) => void;
}

export default function EventCard({ event, currentUserId, onJoin, onLeave, onFollow, onUnfollow, onClick }: EventCardProps) {
  const isCreator = event.creator.id === currentUserId;
  const isJoined = event.participants.some(p => p.id === currentUserId);
  const isFollowed = event.followers.some(f => f.id === currentUserId);

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full" onClick={() => onClick?.(event)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
            <div className="flex flex-wrap gap-1 shrink-0 justify-end">
                {isCreator && <Badge variant="default" className="text-[10px] px-1.5 py-0">Creator</Badge>}
                {isJoined && <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0">Joined</Badge>}
                {!isJoined && isFollowed && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Followed</Badge>}
            </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarDays className="mr-1.5 h-4 w-4 shrink-0" />
          <span className="truncate">
            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description || 'No description provided.'}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex flex-wrap gap-2">
        <div onClick={e => e.stopPropagation()} className="w-full flex gap-2">
            {!isJoined && onJoin && (
                <Button size="sm" className="flex-1" onClick={() => onJoin(event.id)}>Join</Button>
            )}
            {isJoined && onLeave && (
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => onLeave(event.id)}>Leave</Button>
            )}
            {!isJoined && !isFollowed && onFollow && (
                <Button size="sm" variant="outline" className="flex-1" onClick={() => onFollow(event.id)}>Follow</Button>
            )}
            {!isJoined && isFollowed && onUnfollow && (
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => onUnfollow(event.id)}>Unfollow</Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
