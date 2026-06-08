import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const JourneyPlanner: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7));

  const handleCreateJourney = () => {
    // TODO: Connect to backend via GraphQL mutation to create journey
    // TODO: Pass dates to Google Calendar API to check for overlap/create event
    console.log('Create journey from', startDate?.toISOString(), 'to', endDate?.toISOString());
  };

  const handleCalendarSync = () => {
    // TODO: Implement Google Calendar OAuth login flow here
    console.log('Initiating Google Calendar Sync...');
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-800">
        Plan Your Journey
      </h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium">Start Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="datetime-local"
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9",
                !startDate && "text-muted-foreground"
              )}
              value={startDate ? new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium">End Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="datetime-local"
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9",
                !endDate && "text-muted-foreground"
              )}
              value={endDate ? new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <Button variant="outline" className="w-full sm:flex-1" onClick={handleCalendarSync}>
          Sync Google Calendar
        </Button>
        <Button className="w-full sm:flex-1" onClick={handleCreateJourney}>
          Create Journey Event
        </Button>
      </div>

      {/* TODO: Display warning if selected dates overlap with busy calendar events */}
    </div>
  );
};

export default JourneyPlanner;
