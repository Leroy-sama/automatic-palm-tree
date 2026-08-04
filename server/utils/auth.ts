import { SignJWT, jwtVerify } from 'jose'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SCRYPT_KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const next = scryptSync(password, salt, SCRYPT_KEYLEN)
  const prev = Buffer.from(hash, 'hex')
  if (prev.length !== next.length) return false
  return timingSafeEqual(prev, next)
}

function secretKey() {
  const secret = useRuntimeConfig().authSecret
  if (!secret || secret.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_AUTH_SECRET must be at least 32 characters',
    })
  }
  return new TextEncoder().encode(secret)
}

export async function signAuthToken(payload: { id: string; username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey())
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey())
  const id = payload.id
  const username = payload.username
  if (typeof id !== 'string' || typeof username !== 'string') {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
  return { id, username }
}

export function getBearerToken(event: Parameters<typeof getHeader>[0]) {
  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7)
}

export async function requireAuthUser(event: Parameters<typeof getHeader>[0]) {
  const token = getBearerToken(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return verifyAuthToken(token)
}
