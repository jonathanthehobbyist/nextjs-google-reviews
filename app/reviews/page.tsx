'use client';

import { useState } from 'react';

export default function FetchReviewsPage() {
    const [placeId, setPlaceId] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReviews = async () => {
        if (!placeId) {
            setError('Please enter a valid Place ID');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/fetch-all-reviews?place_id=${placeId}`);
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

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Fetch Google Reviews</h1>
            <input
                type="text"
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                placeholder="Enter Google Place ID"
                className="border p-2 rounded w-full mb-2"
            />
            <button
                onClick={fetchReviews}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? 'Fetching...' : 'Fetch Reviews'}
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {reviews.length > 0 && (
                <div className="mt-4">
                    <h2 className="font-bold text-lg">Reviews:</h2>
                    {reviews.map((review, index) => (
                        <div key={index} className="border p-4 mb-4 rounded-lg shadow">
                            <h2 className="font-semibold">{review.author_name}</h2>
                            <p className="text-yellow-500">⭐ {review.rating}/5</p>
                            <p>{review.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
