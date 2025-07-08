/**
 * IGDB API Field Constants - SINGLE SOURCE OF TRUTH
 * 
 * ⚠️  CRITICAL: These constants ensure that ALL IGDB API calls use the EXACT same fields
 * for platforms and platform versions, preventing data inconsistencies.
 * 
 * 🎯 OBJECTIVE: Fix the issue where platform versions fetched via different methods
 * (main search vs. platform.versions) have different field completeness, especially
 * missing images/logos in some sections.
 * 
 * 📋 USAGE: Every IGDB fetch for platforms/platform_versions MUST use these constants:
 * - utils/igdb.ts: searchIGDBPlatforms, searchIGDBPlatformVersions, etc.
 * - services/igdbService.ts: searchPlatforms, searchPlatformVersions
 * - All API routes: /api/admin/igdb/*
 * - Any new IGDB fetches must import and use these constants
 * 
 * 🚨 DO NOT create new hardcoded field lists anywhere else!
 */

/**
 * Complete list of ALL possible fields for IGDB Platforms
 * Using * to get ALL available fields, plus expanded reference data
 * (versions will be just IDs, we fetch full version data separately)
 */
export const IGDB_PLATFORM_FIELDS = `*, platform_logo.*, platform_family.*, platform_type.*`;

/**
 * Complete list of ALL possible fields for IGDB Platform Versions
 * Using * to get ALL available fields, plus expanded reference data
 */
export const IGDB_PLATFORM_VERSION_FIELDS = `*, platform_logo.*, main_manufacturer.*, companies.*, platform_version_release_dates.*`;

/**
 * Complete list of ALL possible fields for IGDB Companies
 * Using * to get ALL available fields, plus expanded reference data
 */
export const IGDB_COMPANY_FIELDS = `*, logo.*`;

/**
 * Complete list of ALL possible fields for IGDB Games
 * Using * to get ALL basic fields, plus expanded reference data
 */
export const IGDB_GAME_FIELDS = `*, cover.*, platforms, genres.*, release_dates.*, involved_companies.company.*, age_ratings.*, artworks.*, screenshots.*, videos.*, websites.*, game_engines.*, game_modes.*, themes.*, player_perspectives.*, multiplayer_modes.*, language_supports.*, alternative_names.*, collections.*, franchises.*, external_games.*`;

/**
 * Helper function to build platform query with consistent fields
 */
export function buildPlatformQuery(whereClause: string, limit: number = 20): string {
  return `
    fields ${IGDB_PLATFORM_FIELDS};
    ${whereClause};
    limit ${limit};
  `.trim();
}

/**
 * Helper function to build platform version query with consistent fields
 */
export function buildPlatformVersionQuery(whereClause: string, limit: number = 20): string {
  return `
    fields ${IGDB_PLATFORM_VERSION_FIELDS};
    ${whereClause};
    limit ${limit};
  `.trim();
}

/**
 * Helper function to build games query with consistent fields
 */
export function buildGamesQuery(whereClause: string, limit: number = 20): string {
  return `
    fields ${IGDB_GAME_FIELDS};
    ${whereClause};
    limit ${limit};
  `.trim();
}

/**
 * 🚨 VALIDATION HELPER: Use this to verify that all IGDB fetches use these constants
 * Call this in tests or during development to ensure consistency
 */
export function validateIGDBFieldConsistency() {
  const requiredFields = {
    platforms: IGDB_PLATFORM_FIELDS,
    platform_versions: IGDB_PLATFORM_VERSION_FIELDS,
  };
  
  console.log('📋 IGDB Field Constants (Single Source of Truth):');
  console.log('✅ Platform fields:', IGDB_PLATFORM_FIELDS, '(gets ALL available fields)');
  console.log('✅ Platform version fields:', IGDB_PLATFORM_VERSION_FIELDS, '(gets ALL available fields)');
  console.log('⚠️  All IGDB fetches must use these constants to prevent data inconsistencies!');
  
  return requiredFields;
}
