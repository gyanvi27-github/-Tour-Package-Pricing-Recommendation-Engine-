import { SeasonTag } from '../types';

export interface DestinationWeatherProfile {
  climateType: string;
  bestTimeToVisit: string;
  bestMonths: number[]; // 1 = Jan, 12 = Dec
  peakSeasonMonths: number[];
  shoulderSeasonMonths: number[];
  offSeasonMonths: number[];
  avgTempRange: string;
  tempCelsius: { min: number; max: number };
  rainfallStatus: string;
  sunshineDaily: string;
  packingRecommendations: string[];
  climateSummary: string;
  seasonalHighlights: {
    peak: string;
    shoulder: string;
    offPeak: string;
  };
}

export interface WeatherInsightResult {
  destination: string;
  climateType: string;
  bestTimeToVisit: string;
  avgTempRange: string;
  rainfallStatus: string;
  sunshineDaily: string;
  packingRecommendations: string[];
  climateSummary: string;
  currentScheduledMonth: string;
  isScheduledOptimal: boolean;
  timingStatus: 'Optimal Peak' | 'Great Shoulder' | 'Off-Season Alert';
  timingBadgeClass: string;
  timingAdvice: string;
  seasonalHighlights: {
    peak: string;
    shoulder: string;
    offPeak: string;
  };
}

