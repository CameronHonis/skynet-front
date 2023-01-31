import TerminalProcess from "../models/terminal_process";
import Command, { Argument, Flag, Param } from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";

class EchoCommand extends Command {
    constructor(terminalParser: TerminalParser) {
        super("echo", "prints out input", terminalParser);
    }

    _validate(params: Param[], _: Flag[], __: Argument[]): string | null {
        return null;
    }

    execute(tokens: string[], id: number): TerminalProcess {
        const input = tokens.join(" ");
        this.addTerminalBlock(new TerminalBlockContent({ username: this.terminalParser.username!, 
            location: this.terminalParser.location!, input, output: tokens.slice(1)}));

        return new TerminalProcess({
            id,
            name: this.verb,
            exitCode: 0, 
        });
    }
}

export default EchoCommand;