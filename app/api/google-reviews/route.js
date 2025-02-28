import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const place_id = searchParams.get('place_id');

    if (!place_id) {
        return NextResponse.json({ error: 'Missing place_id' }, { status: 400 });
    }

    // debug check if API key is correctly read
    console.log("API Key from .env:", process.env.GOOGLE_PLACES_API_KEY);

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=reviews&key=${apiKey}`;

        console.log(`Fetching URL: ${url}`); //log the exact API request

        const response = await fetch(url);
        const text = await response.text();

        console.log("Google API Response", text);  //log what Google returns

        const data = JSON.parse(text);  //= await response.json();

        if (data.status !== 'OK') {
            return NextResponse.json({ error: 'Failed to fetch reviews', details: data }, { status: 400 });
        }

        return NextResponse.json(data.result.reviews || []);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
