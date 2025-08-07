'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Clock, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { openDB, DBSchema } from 'idb';

type TimesheetEntry = {
  id: string;
  timestamp: string;
  type: 'entry' | 'exit';
  location?: {
    latitude: number;
    longitude: number;
  };
  synced: boolean;
};

interface OfflineDB extends DBSchema {
  timesheet: {
    key: string;
    value: TimesheetEntry;
  };
}

export default function TimeTracker() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [lastEntry, setLastEntry] = useState<TimesheetEntry | null>(null);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      setGeoEnabled(true);
      const watchId = navigator.geolocation.watchPosition(
        (position) => setCurrentLocation(position),
        (error) => console.error('Erreur de géolocalisation:', error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    fetchLastEntry();
  }, [user]);

  const fetchLastEntry = async () => {
    try {
      const response = await fetch('/api/mobile/timesheet/last');
      if (response.ok) {
        const data = await response.json();
        setLastEntry(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du dernier pointage:', error);
    }
  };

  const handleTimesheet = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const type = lastEntry?.type === 'entry' ? 'exit' : 'entry';
      const timestamp = new Date().toISOString();

      const payload: Partial<TimesheetEntry> = {
        type,
        timestamp,
      };

      if (geoEnabled && currentLocation) {
        payload.location = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
      }

      try {
        const response = await fetch('/api/mobile/timesheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          setLastEntry(data);
          toast({
            title: type === 'entry' ? 'Arrivée enregistrée' : 'Départ enregistré',
            description: format(new Date(timestamp), 'PPP à HH:mm', { locale: fr }),
          });
        }
      } catch (error) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          await saveOffline(payload);
          toast({
            title: 'Mode hors ligne',
            description: 'Le pointage sera synchronisé dès que possible',
            variant: 'default',
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Erreur lors du pointage:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'enregistrer le pointage",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveOffline = async (entry: Partial<TimesheetEntry>) => {
    const offlineDb = await openDB<OfflineDB>('offlineStore', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('timesheet')) {
          db.createObjectStore('timesheet', { keyPath: 'timestamp' });
        }
      },
    });

    await offlineDb.add('timesheet', {
      ...(entry as TimesheetEntry),
      synced: false,
    });

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      await navigator.serviceWorker.ready;
      navigator.serviceWorker.controller.postMessage({
        type: 'sync-timesheet',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto timesheet-card">
      <CardHeader className="timesheet-header">
        <CardTitle>Pointage</CardTitle>
        <CardDescription>
          Enregistrez votre entrée et sortie quotidienne
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 touch-friendly-container">
        <div className="text-center current-time">
          <div className="text-3xl font-bold">
            {format(new Date(), 'HH:mm:ss')}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </div>
        </div>

        {geoEnabled && currentLocation && (
          <div className="text-sm text-center text-muted-foreground geolocation-display overflow-hidden">
            <MapPin className="inline-block mr-1 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
            </span>
          </div>
        )}

        {lastEntry && (
          <div className="bg-muted p-3 rounded-md last-entry">
            <div className="font-medium">Dernier pointage</div>
            <div className="text-sm mt-1">
              {lastEntry.type === 'entry' ? 'Arrivée' : 'Départ'} le{' '}
              {format(new Date(lastEntry.timestamp), 'PPP à HH:mm', { locale: fr })}
            </div>
          </div>
        )}

        <Button
          className="w-full timesheet-button"
          size="lg"
          onClick={handleTimesheet}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              {lastEntry?.type === 'entry' ? 'Pointer le départ' : "Pointer l'arrivée"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

