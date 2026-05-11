import { Drawer, Box, Typography, IconButton, Divider, List, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { GetEventsQuery } from '../__generated__/graphql';

type EventType = GetEventsQuery['events'][0];

interface EventDetailsSideSheetProps {
  event: EventType | null;
  open: boolean;
  onClose: () => void;
}

export default function EventDetailsSideSheet({ event, open, onClose }: EventDetailsSideSheetProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      {event && (
        <Box className="p-6">
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h5" className="font-bold">{event.title}</Typography>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>
          <Divider className="mb-4" />

          <Typography variant="subtitle1" className="font-bold mt-4">Description</Typography>
          <Typography variant="body1" className="mb-4">{event.description || 'N/A'}</Typography>

          <Typography variant="subtitle1" className="font-bold">Location</Typography>
          <Typography variant="body1" className="mb-4">{event.location || 'N/A'}</Typography>

          <Typography variant="subtitle1" className="font-bold">Start Date</Typography>
          <Typography variant="body1" className="mb-4">{new Date(event.startDate).toLocaleString()}</Typography>

          <Typography variant="subtitle1" className="font-bold">End Date</Typography>
          <Typography variant="body1" className="mb-4">{new Date(event.endDate).toLocaleString()}</Typography>

          <Typography variant="subtitle1" className="font-bold">Creator</Typography>
          <Typography variant="body1" className="mb-4">{event.creator.name}</Typography>

          <Divider className="my-4" />

          <Typography variant="subtitle1" className="font-bold">Participants ({event.participants.length})</Typography>
          <List dense>
            {event.participants.map(p => (
              <ListItem key={p.id} disablePadding>
                <ListItemText primary={p.name} />
              </ListItem>
            ))}
          </List>

          <Typography variant="subtitle1" className="font-bold mt-4">Followers ({event.followers.length})</Typography>
          <List dense>
            {event.followers.map(f => (
              <ListItem key={f.id} disablePadding>
                <ListItemText primary={f.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Drawer>
  );
}
