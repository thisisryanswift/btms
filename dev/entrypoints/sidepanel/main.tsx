import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../src/assets/styles.css';
import { SidePanel } from '../../src/components/SidePanel';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SidePanel />
    </React.StrictMode>
);
