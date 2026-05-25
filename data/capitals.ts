export interface Capital {
  name: string;
  lat: number;
  lon: number;
}

export const CAPITALS: Capital[] = [
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Washington D.C.', lat: 38.9072, lon: -77.0369 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Pretoria', lat: -25.7461, lon: 28.1881 },
  { name: 'Brasília', lat: -15.8267, lon: -47.9218 },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Canberra', lat: -35.2809, lon: 149.1300 },
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
];
