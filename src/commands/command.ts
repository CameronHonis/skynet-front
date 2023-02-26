import TerminalParser from "../services/terminal_parser";
import TerminalProcess from "../models/terminal_process";
import TerminalBlockContent from "../models/terminal_block_contents";

export interface Flag {
    name: string;
    value: string | boolean;
    pos: number;
    isFlag: true;
}

export interface Argument {
    value: string;
    pos: number;
    isArgument: true;
}

export type Param = Flag | Argument;

export enum CommandVerb {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    ECHO = "echo",
    ASYNC_ECHO = "async-echo",
    SOCKET_SEND = "socket-send"
}

abstract class Command {
    verb: CommandVerb;
    summary: string;
    terminalParser: TerminalParser;

    constructor(verb: CommandVerb, summary: string, terminalParser: TerminalParser) {
        this.verb = verb;
        this.summary = summary;
        this.terminalParser = terminalParser;
    }

    abstract _validate(params: Param[], flags: Flag[], args: Argument[]): string | null

    abstract execute(tokens: string[], id: number): TerminalProcess

    validate(rawParams: string[]): string | null {
        let flags: Flag[], args: Argument[];
        // validate flag and args parsing
        try {
            flags = this.getFlags(rawParams);
            args = this.getArguments(rawParams); 
        } catch (err) {
            //@ts-ignore
            return `Error parsing params: ${err.message}`;
        }

        // insertion sort flags and args based on position
        // Note: assumes `flags` and `args` are both sorted by pos initially
        const params: Param[] = [];
        let flagIdx = 0;
        let argIdx = 0;
        while (flagIdx < flags.length && argIdx < args.length) {
            if (flags[flagIdx].pos < args[argIdx].pos) {
                params.push(flags[flagIdx]);
                flagIdx++;
            } else {
                params.push(args[argIdx]);
                argIdx++;
            }
        }
        params.push(...flags.slice(flagIdx));
        params.push(...args.slice(argIdx));

        // return result of unique command validation
        return this._validate(params, flags, args);
    }

    getFlags(params: string[]): Flag[] {
        const flags: Flag[] = [];
        for (let paramIdx = 1; paramIdx < params.length; paramIdx++) {
            const param = params[paramIdx];
            if (param.startsWith("-")) {
                if (!this._getIsValidDashFlag(param)) throw new Error(`Invalid flag parameter ${param}`);
                for (let i = 1; i < param.length; i++) {
                    flags.push({ name: param[i], value: true, pos: paramIdx, isFlag: true});
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
                flags.push({ name, value, pos: paramIdx, isFlag: true});
            }
        }
        return flags;
    }

    getArguments(params: string[]): Argument[] {
        const args: Argument[] = [];
        for (let paramIdx = 1; paramIdx < params.length; paramIdx++) {
            const param = params[paramIdx];
            if (!(param.startsWith("-") || param.startsWith("--"))) {
                args.push({ value: param, pos: paramIdx, isArgument: true});
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