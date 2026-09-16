from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:

    def __init__(self):
        # Stores active connections for each vendor
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(
        self,
        vendor_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()

        if vendor_id not in self.active_connections:
            self.active_connections[vendor_id] = []

        self.active_connections[vendor_id].append(websocket)

    def disconnect(
        self,
        vendor_id: int,
        websocket: WebSocket
    ):
        if vendor_id in self.active_connections:

            if websocket in self.active_connections[vendor_id]:
                self.active_connections[vendor_id].remove(websocket)

            if not self.active_connections[vendor_id]:
                del self.active_connections[vendor_id]

    async def send_to_vendor(
        self,
        vendor_id: int,
        message: dict
    ):
        connections = self.active_connections.get(
            vendor_id,
            []
        )

        disconnected = []

        for websocket in connections:

            try:
                await websocket.send_json(message)

            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(
                vendor_id,
                websocket
            )

manager = ConnectionManager()