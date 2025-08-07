'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import { FileText, Download, Search, Filter, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type UserDocument = {
  id: string;
  title: string;
  document_type: string;
  file_path: string;
  uploaded_at: string;
  mime_type: string;
  file_size: number;
  metadata: {
    period?: string;
    reference?: string;
    version?: string;
  };
};

const documentTypes = [
  { id: 'payslip', label: 'Fiche de paie' },
  { id: 'contract', label: 'Contrat' },
  { id: 'amendment', label: 'Avenant' },
  { id: 'certificate', label: 'Attestation' },
];

export default function DocumentViewer() {
  const user = useUser();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/mobile/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (doc: UserDocument) => {
  try {
    setDownloadProgress((prev) => ({ ...prev, [doc.id]: 0 }));

    const response = await fetch(`/api/mobile/documents/${doc.id}/download`);
    if (!response.ok) throw new Error('Erreur de téléchargement');

    const reader = response.body?.getReader();
    const contentLength = +(response.headers.get('Content-Length') ?? 0);
    let receivedLength = 0;

    if (reader) {
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        const progress = (receivedLength / contentLength) * 100;
        setDownloadProgress((prev) => ({
          ...prev,
          [doc.id]: Math.round(progress),
        }));
      }

      const blob = new Blob(chunks, { type: doc.mime_type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); // ✅ ici c'est bien le DOM global
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
  } finally {
    setDownloadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[doc.id];
      return newProgress;
    });
  }
};


  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || doc.document_type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center search-filter-container">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Type de document" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="flex items-center justify-center p-8 text-center text-muted-foreground">
          Aucun document trouvé
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="p-4 document-card">
              <div className="flex items-start justify-between document-info">
                <div className="flex items-start space-x-4">
                  <FileText className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {documentTypes.find((t) => t.id === doc.document_type)?.label}
                      {doc.metadata.period && ` - ${doc.metadata.period}`}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(doc.uploaded_at), 'PPP', { locale: fr })}
                      </span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="document-actions"
                  onClick={() => downloadDocument(doc)}
                  disabled={doc.id in downloadProgress}
                >
                  {doc.id in downloadProgress ? (
                    <div className="relative h-6 w-6">
                      <svg
                        className="h-6 w-6 -rotate-90 transform"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="stroke-muted"
                          cx="12"
                          cy="12"
                          r="10"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          className="stroke-primary"
                          cx="12"
                          cy="12"
                          r="10"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${(downloadProgress[doc.id] / 100) * 62.83} 62.83`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs">
                        {downloadProgress[doc.id]}%
                      </span>
                    </div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.metadata.period}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="aspect-[1/1.4] w-full overflow-hidden rounded border bg-muted">
              <iframe
                src={`/api/mobile/documents/${selectedDocument.id}/preview`}
                className="h-full w-full"
                title={selectedDocument.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
