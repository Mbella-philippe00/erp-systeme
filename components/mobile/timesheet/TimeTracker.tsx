'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
            variant: 'default', // ✅ warning remplacé par default
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Erreur lors du pointage:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le pointage',
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
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pointage</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(), 'PPP', { locale: fr })}</span>
        </div>
      </div>

      {geoEnabled && currentLocation && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            Position : {currentLocation.coords.latitude.toFixed(6)},
            {currentLocation.coords.longitude.toFixed(6)}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {lastEntry && (
          <div className="text-sm text-muted-foreground">
            Dernier pointage : {lastEntry.type === 'entry' ? 'Arrivée' : 'Départ'} le{' '}
            {format(new Date(lastEntry.timestamp), 'PPP à HH:mm', { locale: fr })}
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleTimesheet}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Clock className="w-4 h-4 mr-2" />
          )}
          {lastEntry?.type === 'entry' ? 'Pointer le départ' : 'Pointer l\'arrivée'}
        </Button>
      </div>
    </Card>
  );
}
