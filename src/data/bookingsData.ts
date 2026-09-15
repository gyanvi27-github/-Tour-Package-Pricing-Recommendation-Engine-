import { Booking } from '../types';
import { PACKAGES_DATA } from './packagesData';

export const BOOKINGS_DATA: Booking[] = [];

// Seed 4,000 deterministic bookings with real statistical behavior
const months = [
  '2023-09', '2023-10', '2023-11', '2023-12',
  '2024-01', '2024-02', '2024-03', '2024-04',
  '2024-05', '2024-06', '2024-07', '2024-08'
];

for (let i = 1; i <= 4000; i++) {
  const pkgIdx = ((i * 17 + i % 13) % PACKAGES_DATA.length);
  const pkg = PACKAGES_DATA[pkgIdx];
  const userNum = ((i * 31) % 400) + 1;

  // Group size distribution: 2 is most common, then 4, 6, 1, 8, 10
  const grpRand = (i * 7) % 100;
  let groupSize = 2;
  if (grpRand < 15) groupSize = 1;
  else if (grpRand < 55) groupSize = 2;
  else if (grpRand < 80) groupSize = 4;
  else if (grpRand < 92) groupSize = 6;
  else if (grpRand < 97) groupSize = 8;
  else groupSize = 10;

  // Lead time days: 0 to 120 days
  // Skewed: many 10-45 days, some last minute (1-7 days), some advance (60-120 days)
  const leadRand = (i * 29 + pkgIdx * 11) % 120;
  const leadTimeDays = Math.max(1, leadRand);

  // Travel month
  const monthIdx = (i * 5 + pkgIdx * 3) % months.length;
  const travelMonth = months[monthIdx];
  const travelDay = ((i * 13) % 28 + 1).toString().padStart(2, '0');
  const travelDate = `${travelMonth}-${travelDay}`;

  // Booking date = travel date minus lead time
  const tDateObj = new Date(travelDate);
  const bDateObj = new Date(tDateObj.getTime() - leadTimeDays * 24 * 60 * 60 * 1000);
  const bookingDate = bDateObj.toISOString().split('T')[0];

  // Calculate final price paid using demand principles:
  // Base price
  let multiplier = 1.0;

  // 1. Lead time impact:
  // Last minute (< 7 days): surge pricing +15% to +30%
  // Optimal early bird (30-60 days): discount -5% to -10%
  // Very early (> 90 days): slight discount -4%
  if (leadTimeDays <= 5) {
    multiplier += 0.22 + ((i % 10) * 0.01);
  } else if (leadTimeDays <= 14) {
    multiplier += 0.12 + ((i % 8) * 0.01);
  } else if (leadTimeDays >= 30 && leadTimeDays <= 60) {
    multiplier -= 0.06;
  } else if (leadTimeDays > 60) {
    multiplier -= 0.04;
  }

  // 2. Seasonality impact on destination
  if (pkg.season_tag === 'Peak-Winter' || pkg.season_tag === 'Winter') {
    if (travelMonth.includes('-12') || travelMonth.includes('-01') || travelMonth.includes('-02')) {
      multiplier += 0.18;
    }
  } else if (pkg.season_tag === 'Summer') {
    if (travelMonth.includes('-05') || travelMonth.includes('-06')) {
      multiplier += 0.15;
    }
  } else if (pkg.season_tag === 'Monsoon') {
    if (travelMonth.includes('-07') || travelMonth.includes('-08')) {
      multiplier -= 0.08;
    }
  }

  // 3. Destination popularity factor
  const popFactor = (pkg.destination_popularity - 75) / 100 * 0.25;
  multiplier += popFactor;

  // 4. Minor random jitter (-3% to +3%)
  const jitter = (((i * 47) % 7) - 3) / 100;
  multiplier += jitter;

  // Final price per booking record
  const finalPricePaid = Math.round((pkg.base_price * multiplier) / 50) * 50;

  BOOKINGS_DATA.push({
    booking_id: `BKG-${i.toString().padStart(4, '0')}`,
    package_id: pkg.package_id,
    user_id: `USR-${userNum.toString().padStart(3, '0')}`,
    booking_date: bookingDate,
    travel_date: travelDate,
    lead_time_days: leadTimeDays,
    group_size: groupSize,
    final_price_paid: finalPricePaid
  });
}

// Helper query functions for performance
export function getBookingsForPackage(packageId: string): Booking[] {
  return BOOKINGS_DATA.filter((b) => b.package_id === packageId);
}

export function getBookingsForUser(userId: string): Booking[] {
  return BOOKINGS_DATA.filter((b) => b.user_id === userId);
}
