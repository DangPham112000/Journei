import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
