import TerminalProcess from "../models/terminal_process";
import Command, {Argument, CommandVerb, Flag, Param} from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";
import SocketMessage from "../models/socket_message";

class SocketSendCommand extends Command {
    constructor(terminalParser: TerminalParser) {
        super(CommandVerb.SOCKET_SEND, "sends message over socket connection", terminalParser);
    }

    _validate(params: Param[], _: Flag[], args: Argument[]): string | null {
        return null;
    }

    execute(tokens: string[], id: number): TerminalProcess {
        const input = tokens.join(" ");
        if (!window.connection) {
            this.addTerminalBlock(new TerminalBlockContent({ username: this.terminalParser.username!,
            location: this.terminalParser.location!, input, output: ["Error: No valid connection established"]}));
            return new TerminalProcess({
                id,
                name: this.verb,

            });
        }

        window.connection.socket.send(input);
        window.connection.messageHandler = (msg: string) => this.handleSocketMessage(this, msg);
        this.addTerminalBlock(new TerminalBlockContent({ username: this.terminalParser.username!,
            location: this.terminalParser.location!, input}));
        return new TerminalProcess({
            id,
            name: this.verb,
        });
    }

    handleSocketMessage(self: SocketSendCommand, msg: string): void {
        const sockMsg = SocketMessage.fromString(msg);
        if (sockMsg.process) {
            if (!self.terminalParser.blockContents) {
                throw new Error("Block contents mysteriously not set after receiving a socket message");
            }
            const lastBlockContent = self.terminalParser.blockContents[self.terminalParser.blockContents.length - 1]
            for (let i = lastBlockContent.output.length; i < sockMsg.process.output.length; i++) {
                self.addOutput(sockMsg.process.output[i]);
            }
            if (sockMsg.process.statusCode > -1) {
                self.updateLastProcess({exitCode: sockMsg.process.statusCode});
            }
        }
    }
}

export default SocketSendCommand;