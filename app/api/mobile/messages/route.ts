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
    const threadId = searchParams.get('threadId');
    const status = searchParams.get('status');

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, email, metadata->name, metadata->avatar_url),
        receiver:receiver_id(id, email, metadata->name, metadata->avatar_url)
      `);

    if (threadId) {
      query = query.eq('thread_id', threadId);
    } else {
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Marquer les messages comme lus si l'utilisateur est le destinataire
    const unreadMessages = data
      ?.filter((msg) => msg.receiver_id === user.id && msg.status === 'unread')
      .map((msg) => msg.id);

    if (unreadMessages?.length) {
      await supabase
        .from('messages')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .in('id', unreadMessages);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
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

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const threadId = formData.get('threadId') as string;
    const attachments = formData.getAll('attachments') as File[];

    if (!content && attachments.length === 0) {
      return new NextResponse('Message content required', { status: 400 });
    }

    // Traiter les pièces jointes
    const uploadedAttachments = [];
    for (const file of attachments) {
      const fileBuffer = await file.arrayBuffer();
      const fileName = `${user.id}/${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      uploadedAttachments.push({
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
      });
    }

    // Récupérer le thread ou le destinataire
    let receiverId: string;
    if (threadId) {
  const { data: thread, error } = await supabase
    .from('messages')
    .select('sender_id, receiver_id')
    .eq('id', threadId)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération du thread:', error.message);
    return; // ou continue, selon le contexte
  }

  if (!thread) {
    console.error("Thread introuvable pour l'ID fourni.");
    return;
  }

  // À ce stade, thread est non null
  receiverId = thread.sender_id === user.id
    ? thread.receiver_id
    : thread.sender_id;
    } else {
      // Pour un nouveau message, le destinataire doit être un utilisateur RH
      const { data: hrUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'hr')
        .limit(1)
        .single();

      if (!hrUsers) {
        return new NextResponse('No HR user found', { status: 400 });
      }

      receiverId = hrUsers.user_id;
    }

    // Créer le message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        attachments: uploadedAttachments,
        thread_id: threadId || null,
        status: 'unread',
      })
      .select(`
        *,
        sender:sender_id(id, email, metadata->name, metadata->avatar_url),
        receiver:receiver_id(id, email, metadata->name, metadata->avatar_url)
      `)
      .single();

    if (error) throw error;

    // Créer une notification pour le destinataire
    await supabase
      .from('notifications')
      .insert({
        user_id: receiverId,
        type: 'message',
        title: 'Nouveau message',
        content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        metadata: {
          message_id: message.id,
          sender_name: user.user_metadata?.name || user.email,
        },
        read: false,
      });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}