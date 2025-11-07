"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Plus, Edit, Trash2, Home, School, MapPin, Save, X } from "lucide-react";
import dynamic from 'next/dynamic';
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export interface Stop {
  id: string;
  name: string;
  coords: string;
  description?: string;
  type: 'casa' | 'uni' | 'special';
}

// Fermate di default (sempre disponibili)
export const DEFAULT_STOPS: Stop[] = [
  {
    id: 'casa1',
    name: 'Casa 1',
    coords: '42.35706, 13.39041',
    description: 'Viale Croce Rossa bivio via San Sisto',
    type: 'casa'
  },
  {
    id: 'casa2', 
    name: 'Casa 2',
    coords: '42.35836, 13.38643',
    description: 'Via Betao Cesidio',
    type: 'casa'
  },
  {
    id: 'casa_special',
    name: 'Casa Speciale',
    coords: '42.35916, 13.38143',
    description: 'Viale Corrado IV',
    type: 'special'
  },
  {
    id: 'uni',
    name: 'Università',
    coords: '42.36780, 13.35246',
    description: 'Campus Universitario L\'Aquila',
    type: 'uni'
  }
];

const STORAGE_KEY = 'easybusaq_stops';

interface SettingsDialogProps {
  children: React.ReactNode;
  onStopsChange: (stops: Stop[]) => void;
}

