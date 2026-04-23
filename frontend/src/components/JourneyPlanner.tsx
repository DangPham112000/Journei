import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

const JourneyPlanner: React.FC = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));

  const handleCreateJourney = () => {
    // TODO: Connect to backend via GraphQL mutation to create journey
    // TODO: Pass dates to Google Calendar API to check for overlap/create event
    console.log('Create journey from', startDate?.format('YYYY-MM-DD'), 'to', endDate?.format('YYYY-MM-DD'));
  };

  const handleCalendarSync = () => {
    // TODO: Implement Google Calendar OAuth login flow here
    console.log('Initiating Google Calendar Sync...');
  }

  return (
    <Box className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md">
      <Typography variant="h5" component="h2" className="font-semibold text-gray-800">
        Plan Your Journey
      </Typography>

      <Box className="flex gap-4">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
          />
        </LocalizationProvider>
      </Box>

      <Box className="flex justify-between mt-2">
        <Button variant="outlined" color="secondary" onClick={handleCalendarSync}>
          Sync Google Calendar
        </Button>
        <Button variant="contained" color="primary" onClick={handleCreateJourney}>
          Create Journey Event
        </Button>
      </Box>

      {/* TODO: Display warning if selected dates overlap with busy calendar events */}
    </Box>
  );
};

export default JourneyPlanner;
