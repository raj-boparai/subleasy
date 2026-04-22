import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, description, price, market,
      room_type, furnished, utilities_included,
      available_start, available_end,
      address, url, image_url
    } = body

    if (!title || !price || !market || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = supabaseAdmin()

    const { data, error } = await db.from('listings').insert({
      source: 'facebook_submit',
      external_id: `fb_submit_${Date.now()}`,
      market,
      title,
      description,
      price: parseInt(price),
      room_type,
      furnished: !!furnished,
      utilities_included: !!utilities_included,
      available_start,
      available_end,
      address,
      url,
      image_url,
      active: true,
    }).select('id').single()

    if (error) throw error

    return NextResponse.json({ success: true, listing_id: data.id })
  } catch (err: any) {
    console.error('Listing submit error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const market = searchParams.get('market')
  const max_price = searchParams.get('max_price')

  const db = supabaseAdmin()
  let query = db.from('listings').select('*').eq('active', true).order('first_seen_at', { ascending: false })

  if (market) query = query.eq('market', market)
  if (max_price) query = query.lte('price', parseInt(max_price))

  const { data, error } = await query.limit(50)
  if (error) throw error

  return NextResponse.json(data)
}
