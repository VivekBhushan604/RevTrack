declare module "react-native-zeroconf" {
    type ZeroconfService = {
        name: string;
        fullname: string;
        host: string;
        port: number;
        addresses: string[];
        txt: Record<string, string>;
    };

    type ZeroconfEvent =
        | "resolved"
        | "removed"
        | "updated"
        | "error"
        | "start"
        | "stop";

    class Zeroconf {
        scan(
            serviceType: string,
            protocol: string,
            domain?: string,
        ): void;

        stop(): void;

        on(
            event: ZeroconfEvent,
            callback: (service: ZeroconfService) => void,
        ): void;

        removeDeviceListeners(): void;
    }

    export default Zeroconf;
}