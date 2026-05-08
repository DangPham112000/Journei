import { Typography, Grid, CircularProgress, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { useGetMyEventsQuery, useCreateEventMutation, useDeleteEventMutation, useMeQuery } from '../../__generated__/graphql';
import EventCard from '../../components/EventCard';
import EventDetailsSideSheet from '../../components/EventDetailsSideSheet';
import { useState } from 'react';
import type { GetEventsQuery } from '../../__generated__/graphql';

type EventType = GetEventsQuery['events'][0];

export default function ManageEventsPage() {
  const { data: meData } = useMeQuery();
  const { data, loading, error, refetch } = useGetMyEventsQuery();

  const [createEvent] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [autoFollow, setAutoFollow] = useState(true);

  if (loading) return <Box className="flex justify-center mt-8"><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error loading your events</Typography>;

  const handleCreateOpen = () => setCreateModalOpen(true);
  const handleCreateClose = () => {
    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setLocation('');
    setAutoFollow(true);
  };

  const handleCreateSubmit = async () => {
    try {
      await createEvent({
        variables: {
          title,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent({ variables: { id } });
        refetch();
      } catch (e) {
        console.error('Failed to delete event', e);
      }
    }
  };

  return (
    <div>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4">Manage My Events</Typography>
        <Button variant="contained" color="primary" onClick={handleCreateOpen}>
          Create Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {data?.myEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Box className="relative">
              <EventCard
                event={event}
                currentUserId={meData?.me?.id || ''}
                onClick={setSelectedEvent}
              />
              <Box className="absolute top-2 right-2">
                <Button size="small" color="error" variant="contained" onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(event.id);
                }}>
                  Delete
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {(!data?.myEvents || data.myEvents.length === 0) && (
        <Typography variant="body1" className="text-gray-500 mt-4">You haven't created any events yet.</Typography>
      )}

      <EventDetailsSideSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <Dialog open={createModalOpen} onClose={handleCreateClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Title" type="text" fullWidth variant="outlined" value={title} onChange={e => setTitle(e.target.value)} />
          <TextField margin="dense" label="Description" type="text" fullWidth variant="outlined" multiline rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          <TextField margin="dense" label="Location" type="text" fullWidth variant="outlined" value={location} onChange={e => setLocation(e.target.value)} />
          <Box className="flex gap-4 mt-2">
            <TextField margin="dense" label="Start Date & Time" type="datetime-local" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <TextField margin="dense" label="End Date & Time" type="datetime-local" fullWidth variant="outlined" InputLabelProps={{ shrink: true }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </Box>
          <FormControlLabel className="mt-2" control={<Checkbox checked={autoFollow} onChange={e => setAutoFollow(e.target.checked)} />} label="Follow this event automatically" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained" color="primary" disabled={!title || !startDate || !endDate}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
