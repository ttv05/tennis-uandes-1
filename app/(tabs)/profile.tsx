import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, logout } = useAuth();
  const [isEditingGender, setIsEditingGender] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(null);

  const setGenderMutation = trpc.auth.setGender.useMutation({
    onSuccess: () => {
      setIsEditingGender(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.error("Error updating gender:", error);
    },
  });

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logout();
    router.replace("/");
  };

  const handleSaveGender = async () => {
    if (selectedGender) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await setGenderMutation.mutateAsync({ gender: selectedGender });
    }
  };

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* User Avatar */}
          <View className="items-center gap-4">
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-5xl">👤</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold text-foreground">{user.name || "Usuario"}</Text>
              <Text className="text-sm text-muted">{user.email}</Text>
            </View>
          </View>

          {/* User Information */}
          <View className="gap-4">
            {/* Gender Section */}
            <View className="bg-surface rounded-2xl p-4 gap-3">
              <Text className="text-sm font-semibold text-muted">GÉNERO</Text>
              {!isEditingGender ? (
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg text-foreground">
                    {user.gender === "male" ? "👨 Hombre" : user.gender === "female" ? "👩 Mujer" : "No especificado"}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setIsEditingGender(true);
                      setSelectedGender(user.gender as "male" | "female" | null);
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text className="text-primary font-semibold">Editar</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-3">
                  <Pressable
                    onPress={() => setSelectedGender("male")}
                    style={({ pressed }) => [
                      {
                        backgroundColor: selectedGender === "male" ? colors.primary : colors.background,
                        borderColor: selectedGender === "male" ? colors.primary : colors.border,
                        borderWidth: 2,
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        selectedGender === "male" ? "text-background" : "text-foreground"
                      }`}
                    >
                      👨 Hombre
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedGender("female")}
                    style={({ pressed }) => [
                      {
                        backgroundColor: selectedGender === "female" ? colors.primary : colors.background,
                        borderColor: selectedGender === "female" ? colors.primary : colors.border,
                        borderWidth: 2,
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        selectedGender === "female" ? "text-background" : "text-foreground"
                      }`}
                    >
                      👩 Mujer
                    </Text>
                  </Pressable>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setIsEditingGender(false)}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          borderRadius: 8,
                          paddingVertical: 10,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text className="text-center font-semibold text-foreground">Cancelar</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveGender}
                      disabled={setGenderMutation.isPending}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          backgroundColor: colors.primary,
                          borderRadius: 8,
                          paddingVertical: 10,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text className="text-center font-semibold text-background">
                        {setGenderMutation.isPending ? "Guardando..." : "Guardar"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Role Section */}
            <View className="bg-surface rounded-2xl p-4 gap-3">
              <Text className="text-sm font-semibold text-muted">ROL</Text>
              <Text className="text-lg text-foreground">
                {user.role === "captain" ? "👨‍⚖️ Capitán" : user.role === "admin" ? "🔧 Admin" : "👤 Jugador"}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              {
                backgroundColor: colors.error,
                borderRadius: 12,
                paddingVertical: 14,
                marginTop: "auto",
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text className="text-center font-semibold text-background text-lg">Cerrar Sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
