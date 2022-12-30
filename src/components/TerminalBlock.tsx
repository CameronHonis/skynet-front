import React from "react";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalBlockHeader from "./TerminalBlockHeader";
import TerminalInput from "./TerminalInput";
import TerminalOutput from "./TerminalOutput";

interface Props {
    content: TerminalBlockContent;
    isInputBlock?: boolean;
}

const TerminalBlock = (props: Props) => {
    const {
        content,
        isInputBlock
    } = props;

    return <div className="TerminalBlock" id={isInputBlock ? "TerminalInputBlock" : undefined}>
       <TerminalBlockHeader username={content.username} location={content.location} />
       {content.input && <TerminalInput textContent={content.input} />}
       {content.output && <TerminalOutput textContents={content.output} />} 
    </div>
}

export default TerminalBlock;