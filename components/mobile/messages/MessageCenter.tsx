'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, Paperclip, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  sender: {
    name: string;
    avatar_url?: string;
  };
};

type Thread = {
  id: string;
  subject: string;
  last_message: Message;
  unread_count: number;
};

export default function MessageCenter() {
  const user = useUser();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/mobile/messages/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/mobile/messages/threads/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() && files.length === 0) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      formData.append('threadId', selectedThread || '');

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/mobile/messages', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage('');
        setFiles([]);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 gap-4 md:grid-cols-3 message-grid">
      <Card className="md:col-span-1 thread-list">
        <div className="p-4 font-medium border-b">Conversations</div>
        <ScrollArea className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune conversation
            </div>
          ) : (
            <div className="p-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  className={`w-full p-3 text-left transition-colors rounded-lg hover:bg-accent ${
                    selectedThread === thread.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedThread(thread.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium truncate">
                          {thread.subject}
                        </div>
                        {thread.unread_count > 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium text-primary-foreground bg-primary rounded-full">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground truncate">
                        {thread.last_message.content}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-2 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      <Card className="flex flex-col md:col-span-2 message-area">
        {selectedThread ? (
          <>
            <ScrollArea className="flex-1 p-4 messages-container">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isSender = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'} message-bubble-container`}
                    >
                      <div
                        className={`flex space-x-2 max-w-[90%] sm:max-w-[80%] ${
                          isSender
                            ? 'flex-row-reverse space-x-reverse'
                            : ''
                        } message-content`}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage
                            src={message.sender.avatar_url}
                            alt={message.sender.name}
                          />
                          <AvatarFallback>
                            {message.sender.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div
                            className={`rounded-lg p-3 ${
                              isSender
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            } message-bubble`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            {message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment, index) => (
                                  <a
                                    key={index}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-2 text-sm rounded bg-background/50 hover:underline attachment-item"
                                  >
                                    <Paperclip className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span className="flex-1 min-w-0 truncate">{attachment.name}</span>
                                    <span className="ml-1 text-xs opacity-70">
                                      ({formatFileSize(attachment.size)})
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {format(new Date(message.created_at), 'PPp', {
                              locale: fr,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t message-input-container">
              {files.length > 0 && (
                <div className="mb-4 space-y-2 selected-files">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 text-sm border rounded-lg file-item"
                    >
                      <div className="flex items-center">
                        <Paperclip className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="remove-file-button"
                        onClick={() => removeFile(index)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="attachment-button"
                  onClick={handleFileSelect}
                  disabled={sending}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 min-h-[2.5rem] max-h-32 message-textarea"
                  disabled={sending}
                />
                <Button
                  size="icon"
                  className="send-button"
                  onClick={handleSend}
                  disabled={sending || (!newMessage.trim() && files.length === 0)}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 p-8 text-center text-muted-foreground">
            Sélectionnez une conversation pour afficher les messages
          </div>
        )}
      </Card>
    </div>
  );
}