export default function SettingsDialog({ children, onStopsChange }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stops, setStops] = useState<Stop[]>(DEFAULT_STOPS);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [newStop, setNewStop] = useState<{name: string; coords: string; description: string; type: 'casa' | 'uni' | 'special'}>({ name: '', coords: '', description: '', type: 'casa' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  // Carica fermate da localStorage al mount (non chiamare onStopsChange qui,
  // altrimenti la callback ricreata dal genitore può causare un loop di aggiornamenti)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedStops = JSON.parse(saved);
        setStops(parsedStops);
        // Non invochiamo onStopsChange qui per evitare richiami ripetuti al genitore.
      }
    } catch (err) {
      console.error('Errore nel caricamento fermate:', err);
    }
  }, []);

  // Salva fermate in localStorage
  const saveStops = (newStops: Stop[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStops));
      setStops(newStops);
      onStopsChange(newStops);
    } catch (err) {
      console.error('Errore nel salvataggio fermate:', err);
      setError('Errore nel salvataggio delle modifiche');
    }
  };

  // Valida coordinate (formato: "lat, lng")
  const validateCoords = (coords: string) => {
    const pattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    return pattern.test(coords.trim());
  };

  // Aggiungi nuova fermata
  const handleAddStop = () => {
    setError('');
    
    if (!newStop.name.trim()) {
      setError('Il nome della fermata è obbligatorio');
      return;
    }
    
    if (!validateCoords(newStop.coords)) {
      setError('Formato coordinate non valido. Usa: "lat, lng" (es. 42.123, 13.456)');
      return;
    }

    const stop: Stop = {
      id: `custom_${Date.now()}`,
      name: newStop.name.trim(),
      coords: newStop.coords.trim(),
      description: newStop.description.trim() || undefined,
      type: newStop.type
    };

    const newStops = [...stops, stop];
    saveStops(newStops);
    
    setNewStop({ name: '', coords: '', description: '', type: 'casa' });
    setShowAddForm(false);
  };

  // Modifica fermata esistente
  const handleEditStop = (stop: Stop) => {
    setEditingStop({ ...stop });
  };

  // Salva modifiche alla fermata
  const handleSaveEdit = () => {
    if (!editingStop) return;
    
    setError('');
    
    if (!editingStop.name.trim()) {
      setError('Il nome della fermata è obbligatorio');
      return;
    }
    
    if (!validateCoords(editingStop.coords)) {
      setError('Formato coordinate non valido. Usa: "lat, lng" (es. 42.123, 13.456)');
      return;
    }

    const newStops = stops.map(stop => 
      stop.id === editingStop.id ? editingStop : stop
    );
    saveStops(newStops);
    setEditingStop(null);
  };

  // Elimina fermata (solo quelle custom)
  const handleDeleteStop = (stopId: string) => {
    const isDefault = DEFAULT_STOPS.some(stop => stop.id === stopId);
    if (isDefault) {
      setError('Non puoi eliminare le fermate predefinite');
      return;
    }

    const newStops = stops.filter(stop => stop.id !== stopId);
    saveStops(newStops);
  };

  // Reset alle impostazioni di default
  const handleReset = () => {
    saveStops(DEFAULT_STOPS);
    setEditingStop(null);
    setShowAddForm(false);
    setError('');
  };

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'casa': return <Home className="w-4 h-4" />;
      case 'uni': return <School className="w-4 h-4" />;
      case 'special': return <MapPin className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStopTypeLabel = (type: string) => {
    switch (type) {
      case 'casa': return 'Casa';
      case 'uni': return 'Università';
      case 'special': return 'Speciale';
      default: return 'Altro';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Gestione Fermate</span>
          </DialogTitle>
          <DialogDescription>
            Configura le tue fermate personalizzate. Le fermate predefinite non possono essere eliminate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Errori */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pulsanti di azione */}
          <div className="flex justify-between items-center">
            <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Fermata
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset Predefinite
            </Button>
          </div>

          {/* Form aggiunta nuova fermata */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nuova Fermata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newName">Nome fermata *</Label>
                    <Input
                      id="newName"
                      value={newStop.name}
                      onChange={(e) => setNewStop(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es: Casa Mia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newCoords">Coordinate *</Label>
                    <Input
                      id="newCoords"
                      className="w-full"
                      value={newStop.coords}
                      onChange={(e) => setNewStop(prev => ({ ...prev, coords: e.target.value }))}
                      placeholder="42.123456, 13.654321"
                    />
                    <div className="mt-2">
                      <MapPicker
                        initialCoords={newStop.coords}
                        onSelect={(coords) => setNewStop(prev => ({ ...prev, coords }))}
                        trigger={<Button variant="outline" size="sm"><MapPin className="w-4 h-4 mr-2" />Seleziona su mappa</Button>}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newDesc">Descrizione (opzionale)</Label>
                  <Input
                    id="newDesc"
                    value={newStop.description}
                    onChange={(e) => setNewStop(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Es: Fermata autobus vicino al supermercato"
                  />
                </div>
                <div>
                  <Label htmlFor="newType">Tipo</Label>
                  <select
                    id="newType"
                    value={newStop.type}
                    onChange={(e) => setNewStop(prev => ({ ...prev, type: e.target.value as 'casa' | 'uni' | 'special' }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="casa">Casa</option>
                    <option value="uni">Università</option>
                    <option value="special">Speciale</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddStop}>
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Annulla
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista fermate esistenti */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Fermate Configurate</h3>
            {stops.map((stop) => {
              const isDefault = DEFAULT_STOPS.some(defaultStop => defaultStop.id === stop.id);
              const isEditing = editingStop?.id === stop.id;

              return (
                <Card key={stop.id} className={isDefault ? "border-blue-200" : ""}>
                  <CardContent className="p-4">
                    {isEditing ? (
                      // Form di modifica
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Nome fermata *</Label>
                            <Input
                              value={editingStop.name}
                              onChange={(e) => setEditingStop(prev => prev ? { ...prev, name: e.target.value } : null)}
                            />
                          </div>
                          <div>
                            <Label>Coordinate *</Label>
                            <Input
                              className="w-full"
                              value={editingStop.coords}
                              onChange={(e) => setEditingStop(prev => prev ? { ...prev, coords: e.target.value } : null)}
                            />
                            <div className="mt-2">
                              <MapPicker
                                initialCoords={editingStop.coords}
                                onSelect={(coords) => setEditingStop(prev => prev ? { ...prev, coords } : null)}
                                trigger={<Button size="sm" variant="outline"><MapPin className="w-4 h-4 mr-2" />Seleziona su mappa</Button>}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Descrizione</Label>
                          <Input
                            value={editingStop.description || ''}
                            onChange={(e) => setEditingStop(prev => prev ? { ...prev, description: e.target.value } : null)}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="w-3 h-3 mr-1" />
                            Salva
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingStop(null)}>
                            <X className="w-3 h-3 mr-1" />
                            Annulla
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Vista normale
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStopIcon(stop.type)}
                            <span className="font-medium">{stop.name}</span>
                            <Badge variant={isDefault ? "default" : "secondary"}>
                              {getStopTypeLabel(stop.type)}
                            </Badge>
                            {isDefault && <Badge variant="outline">Predefinita</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stop.coords}
                          </p>
                          {stop.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              {stop.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStop(stop)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {!isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteStop(stop.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}