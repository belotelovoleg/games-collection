import { IGDB_PLATFORM_FIELDS, IGDB_PLATFORM_VERSION_FIELDS, buildPlatformQuery, buildPlatformVersionQuery } from '@/constants/igdbFields';

interface IGDBAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface IGDBAuthCache {
  token: string;
  expiresAt: number;
}

// In-memory cache for auth token
let authCache: IGDBAuthCache | null = null;
let authPromise: Promise<string> | null = null; // Prevent concurrent auth requests

// Rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 250; // 4 requests per second = 250ms between requests

// Logging utility for IGDB requests
function logIGDBRequest(
  method: string,
  url: string,
  requestBody?: any,
  responseFirstElement?: any,
  status?: number,
  error?: string
) {
  const timestamp = new Date().toISOString();
  
  // Only log completed requests (with status) or errors, not the "starting" requests
  if (!status && !error) {
    return; // Skip logging for request start
  }
  
  console.log(`\n=== [IGDB API] ${timestamp} ===`);
  console.log(`${method} ${url}`);
  console.log(`STATUS: ${status || 'ERROR'}`);
  
  if (requestBody && requestBody !== 'client_credentials grant request') {
    console.log(`REQUEST BODY:`);
    console.log(requestBody);
  }
  
  if (responseFirstElement) {
    console.log(`FIRST RESPONSE ELEMENT (ALL FIELDS):`);
    console.log(`Available keys: ${Object.keys(responseFirstElement).join(', ')}`);
    console.log(JSON.stringify(responseFirstElement, null, 2));
  }
  
  if (error) {
    console.log(`ERROR: ${error}`);
  }
  
  console.log(`=== END IGDB LOG ===\n`);
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await wait(waitTime);
  }
  
  lastRequestTime = Date.now();
}

/**
 * Get IGDB access token (with caching and auto-refresh)
 */
export async function getIGDBAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (authCache && authCache.expiresAt > Date.now()) {
    console.log('[IGDB AUTH] Using cached token');
    return authCache.token;
  }

  // If an auth request is already in progress, wait for it
  if (authPromise) {
    console.log('[IGDB AUTH] Waiting for existing auth request');
    return authPromise;
  }

  console.log('[IGDB AUTH] Getting new access token');
  
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const error = 'IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set';
    logIGDBRequest('POST', 'oauth2/token', undefined, undefined, 500, error);
    throw new Error(error);
  }

  const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  // Create a shared promise for this auth request
  authPromise = (async () => {
    try {
      await rateLimit();
      
      logIGDBRequest('POST', authUrl, 'client_credentials grant request');
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = `IGDB auth failed: ${response.status} ${response.statusText}`;
        logIGDBRequest('POST', authUrl, 'client_credentials grant request', undefined, response.status, error);
        throw new Error(error);
      }

      const data: IGDBAuthResponse = await response.json();
      
      // Cache the token with expiration time (subtract 5 minutes for safety)
      const expiresAt = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
      authCache = {
        token: data.access_token,
        expiresAt
      };

      logIGDBRequest('POST', authUrl, 'client_credentials grant request', data, response.status);
      
      return data.access_token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown auth error';
      logIGDBRequest('POST', authUrl, 'client_credentials grant request', undefined, 500, errorMessage);
      throw error;
    } finally {
      // Clear the promise so future requests can create a new one
      authPromise = null;
    }
  })();

  return authPromise;
}

/**
 * Make authenticated request to IGDB API with rate limiting and retry logic
 */
export async function makeIGDBRequest(
  endpoint: string,
  query: string,
  maxRetries = 3
): Promise<any[]> {
  const token = await getIGDBAccessToken();
  const url = `https://api.igdb.com/v4/${endpoint}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rateLimit();
      
      console.log(`[IGDB API] Making request to ${endpoint}...`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: query,
      });

      if (response.status === 429) {
        // Rate limit exceeded, wait and retry
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        logIGDBRequest('POST', url, query, undefined, 429, `Rate limited, waiting ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
        await wait(waitTime);
        continue;
      }

      if (!response.ok) {
        const error = `IGDB ${endpoint} failed: ${response.status} ${response.statusText}`;
        logIGDBRequest('POST', url, query, undefined, response.status, error);
        
        // Don't retry on 4xx client errors (400, 401, 403, 404, etc.)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(error);
        }
        
        // Only retry on 5xx server errors and network issues
        throw new Error(error);
      }

      const data = await response.json();
      const firstElement = Array.isArray(data) && data.length > 0 ? data[0] : null;
      
      console.log(`[IGDB API] Received ${Array.isArray(data) ? data.length : 0} results`);
      logIGDBRequest('POST', url, query, firstElement, response.status);
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (attempt === maxRetries) {
        logIGDBRequest('POST', url, query, undefined, 500, `Final attempt failed: ${errorMessage}`);
        throw error;
      }
      
      logIGDBRequest('POST', url, query, undefined, 500, `Attempt ${attempt}/${maxRetries} failed: ${errorMessage}, retrying...`);
      await wait(1000 * attempt); // Wait before retry
    }
  }

  throw new Error(`Failed to complete IGDB request after ${maxRetries} attempts`);
}

/**
 * Search for platforms in IGDB (with all available fields)
 */
export async function searchIGDBPlatforms(searchQuery: string): Promise<any[]> {
  console.log(`[IGDB] Searching platforms for: "${searchQuery}"`);
  
  const query = buildPlatformQuery(
    `where name ~ *"${searchQuery}"* | alternative_name ~ *"${searchQuery}"*`
  );
  
  const result = await makeIGDBRequest('platforms', query);
  console.log(`[IGDB] Found ${result.length} platforms with full data`);
  return result;
}

/**
 * Search for platform versions in IGDB (using where clause)
 */
export async function searchIGDBPlatformVersions(searchQuery: string): Promise<any[]> {
  console.log(`[IGDB] Searching platform versions for: "${searchQuery}"`);
  
  try {
    const query = buildPlatformVersionQuery(
      `where name ~ *"${searchQuery}"*`
    );
    
    const result = await makeIGDBRequest('platform_versions', query);
    console.log(`[IGDB] Found ${result.length} platform versions with full data`);
    return result;
  } catch (error) {
    console.error('[IGDB] Platform versions search failed:', error);
    // Return empty array instead of throwing to prevent breaking the whole search
    return [];
  }
}

/**
 * Get platform by ID from IGDB (with all available fields)
 */
export async function getIGDBPlatformById(id: number): Promise<any> {
  const query = buildPlatformQuery(`where id = ${id}`, 1);
  
  const results = await makeIGDBRequest('platforms', query);
  return results[0] || null;
}

/**
 * Get platform version by ID from IGDB
 */
export async function getIGDBPlatformVersionById(id: number): Promise<any> {
  const query = buildPlatformVersionQuery(`where id = ${id}`, 1);
  
  const results = await makeIGDBRequest('platform_versions', query);
  return results[0] || null;
}

/**
 * Get platform logo by ID from IGDB
 */
export async function getIGDBPlatformLogoById(id: number): Promise<any> {
  const query = `
    fields id, url, image_id, width, height;
    where id = ${id};
  `;
  
  const results = await makeIGDBRequest('platform_logos', query);
  return results[0] || null;
}

/**
 * Find parent platform by platform version ID
 */
export async function getIGDBParentPlatformByVersionId(versionId: number): Promise<any> {
  const query = buildPlatformQuery(`where versions = (${versionId})`, 1);
  
  const results = await makeIGDBRequest('platforms', query);
  return results[0] || null;
}
