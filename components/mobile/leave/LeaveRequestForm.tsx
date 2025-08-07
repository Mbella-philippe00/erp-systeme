

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <Card className="w-full max-w-2xl mx-auto leave-request-card">
      <CardHeader>
        <CardTitle>Demande de congé</CardTitle>
        <CardDescription>
          Remplissez le formulaire pour soumettre une demande de congé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 leave-form">
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem className="leave-type-field">
                  <FormLabel>Type de congé</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type de congé" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="annual">Congé annuel</SelectItem>
                      <SelectItem value="sick">Congé maladie</SelectItem>
                      <SelectItem value="parental">Congé parental</SelectItem>
                      <SelectItem value="unpaid">Congé sans solde</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 date-fields-container">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col date-field">
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal date-button",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionnez une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 date-popover" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col date-field">
                    <FormLabel>Date de fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal date-button",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionnez une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 date-popover" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date <
                            (form.getValues().startDate ||
                              new Date(new Date().setHours(0, 0, 0, 0)))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="reason-field">
                  <FormLabel>Motif de la demande</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Veuillez détailler la raison de votre demande"
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 attachments-section">
              <FormLabel>Pièces jointes (optionnel)</FormLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="file-upload-button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Ajouter un fichier
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </div>

              {files.length > 0 && (
                <ul className="space-y-2 file-list">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        &times;
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button type="submit" className="w-full submit-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Soumettre la demande'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
// LeaveRequestForm.tsx corrigé

