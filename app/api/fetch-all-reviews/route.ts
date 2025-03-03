import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const place_id = searchParams.get('place_id');

    if (!place_id) {
        return NextResponse.json({ error: 'Missing place_id' }, { status: 400 });
    }

    try {
        let allReviews = [];
        let attempts = 0;

        while (allReviews.length < 1000 && attempts < 200) {
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== 'OK' || !data.result.reviews) {
                break;
            }

            allReviews = [...allReviews, ...data.result.reviews];

            // Insert into Supabase (only new reviews)
            const { data: insertedData, error } = await supabase
                .from('google_reviews')
                .upsert(data.result.reviews.map(review => ({
                    place_id,
                    author_name: review.author_name,
                    rating: review.rating,
                    text: review.text,
                    time: review.time
                })));

            if (error) console.error("Supabase Insert Error:", error);

            await new Promise((resolve) => setTimeout(resolve, 200));
            attempts++;
        }

        return NextResponse.json(allReviews);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
