"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Users, Settings, Download, Smartphone, Wifi, Bus } from "lucide-react";
import { useState, useEffect } from "react";
import TransportPlanner from "@/components/TransportPlanner";

export default function Home() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if PWA is installable
    const checkInstallable = () => {
      if ('serviceWorker' in navigator) {
        setIsInstallable(true);
      }
    };
    
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    checkInstallable();
    updateOnlineStatus();
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EasyUni</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
                <Wifi className="w-3 h-3" />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </Badge>
              {isInstallable && (
                <Button size="sm" variant="outline" className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>Installa App</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
 

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            La tua università a portata di mano
          </h2>
      
        </div>

        {/* Features Tabs */}
       

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TransportPlanner />
  
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 EasyUni.</p>
        </div>
      </footer>
    </div>
  );
}
