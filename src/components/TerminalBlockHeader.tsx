import React from "react";

interface Props {
    username: string;
    location: string;
}

const TerminalBlockHeader = (props: Props) => {
    const {
        username,
        location
    } = props;

    return <div className="TerminalBlockHeader">
        <span className="TerminalBlockHeader-Username"><b>{username}</b></span>
        <span>in</span>
        <span className="TerminalBlockHeader-Location"><b>{location}</b></span>
    </div>
}

export default TerminalBlockHeader;