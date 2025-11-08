import Pusher from "pusher-js"

let pusherClient: Pusher | null = null

export function getPusherClient(): Pusher {
  if (typeof window === "undefined") {
    // Server-side: return a mock or throw error
    throw new Error("Pusher client can only be initialized on the client side")
  }

  const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  if (!appKey) {
    throw new Error("NEXT_PUBLIC_PUSHER_APP_KEY is not set. Please check your .env.local file.")
  }

  if (!cluster) {
    throw new Error("NEXT_PUBLIC_PUSHER_CLUSTER is not set. Please check your .env.local file.")
  }

  if (!pusherClient) {
    pusherClient = new Pusher(appKey, {
      cluster: cluster,
      forceTLS: true,
    })
  }

  return pusherClient
}

