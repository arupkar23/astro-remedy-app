// Geolocation and Timezone Detection Service
// Using free APIs to provide timezone auto-detection based on location

export interface LocationData {
  city: string;
  state: string;
  country: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  abbreviation: string;
  isDst: boolean;
}

export class GeolocationService {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private static readonly TIMEZONE_API_BASE_URL = 'https://api.timezonedb.com/v2.1';

  /**
   * Geocode a location string to get coordinates and timezone
   * Uses OpenStreetMap Nominatim (free) for geocoding
   */
  static async geocodeLocation(city: string, state?: string, country?: string): Promise<LocationData | null> {
    try {
      // Build search query
      const parts = [city, state, country].filter(Boolean);
      const query = parts.join(', ');
      
      const url = new URL('/search', this.NOMINATIM_BASE_URL);
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '1');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Jai-Guru-Astro-Remedy/1.0 (contact@jaiguruastroremedies.com)'
        }
      });

      if (!response.ok) {
        console.error('Geocoding API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.warn('No geocoding results found for:', query);
        return null;
      }

      const result = data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      // Extract address components
      const address = result.address || {};
      const detectedCity = address.city || address.town || address.village || address.municipality || city;
      const detectedState = address.state || address.region || state || '';
      const detectedCountry = address.country || country || '';

      // Get timezone for the coordinates
      const timezoneInfo = await this.getTimezoneFromCoordinates(latitude, longitude);
      
      return {
        city: detectedCity,
        state: detectedState,
        country: detectedCountry,
        timezone: timezoneInfo?.timezone || this.guessTimezoneFromCountry(detectedCountry),
        latitude,
        longitude
      };
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  }

  /**
   * Get timezone information from coordinates
   * Uses timeapi.io (free) as fallback
   */
  static async getTimezoneFromCoordinates(latitude: number, longitude: number): Promise<TimezoneInfo | null> {
    try {
      // Using timeapi.io (free, no API key required)
      const url = `https://timeapi.io/api/TimeZone/coordinate?latitude=${latitude}&longitude=${longitude}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Timezone API error:', response.status, response.statusText);
        return this.getTimezoneFromCoordinatesFallback(latitude, longitude);
      }

      const data = await response.json();
      
      return {
        timezone: data.timeZone || '',
        offset: data.currentUtcOffset?.offset || '',
        abbreviation: data.abbreviation || '',
        isDst: data.isDayLightSavingTime || false
      };
    } catch (error) {
      console.error('Error getting timezone from coordinates:', error);
      return this.getTimezoneFromCoordinatesFallback(latitude, longitude);
    }
  }

  /**
   * Fallback timezone detection using geographical approximation
   */
  private static getTimezoneFromCoordinatesFallback(latitude: number, longitude: number): TimezoneInfo | null {
    // Rough timezone approximation based on longitude
    // 15 degrees = 1 hour timezone
    const approximateOffset = Math.round(longitude / 15);
    
    // Common timezone mappings for major regions
    const timezoneGuess = this.guessTimezoneFromCoordinates(latitude, longitude);
    
    return {
      timezone: timezoneGuess,
      offset: `${approximateOffset >= 0 ? '+' : ''}${approximateOffset}:00`,
      abbreviation: '',
      isDst: false
    };
  }

  /**
   * Guess timezone from coordinates using geographical knowledge
   */
  private static guessTimezoneFromCoordinates(latitude: number, longitude: number): string {
    // India
    if (latitude >= 6 && latitude <= 37 && longitude >= 68 && longitude <= 97) {
      return 'Asia/Kolkata';
    }
    
    // USA East Coast
    if (latitude >= 25 && latitude <= 49 && longitude >= -84 && longitude <= -67) {
      return 'America/New_York';
    }
    
    // USA West Coast
    if (latitude >= 32 && latitude <= 49 && longitude >= -125 && longitude <= -114) {
      return 'America/Los_Angeles';
    }
    
    // UK/Europe
    if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
      return 'Europe/London';
    }
    
    // Australia
    if (latitude >= -45 && latitude <= -10 && longitude >= 110 && longitude <= 160) {
      return 'Australia/Sydney';
    }
    
    // Default fallback
    return 'UTC';
  }

  /**
   * Guess timezone from country name
   */
  private static guessTimezoneFromCountry(country: string): string {
    const countryTimezones: Record<string, string> = {
      'India': 'Asia/Kolkata',
      'United States': 'America/New_York',
      'United Kingdom': 'Europe/London',
      'Canada': 'America/Toronto',
      'Australia': 'Australia/Sydney',
      'Germany': 'Europe/Berlin',
      'France': 'Europe/Paris',
      'Japan': 'Asia/Tokyo',
      'China': 'Asia/Shanghai',
      'Brazil': 'America/Sao_Paulo',
      'Russia': 'Europe/Moscow',
      'South Africa': 'Africa/Johannesburg',
      'Egypt': 'Africa/Cairo',
      'Dubai': 'Asia/Dubai',
      'UAE': 'Asia/Dubai',
      'Singapore': 'Asia/Singapore',
      'Malaysia': 'Asia/Kuala_Lumpur',
      'Thailand': 'Asia/Bangkok',
      'Nepal': 'Asia/Kathmandu',
      'Bangladesh': 'Asia/Dhaka',
      'Sri Lanka': 'Asia/Colombo',
      'Pakistan': 'Asia/Karachi'
    };

    const normalizedCountry = country.trim();
    return countryTimezones[normalizedCountry] || 'UTC';
  }

  /**
   * Get list of common timezones for dropdown
   */
  static getCommonTimezones(): string[] {
    return [
      'UTC',
      'Asia/Kolkata',
      'America/New_York',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'America/Toronto',
      'America/Chicago',
      'Asia/Dubai',
      'Asia/Singapore',
      'Asia/Bangkok',
      'Asia/Kathmandu',
      'Asia/Dhaka',
      'Asia/Colombo',
      'Asia/Karachi',
      'Africa/Cairo',
      'Africa/Johannesburg',
      'America/Sao_Paulo',
      'Europe/Moscow'
    ];
  }

  /**
   * Validate timezone string
   */
  static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current time in a timezone
   */
  static getCurrentTimeInTimezone(timezone: string): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date());
    } catch {
      return new Date().toISOString();
    }
  }
}