// Curated weather & climate database for iconic destinations
const CURATED_DESTINATIONS: Record<string, DestinationWeatherProfile> = {
  Goa: {
    climateType: 'Tropical Coastal Maritime',
    bestTimeToVisit: 'November to February (Dry & Balmy)',
    bestMonths: [11, 12, 1, 2],
    peakSeasonMonths: [11, 12, 1, 2],
    shoulderSeasonMonths: [3, 10],
    offSeasonMonths: [6, 7, 8, 9],
    avgTempRange: '21°C – 32°C (70°F – 90°F)',
    tempCelsius: { min: 21, max: 32 },
    rainfallStatus: 'Minimal precipitation (<12mm/month)',
    sunshineDaily: '9 hours daily sunshine',
    packingRecommendations: ['Breathable linen shirts', 'UV protection & sunglasses', 'Waterproof sandals & swimwear'],
    climateSummary: 'Clear azure skies and gentle Arabian Sea breezes make winter the ultimate beach and water-sports window.',
    seasonalHighlights: {
      peak: 'Nov–Feb: Sun-drenched beaches, low humidity, open shacks, and active sailing.',
      shoulder: 'Mar & Oct: Warmer afternoons with quieter shores and great resort value.',
      offPeak: 'Jun–Sep: Vigorous monsoon downpours, lush green spice plantations, and quiet retreat vibes.'
    }
  },
  Manali: {
    climateType: 'Sub-Alpine Mountainous',
    bestTimeToVisit: 'October to June (Snow in Winter, Crisp Flora in Spring)',
    bestMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6],
    peakSeasonMonths: [12, 1, 2, 5, 6],
    shoulderSeasonMonths: [3, 4, 10, 11],
    offSeasonMonths: [7, 8],
    avgTempRange: '-2°C – 18°C (28°F – 64°F)',
    tempCelsius: { min: -2, max: 18 },
    rainfallStatus: 'Heavy snowfall in winter; dry crisp late autumn',
    sunshineDaily: '6–8 hours daily mountain sunshine',
    packingRecommendations: ['Heavy thermal woolens & fleece', 'Wind-resistant parkas', 'Grip-traction hiking boots'],
    climateSummary: 'Pristine Himalayan air with snowy peaks in winter and lush pine-scented orchards in spring.',
    seasonalHighlights: {
      peak: 'Dec–Feb: Powder snow sports at Solang Valley; May–Jun: Cool mountain summer retreat.',
      shoulder: 'Oct–Nov & Mar–Apr: Crisp golden foliage, crisp clear stargazing, mild crowds.',
      offPeak: 'Jul–Aug: Heavy monsoon landslides; recommend caution on Rohtang pass routes.'
    }
  },
  Kashmir: {
    climateType: 'Himalayan Alpine & Valley Subtropical',
    bestTimeToVisit: 'March to October (Spring Blossoms & Autumn Chinar) / Dec–Feb for Skiing',
    bestMonths: [3, 4, 5, 9, 10, 12, 1],
    peakSeasonMonths: [4, 5, 6, 9, 10],
    shoulderSeasonMonths: [3, 11],
    offSeasonMonths: [7, 8],
    avgTempRange: '4°C – 22°C (39°F – 72°F)',
    tempCelsius: { min: 4, max: 22 },
    rainfallStatus: 'Crisp dry autumn; winter snow in Gulmarg',
    sunshineDaily: '7 hours sunshine across Dal Lake',
    packingRecommendations: ['Pashmina shawls & warm jackets', 'Layered fleece', 'Comfortable walking loafers'],
    climateSummary: 'Paradise on Earth with blooming tulip gardens in spring, golden chinar leaves in autumn, and alpine snow sports in winter.',
    seasonalHighlights: {
      peak: 'Apr–Jun & Sep–Oct: Mild pleasant temperatures, mirror-calm shikara rides, and apple blossoms.',
      shoulder: 'Nov & Mar: Crisp mountain chill and budding saffron fields in Pampore.',
      offPeak: 'Jul–Aug: Humid valley showers, though higher alpine meadows remain picturesque.'
    }
  },
  Bali: {
    climateType: 'Equatorial Tropical Island',
    bestTimeToVisit: 'April to October (Dry Season & Consistent Swells)',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    peakSeasonMonths: [6, 7, 8, 9],
    shoulderSeasonMonths: [4, 5, 10],
    offSeasonMonths: [11, 12, 1, 2, 3],
    avgTempRange: '24°C – 31°C (75°F – 88°F)',
    tempCelsius: { min: 24, max: 31 },
    rainfallStatus: 'Low humidity & minimal rain showers during dry season',
    sunshineDaily: '8–9 hours direct tropical sunshine',
    packingRecommendations: ['Light breathable cottons', 'Temple sarongs & light scarves', 'Reef-safe sunscreen'],
    climateSummary: 'Balmy maritime breezes, low humidity during dry months, and warm Indian Ocean waters ideal for reef diving.',
    seasonalHighlights: {
      peak: 'Jun–Aug: Clean offshore winds, clear blue waters for surfing, and vibrant cultural temple festivals.',
      shoulder: 'Apr–May & Sep–Oct: Fewer tourists, calm emerald rice terraces in Ubud, and great dining reservations.',
      offPeak: 'Nov–Mar: Tropical monsoon downpours usually occurring in late afternoon bursts.'
    }
  },
  Jaipur: {
    climateType: 'Semi-Arid Desert Subtropical',
    bestTimeToVisit: 'October to March (Pleasant Sunny Days & Cool Nights)',
    bestMonths: [10, 11, 12, 1, 2, 3],
    peakSeasonMonths: [11, 12, 1, 2],
    shoulderSeasonMonths: [3, 10],
    offSeasonMonths: [5, 6, 7],
    avgTempRange: '10°C – 28°C (50°F – 82°F)',
    tempCelsius: { min: 10, max: 28 },
    rainfallStatus: 'Virtually dry throughout winter months (<8mm)',
    sunshineDaily: '8.5 hours golden desert sunlight',
    packingRecommendations: ['Light layers for day, woolen jacket for chilly night courtyards', 'Sun hat & sunglasses', 'Comfortable fort walking shoes'],
    climateSummary: 'Golden sunlight over pink terracotta palaces without the searing summer desert heat.',
    seasonalHighlights: {
      peak: 'Nov–Feb: Crisp royal weather, heritage polo matches, and the Jaipur Literature Festival.',
      shoulder: 'Oct & Mar: Warm sunny exploration with tranquil evenings across Amer Fort.',
      offPeak: 'May–Jun: Extreme desert heat surpassing 42°C; outdoor fort exploration restricted to early mornings.'
    }
  },
  'Andaman Islands': {
    climateType: 'Tropical Bay of Bengal Maritime',
    bestTimeToVisit: 'October to May (Calm Seas & Exceptional Underwater Visibility)',
    bestMonths: [10, 11, 12, 1, 2, 3, 4, 5],
    peakSeasonMonths: [11, 12, 1, 2, 3],
    shoulderSeasonMonths: [10, 4, 5],
    offSeasonMonths: [6, 7, 8, 9],
    avgTempRange: '23°C – 30°C (73°F – 86°F)',
    tempCelsius: { min: 23, max: 30 },
    rainfallStatus: 'Clear turquoise sea conditions with gentle trade winds',
    sunshineDaily: '8 hours vibrant island sunshine',
    packingRecommendations: ['Snorkeling mask & swim fins', 'Biodegradable sunscreen', 'Quick-dry activewear'],
    climateSummary: 'World-class scuba diving visibility reaching up to 30 meters amidst untouched coral reefs.',
    seasonalHighlights: {
      peak: 'Nov–Feb: Glassy emerald waters at Radhanagar Beach, calm boat crossings to Havelock.',
      shoulder: 'Oct & Mar–Apr: Warm calm tropical currents and secluded private beach coves.',
      offPeak: 'Jun–Aug: High monsoon tidal swells and intermittent inter-island ferry cancellations.'
    }
  },
  Kerala: {
    climateType: 'Tropical Monsoonal & Backwater Coast',
    bestTimeToVisit: 'September to March (Crisp Backwaters & Ayurvedic Peak)',
    bestMonths: [9, 10, 11, 12, 1, 2, 3],
    peakSeasonMonths: [11, 12, 1, 2],
    shoulderSeasonMonths: [9, 10, 3],
    offSeasonMonths: [6, 7, 8],
    avgTempRange: '22°C – 32°C (72°F – 90°F)',
    tempCelsius: { min: 22, max: 32 },
    rainfallStatus: 'Mild humidity along palm-fringed lagoons',
    sunshineDaily: '7–8 hours serene tropical sunshine',
    packingRecommendations: ['Loose eco-cotton clothing', 'Herbal mosquito repellent', 'Light cardigan for Munnar hills'],
    climateSummary: 'Lush coconut waterways with gentle breezes in Alleppey and cool misty tea hills in Munnar.',
    seasonalHighlights: {
      peak: 'Nov–Feb: Ideal houseboat cruising weather, tranquil lagoons, and Kathakali cultural performances.',
      shoulder: 'Sep–Oct: Post-monsoon vibrant greenery, full waterfalls, and traditional snake boat races.',
      offPeak: 'Jun–Aug: Rejuvenating monsoon season; renowned for authentic Ayurvedic spa wellness therapies.'
    }
  },
  Dubai: {
    climateType: 'Arid Subtropical Desert',
    bestTimeToVisit: 'November to March (Mild Balmy Weather & Desert Safari)',
    bestMonths: [11, 12, 1, 2, 3],
    peakSeasonMonths: [12, 1, 2],
    shoulderSeasonMonths: [11, 3],
    offSeasonMonths: [6, 7, 8, 9],
    avgTempRange: '16°C – 28°C (61°F – 82°F)',
    tempCelsius: { min: 16, max: 28 },
    rainfallStatus: 'Practically rainless with crystal-clear desert skies',
    sunshineDaily: '9 hours radiant sunshine',
    packingRecommendations: ['Chic resort wear & smart-casual dinner attire', 'Light scarf for air-conditioned venues', 'Sunglasses & desert sandals'],
    climateSummary: 'Comfortable daytime temperatures ideal for beach clubs, desert quad biking, and marina yacht cruising.',
    seasonalHighlights: {
      peak: 'Dec–Feb: World-famous shopping festivals, rooftop dining, and comfortable desert glamping.',
      shoulder: 'Nov & Mar: Warm sea water for jet-skiing and outdoor skyline lounges.',
      offPeak: 'Jun–Aug: Scorching desert heat exceeding 44°C; city life shifts into climate-controlled luxury indoor wonderlands.'
    }
  },
  Paris: {
    climateType: 'Temperate Oceanic',
    bestTimeToVisit: 'April to October (Spring Blossoms & Autumn Boulevards)',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    peakSeasonMonths: [5, 6, 7, 9],
    shoulderSeasonMonths: [4, 10],
    offSeasonMonths: [11, 12, 1, 2],
    avgTempRange: '11°C – 25°C (52°F – 77°F)',
    tempCelsius: { min: 11, max: 25 },
    rainfallStatus: 'Occasional light drizzle; mostly mild pleasant breeze',
    sunshineDaily: '7 hours Parisian daylight',
    packingRecommendations: ['Stylish trench coat & scarf', 'Comfortable cobblestone walking sneakers', 'Compact travel umbrella'],
    climateSummary: 'Enchanting café terraces along the Seine with vibrant chestnut tree foliage and comfortable promenade walks.',
    seasonalHighlights: {
      peak: 'May–Jul & Sep: Long golden daylight hours, open-air bistros, and Seine riverboat dinners.',
      shoulder: 'Apr & Oct: Beautiful spring blossoms, vibrant golden leaves, and shorter Louvre lines.',
      offPeak: 'Nov–Feb: Chilly romantic winter fog, festive Christmas lights along Champs-Élysées, and cozy museum visits.'
    }
  },
  Singapore: {
    climateType: 'Equatorial Tropical Marine',
    bestTimeToVisit: 'November to June (Consistent Warmth & Festive Celebrations)',
    bestMonths: [11, 12, 1, 2, 3, 4, 5, 6],
    peakSeasonMonths: [12, 1, 2, 6, 7],
    shoulderSeasonMonths: [3, 4, 5],
    offSeasonMonths: [9, 10],
    avgTempRange: '24°C – 32°C (75°F – 90°F)',
    tempCelsius: { min: 24, max: 32 },
    rainfallStatus: 'Brief 30-minute refreshing afternoon tropical showers',
    sunshineDaily: '6 hours bright equatorial light',
    packingRecommendations: ['Light breathable athletic fabrics', 'Compact umbrella', 'Comfortable walking sneakers for Marina Bay'],
    climateSummary: 'Year-round lush green botanical paradise with warm breezes and world-class air-conditioned indoor gardens.',
    seasonalHighlights: {
      peak: 'Dec–Feb: Chinese New Year illuminations, Formula 1 buzz, and bustling night food hawkers.',
      shoulder: 'Mar–May: Stable warm sunshine and excellent rooftop pool infinity swimming.',
      offPeak: 'Oct–Nov: Higher monsoon precipitation; ideal for art science museums and Jewel Changi indoor canopy.'
    }
  }
};

