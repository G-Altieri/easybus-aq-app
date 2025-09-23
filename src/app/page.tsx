"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TransportHome from "@/components/TransportHome";
import { Bus, Download } from "lucide-react";

// Interface per l'evento di installazione PWA
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Gestisce l&apos;evento beforeinstallprompt per le PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      setInstallPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header con stato dell'app */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EasyBusAq</h1>
              {/* <Badge variant="secondary">PWA</Badge> */}
            </div>
            <div className="flex items-center space-x-2">
              {/* Indicatore di connessione */}
              {/* <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                <span>{isOnline ? "Online" : "Offline"}</span>
              </Badge> */}
              
              {/* Pulsante di installazione PWA */}
              {isInstallable && (
                <Button variant="outline" size="sm" onClick={handleInstall}>
                  <Download className="w-4 h-4 mr-1" />
                  Installa
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenuto principale */}
      <div className="container mx-auto px-4 py-6">
        <TransportHome />
      </div>
    </main>
  );
}
