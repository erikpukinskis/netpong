import { useEffect } from "react";

export function OpponentProvider({ children }) {
    useEffect(function openWebSocket() {
        const websocket = new WebSocket("ws://localhost:8080/ws");

        websocket.onopen = () => {
            setInterval(() => {
                console.log("ping?");
                websocket.send("ping");
            }, 2000);
        };
        websocket.onmessage = (message) => {
            console.log(message.data);
        };
    }, []);

    return children;
}
