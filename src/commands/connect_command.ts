import TerminalProcess from "../models/terminal_process";
import Command, {Argument, CommandVerb, Flag, Param} from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";
import Connection from "../models/connection";
import {SetState} from "index";

class ConnectCommand extends Command {
    connection: Connection | null = null;
    setConnection: SetState<Connection | null>;
    constructor(terminalParser: TerminalParser, setConnection: SetState<Connection | null>) {
        super(CommandVerb.CONNECT, "attempts to establish websocket connection", terminalParser);
        this.setConnection = setConnection;
    }

    _validate(_: Param[], __: Flag[], args: Argument[]): string | null {
        if (args.length === 0) {
            return `Expected URL (string) at parameter [1]`;
        } else if (args.length > 1) {
            return `Too many arguments provided, expected URL (string)`;
        }
        return null;
    }

    execute(tokens: string[], id: number): TerminalProcess {
        const input = tokens.join(" ");
        const args = this.getArguments(tokens);

        const baseTerminalBlockContent = new TerminalBlockContent({ username: this.terminalParser.username!,
                                                                    location: this.terminalParser.location!,
                                                                    input });

        if (this.connection) {
            this.addTerminalBlock(baseTerminalBlockContent.copyWith({ 
                output: [`Connection to ${this.connection.socket.url} is already established, exiting`]
            }));
            return new TerminalProcess({ id, name: this.verb, exitCode: 1 });
        }

        const parsedUrl = this._parseUrl(args[0].value);
        this.addTerminalBlock(baseTerminalBlockContent.copyWith({
            output: [`Connecting to ${parsedUrl} ...`]
        }));

        this._initiateConnection(parsedUrl);

        return new TerminalProcess({ id, name: this.verb});
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

        const handleOpen = (event: Event) => {
            this.addOutput("Connection Established");
            this.updateLastProcess({exitCode: 0});
            socket.send('Connection Established');
            socket.removeEventListener('close', handleOpenFailure);
        }

        const handleOpenFailure = (event: Event) => {
            this.addOutput("Connection failed");
            this.updateLastProcess({exitCode: 0});
            this.setConnection(null);
        }

        const handleMessage = (event: MessageEvent) => {
            console.log(`< ${event.data}`);
            if (this.connection && this.connection.messageHandler) {
                this.connection.messageHandler(event.data);
            }
        }

        socket.addEventListener('open', handleOpen);
        
        socket.addEventListener('close', handleOpenFailure);
        
        socket.addEventListener('message', handleMessage);

        this.setConnection(new Connection(socket));
    }
}

export default ConnectCommand;