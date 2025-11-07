import { auth } from "@/auth"
import { authOptions } from "./auth"

// Helper function for server components and API routes
export async function getServerSession() {
  return await auth()
}

