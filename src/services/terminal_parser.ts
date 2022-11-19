import React from "react";
import Command from "../commands/command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalProcess from "../models/terminal_process";
import EchoCommand from "../commands/echo_command";
import ConnectCommand from "../commands/connect_command";
import AsyncCommand from "../commands/async_command";
import Connection from "../models/connection";

type Token = string;

class TerminalParser {
    lastProcess: TerminalProcess | null = null;
    blockContents: TerminalBlockContent[] | null = null;
    username: string | null = null;
    location: string | null = null;
    setLastProcess: SetState<TerminalProcess | null>
    setBlockContents: SetState<TerminalBlockContent[]>
    setConnection: SetState<Connection | null>

    commandsByName: {[token: Token]: Command};

    constructor(setLastProcess: SetState<TerminalProcess | null>,
                setBlockContents: SetState<TerminalBlockContent[]>,
                setConnection: SetState<Connection | null>) {
        this.setLastProcess = setLastProcess;
        this.setBlockContents = setBlockContents;
        this.setConnection = setConnection;
        this.commandsByName = {
            "echo": new EchoCommand(this),
            "async": new AsyncCommand(this),
            "connect": new ConnectCommand(this, this.setConnection),
        }
    }

    parse(input: string) {
        const tokens = this._tokenize(input);
        const command = this.commandsByName[tokens[0]];
        if (command) {
            const paramValidationErrorMessage = command.validate(tokens);
            if (paramValidationErrorMessage) {
                this.setBlockContents([...this.blockContents!, new TerminalBlockContent({ username: this.username!, location: this.location!, input,
                    output: [paramValidationErrorMessage]})]);
            } else {
                const newProcessId = this.lastProcess ? this.lastProcess.id + 1 : 0;
                const process = command.execute(tokens, newProcessId);
                this.setLastProcess(process);
            }
        } else {
            this.setBlockContents([...this.blockContents!, new TerminalBlockContent({ username: this.username!, location: this.location!, input, 
                output: [`Command '${tokens[0]}' not found`]})]);
        }
    }

    _tokenize(input: string): Token[] {
        return input.split(" ");
    }

}

export default TerminalParser;