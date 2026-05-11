import { Typography, Grid, CircularProgress, Box } from '@mui/material';
import { useGetEventsQuery, useJoinEventMutation, useFollowEventMutation, useMeQuery } from '../../__generated__/graphql';
import EventCard from '../../components/EventCard';
import EventDetailsSideSheet from '../../components/EventDetailsSideSheet';
import { useState } from 'react';
import type { GetEventsQuery } from '../../__generated__/graphql';

type EventType = GetEventsQuery['events'][0];

export default function DiscoverPage() {
  const { data: meData } = useMeQuery();
  const { data, loading, error, refetch } = useGetEventsQuery();
  const [joinEvent] = useJoinEventMutation();
  const [followEvent] = useFollowEventMutation();

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  if (loading) return <Box className="flex justify-center mt-8"><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error loading events</Typography>;

  const handleJoin = async (id: string) => {
    try {
      await joinEvent({ variables: { id } });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollow = async (id: string) => {
    try {
      await followEvent({ variables: { id } });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Discover Events</Typography>

      <Grid container spacing={3}>
        {data?.events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <EventCard
              event={event}
              currentUserId={meData?.me?.id || ''}
              onJoin={handleJoin}
              onFollow={handleFollow}
              onClick={setSelectedEvent}
            />
          </Grid>
        ))}
      </Grid>

      {data?.events.length === 0 && (
        <Typography variant="body1" className="text-gray-500 mt-4">No events found.</Typography>
      )}

      <EventDetailsSideSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
