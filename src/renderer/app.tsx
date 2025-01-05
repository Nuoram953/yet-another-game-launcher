import * as ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import Cover from './components/Cover';

const CommandRunner = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleRunCommand = async () => {
    try {
      const result = await window.api.runCommand(command);
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err);
      setOutput('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Run Terminal Command</h1>
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Enter a command"
        style={{ width: '80%', padding: '10px' }}
      />
      <button onClick={handleRunCommand} style={{ marginLeft: '10px', padding: '10px' }}>
        Run
      </button>
      <div style={{ marginTop: '20px' }}>
        <h2>Output:</h2>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>{output}</pre>
        <h2>Error:</h2>
        <pre style={{ background: '#f8d7da', padding: '10px', color: '#721c24' }}>{error}</pre>
      </div>
    </div>
  );
};

const App = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center mx-10">
      <h1 className="text-4xl font-bold text-gray-800">
        🚀 Electron React Tailwind Typescript Starter
      </h1>
      <p className="mt-4 text-md text-gray-600">
      This starter repository provides a ready-to-use project template for building cross-platform
      desktop applications with Electron, React, TypeScript, and Tailwind CSS,
      utilizing Electron Forge for easy packaging and publishing.
      </p>

      <div className='flex flex-row flex-wrap gap-2'>
      <Cover fileName={"the_last_of_us_part_1.webp"}/>
      <Cover fileName={"the_last_of_us_part_1.webp"}/>
      <Cover fileName={"the_last_of_us_part_1.webp"}/>
      <Cover fileName={"the_last_of_us_part_1.webp"}/>


      </div>
    </div>
  </div>
);

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App/>);
}

render();
