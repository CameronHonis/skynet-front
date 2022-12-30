import TerminalProcess from "../models/terminal_process";
import Command, { Argument, Flag, Param } from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";

class AsyncCommand extends Command {
    constructor(terminalParser: TerminalParser) {
        super(terminalParser);
    }

    _validate(params: Param[], _: Flag[], args: Argument[]): string | null {
        if (args.length > 1) {
            return `Too many arguments, expected one argument Float`;
        }
        if (args.length === 0 || Number.isNaN(Number.parseFloat(args[1].value))) {
            return `Expected type Float at parameter [1] '${params[1]}'`;
        }
        return null;
    }

    execute(params: string[], id: number): TerminalProcess {
        const input = params.join(" ");
        this.addTerminalBlock(new TerminalBlockContent({ username: this.terminalParser.username!, 
            location: this.terminalParser.location!, input}));
        const process = new TerminalProcess({
            id,
            name: "async",
        });

        const recurseParams = (paramIdx: number, delay: number): void => {
            setTimeout(() => {
                this.addOutput(params[paramIdx]);
                if (paramIdx < params.length - 1) {
                    recurseParams(paramIdx + 1, delay);
                } else {
                    this.updateLastProcess({exitCode: 0});
                }
            }, delay);
        }
        recurseParams(2, Number.parseFloat(params[1]));

        return process;
    }
}

export default AsyncCommand;