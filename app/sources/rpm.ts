import { useEffect } from "react";
import {
    SharedValue,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

export type RpmSource = {
    rpm: SharedValue<number>;
};

export function useTestRpmSource(): RpmSource {
    const testProgress = useSharedValue(0);

    useEffect(() => {
        testProgress.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true,
        );
    }, []);

    const rpm = useDerivedValue(() => {
        return testProgress.value * 10000;
    });

    return {
        rpm,
    };
}