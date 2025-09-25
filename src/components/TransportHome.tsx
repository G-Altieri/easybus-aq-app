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

export default function TransportHome() {
  // Nuova logica: selezione libera di due fermate
  const [fromStopId, setFromStopId] = useState<string>("casa1");
  const [toStopId, setToStopId] = useState<string>("uni");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Itinerary[]>([]);
  const [error, setError] = useState<string>("");
  
  // Stato per le tratte perse (negli ultimi 5 minuti)
  const [missedResults, setMissedResults] = useState<Itinerary[]>([]);
  const [isMissedLoading, setIsMissedLoading] = useState(false);
  
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return stop ? stop.coords : DEFAULT_STOPS[0].coords; // fallback alla prima fermata predefinita
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

  // Funzione helper per ottenere data e ora in formato API
  const getApiDateTime = (offsetMinutes: number = 0) => {
    let baseDate: Date;
    
    if (useCustomDateTime && customDate && customTime) {
      // Usa data e ora personalizzate come base
      const [year, month, day] = customDate.split('-');
      const [hours, minutes] = customTime.split(':');
      baseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    } else {
      // Usa data e ora correnti
      baseDate = new Date();
    }
    
    // Applica l'offset in minuti
    const targetDate = new Date(baseDate.getTime() + offsetMinutes * 60000);
    
    // Formato date per API
    const date = targetDate.toLocaleDateString("en-US", { 
      month: "numeric", 
      day: "numeric", 
      year: "numeric" 
    }).replace(/\//g, "-");
    
    // Formato time per API (12h format)
    const time = targetDate.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true 
    });
    
    return { date, time };
  };

  // Funzione helper per fare una chiamata API
  const makeApiCall = async (offsetMinutes: number = 0): Promise<Itinerary[]> => {
    const { date, time } = getApiDateTime(offsetMinutes);
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
    return data.plan?.itineraries || [];
  };

  const searchTransport = async () => {
    setIsLoading(true);
    setIsMissedLoading(true);
    setError("");
    setResults([]);
    setMissedResults([]);

    try {
      // Chiama API per l'orario richiesto (normale)
      const normalResults = await makeApiCall(0);
      setResults(normalResults);

      // Chiama API per 5 minuti prima per trovare i bus persi
      const missedResults = await makeApiCall(-10);
      
      // Filtra le tratte perse: solo quelle che partivano nei 5 minuti precedenti
      const { time: requestedTime } = getApiDateTime(0);
      const requestedTimeMs = getTimeInMinutes(requestedTime);
      const fiveMinutesBeforeMs = requestedTimeMs - 5; // 5 minuti prima
      
      // Crea set delle tratte normali per evitare duplicati
      const normalRoutes = new Set(
        normalResults.flatMap(itinerary => 
          itinerary.legs
            .filter(leg => leg.mode !== 'WALK' && leg.route)
            .map(leg => `${leg.route}-${leg.from.departure}`)
        )
      );
      
      const filteredMissedResults = missedResults.filter(itinerary => {
        // Controlla se c'è almeno una leg di trasporto (non solo walk)
        const hasTransit = itinerary.legs.some(leg => leg.mode !== 'WALK');
        if (!hasTransit) return false;
        
        // Prendi il tempo di partenza del primo trasporto pubblico
        const firstTransitLeg = itinerary.legs.find(leg => leg.mode !== 'WALK');
        if (!firstTransitLeg?.from?.departure) return false;
        
        const departureTimeMs = firstTransitLeg.from.departure;
        const departureTime = new Date(departureTimeMs).toLocaleTimeString("en-US", { 
          hour: "numeric", 
          minute: "2-digit", 
          hour12: true 
        });
        const departureMinutes = getTimeInMinutes(departureTime);
        
        // Escludi se già presente nei risultati normali
        const routeKey = `${firstTransitLeg.route}-${firstTransitLeg.from.departure}`;
        if (normalRoutes.has(routeKey)) return false;
        
        // Includi solo se la partenza è nei 5 minuti precedenti all'orario richiesto
        return departureMinutes >= fiveMinutesBeforeMs && departureMinutes < requestedTimeMs;
      });
      
      setMissedResults(filteredMissedResults);
        
      // Scroll automatico ai risultati dopo un breve delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
      
      if (normalResults.length === 0 && filteredMissedResults.length === 0) {
        setError("Nessun percorso trovato per l'orario richiesto");
      }
    } catch (err) {
      console.error("Errore nella chiamata API:", err);
      setError("Errore nel recupero dei dati. Riprova più tardi.");
    } finally {
      setIsLoading(false);
      setIsMissedLoading(false);
    }
  };

  // Funzione helper per convertire tempo in minuti per confronto
  const getTimeInMinutes = (timeString: string): number => {
    const [time, ampm] = timeString.split(/(?=[ap]m)/i);
    const [hours, minutes] = time.split(':').map(Number);
    let totalHours = hours;
    
    if (ampm.toLowerCase() === 'pm' && hours !== 12) {
      totalHours += 12;
    } else if (ampm.toLowerCase() === 'am' && hours === 12) {
      totalHours = 0;
    }
    
    return totalHours * 60 + minutes;
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

      {/* Tratte perse (negli ultimi 5 minuti) */}
      {missedResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>⏰ Autobus appena persi (ultimi 5 minuti)</span>
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Questi autobus sarebbero dovuti passare prima dell&apos;orario da te richiesto ma sono già partiti.
          </p>
          {missedResults.map((itinerary, index) => (
            <Card key={`missed-${index}`} className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center space-x-2 text-red-700 dark:text-red-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(itinerary.startTime)} → {formatTime(itinerary.endTime)}
                      </span>
                      <Badge variant="destructive" className="ml-2 text-xs">PERSO</Badge>
                    </CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400">
                      Durata totale: {formatDuration(itinerary.duration)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {formatDuration(itinerary.walkTime)} camminata
                    </Badge>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {itinerary.transfers} trasferimenti
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.legs.map((leg, legIndex) => (
                    <div key={legIndex} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getModeColor(leg.mode)}`}>
                        {leg.mode === 'WALK' ? (
                          <MapPin className="w-4 h-4" />
                        ) : (
                          <Bus className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">
                              {leg.mode === 'WALK' ? 'A piedi' : `Linea ${leg.route || leg.routeShortName || 'N/A'}`}
                              {leg.headsign && leg.mode !== 'WALK' && (
                                <span className="text-sm text-red-600 dark:text-red-400 ml-2">→ {leg.headsign}</span>
                              )}
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400">
                              {leg.from.name} → {leg.to.name}
                              {leg.from.departure && leg.to.arrival && (
                                <span className="ml-2">
                                  ({formatTime(leg.from.departure)} - {formatTime(leg.to.arrival)})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-red-600 dark:text-red-400">
                            <div>{Math.round((leg.distance || 0))} m</div>
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

      {/* Indicatore di caricamento per tratte perse */}
      {isMissedLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-red-500" />
          <span className="text-red-600">Controllo autobus persi...</span>
        </div>
      )}
    </div>
  );
}