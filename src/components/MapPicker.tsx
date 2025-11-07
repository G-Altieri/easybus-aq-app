"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMapEvents, CircleMarker } from "react-leaflet";
import type { LeafletMouseEvent } from 'leaflet';

interface MapPickerProps {
  initialCoords?: string;
  onSelect: (coords: string) => void;
  trigger?: React.ReactNode;
}

function MapClickHandler({ onMapClick }: { onMapClick: (c: [number, number]) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

const parseCoords = (coords?: string): [number, number] => {
  if (!coords) return [42.3678, 13.35246];
  const parts = coords.split(",").map(p => parseFloat(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
  return [42.3678, 13.35246];
};

export default function MapPicker({ initialCoords, onSelect, trigger }: MapPickerProps) {
  const initial = parseCoords(initialCoords);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<[number, number] | null>(initial);
  const [userSelected, setUserSelected] = useState(false);

  // Se l'utente ha cliccato sulla mappa, invia subito la selezione e chiudi la dialog
  React.useEffect(() => {
    if (userSelected && selected) {
      onSelect(`${selected[0].toFixed(6)}, ${selected[1].toFixed(6)}`);
      setUserSelected(false);
      setOpen(false);
    }
  }, [userSelected, selected, onSelect]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline" size="sm">Seleziona su mappa</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Seleziona posizione sulla mappa</DialogTitle>
        </DialogHeader>

        <div className="h-[60vh]">
          <MapContainer center={selected ?? initial} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={(c) => { setSelected(c); setUserSelected(true); }} />
            {selected && <CircleMarker center={selected} radius={8} pathOptions={{ color: 'red' }} />}
          </MapContainer>
        </div>

        <div className="flex justify-end space-x-2 mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={() => {
            if (selected) {
              onSelect(`${selected[0].toFixed(6)}, ${selected[1].toFixed(6)}`);
            }
            setOpen(false);
          }}>
            Seleziona
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
