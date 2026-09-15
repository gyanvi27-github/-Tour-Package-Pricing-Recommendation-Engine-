import { UserProfile, Category, BudgetRange } from '../types';

export const USERS_DATA: UserProfile[] = [
  {
    user_id: 'USR-001',
    name: 'Simran Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Adventure', 'Beach', 'Cultural'],
    budget_range: '25k–50k',
    past_bookings_count: 5,
    signup_date: '2024-01-15'
  },
  {
    user_id: 'USR-002',
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Honeymoon', 'Beach', 'Leisure'],
    budget_range: '50k–100k',
    past_bookings_count: 3,
    signup_date: '2024-02-10'
  },
  {
    user_id: 'USR-003',
    name: 'Rahul Mehta',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Adventure', 'Wildlife'],
    budget_range: '10k–25k',
    past_bookings_count: 4,
    signup_date: '2023-11-22'
  },
  {
    user_id: 'USR-004',
    name: 'Ananya Sen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Cultural', 'Pilgrimage'],
    budget_range: '<10k',
    past_bookings_count: 2,
    signup_date: '2024-03-05'
  },
  {
    user_id: 'USR-005',
    name: 'Vikram Singhania',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Honeymoon', 'Leisure', 'Beach'],
    budget_range: '100k+',
    past_bookings_count: 6,
    signup_date: '2023-08-14'
  },
  {
    user_id: 'USR-006',
    name: 'Sneha Roy',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Leisure', 'Cultural', 'Beach'],
    budget_range: '25k–50k',
    past_bookings_count: 3,
    signup_date: '2024-04-18'
  },
  {
    user_id: 'USR-007',
    name: 'Arjun Dasgupta',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Adventure', 'Cultural'],
    budget_range: '10k–25k',
    past_bookings_count: 1,
    signup_date: '2024-05-12'
  },
  {
    user_id: 'USR-008',
    name: 'Divya Nambiar',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    preferred_categories: ['Pilgrimage', 'Leisure'],
    budget_range: '10k–25k',
    past_bookings_count: 4,
    signup_date: '2023-12-01'
  }
];

// Generate deterministic remaining 392 users to represent the 400 travel profiles accurately
const sampleNames = [
  'Kabir', 'Rhea', 'Rohan', 'Tanvi', 'Ishaan', 'Kavya', 'Karan', 'Meera',
  'Dev', 'Tara', 'Varun', 'Nisha', 'Aman', 'Shreya', 'Manish', 'Pooja',
  'Gaurav', 'Swati', 'Alok', 'Neeti', 'Siddharth', 'Pallavi', 'Nikhil', 'Simran'
];
const categoriesPool: Category[] = ['Adventure', 'Beach', 'Cultural', 'Honeymoon', 'Leisure', 'Pilgrimage', 'Wildlife'];
const budgetPool: BudgetRange[] = ['<10k', '10k–25k', '25k–50k', '50k–100k', '100k+'];

for (let i = 9; i <= 400; i++) {
  const nameIdx = (i * 7) % sampleNames.length;
  const cat1 = categoriesPool[(i * 3) % categoriesPool.length];
  const cat2 = categoriesPool[(i * 5 + 1) % categoriesPool.length];
  const preferred = cat1 === cat2 ? [cat1] : [cat1, cat2];
  const budget = budgetPool[(i * 2 + 1) % budgetPool.length];
  const pastBookings = (i * 3) % 8 + 1;
  const month = ((i % 12) + 1).toString().padStart(2, '0');
  const day = ((i % 28) + 1).toString().padStart(2, '0');

  USERS_DATA.push({
    user_id: `USR-${i.toString().padStart(3, '0')}`,
    name: `${sampleNames[nameIdx]} Traveler`,
    preferred_categories: preferred,
    budget_range: budget,
    past_bookings_count: pastBookings,
    signup_date: `2023-${month}-${day}`
  });
}
