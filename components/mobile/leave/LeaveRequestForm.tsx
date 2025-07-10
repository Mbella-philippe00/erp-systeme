// LeaveRequestForm.tsx corrigé

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { openDB, DBSchema } from 'idb';

const leaveTypes = [
  { id: 'paid', label: 'Congés payés' },
  { id: 'unpaid', label: 'Congés sans solde' },
  { id: 'sick', label: 'Arrêt maladie' },
  { id: 'family', label: 'Événement familial' },
  { id: 'other', label: 'Autre' },
];

const formSchema = z
  .object({
    leaveType: z.string({ required_error: 'Veuillez sélectionner un type de congé' }),
    startDate: z.date({ required_error: 'Veuillez sélectionner une date de début' }),
    endDate: z.date({ required_error: 'Veuillez sélectionner une date de fin' }),
    reason: z.string().min(10, {
      message: 'La raison doit contenir au moins 10 caractères',
    }),
    attachments: z.array(z.instanceof(File)).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof formSchema>;

interface OfflineLeaveDB extends DBSchema {
  leaveRequests: {
    key: string;
    value: any;
  };
}

export default function LeaveRequestForm() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { attachments: [] },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('leaveType', data.leaveType);
      formData.append('startDate', data.startDate.toISOString());
      formData.append('endDate', data.endDate.toISOString());
      formData.append('reason', data.reason);
      files.forEach((file) => formData.append('attachments', file));

      try {
        const response = await fetch('/api/mobile/leave-requests', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast({
            title: 'Demande envoyée',
            description: 'Votre demande de congé a été soumise avec succès',
          });
          form.reset();
          setFiles([]);
        } else {
          throw new Error("Erreur lors de l'envoi");
        }
      } catch (error) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          await saveOffline(data, files);
          toast({
            title: 'Mode hors ligne',
            description: 'La demande sera synchronisée dès que possible',
            variant: 'default',
          });
          form.reset();
          setFiles([]);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer la demande",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveOffline = async (data: FormValues, files: File[]) => {
    const db = await openDB<OfflineLeaveDB>('offlineStore', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('leaveRequests')) {
          db.createObjectStore('leaveRequests', { keyPath: 'id' });
        }
      },
    });

    const id = crypto.randomUUID();
    await db.add('leaveRequests', {
      id,
      ...data,
      files: await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await file.arrayBuffer(),
        }))
      ),
      synced: false,
      createdAt: new Date().toISOString(),
    });

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      await navigator.serviceWorker.ready;
      navigator.serviceWorker.controller.postMessage({ type: 'sync-leave-requests' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6">
      {/* ...interface utilisateur inchangée... */}
    </Card>
  );
}
