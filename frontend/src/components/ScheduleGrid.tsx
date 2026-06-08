import { useState } from 'react';
import { format, addDays, differenceInDays, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScheduleGridProps {
  startDate: string;
  endDate: string;
  activities: { id: string; startTime: string; endTime: string; title: string }[];
  onTimeRangeSelect: (start: Date, end: Date) => void;
  onActivityClick: (id: string) => void;
  selectedRange?: { start: Date; end: Date } | null;
}

export default function ScheduleGrid({ startDate, endDate, activities, onTimeRangeSelect, onActivityClick, selectedRange }: ScheduleGridProps) {
  const start = startOfDay(new Date(startDate));
  const end = startOfDay(new Date(endDate));
  const numDays = differenceInDays(end, start) + 1;

  const days = Array.from({ length: numDays }).map((_, i) => addDays(start, i));
  const hours = Array.from({ length: 24 }).map((_, i) => i);

  const [dragStart, setDragStart] = useState<{ dayIdx: number; hour: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ dayIdx: number; hour: number } | null>(null);

  const handleMouseDown = (dayIdx: number, hour: number) => {
    setDragStart({ dayIdx, hour });
    setDragCurrent({ dayIdx, hour });
  };

  const handleMouseEnter = (dayIdx: number, hour: number) => {
    if (dragStart) {
      // For simplicity, restrict dragging to the same day
      if (dayIdx === dragStart.dayIdx) {
         setDragCurrent({ dayIdx, hour });
      }
    }
  };

  const handleMouseUp = () => {
    if (dragStart && dragCurrent) {
       const day = days[dragStart.dayIdx];
       const startHour = Math.min(dragStart.hour, dragCurrent.hour);
       const endHour = Math.max(dragStart.hour, dragCurrent.hour) + 1; // +1 to include the full hour block

       const startTime = new Date(day);
       startTime.setHours(startHour, 0, 0, 0);

       const endTime = new Date(day);
       endTime.setHours(endHour, 0, 0, 0);

       onTimeRangeSelect(startTime, endTime);
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg overflow-hidden">
      <div className="flex border-b shrink-0 bg-gray-50">
        <div className="w-16 shrink-0 border-r" /> {/* Time column header */}
        <div className="flex-grow flex divide-x overflow-hidden">
           {days.map(day => (
              <div key={day.toISOString()} className="flex-1 text-center py-2 text-sm font-semibold truncate">
                {format(day, 'MMM d')}
              </div>
           ))}
        </div>
      </div>

      <ScrollArea className="flex-grow" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="flex relative">
          {/* Time Labels */}
          <div className="w-16 shrink-0 border-r flex flex-col bg-gray-50">
             {hours.map(hour => (
                <div key={hour} className="h-12 border-b flex items-center justify-center text-xs text-muted-foreground select-none">
                  {format(new Date().setHours(hour, 0), 'HH:00')}
                </div>
             ))}
          </div>

          {/* Grid Cells */}
          <div className="flex-grow flex divide-x">
             {days.map((day, dayIdx) => (
                <div key={day.toISOString()} className="flex-1 relative">
                   {hours.map(hour => {
                      let isDragging = false;
                      if (dragStart && dragCurrent && dragStart.dayIdx === dayIdx) {
                          const minH = Math.min(dragStart.hour, dragCurrent.hour);
                          const maxH = Math.max(dragStart.hour, dragCurrent.hour);
                          isDragging = hour >= minH && hour <= maxH;
                      }

                      let isSelected = false;
                      if (selectedRange && isSameDay(day, selectedRange.start)) {
                          const startH = selectedRange.start.getHours();
                          const endH = selectedRange.end.getHours(); // non-inclusive upper bound for grid blocks
                          isSelected = hour >= startH && hour < endH;
                      }

                      return (
                          <div
                            key={hour}
                            className={cn(
                                "h-12 border-b cursor-crosshair transition-colors duration-75",
                                isDragging && "bg-blue-100",
                                isSelected && !isDragging && "bg-blue-50 border-blue-200"
                            )}
                            onMouseDown={() => handleMouseDown(dayIdx, hour)}
                            onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                          />
                      )
                   })}

                   {/* Render Activities */}
                   {activities.filter(a => isSameDay(new Date(a.startTime), day)).map(activity => {
                      const st = new Date(activity.startTime);
                      const et = new Date(activity.endTime);

                      const startOffsetHours = st.getHours() + (st.getMinutes() / 60);
                      const durationHours = (et.getTime() - st.getTime()) / (1000 * 60 * 60);

                      return (
                         <div
                           key={activity.id}
                           onClick={(e) => {
                               e.stopPropagation();
                               onActivityClick(activity.id);
                           }}
                           className="absolute left-1 right-1 rounded-md bg-primary text-primary-foreground p-1 text-xs overflow-hidden cursor-pointer shadow-sm z-10 hover:ring-2 ring-offset-1"
                           style={{
                              top: `${startOffsetHours * 3}rem`, // 3rem = h-12 (48px)
                              height: `${durationHours * 3}rem`,
                           }}
                         >
                            <div className="font-semibold truncate">{activity.title}</div>
                            <div className="truncate opacity-80">{format(st, 'HH:mm')} - {format(et, 'HH:mm')}</div>
                         </div>
                      );
                   })}
                </div>
             ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
