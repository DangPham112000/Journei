import { useGetJoinedEventsQuery, useGetFollowedEventsQuery, useLeaveEventMutation, useUnfollowEventMutation, useJoinEventMutation, useMeQuery } from '../../__generated__/graphql';
import EventCard from '../../components/EventCard';
import EventDetailsSideSheet from '../../components/EventDetailsSideSheet';
import { useState } from 'react';
import type { GetEventsQuery } from '../../__generated__/graphql';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type EventType = GetEventsQuery['events'][0];

export default function LandingPage() {
  const { data: meData } = useMeQuery();

  const { data: joinedData, loading: loadingJoined, refetch: refetchJoined } = useGetJoinedEventsQuery();
  const { data: followedData, loading: loadingFollowed, refetch: refetchFollowed } = useGetFollowedEventsQuery();

  const [leaveEvent] = useLeaveEventMutation();
  const [unfollowEvent] = useUnfollowEventMutation();
  const [joinEvent] = useJoinEventMutation();

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  if (loadingJoined || loadingFollowed) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Events I Joined</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {joinedData?.joinedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={meData?.me?.id || ''}
              onLeave={handleLeave}
              onClick={setSelectedEvent}
            />
          ))}
        </div>
        {(!joinedData?.joinedEvents || joinedData.joinedEvents.length === 0) && (
          <p className="text-muted-foreground mt-2 text-sm md:text-base">You haven't joined any events yet.</p>
        )}
      </div>

      <Separator className="my-8" />

      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">Events I Followed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {followedData?.followedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={meData?.me?.id || ''}
              onJoin={handleJoin}
              onUnfollow={handleUnfollow}
              onClick={setSelectedEvent}
            />
          ))}
        </div>
        {(!followedData?.followedEvents || followedData.followedEvents.length === 0) && (
          <p className="text-muted-foreground mt-2 text-sm md:text-base">You aren't following any events right now.</p>
        )}
      </div>

      <EventDetailsSideSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
