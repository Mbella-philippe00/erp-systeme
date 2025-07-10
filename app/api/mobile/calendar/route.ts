import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const type = searchParams.get('type');

    // Récupérer les événements du calendrier
    let eventsQuery = supabase
      .from('calendar_events')
      .select(`
        *,
        participants:event_participants(user_id, response_status)
      `);

    if (startDate) {
      eventsQuery = eventsQuery.gte('start_time', startDate);
    }

    if (endDate) {
      eventsQuery = eventsQuery.lte('end_time', endDate);
    }

    if (type) {
      eventsQuery = eventsQuery.eq('event_type', type);
    }

    // Filtrer les événements auxquels l'utilisateur participe
    eventsQuery = eventsQuery.or(`participants.user_id.eq.${user.id},event_type.eq.holiday`);

    const { data: events, error: eventsError } = await eventsQuery;

    if (eventsError) throw eventsError;

    // Récupérer les demandes de congés de l'utilisateur
    const { data: leaves, error: leavesError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'approved');

    if (leavesError) throw leavesError;

    // Récupérer les jours fériés
    const { data: holidays, error: holidaysError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('event_type', 'holiday');

    if (holidaysError) throw holidaysError;

    // Fusionner et formater tous les événements
    const allEvents = [
      // Événements du calendrier
      ...events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        all_day: event.all_day,
        event_type: event.event_type,
        location: event.location,
        metadata: event.metadata,
      })),

      // Congés approuvés
      ...leaves.map((leave) => ({
        id: `leave-${leave.id}`,
        title: `Congés - ${leave.leave_type}`,
        description: leave.reason,
        start_time: `${leave.start_date}T00:00:00Z`,
        end_time: `${leave.end_date}T23:59:59Z`,
        all_day: true,
        event_type: 'leave',
        metadata: {
          leave_type: leave.leave_type,
          status: leave.status,
        },
      })),

      // Jours fériés
      ...holidays.map((holiday) => ({
        id: `holiday-${holiday.id}`,
        title: holiday.title,
        description: holiday.description,
        start_time: holiday.start_time,
        end_time: holiday.end_time,
        all_day: true,
        event_type: 'holiday',
        metadata: holiday.metadata,
      })),
    ];

    // Trier les événements par date
    allEvents.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payload = await request.json();
    const {
      title,
      description,
      start_time,
      end_time,
      all_day,
      event_type,
      location,
      participants,
    } = payload;

    // Vérifier les droits de création d'événements
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Seuls les RH peuvent créer des événements de type 'hr'
    if (event_type === 'hr' && userRole?.role !== 'hr') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Créer l'événement
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title,
        description,
        start_time,
        end_time,
        all_day,
        event_type,
        location,
        created_by: user.id,
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Ajouter les participants
    if (participants?.length > 0) {
      const participantRecords = participants.map((participantId: string) => ({
        event_id: event.id,
        user_id: participantId,
        response_status: 'pending',
      }));

      const { error: participantsError } = await supabase
        .from('event_participants')
        .insert(participantRecords);

      if (participantsError) throw participantsError;

      // Créer des notifications pour les participants
      const notifications = participants.map((participantId: string) => ({
        user_id: participantId,
        type: 'event_invitation',
        title: 'Nouvel événement',
        content: `Vous avez été invité à l'événement : ${title}`,
        metadata: {
          event_id: event.id,
          event_type,
          start_time,
        },
        read: false,
      }));

      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}