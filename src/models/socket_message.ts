export default class SocketMessage {
    process: SocketProcess | undefined;

    constructor({ process }: Partial<SocketMessage>) {
        this.process = process;
    }

    static fromString(msg: string): SocketMessage {
        const parsed_msg = JSON.parse(msg);
        if ("process" in parsed_msg) {
            parsed_msg["process"] = JSON.parse(parsed_msg["process"]);
        }
        return new SocketMessage(parsed_msg);
    }
}

class SocketProcess {
    statusCode: number;
    output: string[]

    constructor({ statusCode, output }: SocketProcess) {
        this.statusCode = statusCode;
        this.output = output;
    }
}