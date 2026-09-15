import { Rating } from '../types';
import { PACKAGES_DATA } from './packagesData';

// 2,500 ratings distributed across 60 packages
export const RATINGS_DATA: Rating[] = [];

// Seed deterministic realistic ratings around package popularity and satisfaction
const baseDates = ['2023-10', '2023-11', '2023-12', '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07'];

let ratingIndex = 1;
for (let pIdx = 0; pIdx < PACKAGES_DATA.length; pIdx++) {
  const pkg = PACKAGES_DATA[pIdx];
  // More popular packages receive more ratings
  const countForPkg = Math.round(25 + (pkg.destination_popularity / 100) * 35);

  for (let i = 0; i < countForPkg && ratingIndex <= 2500; i++) {
    // Skew towards 4 and 5 stars with occasional 3, 2, 1
    const pseudoRandom = ((pIdx * 19 + i * 23 + 7) % 100);
    let ratingVal = 5;
    if (pseudoRandom < 45) ratingVal = 5;
    else if (pseudoRandom < 80) ratingVal = 4;
    else if (pseudoRandom < 92) ratingVal = 3;
    else if (pseudoRandom < 97) ratingVal = 2;
    else ratingVal = 1;

    const userNum = ((i * 7 + pIdx * 13) % 400) + 1;
    const dateMonth = baseDates[(i + pIdx) % baseDates.length];
    const day = ((i * 3) % 28 + 1).toString().padStart(2, '0');

    RATINGS_DATA.push({
      user_id: `USR-${userNum.toString().padStart(3, '0')}`,
      package_id: pkg.package_id,
      rating: ratingVal,
      rating_date: `${dateMonth}-${day}`
    });
    ratingIndex++;
  }
}

// Fill any remainder to exactly 2500
while (RATINGS_DATA.length < 2500) {
  const idx = RATINGS_DATA.length;
  const pkg = PACKAGES_DATA[idx % PACKAGES_DATA.length];
  RATINGS_DATA.push({
    user_id: `USR-${((idx * 11) % 400 + 1).toString().padStart(3, '0')}`,
    package_id: pkg.package_id,
    rating: (idx % 3 === 0) ? 5 : 4,
    rating_date: `2024-06-${((idx % 25) + 1).toString().padStart(2, '0')}`
  });
}

// Precomputed mapping for instant lookup
export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  breakdown: { [star: number]: number };
}

const packageRatingStatsMap = new Map<string, RatingSummary>();

export function getPackageRatingStats(packageId: string): RatingSummary {
  if (packageRatingStatsMap.has(packageId)) {
    return packageRatingStatsMap.get(packageId)!;
  }

  const pkgRatings = RATINGS_DATA.filter((r) => r.package_id === packageId);
  const breakdown: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of pkgRatings) {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    sum += r.rating;
  }

  const total = pkgRatings.length;
  const avg = total > 0 ? Number((sum / total).toFixed(1)) : 4.4;

  const result: RatingSummary = {
    averageRating: avg,
    totalRatings: total || 35,
    breakdown: total > 0 ? breakdown : { 5: 22, 4: 10, 3: 2, 2: 1, 1: 0 }
  };

  packageRatingStatsMap.set(packageId, result);
  return result;
}
