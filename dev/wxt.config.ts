import { defineConfig } from 'wxt';

export default defineConfig({
    srcDir: '.',
    modules: ['@wxt-dev/module-react'],
    manifest: {
        name: 'BTMS - Better Tab Management System',
        version: '0.1.0',
        description: 'AI-powered browser session management',
        permissions: ['tabs', 'storage', 'tabGroups', 'windows', 'sidePanel'],
        optional_permissions: ['history'],
        side_panel: {
            default_path: 'sidepanel.html'
        }
    }
});
