import { prisma } from '@/lib/prisma'

// Daily refill cutoff 06:00 UTC+8
function getTodayCutoffUTC8() {
  const now = new Date()
  // Convert to UTC+8 by shifting milliseconds
  const utc8OffsetMs = 8 * 60 * 60 * 1000
  const local = new Date(now.getTime() + utc8OffsetMs)
  const cutoffLocal = new Date(local.getFullYear(), local.getMonth(), local.getDate(), 6, 0, 0, 0)
  // If now before today's 06:00 local, use previous day 06:00
  let cutoff = cutoffLocal
  if (local < cutoffLocal) {
    cutoff = new Date(cutoffLocal.getTime() - 24 * 60 * 60 * 1000)
  }
  // convert back to UTC
  return new Date(cutoff.getTime() - utc8OffsetMs)
}

export async function applyDailyEnergyRefill(userId: string) {
  const cutoff = getTodayCutoffUTC8()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { energy: true, energyMax: true, lastEnergyRefill: true },
  })
  if (!user) return null

  if (user.lastEnergyRefill < cutoff) {
    // 确保energyMax不超过50
    const maxEnergy = Math.min(user.energyMax, 50)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        energy: maxEnergy,
        energyMax: maxEnergy, // 同时更新energyMax确保不超过50
        lastEnergyRefill: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        birthday: true,
        gender: true,
        location: true,
        height: true,
        bio: true,
        energy: true,
        energyMax: true,
        createdAt: true,
        isVerified: true,
      },
    })
    return updated
  }
  return null
}

export function clampEnergy(value: number, max: number) {
  // 确保max不超过50
  const maxEnergy = Math.min(max, 50)
  return Math.min(Math.max(value, 0), maxEnergy)
}

// 确保energyMax不超过50
export function ensureMaxEnergy(max: number): number {
  return Math.min(max, 50)
}

