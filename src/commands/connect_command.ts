import TerminalProcess from "../models/terminal_process";
import Command from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";
import Connection from "../models/connection";

class ConnectCommand extends Command {
    connection: Connection | null = null;
    setConnection: SetState<Connection | null>;
    constructor(terminalParser: TerminalParser, setConnection: SetState<Connection | null>) {
        super(terminalParser);
        this.setConnection = setConnection;
    }

    validate(params: string[]): string | null {
        if (!params[1]) return `Expected URL (string) at parameter [1]`;
        return null;
    }

    execute(params: string[], id: number): TerminalProcess {
        if (this.connection) {
            this.addOutput(`Connection to ${this.connection.socket.url} is already established`);
            return new TerminalProcess({ id, name: "connect", exitCode: 1 });
        }
        const input = params.join(" ");
        const parsedUrl = this._parseUrl(this.getArguments(params)[0]);
        this.addTerminalBlock(new TerminalBlockContent({ username: this.terminalParser.username!, 
            location: this.terminalParser.location!, input, output: [`Connecting to ${parsedUrl} ...`]}));
        const process = new TerminalProcess({
            id, 
            name: "connect"
        });

        this._initiateConnection(parsedUrl);

        return process;
    }

    private _parseUrl(rawUrl: string): string {
        if (rawUrl.startsWith("https://")) {
            return `ws://${rawUrl.substring(8)}`;
        } else if (rawUrl.startsWith("http://")) {
            return `ws://${rawUrl.substring(7)}`;
        } else if (!(rawUrl.startsWith("ws://") || rawUrl.startsWith("wss://"))) {
            return `ws://${rawUrl}`;
        }
        return rawUrl;
    }

    private _initiateConnection(url: string): void {
        const socket = new WebSocket(url);
        socket.addEventListener('open', (event) => {
            this.addOutput("Connection Established");
            this.updateLastProcess({exitCode: 0});
            socket.send('Connection Established');
        });
        
        socket.addEventListener('close', (event) => {
            this.addOutput("Connection failed");
            this.updateLastProcess({exitCode: 0});
        });
        
        socket.addEventListener('message', function (event) {
            console.log(event.data);
        });

        this.setConnection(new Connection(socket));
    }
}

export default ConnectCommand;