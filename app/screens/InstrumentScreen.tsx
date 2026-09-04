import { View } from "react-native";
import { Tachometer } from "../components/tachometer/Tachometer";
import { V15_TACHOMETER_CONFIG } from "../config/bajajv15";

import { useTestRpmSource } from "../sources/rpm";

import { useFonts } from "expo-font";
import { Rajdhani_300Light } from "@expo-google-fonts/rajdhani";
import { Exo_300Light_Italic } from "@expo-google-fonts/exo";

export function InstrumentScreen() {
  const [fontsLoaded] = useFonts({
    Rajdhani: Rajdhani_300Light,
    ExoItalic: Exo_300Light_Italic,
  });

  const { rpm } = useTestRpmSource();

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center">
        <Tachometer rpm={rpm} speed={100} config={V15_TACHOMETER_CONFIG} />
      </View>
    </View>
  );
}
