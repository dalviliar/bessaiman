import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me')

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const token = req.cookies.get('admin_session')?.value
  if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
