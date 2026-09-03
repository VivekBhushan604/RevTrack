import { View } from "react-native";
import { Tachometer } from "../components/tachometer/Tachometer";
import { V15_TACHOMETER_CONFIG } from "../config/bajajv15";
import { useEffect, useState } from "react";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function InstrumentScreen() {
  const testProgress = useSharedValue(0);

  useEffect(() => {
    testProgress.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true,
    );
  }, []);

  const rpm = useDerivedValue(() => {
    return testProgress.value * V15_TACHOMETER_CONFIG.maxRpm;
  });

  return (
    <View className="flex-1 bg-black ">
      <View className="flex-1 items-center justify-center">
        <Tachometer rpm={rpm} config={V15_TACHOMETER_CONFIG} />
      </View>
    </View>
  );
}
