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

    // Récupérer le dernier pointage de l'utilisateur
    const { data, error } = await supabase
      .from('timesheet')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si aucun pointage n'est trouvé, retourner null sans erreur
      if (error.code === 'PGRST116') {
        return NextResponse.json(null);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier pointage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}