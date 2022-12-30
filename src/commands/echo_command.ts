import TerminalProcess from "../models/terminal_process";
import Command, { Argument, Flag, Param } from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";

class EchoCommand extends Command {
    constructor(terminalParser: TerminalParser) {
        super(terminalParser);
    }

    _validate(params: Param[], _: Flag[], __: Argument[]): string | null {
        return null;
    }

    execute(params: string[], id: number): TerminalProcess {
        const input = params.join(" ");
        this.addTerminalBlock(new TerminalBlockContent({ username: this.terminalParser.username!, 
            location: this.terminalParser.location!, input, output: params.slice(1)}));

        return new TerminalProcess({
            id,
            name: "echo",
            exitCode: 0, 
        });
    }
}

export default EchoCommand;