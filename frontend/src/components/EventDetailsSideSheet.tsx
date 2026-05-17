import type { GetEventsQuery } from '../__generated__/graphql';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MapPin, CalendarClock, User, Users } from 'lucide-react';

type EventType = GetEventsQuery['events'][0];

interface EventDetailsSideSheetProps {
  event: EventType | null;
  open: boolean;
  onClose: () => void;
}

export default function EventDetailsSideSheet({ event, open, onClose }: EventDetailsSideSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-full sm:w-[400px] sm:side-right sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-xl font-bold">{event?.title}</SheetTitle>
        </SheetHeader>

        {event && (
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-6 pb-6">
              <div>
                <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Description</h4>
                <p className="text-sm">{event.description || 'N/A'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold mb-0.5 text-muted-foreground">Location</h4>
                    <p className="text-sm">{event.location || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <div>
                      <h4 className="text-sm font-semibold mb-0.5 text-muted-foreground">Start</h4>
                      <p className="text-sm">{new Date(event.startDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-0.5 text-muted-foreground">End</h4>
                      <p className="text-sm">{new Date(event.endDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold mb-0.5 text-muted-foreground">Creator</h4>
                    <p className="text-sm">{event.creator.name}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Participants ({event.participants.length})</h4>
                  </div>
                  {event.participants.length > 0 ? (
                    <ul className="space-y-1 ml-6 text-sm">
                      {event.participants.map(p => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-6">No participants yet.</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Followers ({event.followers.length})</h4>
                  </div>
                  {event.followers.length > 0 ? (
                    <ul className="space-y-1 ml-6 text-sm">
                      {event.followers.map(f => (
                        <li key={f.id}>{f.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-6">No followers yet.</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
