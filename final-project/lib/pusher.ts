import Pusher from 'pusher';

const PUSHER_APP_ID = process.env.PUSHER_APP_ID || '';
const PUSHER_SECRET = process.env.PUSHER_SECRET || '';
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1';

// Only create Pusher instance if all required env vars are set
let pusherServer: Pusher | null = null;

if (PUSHER_APP_ID && PUSHER_SECRET && PUSHER_KEY) {
  pusherServer = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
} else {
  // Create a dummy Pusher instance for build time
  pusherServer = new Pusher({
    appId: 'dummy',
    key: 'dummy',
    secret: 'dummy',
    cluster: 'ap1',
    useTLS: true,
  });
}

export { pusherServer };

