import { NextResponse } from 'next/server'

export async function POST() {
  // Fail closed until the paid package, license verification, and download are ready.
  return NextResponse.json(
    { error: 'Ameno Cotas está em preparação. Compras temporariamente indisponíveis.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  )
}
