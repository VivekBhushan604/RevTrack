export type TelemetryMessage = {
    type: "telemetry";
    rpm: number;
};

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected";

type WebSocketCallbacks = {
    onTelemetry?: (message: TelemetryMessage) => void;
    onStatusChange?: (status: ConnectionStatus) => void;
};

export class RevTrackWebSocket {
    private socket: WebSocket | null = null;
    private callbacks: WebSocketCallbacks;


    constructor(callbacks: WebSocketCallbacks = {}) {
        this.callbacks = callbacks;
    }

    connect(url: string) {
        if (this.socket) {
            return;
        }

        this.callbacks.onStatusChange?.("connecting");

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.callbacks.onStatusChange?.("connected");
        };

        this.socket.onmessage = (event) => {
            try {
                const message: unknown = JSON.parse(event.data);

                if (!this.isTelemetryMessage(message)) {
                    return;
                }

                this.callbacks.onTelemetry?.(message);
            } catch {
                console.warn("Invalid WebSocket message");
            }
        };

        this.socket.onerror = () => {
            this.callbacks.onStatusChange?.("disconnected");
        };

        this.socket.onclose = () => {
            this.socket = null;
            this.callbacks.onStatusChange?.("disconnected");
        };
    }

    disconnect() {
        this.socket?.close();
        this.socket = null;
        this.callbacks.onStatusChange?.("disconnected");
    }

    private isTelemetryMessage(
        message: unknown,
    ): message is TelemetryMessage {
        if (typeof message !== "object" || message === null) {
            return false;
        }

        const data = message as Record<string, unknown>;

        return (
            data.type === "telemetry" &&
            typeof data.rpm === "number" &&
            Number.isFinite(data.rpm)
        );
    }
}