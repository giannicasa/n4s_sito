import type { Access } from 'payload'

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Il pubblico vede solo i documenti pubblicati; chi è loggato vede anche le bozze.
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const anyone: Access = () => true
