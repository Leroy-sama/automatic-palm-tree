export default defineEventHandler(async (event) => {
  const token = getBearerToken(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return verifyAuthToken(token)
})
