import React from "react";

// TODO: add pretty formatting
interface Props {
    textContents: string[];
}

const TerminalOutput = (props: Props) => {
    const {
        textContents
    } = props;

    return <div className="TerminalOutput">
        {textContents.map((textContent, idx) => <span key={idx}>{textContent}</span>)}
    </div>
}

export default TerminalOutput;