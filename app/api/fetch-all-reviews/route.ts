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
        let allReviews = new Set();
        let attempts = 0;

        while (allReviews.length < 1000 && attempts < 200) {
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            const text = await response.text();
            console.log("Google API Response", text); // Log full  response
            const data = await response.json();

            if (data.status !== 'OK' || !data.result.reviews) {
                break;
            }

            // Filter out duplicate reviews using set
            data.result.reviews.forEach((review) => {
                allReviews.add(JSON.stringify({
                    place_id,
                    author_name: review.author_name,
                    rating: review.rating,
                    text: review.text,
                    time: review.time
                }));
            });

            // Convert set back to array
            const reviewsArray = Array.from(allReviews).map((r) => JSON.parse(r));

            // Insert into Supabase while avoiding duplicates
            const { error } = await supabase
                .from('google_reviews')
                .upsert(reviewsArray, { onConflict: ['place_id', 'author_name', 'time'] });


            

            if (error) {
                console.error("Supabase Insert Error:", error);
                return NextResponse.json({ error: "Supabase Insert Failed", details: error.message}, { status: 500});
            } else {
                console.log(`Inserted/Updated ${reviewsArray.length} reviews`);
            }

            await new Promise((resolve) => setTimeout(resolve, 200));
            attempts++;
        }

        return NextResponse.json(Array.from(allReviews).map((r) => JSON.parse(r)));
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
