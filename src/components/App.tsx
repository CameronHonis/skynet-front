import React from 'react';
import Connection from '../models/connection';
import '../css/App.css';
import Terminal from './Terminal';
import useStoredState from "../hooks/UseStoredState";

function App() {
  const [ focus, setFocus ] = React.useState<string>("terminal");
  // const [ connection, setConnection ] = React.useState<Connection | null>(null);
  const [ connection, setConnection ] = React.useState<Connection | null>(null);
  window.connection = connection;
  const handleClick = () => {
    setFocus("app");
  }

  return (
    <div id="App" onClick={handleClick}>
      <Terminal username={"camer"} focus={focus} setFocus={setFocus} connection={connection} setConnection={setConnection} />
    </div>
  );
}

export default App;
