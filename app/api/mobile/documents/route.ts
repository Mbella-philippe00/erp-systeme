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
    const documentType = searchParams.get('type');
    const period = searchParams.get('period');

    let query = supabase
      .from('employee_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    if (period) {
      query = query.contains('metadata', { period });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Vérifier les droits d'accès pour chaque document
    const accessibleDocuments = data.filter((doc) => {
      // Les documents confidentiels nécessitent une vérification supplémentaire
      if (doc.is_confidential) {
        // Vérifier si l'utilisateur est le propriétaire ou a un rôle autorisé
        return doc.user_id === user.id;
      }
      return true;
    });

    return NextResponse.json(accessibleDocuments);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
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
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const title = formData.get('title') as string;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!file || !documentType || !title) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return new NextResponse('Invalid file type', { status: 400 });
    }

    // Vérifier la taille du fichier (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse('File too large', { status: 400 });
    }

    // Générer un nom de fichier unique
    const fileName = `${user.id}/${documentType}/${crypto.randomUUID()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    // Uploader le fichier
    const { error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) throw uploadError;

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(fileName);

    // Enregistrer les métadonnées du document
    const { data, error } = await supabase
      .from('employee_documents')
      .insert({
        user_id: user.id,
        document_type: documentType,
        title,
        file_path: fileName,
        mime_type: file.type,
        file_size: file.size,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Route pour le téléchargement d'un document
export async function download(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Récupérer les informations du document
    const { data: document, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Vérifier les droits d'accès
    if (document.user_id !== user.id && document.is_confidential) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Récupérer le fichier
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('employee-documents')
      .download(document.file_path);

    if (downloadError) throw downloadError;

    // Créer la réponse avec le fichier
    const headers = new Headers();
    headers.set('Content-Type', document.mime_type);
    headers.set('Content-Disposition', `attachment; filename="${document.title}"`);
    headers.set('Content-Length', document.file_size.toString());

    return new NextResponse(fileData, { headers });
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}