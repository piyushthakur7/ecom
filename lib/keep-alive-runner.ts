/**
 * Client/Server auto-keep-alive runner.
 * Automatically checks and pings InsForge DB every 2 days or on site load.
 */

let lastPingTime = 0;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function triggerKeepAliveIfExpired() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const storedLastPing = localStorage.getItem('insforge_last_keep_alive');
  const lastPing = storedLastPing ? parseInt(storedLastPing, 10) : 0;

  if (now - lastPing > THREE_DAYS_MS || now - lastPingTime > THREE_DAYS_MS) {
    lastPingTime = now;
    localStorage.setItem('insforge_last_keep_alive', now.toString());

    fetch('/api/keep-alive')
      .then((res) => res.json())
      .then((data) => {
        console.log('[Keep-Alive] InsForge DB pinged successfully:', data);
      })
      .catch((err) => {
        console.warn('[Keep-Alive] Auto-ping failed:', err);
      });
  }
}
