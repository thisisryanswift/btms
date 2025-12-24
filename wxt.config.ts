import { defineConfig } from 'wxt';

export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifest: {
        name: 'BTMS - Better Tab Management System',
        version: '0.1.0',
        description: 'AI-powered browser session management',
        permissions: ['tabs', 'storage', 'tabGroups', 'windows', 'sidePanel', 'alarms'],
        optional_permissions: ['history'],
        options_ui: {
            page: 'options.html',
            open_in_tab: true
        },
        side_panel: {
            default_path: 'sidepanel.html'
        },
        action: {
            default_title: 'BTMS - Open Session Manager'
            // No default_popup - this allows action.onClicked to fire
        }
    }
});
