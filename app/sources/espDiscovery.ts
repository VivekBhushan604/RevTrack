import { useEffect, useState } from "react";
import Zeroconf from "react-native-zeroconf";

const zeroconf = new Zeroconf();

export type EspDiscovery = {
    address: string | null;
};

export function useEspDiscovery(): EspDiscovery {
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        console.log("Starting RevTrack discovery...");


        const handleResolved = (service: any) => {
            console.log("REVTRACK SERVICE RESOLVED");
            console.log(service);


            const discoveredAddress = service.addresses?.[0];

            if (discoveredAddress && mounted) {
                console.log(
                    "RevTrack ESP address:",
                    discoveredAddress,
                );

                setAddress(discoveredAddress);
            }
        };

        const handleError = (error: any) => {
            console.log("REVTRACK DISCOVERY ERROR:");
            console.log(error);
        };

        const handleStart = () => {
            console.log("RevTrack discovery STARTED");
        };

        const handleStop = () => {
            console.log("RevTrack discovery STOPPED");
        };

        zeroconf.on("resolved", handleResolved);
        zeroconf.on("error", handleError);
        zeroconf.on("start", handleStart);
        zeroconf.on("stop", handleStop);

        console.log("Calling zeroconf.scan()...");

        zeroconf.scan(
            "revtrack",
            "tcp",
            "local.",

        );

        return () => {
            mounted = false;

            console.log("Stopping RevTrack discovery...");

            zeroconf.stop();
            zeroconf.removeDeviceListeners();
        };
    }, []);

    return { address };
}