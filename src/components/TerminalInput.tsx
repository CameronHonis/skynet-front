import React from "react";

interface Props {
    textContent: string;
}

const TerminalInput = (props: Props) => {
    const {
        textContent
    } = props;

    return <div className="TerminalInput">
        <span className="TerminalInput-Arrow"><b>➜</b></span>
        <span className="TerminalInput-Text">{textContent}</span> 
    </div>
}

export default TerminalInput;