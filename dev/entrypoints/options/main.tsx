import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../src/assets/styles.css';
import { OptionsApp } from '../../src/components/OptionsApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <OptionsApp />
    </React.StrictMode>
);
