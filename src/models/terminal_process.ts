interface TerminalProcessConstructor {
    id: number
    name: string
    isRunning?: boolean;
    exitCode?: number;
}

class TerminalProcess {
    id: number;
    name: string;
    exitCode: number = -1;

    constructor({ id, name, exitCode=-1 }: TerminalProcessConstructor) {
        this.id = id;
        this.name = name;
        this.exitCode = exitCode;
    }

    copyWith({ id, name, exitCode}: Partial<TerminalProcess>): TerminalProcess {
        return new TerminalProcess({
            id: id !== undefined ? id : this.id,
            name: name !== undefined ? name : this.name,
            exitCode: exitCode !== undefined ? exitCode : this.exitCode,
        });
    }
}

export default TerminalProcess;

