import { auth } from './auth'
import { NextRequest } from 'next/server'

export async function getAuthSession(request?: NextRequest) {
  try {
    const headers = request?.headers || new Headers()
    return await auth.api.getSession({
      headers: headers
    })
  } catch (error) {
    console.error('Failed to get auth session:', error)
    return null
  }
}