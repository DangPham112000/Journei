import { Typography, Grid, CircularProgress, Box, Divider } from '@mui/material';
import { useGetJoinedEventsQuery, useGetFollowedEventsQuery, useLeaveEventMutation, useUnfollowEventMutation, useJoinEventMutation, useMeQuery } from '../../__generated__/graphql';
import EventCard from '../../components/EventCard';
import EventDetailsSideSheet from '../../components/EventDetailsSideSheet';
import { useState } from 'react';
import type { GetEventsQuery } from '../../__generated__/graphql';

type EventType = GetEventsQuery['events'][0];

export default function LandingPage() {
  const { data: meData } = useMeQuery();

  const { data: joinedData, loading: loadingJoined, refetch: refetchJoined } = useGetJoinedEventsQuery();
  const { data: followedData, loading: loadingFollowed, refetch: refetchFollowed } = useGetFollowedEventsQuery();

  const [leaveEvent] = useLeaveEventMutation();
  const [unfollowEvent] = useUnfollowEventMutation();
  const [joinEvent] = useJoinEventMutation();

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  if (loadingJoined || loadingFollowed) return <Box className="flex justify-center mt-8"><CircularProgress /></Box>;

  const refetchAll = () => {
    refetchJoined();
    refetchFollowed();
  };

  const handleLeave = async (id: string) => {
    try {
      await leaveEvent({ variables: { id } });
      refetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnfollow = async (id: string) => {
    try {
      await unfollowEvent({ variables: { id } });
      refetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async (id: string) => {
    try {
      await joinEvent({ variables: { id } });
      refetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>My Dashboard</Typography>

      <Box className="mb-8">
        <Typography variant="h5" gutterBottom className="mt-6 mb-4">Events I Joined</Typography>
        <Grid container spacing={3}>
          {joinedData?.joinedEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard
                event={event}
                currentUserId={meData?.me?.id || ''}
                onLeave={handleLeave}
                onClick={setSelectedEvent}
              />
            </Grid>
          ))}
        </Grid>
        {(!joinedData?.joinedEvents || joinedData.joinedEvents.length === 0) && (
          <Typography variant="body1" className="text-gray-500 mt-2">You haven't joined any events yet.</Typography>
        )}
      </Box>

      <Divider className="my-8" />

      <Box className="mb-8">
        <Typography variant="h5" gutterBottom className="mt-6 mb-4">Events I Followed</Typography>
        <Grid container spacing={3}>
          {followedData?.followedEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard
                event={event}
                currentUserId={meData?.me?.id || ''}
                onJoin={handleJoin}
                onUnfollow={handleUnfollow}
                onClick={setSelectedEvent}
              />
            </Grid>
          ))}
        </Grid>
        {(!followedData?.followedEvents || followedData.followedEvents.length === 0) && (
          <Typography variant="body1" className="text-gray-500 mt-2">You aren't following any events right now.</Typography>
        )}
      </Box>

      <EventDetailsSideSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
