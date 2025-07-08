interface IGDBAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  acquired_at: number; // timestamp when token was acquired
}

class IGDBAuth {
  private static instance: IGDBAuth;
  private token: IGDBAuthToken | null = null;

  private constructor() {}

  public static getInstance(): IGDBAuth {
    if (!IGDBAuth.instance) {
      IGDBAuth.instance = new IGDBAuth();
    }
    return IGDBAuth.instance;
  }

  /**
   * Check if current token is valid (not expired)
   */
  private isTokenValid(): boolean {
    if (!this.token) return false;
    
    const now = Date.now();
    const expirationTime = this.token.acquired_at + (this.token.expires_in * 1000);
    
    // Add 5 minute buffer before expiration
    return now < (expirationTime - 5 * 60 * 1000);
  }

  /**
   * Get access token from Twitch OAuth (required for IGDB)
   */
  private async fetchNewToken(): Promise<IGDBAuthToken> {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('IGDB credentials not configured');
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to authenticate with IGDB: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    return {
      ...tokenData,
      acquired_at: Date.now(),
    };
  }

  /**
   * Get valid access token (refreshes if needed)
   */
  public async getAccessToken(): Promise<string> {
    if (!this.isTokenValid()) {
      console.log('Fetching new IGDB access token...');
      this.token = await this.fetchNewToken();
      console.log('IGDB token acquired, expires in:', this.token.expires_in, 'seconds');
    }

    return this.token!.access_token;
  }

  /**
   * Make authenticated request to IGDB API
   */
  public async makeRequest(endpoint: string, body: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const clientId = process.env.IGDB_CLIENT_ID;

    const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId!,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`IGDB API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const igdbAuth = IGDBAuth.getInstance();
