export interface Stadium {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  capacity: number;
  color: string; // Primary color for stadium
  accentColor: string; // Secondary color
  imageUrl: string; // Official Wikimedia Commons image URL
  sketchfabId?: string; // Optional Sketchfab model ID for real 3D viewing
}

export const WORLD_CUP_2026_STADIUMS: Stadium[] = [
  // MÉXICO
  {
    id: 'azteca',
    name: 'Estadio Azteca',
    country: 'México',
    countryCode: 'MX',
    city: 'Ciudad de México',
    latitude: 19.3024,
    longitude: -99.1613,
    timezone: 'America/Mexico_City',
    capacity: 87523,
    color: '#1a472a',
    accentColor: '#ffd700',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Estadio_Azteca1706p2.jpg',
    sketchfabId: '813fd48eb6cf47cea87246be5bd4461f'
  },
  {
    id: 'guadalajara',
    name: 'Estadio Akron',
    country: 'México',
    countryCode: 'MX',
    city: 'Guadalajara',
    latitude: 20.6595,
    longitude: -103.3155,
    timezone: 'America/Mexico_City',
    capacity: 46399,
    color: '#c60c30',
    accentColor: '#ffffff',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Estadio_Omnilife_Chivas.jpg'
  },
  {
    id: 'monterrey',
    name: 'Estadio BBVA',
    country: 'México',
    countryCode: 'MX',
    city: 'Monterrey',
    latitude: 25.6866,
    longitude: -100.3161,
    timezone: 'America/Mexico_City',
    capacity: 53000,
    color: '#003da5',
    accentColor: '#ffd700',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Estadio_BBVA_Bancomer_%281%29.jpg'
  },
  // USA
  {
    id: 'kansas_city',
    name: 'Arrowhead Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'Kansas City',
    latitude: 39.0489,
    longitude: -94.4835,
    timezone: 'America/Chicago',
    capacity: 76416,
    color: '#e31937',
    accentColor: '#ffb81c',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Chiefs-Raiders_2021_at_Arrowhead_Stadium.png'
  },
  {
    id: 'atlanta',
    name: 'Mercedes-Benz Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'Atlanta',
    latitude: 33.7505,
    longitude: -84.3888,
    timezone: 'America/New_York',
    capacity: 71000,
    color: '#a71930',
    accentColor: '#000000',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg'
  },
  {
    id: 'dallas',
    name: 'AT&T Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'Dallas',
    latitude: 32.8975,
    longitude: -97.0081,
    timezone: 'America/Chicago',
    capacity: 80000,
    color: '#003594',
    accentColor: '#b0b7bc',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Cowboys_Stadium_full_view.jpg'
  },
  {
    id: 'houston',
    name: 'NRG Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'Houston',
    latitude: 29.6847,
    longitude: -95.4107,
    timezone: 'America/Chicago',
    capacity: 72220,
    color: '#eb6e1f',
    accentColor: '#003da5',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Nrg_stadium.jpg/1280px-Nrg_stadium.jpg'
  },
  {
    id: 'miami',
    name: 'Hard Rock Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'Miami',
    latitude: 25.9581,
    longitude: -80.2389,
    timezone: 'America/New_York',
    capacity: 65326,
    color: '#008687',
    accentColor: '#f26522',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg/1280px-Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg'
  },
  {
    id: 'san_francisco',
    name: 'Levi\'s Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'San Francisco',
    latitude: 37.4049,
    longitude: -121.9747,
    timezone: 'America/Los_Angeles',
    capacity: 68500,
    color: '#aa0000',
    accentColor: '#b3995d',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg/1280px-Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg'
  },
  {
    id: 'los_angeles',
    name: 'SoFi Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'Los Angeles',
    latitude: 33.9533,
    longitude: -118.3394,
    timezone: 'America/Los_Angeles',
    capacity: 70240,
    color: '#0066cc',
    accentColor: '#ffb81c',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/1280px-SoFi_Stadium_2023.jpg'
  },
  {
    id: 'seattle',
    name: 'Lumen Field',
    country: 'USA',
    countryCode: 'US',
    city: 'Seattle',
    latitude: 47.5952,
    longitude: -122.3316,
    timezone: 'America/Los_Angeles',
    capacity: 69000,
    color: '#002244',
    accentColor: '#69be28',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Qwest_Field_North.jpg'
  },
  {
    id: 'denver',
    name: 'Empower Field',
    country: 'USA',
    countryCode: 'US',
    city: 'Denver',
    latitude: 39.7439,
    longitude: -104.9885,
    timezone: 'America/Denver',
    capacity: 76125,
    color: '#fb4f14',
    accentColor: '#002244',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Empower_Field_at_Mile_High_20241001.jpg/1280px-Empower_Field_at_Mile_High_20241001.jpg'
  },
  // CANADÁ
  {
    id: 'toronto',
    name: 'BMO Field',
    country: 'Canadá',
    countryCode: 'CA',
    city: 'Toronto',
    latitude: 43.6629,
    longitude: -79.3957,
    timezone: 'America/Toronto',
    capacity: 45371,
    color: '#cc0000',
    accentColor: '#ffffff',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/BMO_Field_in_2016.png'
  },
  {
    id: 'vancouver',
    name: 'BC Place',
    country: 'Canadá',
    countryCode: 'CA',
    city: 'Vancouver',
    latitude: 49.2827,
    longitude: -123.1117,
    timezone: 'America/Vancouver',
    capacity: 54500,
    color: '#00205b',
    accentColor: '#ffffff',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/BC_Place_2015_Women%27s_FIFA_World_Cup.jpg/1280px-BC_Place_2015_Women%27s_FIFA_World_Cup.jpg'
  },
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'East Rutherford',
    latitude: 40.8135,
    longitude: -74.0743,
    timezone: 'America/New_York',
    capacity: 82500,
    color: '#0f2d1e',
    accentColor: '#ffffff',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Metlife_stadium_%28Aerial_view%29.jpg/1280px-Metlife_stadium_%28Aerial_view%29.jpg'
  },
  {
    id: 'rose_bowl',
    name: 'Rose Bowl',
    country: 'USA',
    countryCode: 'US',
    city: 'Pasadena',
    latitude: 34.1613,
    longitude: -118.1676,
    timezone: 'America/Los_Angeles',
    capacity: 89702,
    color: '#0b3c2a',
    accentColor: '#ffb81c',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2018.06.17_Over_the_Rose_Bowl%2C_Pasadena%2C_CA_USA_0039_%2842855669451%29_%28cropped%29.jpg/1280px-2018.06.17_Over_the_Rose_Bowl%2C_Pasadena%2C_CA_USA_0039_%2842855669451%29_%28cropped%29.jpg'
  },
  {
    id: 'gillette',
    name: 'Gillette Stadium',
    country: 'USA',
    countryCode: 'US',
    city: 'Foxborough',
    latitude: 42.0909,
    longitude: -71.2643,
    timezone: 'America/New_York',
    capacity: 65878,
    color: '#0a2342',
    accentColor: '#c8102e',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Gillette_Stadium%2C_Chicago_Fire_vs._New_England_Revolution_2003.jpg'
  },
  {
    id: 'lincoln',
    name: 'Lincoln Financial Field',
    country: 'USA',
    countryCode: 'US',
    city: 'Filadelfia',
    latitude: 39.9008,
    longitude: -75.1674,
    timezone: 'America/New_York',
    capacity: 69796,
    color: '#004c54',
    accentColor: '#a5acaf',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Lincoln_Financial_Field_%28Aerial_view%29.jpg'
  }
];

