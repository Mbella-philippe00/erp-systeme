import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payload = await request.json();
    const { type, timestamp, location } = payload;

    // Insérer le pointage dans la base de données
    const { data, error } = await supabase
      .from('timesheet')
      .insert({
        user_id: user.id,
        type,
        timestamp,
        location: location ? `POINT(${location.longitude} ${location.latitude})` : null,
        device_info: {
          userAgent: request.headers.get('user-agent'),
          platform: request.headers.get('sec-ch-ua-platform'),
        },
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du pointage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Récupérer les pointages de l'utilisateur
    const { data, error } = await supabase
      .from('timesheet')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des pointages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}