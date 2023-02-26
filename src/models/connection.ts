class Connection {
    socket: WebSocket
    messageHandler: ((msg: string) => any) | null

    constructor(socket: WebSocket, messageHandler: ((msg: string) => any) | null = null) {
        this.socket = socket;
        this.messageHandler = messageHandler;
    }
}

export default Connection;