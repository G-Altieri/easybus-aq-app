"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, Home, School, Clock, MapPin, ArrowRight, Loader2, Calendar } from "lucide-react";

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

export default function TransportPlanner() {
  const [direction, setDirection] = useState<"casa-uni" | "uni-casa">("casa-uni");
  const [selectedCasa, setSelectedCasa] = useState<"casa1" | "casa2">("casa1");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Itinerary[]>([]);
  const [error, setError] = useState<string>("");
  
  // Stati per data e ora personalizzate
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  // Inizializza data e ora correnti
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().substring(0, 5); // HH:MM
    return { date, time };
  };

  // Funzione per ottenere le coordinate della casa
  const getCasaCoordinates = () => {
    if (direction === "uni-casa") {
      return CASA_SPECIAL_COORDS; // Coordinate speciali quando si va dall'università a casa
    }
    return selectedCasa === "casa1" ? CASA1_COORDS : CASA2_COORDS;
  };

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

      const casaCoords = getCasaCoordinates();
      const fromPlace = direction === "casa-uni" ? casaCoords : UNI_COORDS;
      const toPlace = direction === "casa-uni" ? UNI_COORDS : casaCoords;

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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-20 flex flex-col space-y-2">
          <Bus className="w-6 h-6" />
          <span>Mezzi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bus className="w-5 h-5" />
            <span>Pianifica il Viaggio</span>
          </DialogTitle>
          <DialogDescription>
            Trova il percorso migliore tra casa e università usando i trasporti pubblici
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selezione direzione */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Direzione del viaggio:</label>
            <Select value={direction} onValueChange={(value: "casa-uni" | "uni-casa") => setDirection(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa-uni">
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4" />
                    <span>Casa</span>
                    <ArrowRight className="w-4 h-4" />
                    <School className="w-4 h-4" />
                    <span>Università</span>
                  </div>
                </SelectItem>
                <SelectItem value="uni-casa">
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4" />
                    <span>Università</span>
                    <ArrowRight className="w-4 h-4" />
                    <Home className="w-4 h-4" />
                    <span>Casa</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selezione Casa (solo per direzione casa-uni) */}
          {direction === "casa-uni" && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Quale casa:</label>
              <Select value={selectedCasa} onValueChange={(value: "casa1" | "casa2") => setSelectedCasa(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa1">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4" />
                      <span>Casa 1</span>
                      <span className="text-xs text-gray-500">(42.3571, 13.3904)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="casa2">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4" />
                      <span>Casa 2</span>
                      <span className="text-xs text-gray-500">(42.3584, 13.3864)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nota per direzione uni-casa */}
          {direction === "uni-casa" && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Destinazione: Casa speciale (42.3592, 13.3814)
              </p>
            </div>
          )}

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

          {/* Informazioni posizioni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>
                    {direction === "uni-casa" ? "Casa (Speciale)" : 
                     selectedCasa === "casa1" ? "Casa 1" : "Casa 2"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {direction === "uni-casa" ? "42.3592, 13.3814" :
                     selectedCasa === "casa1" ? "42.3571, 13.3904" : "42.3584, 13.3864"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <School className="w-4 h-4" />
                  <span>Università</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>42.3678, 13.3525</span>
                </div>
              </CardContent>
            </Card>
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

          {/* Errori */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Risultati */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Soluzioni di viaggio trovate:</h3>
              {results.map((itinerary, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
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
                                <p className="text-xs text-gray-600">
                                  {leg.from.name} → {leg.to.name}
                                </p>
                              </div>
                              <div className="text-right text-xs text-gray-500">
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
      </DialogContent>
    </Dialog>
  );
}