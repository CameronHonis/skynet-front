import Command from "../commands/command";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalProcess from "../models/terminal_process";
import EchoCommand from "../commands/echo_command";
import ConnectCommand from "../commands/connect_command";
import AsyncEchoCommand from "../commands/async_echo_command";
import Connection from "../models/connection";
import DisconnectCommand from "../commands/disconnect_command";
import LocalStorageService from "./local_storage_service";
import SocketSendCommand from "../commands/socket_send_command";
import {SetState} from "index";

type Token = string;

class TerminalParser {
    lastProcess: TerminalProcess | null = null;
    blockContents: TerminalBlockContent[] | null = null;
    username: string | null = null;
    location: string | null = null;
    setLastProcess: SetState<TerminalProcess | null>
    setBlockContents: SetState<TerminalBlockContent[]>
    setConnection: SetState<Connection | null>
    commands: Command[];
    commandsByVerb: {[token: Token]: Command};
    socketSendCommand: SocketSendCommand;

    constructor(setLastProcess: SetState<TerminalProcess | null>,
                setBlockContents: SetState<TerminalBlockContent[]>,
                setConnection: SetState<Connection | null>) {
        this.setLastProcess = setLastProcess;
        this.setBlockContents = setBlockContents;
        this.setConnection = setConnection;

        this.commands = [
            new EchoCommand(this),
            new AsyncEchoCommand(this),
            new ConnectCommand(this, this.setConnection),
            new DisconnectCommand(this, this.setConnection),
        ];

        this.commandsByVerb = {};
        for (let command of this.commands) {
            this.commandsByVerb[command.verb] = command;
        }
        this.socketSendCommand = new SocketSendCommand(this);
    }

    parse(input: string) {
        const tokens = this._tokenize(input);
        if (window.connection) {
            const newProcessId = this.lastProcess ? this.lastProcess.id + 1 : 0;
            const process = this.socketSendCommand.execute(tokens, newProcessId);
            this.setLastProcess(process);
        } else {
            const command = this.commandsByVerb[tokens[0]];
            if (command) {
                const paramValidationErrorMessage = command.validate(tokens);
                if (paramValidationErrorMessage) {
                    this.setBlockContents([...this.blockContents!, new TerminalBlockContent({
                        username: this.username!, location: this.location!, input,
                        output: [paramValidationErrorMessage]
                    })]);
                } else {
                    const newProcessId = this.lastProcess ? this.lastProcess.id + 1 : 0;
                    const process = command.execute(tokens, newProcessId);
                    this.setLastProcess(process);
                }
            } else {
                this.setBlockContents([...this.blockContents!, new TerminalBlockContent({
                    username: this.username!, location: this.location!, input,
                    output: [`Command '${tokens[0]}' not found`]
                })]);
            }
        }
    }

    _tokenize(input: string): Token[] {
        return input.split(" ");
    }

}

export default TerminalParser;