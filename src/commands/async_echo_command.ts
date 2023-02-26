import TerminalProcess from "../models/terminal_process";
import Command, {Argument, CommandVerb, Flag, Param} from "./command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalParser from "../services/terminal_parser";

class AsyncEchoCommand extends Command {
    constructor(terminalParser: TerminalParser) {
        super(CommandVerb.ASYNC_ECHO, "yields for given time and prints back input", terminalParser);
    }

    _validate(params: Param[], _: Flag[], args: Argument[]): string | null {
        if (args.length > 2) {
            return `Too many arguments, expected two arguments: Float String`;
        }
        if (args.length === 0 || Number.isNaN(Number.parseFloat(args[0].value))) {
            return `Expected type Float at parameter [1] '${args[0]}'`;
        }
        return null;
    }

    execute(tokens: string[], id: number): TerminalProcess {
        const input = tokens.join(" ");
        this.addTerminalBlock(new TerminalBlockContent({ username: this.terminalParser.username!, 
            location: this.terminalParser.location!, input}));
        const process = new TerminalProcess({
            id,
            name: this.verb,
        });

        const recurseParams = (paramIdx: number, delay: number): void => {
            setTimeout(() => {
                this.addOutput(tokens[paramIdx]);
                if (paramIdx < tokens.length - 1) {
                    recurseParams(paramIdx + 1, delay);
                } else {
                    this.updateLastProcess({exitCode: 0});
                }
            }, delay);
        }
        recurseParams(2, Number.parseFloat(tokens[1]));

        return process;
    }
}

export default AsyncEchoCommand;