"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, Home, School, Clock, MapPin, ArrowRight, Loader2, Calendar, Settings } from "lucide-react";
import SettingsDialog, { Stop, DEFAULT_STOPS } from "@/components/SettingsDialog";

interface TransportLeg {
  mode: string;
  route?: string;
  routeShortName?: string;
  agencyName?: string;
  from: {
    name: string;
    departure?: number;
  };
  to: {
    name: string;
    arrival?: number;
  };
  duration: number;
  distance?: number;
  headsign?: string;
}

interface Itinerary {
  duration: number;
  startTime: number;
  endTime: number;
  walkTime: number;
  transitTime: number;
  transfers: number;
  legs: TransportLeg[];
}

interface TransportResponse {
  plan: {
    itineraries: Itinerary[];
  };
}

// Coordinate delle posizioni
const CASA1_COORDS = "42.35706, 13.39041";
const CASA2_COORDS = "42.35836, 13.38643";
const CASA_SPECIAL_COORDS = "42.35916, 13.38143"; // Casa quando si va da università a casa
const UNI_COORDS = "42.36780, 13.35246";

// Descrizioni via/fermata per le case
const CASA1_LABEL = "Viale Croce Rossa bivio via San Sisto";
const CASA2_LABEL = "Via Betao Cesidio";
const CASA_SPECIAL_LABEL = "Viale Corrado IV";

