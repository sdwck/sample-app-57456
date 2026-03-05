import { useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:8080/ws';

type WsHandler = (event: string, payload: any) => void;

export function useWebSocket(onMessage: WsHandler) {
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const handlerRef = useRef(onMessage);
    handlerRef.current = onMessage;

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => setConnected(true);

            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    handlerRef.current(msg.event, msg.payload);
                } catch {}
            };

            ws.onclose = () => {
                setConnected(false);
                setTimeout(connect, 2000);
            };

            ws.onerror = () => ws.close();
        };

        connect();

        return () => {
            const ws = wsRef.current;
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
        };
    }, []);

    return connected;
}