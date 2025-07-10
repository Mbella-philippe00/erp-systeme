'use client';

import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CalendarDays, FileText, MessageSquare, LogOut } from 'lucide-react';
import TimeTracker from '@/components/mobile/timesheet/TimeTracker';
import LeaveRequestForm from '@/components/mobile/leave/LeaveRequestForm';
import DocumentViewer from '@/components/mobile/documents/DocumentViewer';
import MessageCenter from '@/components/mobile/messages/MessageCenter';
import PersonalCalendar from '@/components/mobile/calendar/PersonalCalendar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const tabs = [
  {
    id: 'timesheet',
    label: 'Pointage',
    icon: Clock,
    component: TimeTracker,
  },
  {
    id: 'leave',
    label: 'Congés',
    icon: CalendarDays,
    component: LeaveRequestForm,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    component: DocumentViewer,
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    component: MessageCenter,
  },
  {
    id: 'calendar',
    label: 'Calendrier',
    icon: CalendarDays,
    component: PersonalCalendar,
  },
];

export default function MobilePortal() {
  const user = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('timesheet');

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/mobile">
              <span className="font-bold">ERP Mobile</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-center mb-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              <tab.component />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} ERP Mobile. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}