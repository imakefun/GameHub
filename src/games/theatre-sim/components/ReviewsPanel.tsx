import { useState } from 'react';
import type { GameState, ReviewCategory } from '../types';
import { getDayName } from '../types';

interface Props {
  state: GameState;
}

const categoryLabels: Record<ReviewCategory, string> = {
  cleanliness: 'Cleanliness',
  service: 'Service',
  experience: 'Experience',
  value: 'Value',
  facilities: 'Facilities',
};

const categoryIcons: Record<ReviewCategory, string> = {
  cleanliness: '🧹',
  service: '👤',
  experience: '🎬',
  value: '💰',
  facilities: '🏢',
};

const ratingColors: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-yellow-400',
  4: 'text-lime-400',
  5: 'text-green-400',
};

const ratingBgs: Record<number, string> = {
  1: 'bg-red-900/20 border-red-800/30',
  2: 'bg-orange-900/20 border-orange-800/30',
  3: 'bg-yellow-900/20 border-yellow-800/30',
  4: 'bg-lime-900/20 border-lime-800/30',
  5: 'bg-green-900/20 border-green-800/30',
};

type FilterType = 'all' | 1 | 2 | 3 | 4 | 5;

export function ReviewsPanel({ state }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<ReviewCategory | 'all'>('all');

  const reviews = [...state.reviews].reverse();
  const filteredReviews = reviews
    .filter(r => filter === 'all' || r.rating === filter)
    .filter(r => categoryFilter === 'all' || r.category === categoryFilter);

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0];
  for (const r of state.reviews) {
    ratingCounts[r.rating - 1]++;
  }
  const totalReviews = state.reviews.length;

  // Category average ratings
  const categoryAvgs: Record<ReviewCategory, { total: number; count: number }> = {
    cleanliness: { total: 0, count: 0 },
    service: { total: 0, count: 0 },
    experience: { total: 0, count: 0 },
    value: { total: 0, count: 0 },
    facilities: { total: 0, count: 0 },
  };
  for (const r of state.reviews.slice(-100)) {
    categoryAvgs[r.category].total += r.rating;
    categoryAvgs[r.category].count++;
  }

  // Find worst category for actionable feedback
  let worstCategory: ReviewCategory | null = null;
  let worstAvg = 6;
  for (const [cat, data] of Object.entries(categoryAvgs)) {
    if (data.count >= 3) {
      const avg = data.total / data.count;
      if (avg < worstAvg) {
        worstAvg = avg;
        worstCategory = cat as ReviewCategory;
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header — Yelp-style */}
      <div className="bg-gradient-to-r from-red-900/30 to-red-800/10 rounded-xl p-4 border border-red-800/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Starlight Cinema
              <span className="text-xs bg-red-600/30 text-red-300 px-2 py-0.5 rounded-full">Reviews</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-2xl font-bold ${ratingColors[Math.round(state.overallRating)] || 'text-yellow-400'}`}>
                {state.overallRating.toFixed(1)}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`text-lg ${star <= Math.round(state.overallRating) ? 'text-yellow-400' : 'text-slate-600'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-400">
                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Today's visitors</p>
            <p className="text-lg font-bold text-white">{state.dailyCustomerCount}</p>
          </div>
        </div>

        {/* Actionable feedback */}
        {worstCategory && worstAvg < 3 && (
          <div className="mt-3 p-2 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-amber-400 font-medium">
              {categoryIcons[worstCategory]} Customers are unhappy about: {categoryLabels[worstCategory].toLowerCase()}
              <span className="text-slate-500 ml-1">(avg {worstAvg.toFixed(1)}★)</span>
            </p>
          </div>
        )}
      </div>

      {/* Rating distribution bar chart */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Rating Breakdown</h4>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star - 1];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <button
                key={star}
                onClick={() => setFilter(filter === star ? 'all' : star as FilterType)}
                className={`w-full flex items-center gap-2 py-0.5 rounded transition-colors ${
                  filter === star ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'
                }`}
              >
                <span className="text-xs text-slate-400 w-6 text-right">{star}★</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">By Category</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(categoryLabels) as ReviewCategory[]).map(cat => {
            const data = categoryAvgs[cat];
            const avg = data.count > 0 ? data.total / data.count : 0;
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(isSelected ? 'all' : cat)}
                className={`p-2 rounded-lg text-center transition-all border ${
                  isSelected
                    ? 'bg-slate-700 border-slate-500'
                    : 'bg-slate-800/30 border-slate-700/20 hover:border-slate-600/40'
                }`}
              >
                <span className="text-lg">{categoryIcons[cat]}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{categoryLabels[cat]}</p>
                {data.count > 0 ? (
                  <p className={`text-sm font-bold ${ratingColors[Math.round(avg)]}`}>
                    {avg.toFixed(1)}★
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">—</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Filter:</span>
        <button
          onClick={() => { setFilter('all'); setCategoryFilter('all'); }}
          className={`text-xs px-2 py-1 rounded ${
            filter === 'all' && categoryFilter === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map(star => (
          <button
            key={star}
            onClick={() => setFilter(filter === star ? 'all' : star as FilterType)}
            className={`text-xs px-2 py-1 rounded ${
              filter === star ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {star}★
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-2">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              {totalReviews === 0
                ? 'No reviews yet. Open the theatre and start showing movies to get customer feedback!'
                : 'No reviews match this filter.'}
            </p>
          </div>
        ) : (
          filteredReviews.slice(0, 30).map(review => (
            <div
              key={review.id}
              className={`rounded-lg p-3 border ${ratingBgs[review.rating]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{review.authorName}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`text-xs ${star <= review.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {categoryIcons[review.category]}
                      {categoryLabels[review.category]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">{review.text}</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Day {review.day} ({getDayName(review.day)})
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        {filteredReviews.length > 30 && (
          <p className="text-xs text-slate-500 text-center py-2">
            Showing 30 of {filteredReviews.length} reviews
          </p>
        )}
      </div>
    </div>
  );
}
