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

    const { address } = useEspDiscovery();

    useEffect(() => {
        if (!address) {
            return;
        }

        const url = `ws://${address}:81`;

        console.log("Connecting to ESP:", url);

        let lastTelemetryTime = Date.now();
        let recovering = false;

        const socket = new RevTrackWebSocket({
            onTelemetry: (message) => {
                lastTelemetryTime = Date.now();
                recovering = false;

                rpm.value = message.rpm;
            },

            onStatusChange: (status) => {
                console.log(
                    "ESP WebSocket status:",
                    status,
                );

                if (status === "connected") {
                    lastTelemetryTime = Date.now();
                }
            },
        });

        socket.connect(url);

        const watchdog = setInterval(() => {
            const elapsed =
                Date.now() - lastTelemetryTime;

            if (elapsed > 1500 && !recovering) {
                console.log(
                    "ESP telemetry timeout:",
                    elapsed,
                    "ms",
                );

                recovering = true;

                rpm.value = 0;

                socket.reconnect();
            }
        }, 500);

        return () => {
            clearInterval(watchdog);
            socket.disconnect();
        };
    }, [address]);

    return { rpm };
}