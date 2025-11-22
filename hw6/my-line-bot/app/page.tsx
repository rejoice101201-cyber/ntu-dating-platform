export default function Home() {
  // 使用 production URL
  const webhookUrl = 'https://hw6-bot.vercel.app/api/webhooks/line';

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50">
            Line Bot AI 助手
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            您的 Line Bot 已成功部署並運行中！
          </p>
          <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-900/20 px-6 py-4">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              ✓ Webhook 端點已就緒
            </p>
            <p className="mt-2 text-xs text-green-600 dark:text-green-300">
              API 路徑: /api/webhooks/line
            </p>
          </div>
          <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            <p>請在 Line Developers Console 中設定 Webhook URL:</p>
            <p className="mt-2 font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded break-all">
              {webhookUrl}
            </p>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              注意：路徑是 <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded">/api/webhooks/line</code>（webhooks 是複數）
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
