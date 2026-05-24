import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WorkspaceProvider } from './workspace/WorkspaceContext';
import { ResumePdfProvider } from './pdf/ResumePdfContext';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <WorkspaceProvider>
      <ResumePdfProvider>
        <App />
      </ResumePdfProvider>
    </WorkspaceProvider>
  </React.StrictMode>,
);
