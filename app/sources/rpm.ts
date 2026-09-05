import { useEffect } from "react";
import {
    SharedValue,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { RevTrackWebSocket } from "../services/websockets";
import { useEspDiscovery } from "./espDiscovery";

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

    return { rpm };
}

export function useEspRpmSource(): RpmSource {
    const rpm = useSharedValue(0);
    // const { address } = useEspDiscovery();
    const address = "10.121.102.102";
    useEspDiscovery();
    useEffect(() => {
        if (!address) {
            return;
        }

        const url = `ws://${address}:81`;

        console.log("Connecting to ESP:", url);

        const socket = new RevTrackWebSocket({
            onTelemetry: (message) => {
                rpm.value = message.rpm;
            },
        });

        socket.connect(url);

        return () => {
            socket.disconnect();
        };
    }, [address]);



    return { rpm };
}