// Fallback dynamic profile generator for destinations not in the curated list
function generateFallbackProfile(destination: string, seasonTag: SeasonTag): DestinationWeatherProfile {
  switch (seasonTag) {
    case 'Winter':
      return {
        climateType: 'Continental Winter / Highland',
        bestTimeToVisit: 'October to March (Crisp & Clear Skies)',
        bestMonths: [10, 11, 12, 1, 2, 3],
        peakSeasonMonths: [11, 12, 1, 2],
        shoulderSeasonMonths: [3, 10],
        offSeasonMonths: [6, 7, 8],
        avgTempRange: '8°C – 22°C (46°F – 72°F)',
        tempCelsius: { min: 8, max: 22 },
        rainfallStatus: 'Dry season with negligible precipitation',
        sunshineDaily: '7–8 hours crisp sunshine',
        packingRecommendations: ['Warm layered jackets', 'Comfortable closed walking shoes', 'Moisturizer & lip balm'],
        climateSummary: 'Invigorating cool climate with crystal visibility, ideal for historical excursions and mountain vistas.',
        seasonalHighlights: {
          peak: 'Nov–Feb: Crisp pleasant air, vibrant cultural festivals, and optimal sightseeing conditions.',
          shoulder: 'Oct & Mar: Mild breezes and manageable tourist footfall.',
          offPeak: 'Jun–Aug: High heat or humid seasonal showers.'
        }
      };

    case 'Summer':
      return {
        climateType: 'Temperate Highland Retreat',
        bestTimeToVisit: 'April to July (Cool Mountain Escapes)',
        bestMonths: [4, 5, 6, 7],
        peakSeasonMonths: [5, 6],
        shoulderSeasonMonths: [4, 7],
        offSeasonMonths: [11, 12, 1],
        avgTempRange: '15°C – 26°C (59°F – 79°F)',
        tempCelsius: { min: 15, max: 26 },
        rainfallStatus: 'Crisp mountain breezes with brief evening showers',
        sunshineDaily: '8 hours daily sunshine',
        packingRecommendations: ['Light sweaters for evenings', 'Trekking shoes', 'Sun hat & hydration pack'],
        climateSummary: 'Ideal summer getaway offering respite from lowland heat with blooming valleys and panoramic views.',
        seasonalHighlights: {
          peak: 'May–Jun: Pristine cool climate, active trekking trails, and bustling hill-station markets.',
          shoulder: 'Apr & Jul: Quiet orchards and serene valley walks.',
          offPeak: 'Dec–Feb: Frosty temperatures and reduced alpine accessibility.'
        }
      };

    case 'Monsoon':
      return {
        climateType: 'Tropical Rainforest & Cloud Forest',
        bestTimeToVisit: 'July to October (Lush Cascades & Rejuvenation)',
        bestMonths: [7, 8, 9, 10],
        peakSeasonMonths: [8, 9],
        shoulderSeasonMonths: [7, 10],
        offSeasonMonths: [4, 5],
        avgTempRange: '20°C – 28°C (68°F – 82°F)',
        tempCelsius: { min: 20, max: 28 },
        rainfallStatus: 'Lush tropical showers feeding seasonal waterfalls',
        sunshineDaily: '5 hours diffused rainforest light',
        packingRecommendations: ['Waterproof rain poncho & dry bag', 'Anti-skid trekking sandals', 'Quick-dry shirts'],
        climateSummary: 'Spectacular verdant landscapes with cascading waterfalls, morning mist, and fresh rain-washed greenery.',
        seasonalHighlights: {
          peak: 'Aug–Sep: Roaring waterfalls, mist-covered mountain passes, and peak natural beauty.',
          shoulder: 'Jul & Oct: Transition periods with picturesque clouds and dramatic sunsets.',
          offPeak: 'Mar–May: Drier landscapes with less active waterfall flows.'
        }
      };

    default: // All-Season or Off-Season
      return {
        climateType: 'Equatorial Micro-Climate',
        bestTimeToVisit: 'October to May (Optimal Universal Window)',
        bestMonths: [10, 11, 12, 1, 2, 3, 4, 5],
        peakSeasonMonths: [11, 12, 1, 2],
        shoulderSeasonMonths: [10, 3, 4],
        offSeasonMonths: [6, 7, 8],
        avgTempRange: '18°C – 30°C (64°F – 86°F)',
        tempCelsius: { min: 18, max: 30 },
        rainfallStatus: 'Moderate and predictable seasonal conditions',
        sunshineDaily: '7–9 hours daylight',
        packingRecommendations: ['Versatile layering clothing', 'UV protection sunglasses', 'Comfortable footwear'],
        climateSummary: 'Reliable weather year-round, balanced between active daytime exploration and relaxed evenings.',
        seasonalHighlights: {
          peak: 'Nov–Feb: Optimal humidity, gentle breezes, and peak city vitality.',
          shoulder: 'Oct & Apr: Great pricing, mild weather, and shorter attraction queues.',
          offPeak: 'Jun–Aug: Occasional rain bursts; best for indoor cultural experiences.'
        }
      };
  }
}

