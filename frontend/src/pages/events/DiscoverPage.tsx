import { useGetEventsQuery, useJoinEventMutation, useFollowEventMutation, useMeQuery } from '../../__generated__/graphql';
import EventCard from '../../components/EventCard';
import EventDetailsSideSheet from '../../components/EventDetailsSideSheet';
import { useState } from 'react';
import type { GetEventsQuery } from '../../__generated__/graphql';
import { Loader2 } from 'lucide-react';

type EventType = GetEventsQuery['events'][0];

export default function DiscoverPage() {
  const { data: meData } = useMeQuery();
  const { data, loading, error, refetch } = useGetEventsQuery();
  const [joinEvent] = useJoinEventMutation();
  const [followEvent] = useFollowEventMutation();

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) return <p className="text-destructive">Error loading events</p>;

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
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Discover Events</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            currentUserId={meData?.me?.id || ''}
            onJoin={handleJoin}
            onFollow={handleFollow}
            onClick={setSelectedEvent}
          />
        ))}
      </div>

      {data?.events.length === 0 && (
        <p className="text-muted-foreground mt-4 text-sm md:text-base">No events found.</p>
      )}

      <EventDetailsSideSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
