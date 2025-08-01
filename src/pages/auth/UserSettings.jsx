import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, Lock, Activity } from 'lucide-react';
import ProfileSettings from '../../components/settings/ProfileSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import ActivityLog from '../../components/settings/ActivityLog';
import SecuritySettings from './SecuritySettings';
import PrivacySettings from '../../components/settings/PrivacySettings';

// NOTE: The components for each tab's content are stubbed out for now.
// They will need to be created and imported.

/*
NOTE pour le thème "terre/bois/vert olive":
Les couleurs personnalisées comme 'olive', 'earth-brown', 'wood' 
devront être ajoutées à votre fichier tailwind.config.js.
Exemple:
theme: {
  extend: {
    colors: {
      'olive': {
        100: '#F3F4E4',
        200: '#E7E9C9',
        500: '#8A9A5B',
        800: '#556B2F',
      },
      'earth-brown': '#A0522D',
      'wood': '#8B4513',
    },
  },
},
*/

const UserSettings = () => {
  return (
    <div className="min-h-screen bg-olive-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-olive-800" style={{ fontFamily: "'Georgia', 'serif'" }}>
            Paramètres du Compte
          </h1>
          <p className="text-lg text-stone-600 mt-2">
            Gérez vos informations, votre sécurité et vos préférences.
          </p>
        </header>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-transparent p-0 border-b-2 border-olive-200">
            <TabsTrigger value="profile" className="data-[state=active]:bg-olive-200 data-[state=active]:text-olive-800 text-stone-600 hover:bg-olive-100/50 flex items-center gap-2 px-4 py-3 text-base font-semibold transition-all rounded-t-lg border-b-2 border-transparent data-[state=active]:border-olive-500 -mb-px">
              <User size={18} /> Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-olive-200 data-[state=active]:text-olive-800 text-stone-600 hover:bg-olive-100/50 flex items-center gap-2 px-4 py-3 text-base font-semibold transition-all rounded-t-lg border-b-2 border-transparent data-[state=active]:border-olive-500 -mb-px">
              <Shield size={18} /> Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-olive-200 data-[state=active]:text-olive-800 text-stone-600 hover:bg-olive-100/50 flex items-center gap-2 px-4 py-3 text-base font-semibold transition-all rounded-t-lg border-b-2 border-transparent data-[state=active]:border-olive-500 -mb-px">
              <Bell size={18} /> Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-olive-200 data-[state=active]:text-olive-800 text-stone-600 hover:bg-olive-100/50 flex items-center gap-2 px-4 py-3 text-base font-semibold transition-all rounded-t-lg border-b-2 border-transparent data-[state=active]:border-olive-500 -mb-px">
              <Lock size={18} /> Confidentialité
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-olive-200 data-[state=active]:text-olive-800 text-stone-600 hover:bg-olive-100/50 flex items-center gap-2 px-4 py-3 text-base font-semibold transition-all rounded-t-lg border-b-2 border-transparent data-[state=active]:border-olive-500 -mb-px">
              <Activity size={18} /> Activité
            </TabsTrigger>
          </TabsList>

          <div className="bg-white/70 backdrop-blur-sm mt-4 p-6 rounded-lg shadow-lg border border-olive-200/50">
            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="privacy">
              <PrivacySettings />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityLog />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default UserSettings; 