export default function TransportHome() {
  // Nuova logica: selezione libera di due fermate
  const [fromStopId, setFromStopId] = useState<string>("casa1");
  const [toStopId, setToStopId] = useState<string>("uni");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Itinerary[]>([]);
  const [error, setError] = useState<string>("");
  
  // Gestione fermate configurabili
  const [stops, setStops] = useState<Stop[]>(DEFAULT_STOPS);
  
  // Stati per data e ora personalizzate
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  // Ref per lo scroll automatico
  const resultsRef = useRef<HTMLDivElement>(null);

  // Carica fermate da localStorage al mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('easybusaq_stops');
      if (saved) {
        const parsedStops = JSON.parse(saved);
        setStops(parsedStops);
        
        // Verifica che le fermate selezionate esistano ancora
        if (!parsedStops.find((stop: Stop) => stop.id === fromStopId)) {
          setFromStopId(parsedStops[0]?.id || "casa1");
        }
        if (!parsedStops.find((stop: Stop) => stop.id === toStopId)) {
          setToStopId(parsedStops[1]?.id || "uni");
        }
      }
    } catch (err) {
      console.error('Errore nel caricamento fermate:', err);
    }
  }, []);

  // Inizializza data e ora correnti
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().substring(0, 5); // HH:MM
    return { date, time };
  };

  // Funzione per ottenere le coordinate di una fermata
  const getStopCoords = (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    return stop ? stop.coords : CASA1_COORDS; // fallback
  };

  // Funzione per scambiare origine e destinazione
  const swapStops = () => {
    const temp = fromStopId;
    setFromStopId(toStopId);
    setToStopId(temp);
  };

  // Callback per aggiornare le fermate dal dialog impostazioni
  const handleStopsChange = (newStops: Stop[]) => {
    setStops(newStops);
    // Reset selezione se fermate non più disponibili
    if (!newStops.find(stop => stop.id === fromStopId)) {
      setFromStopId(newStops[0]?.id || "casa1");
    }
    if (!newStops.find(stop => stop.id === toStopId)) {
      setToStopId(newStops[1]?.id || "uni");
    }
  };

  // Ottieni fermata per ID
  const getStopById = (stopId: string) => stops.find(s => s.id === stopId);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "BUS":
        return <Bus className="w-4 h-4" />;
      case "WALK":
        return <span className="text-xs">🚶</span>;
      default:
        return <span className="text-xs">🚇</span>;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "BUS":
        return "bg-blue-500 text-white";
      case "WALK":
        return "bg-gray-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const searchTransport = async () => {
    setIsLoading(true);
    setError("");
    setResults([]);

    try {
      let date: string;
      let time: string;

      if (useCustomDateTime && customDate && customTime) {
        // Usa data e ora personalizzate
        const [year, month, day] = customDate.split('-');
        date = `${month}-${day}-${year}`;
        
        // Converti da 24h a 12h format
        const [hours, minutes] = customTime.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'pm' : 'am';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        time = `${hour12}:${minutes}${ampm}`;
      } else {
        // Usa data e ora correnti
        const now = new Date();
        date = now.toLocaleDateString("en-US", { 
          month: "numeric", 
          day: "numeric", 
          year: "numeric" 
        }).replace(/\//g, "-");
        time = now.toLocaleTimeString("en-US", { 
          hour: "numeric", 
          minute: "2-digit", 
          hour12: true 
        });
      }

      const fromPlace = getStopCoords(fromStopId);
      const toPlace = getStopCoords(toStopId);

      const params = new URLSearchParams({
        date,
        mode: "TRANSIT,WALK",
        arriveBy: "false",
        wheelchair: "false",
        fromPlace,
        toPlace,
        time,
        maxWalkDistance: "750",
        locale: "it"
      });

      const response = await fetch(
        `https://trasporti.opendatalaquila.it/infomobility/otp/routers/default/plan?${params}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TransportResponse = await response.json();
      
      if (data.plan && data.plan.itineraries) {
        setResults(data.plan.itineraries);
        
        // Scroll automatico ai risultati dopo un breve delay
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 300);
      } else {
        setError("Nessun percorso trovato per l'orario richiesto");
      }
    } catch (err) {
      console.error("Errore nella chiamata API:", err);
      setError("Errore nel recupero dei dati. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bus className="w-5 h-5" />
                <span>Pianifica il Viaggio</span>
              </CardTitle>
              <CardDescription>
                Trova il percorso migliore tra casa e università usando i trasporti pubblici
              </CardDescription>
            </div>
            <SettingsDialog onStopsChange={handleStopsChange}>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </SettingsDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selezione fermate */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Seleziona fermate:</label>
            
            {/* Fermata di partenza */}
            <div className="space-y-2">
              <Label className="text-sm">Da:</Label>
              <Select value={fromStopId} onValueChange={setFromStopId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((stop) => (
                    <SelectItem key={stop.id} value={stop.id}>
                      <div className="flex items-center space-x-2">
                        {stop.type === 'casa' && <Home className="w-4 h-4" />}
                        {stop.type === 'uni' && <School className="w-4 h-4" />}
                        {stop.type === 'special' && <MapPin className="w-4 h-4" />}
                        <span>{stop.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(() => {
                const fromStop = getStopById(fromStopId);
                return fromStop?.description ? (
                  <p className="text-xs text-gray-600 dark:text-gray-400">{fromStop.description}</p>
                ) : null;
              })()}
            </div>

            {/* Pulsante scambio */}
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={swapStops}>
                <ArrowRight className="w-4 h-4 transform rotate-90" />
              </Button>
            </div>

            {/* Fermata di destinazione */}
            <div className="space-y-2">
              <Label className="text-sm">A:</Label>
              <Select value={toStopId} onValueChange={setToStopId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((stop) => (
                    <SelectItem key={stop.id} value={stop.id}>
                      <div className="flex items-center space-x-2">
                        {stop.type === 'casa' && <Home className="w-4 h-4" />}
                        {stop.type === 'uni' && <School className="w-4 h-4" />}
                        {stop.type === 'special' && <MapPin className="w-4 h-4" />}
                        <span>{stop.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(() => {
                const toStop = getStopById(toStopId);
                return toStop?.description ? (
                  <p className="text-xs text-gray-600 dark:text-gray-400">{toStop.description}</p>
                ) : null;
              })()}
            </div>
          </div>

          {/* Controlli Data e Ora */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="useCustomDateTime"
                checked={useCustomDateTime}
                onChange={(e) => {
                  setUseCustomDateTime(e.target.checked);
                  if (e.target.checked) {
                    const { date, time } = getCurrentDateTime();
                    setCustomDate(date);
                    setCustomTime(time);
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="useCustomDateTime" className="text-sm font-medium cursor-pointer">
                Scegli data e ora personalizzate
              </Label>
            </div>

            {useCustomDateTime && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="customDate" className="text-sm font-medium">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data
                  </Label>
                  <Input
                    id="customDate"
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customTime" className="text-sm font-medium">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Ora
                  </Label>
                  <Input
                    id="customTime"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {!useCustomDateTime && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Sarà utilizzato l&apos;orario corrente al momento della ricerca
                </p>
              </div>
            )}
          </div>

          {/* Pulsante ricerca */}
          <Button 
            onClick={searchTransport} 
            disabled={isLoading || (useCustomDateTime && (!customDate || !customTime))}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ricerca percorsi...
              </>
            ) : (
              <>
                <Bus className="w-4 h-4 mr-2" />
                {useCustomDateTime ? "Cerca Mezzi per Data/Ora Scelta" : "Cerca Mezzi Adesso"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Errori */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Risultati */}
      {results.length > 0 && (
        <div ref={resultsRef} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            🚌 Soluzioni di viaggio trovate
          </h3>
          {results.map((itinerary, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(itinerary.startTime)} → {formatTime(itinerary.endTime)}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Durata totale: {formatDuration(itinerary.duration)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">
                      {itinerary.transfers} cambi
                    </Badge>
                    <Badge variant="outline">
                      {formatDuration(itinerary.walkTime)} a piedi
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.legs.map((leg, legIndex) => (
                    <div key={legIndex} className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getModeColor(leg.mode)}`}>
                        {getModeIcon(leg.mode)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {leg.mode === "BUS" ? (
                                <>Linea {leg.routeShortName} - {leg.headsign}</>
                              ) : (
                                "A piedi"
                              )}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {leg.from.name} → {leg.to.name}
                            </p>
                          </div>
                          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                            {leg.from.departure && (
                              <div>{formatTime(leg.from.departure)}</div>
                            )}
                            <div>{formatDuration(leg.duration)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}