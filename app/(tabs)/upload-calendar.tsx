import { useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

interface TimeBlock {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  source: "ocr";
  weekNumber: number;
  year: number;
}

export default function UploadCalendarScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "processing" | "confirm">("upload");
  const [processedBlocks, setProcessedBlocks] = useState<TimeBlock[]>([]);
  const [weekNumber, setWeekNumber] = useState(getCurrentWeek());
  const [year, setYear] = useState(new Date().getFullYear());

  const processOCRMutation = trpc.calendar.processOCR.useMutation({
    onSuccess: (data) => {
      setProcessedBlocks(data.blocks);
      setStep("confirm");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", `No se pudo procesar la imagen: ${error.message}`);
      setStep("upload");
    },
  });

  const saveAvailabilityMutation = trpc.availability.save.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Éxito", "Tu disponibilidad ha sido guardada correctamente");
      router.back();
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", `No se pudo guardar la disponibilidad: ${error.message}`);
    },
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);

      // Upload image to S3 and get URL
      await uploadImageAndProcess(imageUri);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso denegado", "Se necesita acceso a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      await uploadImageAndProcess(imageUri);
    }
  };

  const uploadImageAndProcess = async (imageUri: string) => {
    try {
      setStep("processing");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });

      // Create data URL
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Process with OCR
      await processOCRMutation.mutateAsync({
        imageUrl: dataUrl,
        weekNumber,
        year,
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", `No se pudo procesar la imagen: ${error instanceof Error ? error.message : "Unknown error"}`);
      setStep("upload");
    }
  };

  const handleConfirmAvailability = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Convert blocks to availability format
    const availabilityBlocks = processedBlocks.map((block) => ({
      dayOfWeek: block.dayOfWeek,
      startTime: block.startTime,
      endTime: block.endTime,
      isAvailable: block.isAvailable,
      source: "ocr" as const,
    }));

    saveAvailabilityMutation.mutate({
      weekNumber,
      year,
      blocks: availabilityBlocks,
    });
  };

  const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Sube tu Horario</Text>
            <Text className="text-sm text-muted">
              {step === "upload"
                ? "Captura o selecciona una foto de tu calendario universitario"
                : step === "processing"
                  ? "Procesando tu calendario..."
                  : "Revisa y confirma tu disponibilidad"}
            </Text>
          </View>

          {step === "upload" && (
            <View className="gap-4">
              {/* Camera Button */}
              <Pressable
                onPress={handleTakePhoto}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 16,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Text className="text-center font-semibold text-background text-lg">📷 Tomar Foto</Text>
              </Pressable>

              {/* Gallery Button */}
              <Pressable
                onPress={handlePickImage}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingVertical: 16,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Text className="text-center font-semibold text-foreground text-lg">🖼️ Seleccionar de Galería</Text>
              </Pressable>

              {/* Info Box */}
              <View className="bg-surface rounded-2xl p-4 gap-2 border border-border">
                <Text className="font-semibold text-foreground">💡 Consejos:</Text>
                <Text className="text-sm text-muted">
                  • Asegúrate que el calendario sea legible{"\n"}• Incluye todos los días de la semana{"\n"}• La imagen debe estar bien iluminada
                </Text>
              </View>
            </View>
          )}

          {step === "processing" && (
            <View className="items-center justify-center py-12 gap-4">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-lg font-semibold text-foreground">Analizando tu calendario...</Text>
              <Text className="text-sm text-muted text-center">Esto puede tomar unos segundos</Text>
            </View>
          )}

          {step === "confirm" && (
            <View className="gap-4">
              {/* Processed Blocks */}
              <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
                <Text className="font-semibold text-foreground">Bloques Detectados:</Text>

                {processedBlocks.length > 0 ? (
                  <View className="gap-2">
                    {processedBlocks.map((block, idx) => (
                      <View
                        key={idx}
                        className="flex-row justify-between items-center p-3 bg-background rounded-lg"
                      >
                        <View className="flex-1">
                          <Text className="font-semibold text-foreground">
                            {DAYS[block.dayOfWeek]} {block.startTime}-{block.endTime}
                          </Text>
                          <Text className="text-xs text-muted">
                            {block.isAvailable ? "✓ Disponible" : "✕ Ocupado"}
                          </Text>
                        </View>
                        <View
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: block.isAvailable ? colors.success : colors.error,
                          }}
                        />
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-muted">No se detectaron bloques de horario</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setStep("upload")}
                  disabled={saveAvailabilityMutation.isPending}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingVertical: 14,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text className="text-center font-semibold text-foreground">Volver</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmAvailability}
                  disabled={saveAvailabilityMutation.isPending}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      paddingVertical: 14,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text className="text-center font-semibold text-background">
                    {saveAvailabilityMutation.isPending ? "Guardando..." : "Confirmar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}
