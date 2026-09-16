from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.utils.websocket_manager import manager


router = APIRouter()


@router.websocket("/ws/vendor/{vendor_id}")
async def vendor_websocket(
    websocket: WebSocket,
    vendor_id: int
):

    await manager.connect(
        vendor_id,
        websocket
    )

    try:

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(
            vendor_id,
            websocket
        )