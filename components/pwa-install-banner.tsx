import { View, Text, Pressable, Platform } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { usePWA } from '@/hooks/use-pwa';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

export function PWAInstallBanner() {
  const colors = useColors();
  const { isInstallable, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show on web
    if (Platform.OS === 'web' && isInstallable) {
      setShowBanner(true);
    }
  }, [isInstallable]);

  if (!showBanner || Platform.OS !== 'web') {
    return null;
  }

  const handleInstall = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await installApp();
    setShowBanner(false);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBanner(false);
  };

  return (
    <View
      className="bg-primary px-4 py-3 flex-row items-center justify-between gap-3"
      style={{ backgroundColor: colors.primary }}
    >
      <View className="flex-1 gap-1">
        <Text className="font-semibold text-background text-sm">Instalar Tenis Uandes</Text>
        <Text className="text-xs text-background opacity-90">
          Accede rápidamente desde tu pantalla de inicio
        </Text>
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            {
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text className="text-background text-xs font-semibold">Después</Text>
        </Pressable>

        <Pressable
          onPress={handleInstall}
          style={({ pressed }) => [
            {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
              opacity: pressed ? 0.5 : 1,
            },
          ]}
        >
          <Text className="text-background text-xs font-semibold">Instalar</Text>
        </Pressable>
      </View>
    </View>
  );
}
