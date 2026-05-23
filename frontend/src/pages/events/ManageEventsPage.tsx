import { useGetMyEventsQuery, useCreateEventMutation, useDeleteEventMutation, useMeQuery } from '../../__generated__/graphql';
import EventCard from '../../components/EventCard';
import EventDetailsSideSheet from '../../components/EventDetailsSideSheet';
import { useState } from 'react';
import type { GetEventsQuery } from '../../__generated__/graphql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type EventType = GetEventsQuery['events'][0];

export default function ManageEventsPage() {
  const { data: meData } = useMeQuery();
  const { data, loading, error, refetch } = useGetMyEventsQuery();

  const [createEvent] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [location, setLocation] = useState('');
  const [autoFollow, setAutoFollow] = useState(true);

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) return <p className="text-destructive">Error loading your events</p>;

  const handleCreateOpen = () => setCreateModalOpen(true);
  const handleCreateClose = () => {
    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setLocation('');
    setAutoFollow(true);
  };

  const handleCreateSubmit = async () => {
    if (!startDate || !endDate) return;
    try {
      await createEvent({
        variables: {
          title,
          description,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location,
          autoFollow
        }
      });
      refetch();
      handleCreateClose();
    } catch (e) {
      console.error('Failed to create event', e);
    }
  };

  const handleDeleteClick = (id: string) => {
    setEventToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent({ variables: { id: eventToDelete } });
        refetch();
      } catch (e) {
        console.error('Failed to delete event', e);
      } finally {
        setDeleteModalOpen(false);
        setEventToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Manage My Events</h1>
        <Button onClick={handleCreateOpen} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.myEvents.map((event) => (
          <div key={event.id} className="relative group">
            <EventCard
              event={event}
              currentUserId={meData?.me?.id || ''}
              onClick={setSelectedEvent}
            />
            <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-sm" onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(event.id);
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(!data?.myEvents || data.myEvents.length === 0) && (
        <p className="text-muted-foreground mt-4 text-sm md:text-base">You haven't created any events yet.</p>
      )}

      <EventDetailsSideSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <Dialog open={createModalOpen} onOpenChange={(open) => !open && handleCreateClose()}>
        <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Add a new event to your schedule.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow px-6">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger render={
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")} />
                  }>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger render={
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")} />
                  }>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox id="autoFollow" checked={autoFollow} onCheckedChange={(checked) => setAutoFollow(checked as boolean)} />
                <Label htmlFor="autoFollow" className="text-sm font-normal">Follow this event automatically</Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 pt-2">
            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleCreateClose}>Cancel</Button>
              <Button className="flex-1 sm:flex-none" onClick={handleCreateSubmit} disabled={!title || !startDate || !endDate}>Create</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this event? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 w-full sm:w-auto sm:justify-end mt-4">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleCancelDelete}>Cancel</Button>
            <Button variant="destructive" className="flex-1 sm:flex-none" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
