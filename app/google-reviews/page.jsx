'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GoogleReviews() {
    const searchParams = useSearchParams(); // ✅ Correct way to access searchParams
    const placeId = searchParams.get('place_id'); // ✅ Get the value safely

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!placeId) {
            setLoading(false);
            setError('Missing place_id in URL');
            return;
        }

        const fetchReviews = async () => {
            try {
                const response = await fetch(`/api/google-reviews?place_id=${placeId}`);
                const data = await response.json();

                if (response.ok) {
                    setReviews(data);
                } else {
                    throw new Error(data.error || 'Failed to fetch reviews');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [placeId]); // ✅ Run effect when placeId changes

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Google Reviews</h1>
            {loading && <p>Loading reviews...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && reviews.length === 0 && <p>No reviews found.</p>}

            {reviews.map((review, index) => (
                <div key={index} className="border p-4 mb-4 rounded-lg shadow">
                    <h2 className="font-semibold">{review.author_name}</h2>
                    <p className="text-yellow-500">⭐ {review.rating}/5</p>
                    <p>{review.text}</p>
                </div>
            ))}
        </div>
    );
}
