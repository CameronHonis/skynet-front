class Connection {
    socket: WebSocket

    constructor(socket: WebSocket) {
        this.socket = socket;
    }
}

export default Connection;