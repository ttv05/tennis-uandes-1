import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function GenderSelectionScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setGenderMutation = trpc.auth.setGender.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      router.replace("/(tabs)");
    },
    onError: (error) => {
      setIsLoading(false);
      console.error("Error setting gender:", error);
    },
  });

  const handleSelectGender = async (gender: "male" | "female") => {
    setSelectedGender(gender);
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await setGenderMutation.mutateAsync({ gender });
    } catch (error) {
      setIsLoading(false);
      setSelectedGender(null);
    }
  };

  return (
    <ScreenContainer className="p-6 justify-center">
      <View className="gap-8">
        {/* Header */}
        <View className="gap-2 items-center">
          <Text className="text-4xl font-bold text-foreground">¿Cuál es tu género?</Text>
          <Text className="text-base text-muted text-center leading-relaxed">
            Esto ayuda a optimizar entrenamientos hombre-hombre y mujer-mujer
          </Text>
        </View>

        {/* Gender Selection Buttons */}
        <View className="gap-4">
          {/* Male Button */}
          <Pressable
            onPress={() => handleSelectGender("male")}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                backgroundColor: selectedGender === "male" ? colors.primary : colors.surface,
                borderColor: selectedGender === "male" ? colors.primary : colors.border,
                borderWidth: 2,
                borderRadius: 16,
                paddingVertical: 20,
                paddingHorizontal: 24,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View className="items-center gap-3">
              <Text className="text-5xl">👨</Text>
              <Text
                className={`text-xl font-semibold ${
                  selectedGender === "male" ? "text-background" : "text-foreground"
                }`}
              >
                Hombre
              </Text>
            </View>
          </Pressable>

          {/* Female Button */}
          <Pressable
            onPress={() => handleSelectGender("female")}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                backgroundColor: selectedGender === "female" ? colors.primary : colors.surface,
                borderColor: selectedGender === "female" ? colors.primary : colors.border,
                borderWidth: 2,
                borderRadius: 16,
                paddingVertical: 20,
                paddingHorizontal: 24,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View className="items-center gap-3">
              <Text className="text-5xl">👩</Text>
              <Text
                className={`text-xl font-semibold ${
                  selectedGender === "female" ? "text-background" : "text-foreground"
                }`}
              >
                Mujer
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View className="items-center gap-2">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-sm text-muted">Guardando tu información...</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
