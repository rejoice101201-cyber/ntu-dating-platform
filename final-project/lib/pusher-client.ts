import Pusher from 'pusher-js';

// Support multiple env var names to avoid misconfig
const PUSHER_KEY =
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
  process.env.NEXT_PUBLIC_PUSHER_KEY ||
  'dummy';
const PUSHER_CLUSTER =
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || 'ap1';

export const pusherClient = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
});

