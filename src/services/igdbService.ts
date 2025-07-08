// IGDB API Service with authentication and rate limiting
import { IGDB_PLATFORM_FIELDS, IGDB_PLATFORM_VERSION_FIELDS, IGDB_GAME_FIELDS, buildPlatformQuery, buildPlatformVersionQuery, buildGamesQuery } from '@/constants/igdbFields';

export interface IGDBAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number; // calculated field
}

export interface IGDBPlatform {
  id: number;
  name: string;
  abbreviation?: string;
  alternative_name?: string;
  generation?: number;
  platform_family?: number;
  platform_logo?: {
    id: number;
    url: string;
  };
}

export interface IGDBPlatformVersion {
  id: number;
  name: string;
  abbreviation?: string;
  alternative_name?: string;
  platform_logo?: {
    id: number;
    url: string;
  };
  main_manufacturer?: {
    id: number;
    name: string;
  };
  platform?: {
    id: number;
    name: string;
  };
}

export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  cover?: {
    id: number;
    url: string;
    image_id: string;
  };
  platforms?: number[];
  genres?: Array<{
    id: number;
    name: string;
  }>;
  release_dates?: Array<{
    id: number;
    date: number;
    human: string;
    platform: number;
  }>;
  involved_companies?: Array<{
    id: number;
    company: {
      id: number;
      name: string;
    };
  }>;
}

class IGDBService {
  private static instance: IGDBService;
  private authToken: IGDBAuthToken | null = null;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_DELAY = 250; // 4 requests per second = 250ms between requests

  public static getInstance(): IGDBService {
    if (!IGDBService.instance) {
      IGDBService.instance = new IGDBService();
    }
    return IGDBService.instance;
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  public async makeRequest(
    url: string, 
    body: string, 
    retries = 3
  ): Promise<any> {
    await this.authenticate();
    await this.waitForRateLimit();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': process.env.IGDB_CLIENT_ID!,
          'Authorization': `Bearer ${this.authToken!.access_token}`,
        },
        body,
      });

      if (response.status === 429) {
        // Rate limited, wait and retry
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.makeRequest(url, body, retries - 1);
        }
        throw new Error('Rate limit exceeded');
      }

      if (!response.ok) {
        throw new Error(`IGDB API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes('Rate limit')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.makeRequest(url, body, retries - 1);
      }
      throw error;
    }
  }

  public async authenticate(): Promise<void> {
    // Check if we have a valid token
    if (this.authToken && Date.now() < this.authToken.expires_at) {
      return; // Token is still valid
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.IGDB_CLIENT_ID!,
        client_secret: process.env.IGDB_CLIENT_SECRET!,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    this.authToken = {
      ...tokenData,
      expires_at: Date.now() + (tokenData.expires_in * 1000) - 60000, // 1 minute buffer
    };
  }

  public async searchPlatforms(searchQuery: string): Promise<IGDBPlatform[]> {
    await this.authenticate();

    const query = buildPlatformQuery(`search "${searchQuery}"`, 20);

    return this.makeRequest('https://api.igdb.com/v4/platforms', query);
  }

  public async searchPlatformVersions(searchQuery: string): Promise<IGDBPlatformVersion[]> {
    await this.authenticate();

    const query = buildPlatformVersionQuery(`search "${searchQuery}"`, 20);

    return this.makeRequest('https://api.igdb.com/v4/platform_versions', query);
  }

  public async searchGames(searchQuery: string, platformId: number): Promise<IGDBGame[]> {
    await this.authenticate();

    // IGDB API syntax: Let's try a comprehensive search approach
    // We'll search in multiple fields: name, alternative names
    // Using pattern matching for more flexible search
    
    const whereClause = `where (name ~ *"${searchQuery}"* | alternative_names.name ~ *"${searchQuery}"*) & platforms = (${platformId})`;
    const query = buildGamesQuery(whereClause, 20);

    console.log(`🔍 IGDB Games Query for platform ${platformId} (including alternative names):`);
    console.log(query);

    try {
      const result = await this.makeRequest('https://api.igdb.com/v4/games', query);
      console.log(`✅ Successfully got ${result.length} games (searched in name + alternative names)`);
      return result;
    } catch (error) {
      console.error(`❌ IGDB query with alternative names failed for platform ${platformId}:`, error);
      
      // Fallback 1: Try without alternative names (original approach)
      console.log(`🔄 Trying fallback 1: search only in main name`);
      const fallback1WhereClause = `where name ~ *"${searchQuery}"* & platforms = (${platformId})`;
      const fallback1Query = buildGamesQuery(fallback1WhereClause, 20);
      
      console.log(`🔍 Fallback 1 query:`, fallback1Query);
      
      try {
        const fallback1Result = await this.makeRequest('https://api.igdb.com/v4/games', fallback1Query);
        console.log(`✅ Fallback 1 found ${fallback1Result.length} games (main name only)`);
        return fallback1Result;
      } catch (fallback1Error) {
        console.error(`❌ Fallback 1 also failed:`, fallback1Error);
        
        // Fallback 2: Simple search without platform filter, then manual filtering
        console.log(`🔄 Trying fallback 2: simple search + manual filtering`);
        const fallback2WhereClause = `search "${searchQuery}"`;
        const fallback2Query = buildGamesQuery(fallback2WhereClause, 20);
        
        console.log(`🔍 Fallback 2 query:`, fallback2Query);
        
        const fallback2Result = await this.makeRequest('https://api.igdb.com/v4/games', fallback2Query);
        
        // Filter results manually for the platform
        const filteredResults = fallback2Result.filter((game: any) => 
          game.platforms && game.platforms.includes(platformId)
        );
        
        console.log(`✅ Fallback 2 found ${fallback2Result.length} total games, ${filteredResults.length} for platform ${platformId}`);
        return filteredResults;
      }
    }
  }
}

export default IGDBService;