export const getStadiumByVenue = (venue: string): Stadium | undefined => {
  const venueMap: { [key: string]: string } = {
    // Official Names
    'Estadio Azteca':        'azteca',
    'Estadio Akron':         'guadalajara',
    'Estadio BBVA':          'monterrey',
    'Estadio Olímpico':      'azteca',
    'AT&T Stadium':          'dallas',
    'MetLife Stadium':       'metlife',
    'SoFi Stadium':          'los_angeles',
    'Rose Bowl':             'rose_bowl',
    'Hard Rock Stadium':     'miami',
    "Levi's Stadium":        'san_francisco',
    'Arrowhead Stadium':     'kansas_city',
    'NRG Stadium':           'houston',
    'Mercedes-Benz Stadium': 'atlanta',
    'Gillette Stadium':      'gillette',
    'Lincoln Financial':     'lincoln',
    'BMO Field':             'toronto',
    'BC Place':              'vancouver',
    'Empower Field':         'denver',
    'Lumen Field':           'seattle',
    // WC_MATCHES Names
    'Estadio Ciudad de México': 'azteca',
    'Estadio Guadalajara':      'guadalajara',
    'Estadio Monterrey':        'monterrey',
    'Atlanta Stadium':          'atlanta',
    'Toronto Stadium':          'toronto',
    'San Francisco Bay Area':   'san_francisco',
    'Los Angeles Stadium':      'los_angeles',
    'BC Place Vancouver':       'vancouver',
    'Seattle Stadium':          'seattle',
    'Boston Stadium':           'gillette',
    'NY/NJ Stadium':            'metlife',
    'Philadelphia Stadium':     'lincoln',
    'Miami Stadium':            'miami',
    'Dallas Stadium':           'dallas',
    'Kansas City Stadium':      'kansas_city',
    'Houston Stadium':          'houston',
  };
  return WORLD_CUP_2026_STADIUMS.find(s => s.id === venueMap[venue]);
};
