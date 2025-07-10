'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { format, isToday, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

// Types

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  event_type: 'holiday' | 'leave' | 'hr' | 'other';
  location?: string;
  metadata: Record<string, any>;
}

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: 'pending' | 'approved' | 'rejected';
}

const eventTypeColors = {
  holiday: { bg: 'bg-red-100', text: 'text-red-700' },
  leave: { bg: 'bg-blue-100', text: 'text-blue-700' },
  hr: { bg: 'bg-purple-100', text: 'text-purple-700' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const leaveTypeColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function PersonalCalendar() {
  const user = useUser();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayLeaves, setSelectedDayLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    if (user) {
      Promise.all([fetchEvents(), fetchLeaves()]).finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    updateSelectedDayItems(date);
  }, [date, events, leaves]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/mobile/calendar/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch('/api/mobile/calendar/leaves');
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des congés:', error);
    }
  };

  const updateSelectedDayItems = (selectedDate: Date) => {
    const dayEvents = events.filter((event) => {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      return isWithinInterval(selectedDate, { start, end });
    });

    const dayLeaves = leaves.filter((leave) => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      return isWithinInterval(selectedDate, { start, end });
    });

    setSelectedDayEvents(dayEvents);
    setSelectedDayLeaves(dayLeaves);
  };

  const modifiers = {
    hasEvent: (date: Date) =>
      events.some((event) => isWithinInterval(date, {
        start: new Date(event.start_time),
        end: new Date(event.end_time)
      })),
    hasLeave: (date: Date) =>
      leaves.some((leave) => isWithinInterval(date, {
        start: new Date(leave.start_date),
        end: new Date(leave.end_date)
      })),
  };

  const modifiersClassNames = {
    hasEvent: 'border-purple-500',
    hasLeave: 'border-blue-500',
    today: 'bg-accent'
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4 md:col-span-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          locale={fr}
          className="rounded-md border"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
        />
      </Card>

      <Card className="p-4">
        <div className="font-medium">
          {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : selectedDayEvents.length === 0 && selectedDayLeaves.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Aucun événement prévu
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-16rem)] mt-4">
            <div className="space-y-4">
              {selectedDayEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge
                        variant="secondary"
                        className={`${eventTypeColors[event.event_type].bg} ${eventTypeColors[event.event_type].text}`}
                      >
                        {event.event_type === 'holiday'
                          ? 'Jour férié'
                          : event.event_type === 'leave'
                          ? 'Congé'
                          : event.event_type === 'hr'
                          ? 'RH'
                          : 'Autre'}
                      </Badge>
                      <h3 className="mt-2 font-medium">{event.title}</h3>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {event.all_day ? (
                      'Toute la journée'
                    ) : (
                      <>
                        {format(new Date(event.start_time), 'HH:mm')} -{' '}
                        {format(new Date(event.end_time), 'HH:mm')}
                      </>
                    )}
                    {event.location && <div className="mt-1">Lieu : {event.location}</div>}
                  </div>
                </div>
              ))}

              {selectedDayLeaves.map((leave) => (
                <div key={leave.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge
                        variant="secondary"
                        className={`${leaveTypeColors[leave.status].bg} ${leaveTypeColors[leave.status].text}`}
                      >
                        {leave.status === 'pending'
                          ? 'En attente'
                          : leave.status === 'approved'
                          ? 'Approuvé'
                          : 'Refusé'}
                      </Badge>
                      <h3 className="mt-2 font-medium">
                        {leave.leave_type === 'paid'
                          ? 'Congés payés'
                          : leave.leave_type === 'unpaid'
                          ? 'Congés sans solde'
                          : leave.leave_type === 'sick'
                          ? 'Arrêt maladie'
                          : leave.leave_type === 'family'
                          ? 'Événement familial'
                          : 'Autre'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Du {format(new Date(leave.start_date), 'PPP', { locale: fr })} au{' '}
                    {format(new Date(leave.end_date), 'PPP', { locale: fr })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