/**
 * Returns weather insights and best time to visit recommendation for a destination
 */
export function getDestinationWeatherInsight(
  destination: string,
  seasonTag: SeasonTag = 'All-Season',
  scheduledDate?: string
): WeatherInsightResult {
  // Look up curated data or generate intelligent fallback
  const cleanDest = destination.trim();
  const matchedKey = Object.keys(CURATED_DESTINATIONS).find(
    (k) => cleanDest.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(cleanDest.toLowerCase())
  );

  const profile = matchedKey ? CURATED_DESTINATIONS[matchedKey] : generateFallbackProfile(destination, seasonTag);

  // Analyze scheduled date
  const targetDate = scheduledDate ? new Date(scheduledDate) : new Date();
  const monthNum = targetDate.getMonth() + 1; // 1-12
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentScheduledMonth = monthNames[targetDate.getMonth()];

  let timingStatus: 'Optimal Peak' | 'Great Shoulder' | 'Off-Season Alert' = 'Great Shoulder';
  let isScheduledOptimal = false;
  let timingBadgeClass = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  let timingAdvice = '';

  if (profile.peakSeasonMonths.includes(monthNum)) {
    timingStatus = 'Optimal Peak';
    isScheduledOptimal = true;
    timingBadgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    timingAdvice = `Your scheduled visit in ${currentScheduledMonth} hits the peak climate window! Expect optimal temperatures, minimal rain disruptions, and pristine sightseeing.`;
  } else if (profile.shoulderSeasonMonths.includes(monthNum)) {
    timingStatus = 'Great Shoulder';
    isScheduledOptimal = true;
    timingBadgeClass = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    timingAdvice = `${currentScheduledMonth} is a fantastic shoulder season choice. You will enjoy comfortable climate, significantly fewer crowds, and lower seasonal tariffs.`;
  } else {
    timingStatus = 'Off-Season Alert';
    isScheduledOptimal = false;
    timingBadgeClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    timingAdvice = `${currentScheduledMonth} experiences typical ${seasonTag.toLowerCase()} micro-climates. Ensure you pack suggested items and check daily local weather forecasts before excursions.`;
  }

  return {
    destination,
    climateType: profile.climateType,
    bestTimeToVisit: profile.bestTimeToVisit,
    avgTempRange: profile.avgTempRange,
    rainfallStatus: profile.rainfallStatus,
    sunshineDaily: profile.sunshineDaily,
    packingRecommendations: profile.packingRecommendations,
    climateSummary: profile.climateSummary,
    currentScheduledMonth,
    isScheduledOptimal,
    timingStatus,
    timingBadgeClass,
    timingAdvice,
    seasonalHighlights: profile.seasonalHighlights
  };
}
