import React from "react";
import TerminalBlockContent from "../models/terminal_block_contents";
import TerminalBlock from "./TerminalBlock";

import "../css/Terminal.css";
import TerminalProcess from "../models/terminal_process";
import Helpers from "../services/helpers";
import TerminalParser from "../services/terminal_parser";
import Connection from "../models/connection";
import ConnectCommand from "../commands/connect_command";
import DisconnectCommand from "../commands/disconnect_command";
import useStoredState from "../hooks/UseStoredState";

const CURSOR_VISIBLE_MS = 500;
const CURSOR_HIDDEN_MS = 500;
const CURSOR_FLASH_MS = 500;

const PERMITTED_INPUT = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>? ";

const HISTORY_QUEUE_SIZE = 50;

interface Props {
    username: string;
    focus: string;
    setFocus: SetState<string>;
    connection: Connection | null;
    setConnection: SetState<Connection | null>;
}

const Terminal = (props: Props) => {
    const {
        username,
        focus,
        setFocus,
        connection,
        setConnection
    } = props;

    const [ lastProcess, setLastProcess ] = React.useState<TerminalProcess | null>(null);
    const [ currInputText, setCurrInputText ] = React.useState<string>("");
    const [ cursorCharIndex, setCursorCharIndex ] = React.useState<number>(0);
    const [ isCursorVisible, setIsCursorVisible ] = React.useState<boolean>(true);
    const [ cursorTimeBank, setCursorTimeBank ] = React.useState<number>(CURSOR_VISIBLE_MS);
    const [ cursorTimeout, setCursorTimeout ] = React.useState<NodeJS.Timeout | null>(null);
    const [ selectedHistoryIndex, setSelectedHistoryIndex ] = React.useState<number>(-1);
    const [ history, setHistory ] = useStoredState<string[]>(["terminal", "history"], []);
    const [ blockContents, setBlockContents ] = React.useState<TerminalBlockContent[]>([
        new TerminalBlockContent({username: "camer", location: "unknown", input: "time", output: [new Date().toISOString()]}),
        new TerminalBlockContent({username: "camer", location: "unknown", input: "connect 192.168.1.127", output: ["attempting connection...", "connected!"]}),
        new TerminalBlockContent({username: "camer", location: "192.168.1.127", input: "lights off -a"}),
        new TerminalBlockContent({username: "camer", location: "192.168.1.127", input: "this is a really long input, so long that it might break something.... like maybe your precious styling? we'll just have to find out and see >:)", output: ["Command 'this' not found, did you mean 'test'?"]})
    ]);
    const [ inputProcessor, ] = React.useState<TerminalParser>(new TerminalParser(setLastProcess, setBlockContents, setConnection));

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFocus("terminal");
    }

    const location = React.useMemo(() => connection?.socket.url || "unknown", [connection]);

    React.useEffect(() => { // init
        const handleKeydown = (e: KeyboardEvent) => {
            if (focus !== "terminal") return;
            
            let newCursorCharIndex = cursorCharIndex;
            let newCurrInputText = currInputText;
            let newSelectedHistoryIndex = selectedHistoryIndex;
            let newHistory = history;
            if (e.key === "ArrowRight") {
                newCursorCharIndex = cursorCharIndex + 1;
            } else if (e.key === "ArrowLeft") {
                newCursorCharIndex = cursorCharIndex - 1;
            } else if (e.key === "ArrowUp") {
                if (selectedHistoryIndex < newHistory.length - 1) {
                    newSelectedHistoryIndex += 1;
                }
                newCurrInputText = newHistory[newSelectedHistoryIndex];
            } else if (e.key === "ArrowDown") {
                if (selectedHistoryIndex > 0) {
                    newSelectedHistoryIndex -= 1;
                    newCurrInputText = newHistory[newSelectedHistoryIndex];
                } else if (selectedHistoryIndex === 0) {
                    newSelectedHistoryIndex -= 1;
                    newCurrInputText = "";
                }
            } else if (e.key === "a" && e.ctrlKey) {
                newCursorCharIndex = 0;
            } else if (PERMITTED_INPUT.indexOf(e.key) > -1) {
                newCurrInputText = `${currInputText.substring(0, cursorCharIndex)}${e.key}${currInputText.substring(cursorCharIndex)}`;
                newCursorCharIndex++;
            } else if (e.key === "Space") {
                newCurrInputText = `${currInputText.substring(0, cursorCharIndex)} ${currInputText.substring(cursorCharIndex)}`;
                newCursorCharIndex++;
            } else if (e.key === "Backspace") {
                newCurrInputText = `${currInputText.substring(0, cursorCharIndex - 1)}${currInputText.substring(cursorCharIndex)}`;
                newCursorCharIndex--;
            } else if (e.key === "Enter") {
                newCurrInputText = "";
                inputProcessor.parse(currInputText);
                newHistory = [currInputText, ...history.slice(0, HISTORY_QUEUE_SIZE - 1)];
            }

            // normalize states
            newCursorCharIndex = Helpers.clamp(newCursorCharIndex, 0, newCurrInputText.length);

            // set changed states
            if (newCursorCharIndex !== cursorCharIndex) {
                setCursorCharIndex(newCursorCharIndex);
            }
            if (newCurrInputText !== currInputText) {
                setCurrInputText(newCurrInputText);
            }
            if (newSelectedHistoryIndex !== selectedHistoryIndex) {
                setSelectedHistoryIndex(newSelectedHistoryIndex);
            }
            if (newHistory !== history) {
                setHistory(newHistory);
            }
        }
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    });

    React.useEffect(() => {
        if (!isCursorVisible) {
            setIsCursorVisible(true);
            setCursorTimeBank(CURSOR_FLASH_MS);
        } else {
            setCursorTimeBank(Math.max(CURSOR_FLASH_MS, cursorTimeBank));
        }
    }, [cursorCharIndex]);

    React.useEffect(() => {
        if (cursorTimeout) {
            clearTimeout(cursorTimeout);
        }
        const newTimeout = setTimeout(() => {
            if (isCursorVisible) {
                setIsCursorVisible(false);
                setCursorTimeBank(CURSOR_HIDDEN_MS);
            } else {
                setIsCursorVisible(true);
                setCursorTimeBank(CURSOR_VISIBLE_MS);
            }
        }, cursorTimeBank);
        setCursorTimeout(newTimeout);
    }, [cursorTimeBank, isCursorVisible]);

    React.useEffect(() => {
        inputProcessor.lastProcess = lastProcess;
        inputProcessor.blockContents = blockContents;
        inputProcessor.username = username;
        inputProcessor.location = location;
    }, [lastProcess, blockContents, username, location]);

    React.useEffect(() => {
        (inputProcessor.commandsByVerb["connect"] as ConnectCommand).connection = connection;
        (inputProcessor.commandsByVerb["disconnect"] as DisconnectCommand).connection = connection;
    }, [connection]);


    let renderedInputText = currInputText;
    if (isCursorVisible && focus === "terminal") {
        if (cursorCharIndex >= renderedInputText.length) {
            renderedInputText += "█";
        } else {
            renderedInputText = renderedInputText.substring(0, cursorCharIndex) + "█" + renderedInputText.substring(cursorCharIndex + 1);
        }
    }
    const terminalClassName =
        focus === "terminal" ? "Focused " : "";
    return <div id="Terminal" className={terminalClassName} onClick={handleClick}>
        {
            blockContents.map((blockContent, idx) => <TerminalBlock content={blockContent} key={idx} />)
        }
        {
            !(lastProcess && lastProcess.exitCode === -1) &&
            <TerminalBlock content={new TerminalBlockContent({username, location, input: renderedInputText || " "})} isInputBlock />
        }
    </div>
}

export default Terminal;