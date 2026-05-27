import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const fundo = useThemeColor({}, 'background');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarButton: HapticTab,

        sceneStyle: {
          backgroundColor: fundo,
        },

        tabBarStyle: {
          backgroundColor: fundo,
          borderTopColor: '#1f2937',
        },

        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#9ca3af',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Turnos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}