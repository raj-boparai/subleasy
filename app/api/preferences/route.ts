import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      phone, email, market, role,
      move_in_start, move_in_end,
      move_out_start, move_out_end,
      max_budget, room_type,
      furnished_required, utilities_required
    } = body

    // Validate required fields
    if (!phone || !market || !move_in_start || !move_out_end || !max_budget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = supabaseAdmin()

    // Upsert user
    const { data: user, error: userError } = await db
      .from('users')
      .upsert({ phone, email }, { onConflict: 'phone' })
      .select('id')
      .single()

    if (userError) throw userError

    // If they're a lister, just save to waitlist and return
    if (role === 'lister') {
      await db.from('waitlist').upsert({
        email: email || phone,
        phone,
        market,
        role: 'lister'
      }, { onConflict: 'email' })

      return NextResponse.json({ success: true, role: 'lister' })
    }

    // Save preferences for renters
    const { error: prefError } = await db.from('preferences').insert({
      user_id: user.id,
      market,
      move_in_start,
      move_in_end: move_in_end || move_in_start,
      move_out_start: move_out_start || move_out_end,
      move_out_end,
      max_budget: parseInt(max_budget),
      room_type: room_type || 'any',
      furnished_required: !!furnished_required,
      utilities_required: !!utilities_required,
      active: true,
    })

    if (prefError) throw prefError

    return NextResponse.json({ success: true, role: 'renter' })
  } catch (err: any) {
    console.error('Preferences API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
