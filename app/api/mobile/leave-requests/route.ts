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

    // Récupérer le formData
    const formData = await request.formData();
    const leaveType = formData.get('leaveType') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const reason = formData.get('reason') as string;
    const attachments = formData.getAll('attachments') as File[];

    // Traiter les pièces jointes
    const uploadedAttachments = [];
    for (const file of attachments) {
      const fileBuffer = await file.arrayBuffer();
      const fileName = `${user.id}/${crypto.randomUUID()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('leave-attachments')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('leave-attachments')
        .getPublicUrl(fileName);

      uploadedAttachments.push({
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
      });
    }

    // Insérer la demande de congé
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: user.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
        attachments: uploadedAttachments,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Notifier les RH (à implémenter selon vos besoins)
    await notifyHR(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la création de la demande de congé:', error);
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const year = searchParams.get('year');

    let query = supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (year) {
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      query = query.gte('start_date', startOfYear).lte('end_date', endOfYear);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de congé:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function notifyHR(leaveRequest: any) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Récupérer les utilisateurs RH
    const { data: hrUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'hr');

    if (!hrUsers?.length) return;

    // Créer une notification pour chaque utilisateur RH
    const notifications = hrUsers.map((hrUser) => ({
      user_id: hrUser.user_id,
      type: 'leave_request',
      title: 'Nouvelle demande de congé',
      content: `Une nouvelle demande de congé a été soumise pour la période du ${new Date(leaveRequest.start_date).toLocaleDateString()} au ${new Date(leaveRequest.end_date).toLocaleDateString()}`,
      metadata: {
        leave_request_id: leaveRequest.id,
      },
      read: false,
    }));

    await supabase.from('notifications').insert(notifications);

    // Envoyer un email aux RH (à implémenter selon vos besoins)
    // await sendEmailToHR(leaveRequest);
  } catch (error) {
    console.error('Erreur lors de la notification des RH:', error);
  }
}