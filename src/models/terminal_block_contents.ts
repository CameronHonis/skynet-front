interface TerminalBlockContentConstructor {
    username: string
    location: string
    input?: string;
    output?: string[];
}

class TerminalBlockContent {
    username: string;
    location: string;
    input?: string;
    output: string[];

    constructor({username, location, input, output=[]}: TerminalBlockContentConstructor) {
        this.username = username;
        this.location = location;
        this.input = input;
        this.output = output;
    }

    copyWith({username, location, input, output}: Partial<TerminalBlockContent>): TerminalBlockContent {
        return new TerminalBlockContent({
            username: username !== undefined ? username : this.username,
            location: location !== undefined ? location : this.location,
            input: input !== undefined ? input : this.input,
            output: output !== undefined ? output : this.output
        });
    }
}

export default TerminalBlockContent;