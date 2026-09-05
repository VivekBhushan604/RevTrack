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

    private url: string | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    // True only when the owner explicitly calls disconnect().
    private manuallyDisconnected = false;

    private reconnectDelay = 1000;
    private readonly maxReconnectDelay = 10000;

    constructor(callbacks: WebSocketCallbacks = {}) {
        this.callbacks = callbacks;
    }

    connect(url: string) {
        this.url = url;
        this.manuallyDisconnected = false;

        this.clearReconnectTimer();

        if (
            this.socket &&
            (
                this.socket.readyState === WebSocket.OPEN ||
                this.socket.readyState === WebSocket.CONNECTING
            )
        ) {
            return;
        }

        this.createSocket();
    }

    /**
     * Intentionally stop this connection.
     * No automatic reconnect will happen after this.
     */
    disconnect() {
        this.manuallyDisconnected = true;
        this.url = null;

        this.clearReconnectTimer();

        const socket = this.socket;
        this.socket = null;

        if (socket) {
            socket.close();
        }

        this.callbacks.onStatusChange?.("disconnected");
    }

    /**
     * Tell the connection manager that the current connection
     * is dead, but keep the URL so it can reconnect.
     */
    reconnect() {
        if (!this.url) {
            return;
        }

        console.log("ESP WebSocket connection lost");

        this.manuallyDisconnected = false;

        const socket = this.socket;
        this.socket = null;

        if (socket) {
            socket.close();
        }

        this.scheduleReconnect();
    }

    private createSocket() {
        if (!this.url || this.manuallyDisconnected) {
            return;
        }

        const url = this.url;

        console.log("Creating ESP WebSocket:", url);

        this.callbacks.onStatusChange?.("connecting");

        const socket = new WebSocket(url);

        this.socket = socket;

        socket.onopen = () => {
            if (this.socket !== socket) {
                return;
            }

            console.log("ESP WebSocket connected");

            this.reconnectDelay = 1000;

            this.callbacks.onStatusChange?.("connected");
        };

        socket.onmessage = (event) => {
            if (this.socket !== socket) {
                return;
            }

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

        socket.onerror = () => {
            if (this.socket !== socket) {
                return;
            }

            console.warn("ESP WebSocket error");
        };

        socket.onclose = () => {
            if (this.socket !== socket) {
                return;
            }

            this.socket = null;

            console.log("ESP WebSocket disconnected");

            this.callbacks.onStatusChange?.("disconnected");

            if (!this.manuallyDisconnected) {
                this.scheduleReconnect();
            }
        };
    }

    private scheduleReconnect() {
        if (!this.url || this.manuallyDisconnected) {
            return;
        }

        if (this.reconnectTimer !== null) {
            return;
        }

        const delay = this.reconnectDelay;

        console.log(
            `ESP WebSocket reconnecting in ${delay}ms`,
        );

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;

            this.createSocket();

            this.reconnectDelay = Math.min(
                this.reconnectDelay * 2,
                this.maxReconnectDelay,
            );
        }, delay);
    }

    private clearReconnectTimer() {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private isTelemetryMessage(
        message: unknown,
    ): message is TelemetryMessage {
        if (
            typeof message !== "object" ||
            message === null
        ) {
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