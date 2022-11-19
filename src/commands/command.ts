import TerminalParser from "../services/terminal_parser";
import TerminalProcess from "../models/terminal_process";
import TerminalBlockContent from "../models/terminal_block_contents";

export interface Flag {
    name: string;
    value: string | boolean;
}

abstract class Command {
    terminalParser: TerminalParser;

    constructor(terminalParser: TerminalParser) {
        this.terminalParser = terminalParser;
    }

    abstract validate(params: string[]): string | null

    abstract execute(params: string[], id: number): TerminalProcess

    getFlags(params: string[]): Flag[] {
        const flags: Flag[] = [];
        for (let param of params) {
            if (param.startsWith("-")) {
                if (!this._getIsValidDashFlag(param)) throw new Error(`Invalid flag parameter ${param}`);
                for (let i = 1; i < param.length; i++) {
                    flags.push({ name: param[i], value: true });
                }
            } else if (param.startsWith("--")) {
                if (!this._getIsValidDoubleDashFlag(param)) throw new Error(`Invalid flag parameter ${param}`);
                let name: string, value: string | boolean;
                if (param.includes("=")) {
                    name = param.substring(2, param.indexOf("="));
                    value = param.substring(param.indexOf("=") + 1);
                } else {
                    name = param.substring(2);
                    value = true;
                }
                flags.push({ name, value });
            }
        }
        return flags;
    }

    getArguments(params: string[]): string[] {
        const args: string[] = [];
        let isFirst = true;
        for (let param of params) {
            if (isFirst) {
                isFirst = false;
                continue;
            }
            if (!(param.startsWith("-") || param.startsWith("--"))) {
                args.push(param);
            }
        }
        return args;
    }

    private _getIsValidDashFlag(dashFlag: string): boolean {
        const regexMatch = dashFlag.match("-[A-z]*");
        if (!regexMatch || regexMatch[0] !== dashFlag) return false;
        return true;
    }

    private _getIsValidDoubleDashFlag(flag: string): boolean {
        if (flag.split("=").length > 2) return false;
        if (flag.split("=").length === 1) {
            const regexMatch = flag.match("--[A-z]*=[A-z]*");
            if (!regexMatch || regexMatch[0] !== flag) return false;
            return true;
        } else {
            const regexMatch = flag.match("--[A-z]*");
            if (!regexMatch || regexMatch[0] !== flag) return false;
            return true;
        }
    }

    updateLastProcess(process: Partial<TerminalProcess>): void {
        this.terminalParser.setLastProcess(this.terminalParser.lastProcess!.copyWith(process));
    }

    addTerminalBlock(content: TerminalBlockContent): void {
        this.terminalParser.setBlockContents([...this.terminalParser.blockContents!, content]);
    }

    addOutput(output: string): void {
        const newBlockContents = [...this.terminalParser.blockContents!];
        const lastIdx = newBlockContents.length - 1;
        newBlockContents[lastIdx] = newBlockContents[lastIdx].copyWith({
            output: [...newBlockContents[lastIdx].output, output]
        });
        this.terminalParser.setBlockContents(newBlockContents);
    }
}

export default Command;