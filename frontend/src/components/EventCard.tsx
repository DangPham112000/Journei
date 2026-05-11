import { Card, CardContent, Typography, CardActions, Button, Chip, Box } from '@mui/material';
import type { GetEventsQuery } from '../__generated__/graphql';

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
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick?.(event)}>
      <CardContent>
        <Box className="flex justify-between items-start mb-2">
            <Typography variant="h6" component="div">
            {event.title}
            </Typography>
            <Box>
                {isCreator && <Chip label="Creator" size="small" color="primary" className="mr-1" />}
                {isJoined && <Chip label="Joined" size="small" color="success" className="mr-1" />}
                {!isJoined && isFollowed && <Chip label="Followed" size="small" color="secondary" className="mr-1" />}
            </Box>
        </Box>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" noWrap>
          {event.description || 'No description provided.'}
        </Typography>
      </CardContent>
      <CardActions>
        <Box onClick={e => e.stopPropagation()}>
            {!isJoined && onJoin && (
                <Button size="small" onClick={() => onJoin(event.id)}>Join</Button>
            )}
            {isJoined && onLeave && (
                <Button size="small" color="error" onClick={() => onLeave(event.id)}>Leave</Button>
            )}
            {!isJoined && !isFollowed && onFollow && (
                <Button size="small" onClick={() => onFollow(event.id)}>Follow</Button>
            )}
            {!isJoined && isFollowed && onUnfollow && (
                <Button size="small" color="warning" onClick={() => onUnfollow(event.id)}>Unfollow</Button>
            )}
        </Box>
      </CardActions>
    </Card>
  );
}
