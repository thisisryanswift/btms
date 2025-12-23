export function SidePanel() {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4">
      <div className="space-y-4">
        <header className="text-center pb-4 border-b">
          <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
            BTMS Assistant
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your AI-powered session helper
          </p>
        </header>
        
        <main className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              🚀 Quick actions and insights coming soon...
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}