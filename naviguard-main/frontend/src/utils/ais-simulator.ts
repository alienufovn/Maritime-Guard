// src/utils/ais-generator.ts

export interface AISData {
  mmsi: number;              // Unique Vessel ID
  wind_speed_knots: number;
  wave_height_cm: number;
  vessel_age_years: number;
  is_high_risk_zone: boolean;
  latitude: number;
  longitude: number;
}

export const generateMockAIS = (vesselType: 'Cargo' | 'Tanker' | 'Sail'): AISData => {
  // Randomize environmental factors based on vessel context
  const isStormy = Math.random() > 0.7;
  
  return {
    mmsi: Math.floor(100000000 + Math.random() * 900000000),
    wind_speed_knots: isStormy ? Math.floor(35 + Math.random() * 20) : Math.floor(5 + Math.random() * 15),
    wave_height_cm: isStormy ? Math.floor(300 + Math.random() * 500) : Math.floor(20 + Math.random() * 80),
    vessel_age_years: Math.floor(Math.random() * 25),
    is_high_risk_zone: Math.random() > 0.85, // 15% chance of being in a restricted area
    latitude: 1.29027,  // Near Singapore Strait (high traffic)
    longitude: 103.85195
  };
};