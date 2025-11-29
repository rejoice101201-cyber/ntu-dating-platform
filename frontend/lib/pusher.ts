import Pusher from 'pusher';

let pusherInstance: Pusher | null = null;

export const getPusher = (): Pusher => {
  if (!pusherInstance) {
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
      throw new Error('Missing Pusher environment variables');
    }
    
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }
  
  return pusherInstance;
};

// Export for backward compatibility (will be initialized on first use)
export const pusher = new Proxy({} as Pusher, {
  get(_target, prop) {
    return getPusher()[prop as keyof Pusher];
  },
});

