import TerminalProcess from "../models/terminal_process";
import Command, { Argument, Flag, Param } from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";
import Connection from "../models/connection";

class DisconnectCommand extends Command {
    connection: Connection | null = null;
    setConnection: SetState<Connection | null>;
    constructor(terminalParser: TerminalParser, setConnection: SetState<Connection | null>) {
        super(terminalParser);
        this.setConnection = setConnection;
    }

    _validate(_: Param[], __: Flag[], args: Argument[]): string | null {
        if (args.length > 0) {
            return `Too many arguments provided, expected none`;
        }
        return null;
    }

    execute(params: string[], id: number): TerminalProcess {
        const input = params.join(" ");

        const baseTerminalBlockContent = new TerminalBlockContent({ username: this.terminalParser.username!,
                                                                    location: this.terminalParser.location!,
                                                                    input });

        if (!this.connection) {
            this.addTerminalBlock(baseTerminalBlockContent.copyWith({ output: [`No connection established, exiting`]}));
            return new TerminalProcess({ id, name: "connect", exitCode: 1 });
        }

        this.connection.socket.close();
        this.setConnection(null);
        this.addTerminalBlock(new TerminalBlockContent(baseTerminalBlockContent.copyWith({
            output: [`Disconnected from ${this.connection?.socket.url}`]})));

        return new TerminalProcess({
            id, 
            name: "connect",
            exitCode: 0
        });
    }
}

export default DisconnectCommand;