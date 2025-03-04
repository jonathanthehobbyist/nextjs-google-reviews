import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const place_id = searchParams.get('place_id');

    if (!place_id) {
        return NextResponse.json({ error: 'Missing place_id' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('google_reviews')
        .select('*')
        .eq('place_id', place_id)
        .order('time', { ascending: false }) // Show newest reviews first
        .limit(1000);

    if (error) {
        return NextResponse.json({ error: 'Database Error', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
