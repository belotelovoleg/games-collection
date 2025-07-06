/**
 * IGDB Data Population Service - SIMPLIFIED VERSION
 * 
 * Handles automatic population of IGDB platform data when adding a Console.
 * This service ensures that platforms and their dependencies are properly stored.
 */

import { PrismaClient } from '@prisma/client';
import IGDBService from './igdbService';
import { IGDB_PLATFORM_FIELDS } from '@/constants/igdbFields';

const prisma = new PrismaClient();

export interface ConsoleCreationData {
  name: string;
  photo?: string;
  abbreviation?: string;
  alternativeName?: string;
  generation?: number;
  platformFamily?: string;
  platformType?: string;
}

export interface PopulatedConsoleData extends ConsoleCreationData {
  igdbPlatformID: number;
}

class IGDBDataPopulationService {
  private static instance: IGDBDataPopulationService;
  private igdbService = IGDBService.getInstance();

  public static getInstance(): IGDBDataPopulationService {
    if (!IGDBDataPopulationService.instance) {
      IGDBDataPopulationService.instance = new IGDBDataPopulationService();
    }
    return IGDBDataPopulationService.instance;
  }

  /**
   * Main method: Create a Console and automatically populate IGDB platform data
   */
  async createConsoleWithIGDBData(consoleData: ConsoleCreationData): Promise<PopulatedConsoleData> {
    console.log(`🎮 Creating console: ${consoleData.name}`);
    
    // Step 1: Search for platform on IGDB
    const platforms = await this.igdbService.searchPlatforms(consoleData.name);
    if (platforms.length === 0) {
      throw new Error(`No IGDB platform found for: ${consoleData.name}`);
    }

    const selectedPlatform = platforms[0]; // Use first match
    console.log(`🎯 Found IGDB platform: ${selectedPlatform.name} (ID: ${selectedPlatform.id})`);

    // Step 2: Populate platform and all its dependencies
    await this.populatePlatformData(selectedPlatform.id);

    // Step 3: Return populated console data
    return {
      ...consoleData,
      igdbPlatformID: selectedPlatform.id,
    };
  }

  /**
   * Populate a platform and all its dependencies (logo, family, type, etc.)
   */
  async populatePlatformData(platformId: number): Promise<void> {
    console.log(`📋 Populating platform data for ID: ${platformId}`);

    await this.igdbService.authenticate();

    // Fetch full platform data from IGDB
    const query = `fields ${IGDB_PLATFORM_FIELDS}; where id = ${platformId};`;
    const response = await fetch('https://api.igdb.com/v4/platforms', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.IGDB_CLIENT_ID!,
        'Authorization': `Bearer ${(this.igdbService as any).authToken.access_token}`,
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.status} ${response.statusText}`);
    }

    const platforms = await response.json();
    const platformData = platforms[0];

    if (!platformData) {
      throw new Error(`Platform ${platformId} not found on IGDB`);
    }

    // Step 1: Populate platform logo (if exists)
    if (platformData.platform_logo) {
      await this.upsertPlatformLogo(platformData.platform_logo);
    }

    // Step 2: Populate platform family (if exists)
    if (platformData.platform_family) {
      await this.upsertPlatformFamily(platformData.platform_family);
    }

    // Step 3: Populate platform type (if exists)
    if (platformData.platform_type) {
      await this.upsertPlatformType(platformData.platform_type);
    }

    // Step 4: Populate the platform itself
    await this.upsertPlatform(platformData);

    console.log(`✅ Platform ${platformId} populated successfully`);
  }

  /**
   * UPSERT METHODS - Store data in normalized tables
   */

  private async upsertPlatformLogo(logoData: any): Promise<void> {
    await prisma.igdbPlatformLogo.upsert({
      where: { id: logoData.id },
      update: {
        alphaChannel: logoData.alpha_channel,
        animated: logoData.animated,
        checksum: logoData.checksum,
        height: logoData.height,
        imageId: logoData.image_id,
        url: logoData.url,
        width: logoData.width,
      },
      create: {
        id: logoData.id,
        alphaChannel: logoData.alpha_channel,
        animated: logoData.animated,
        checksum: logoData.checksum,
        height: logoData.height,
        imageId: logoData.image_id,
        url: logoData.url,
        width: logoData.width,
      },
    });
    console.log(`  💾 Logo ${logoData.id} stored`);
  }

  private async upsertPlatformFamily(familyData: any): Promise<void> {
    await prisma.igdbPlatformFamily.upsert({
      where: { id: familyData.id },
      update: {
        checksum: familyData.checksum,
        name: familyData.name,
        slug: familyData.slug,
      },
      create: {
        id: familyData.id,
        checksum: familyData.checksum,
        name: familyData.name,
        slug: familyData.slug,
      },
    });
    console.log(`  🏠 Family ${familyData.id} (${familyData.name}) stored`);
  }

  private async upsertPlatformType(typeData: any): Promise<void> {
    await prisma.igdbPlatformType.upsert({
      where: { id: typeData.id },
      update: {
        checksum: typeData.checksum,
        name: typeData.name,
      },
      create: {
        id: typeData.id,
        checksum: typeData.checksum,
        name: typeData.name,
      },
    });
    console.log(`  🏷️  Type ${typeData.id} (${typeData.name}) stored`);
  }

  private async upsertPlatform(platformData: any): Promise<void> {
    await prisma.igdbPlatform.upsert({
      where: { id: platformData.id },
      update: {
        abbreviation: platformData.abbreviation,
        alternativeName: platformData.alternative_name,
        checksum: platformData.checksum,
        generation: platformData.generation,
        name: platformData.name,
        platformFamilyId: platformData.platform_family?.id,
        platformLogoId: platformData.platform_logo?.id,
        platformTypeId: platformData.platform_type?.id,
        slug: platformData.slug,
        summary: platformData.summary,
        url: platformData.url,
        igdbData: JSON.stringify(platformData), // Store complete IGDB response
      },
      create: {
        id: platformData.id,
        abbreviation: platformData.abbreviation,
        alternativeName: platformData.alternative_name,
        checksum: platformData.checksum,
        generation: platformData.generation,
        name: platformData.name,
        platformFamilyId: platformData.platform_family?.id,
        platformLogoId: platformData.platform_logo?.id,
        platformTypeId: platformData.platform_type?.id,
        slug: platformData.slug,
        summary: platformData.summary,
        url: platformData.url,
        igdbData: JSON.stringify(platformData),
      },
    });
    console.log(`  🎮 Platform ${platformData.id} (${platformData.name}) stored`);
  }

  /**
   * Create the actual Console record with populated IGDB data
   */
  async createConsole(consoleData: PopulatedConsoleData) {
    return await prisma.console.create({
      data: {
        name: consoleData.name,
        photo: consoleData.photo,
        abbreviation: consoleData.abbreviation,
        alternativeName: consoleData.alternativeName,
        generation: consoleData.generation,
        platformFamily: consoleData.platformFamily,
        platformType: consoleData.platformType,
        igdbPlatformID: consoleData.igdbPlatformID,
      },
      include: {
        igdbPlatform: {
          include: {
            platformFamily: true,
            platformLogo: true,
            platformType: true,
          },
        },
      },
    });
  }

  /**
   * Complete flow: Search IGDB, populate data, create console
   */
  async createConsoleWithFullIGDBIntegration(consoleData: ConsoleCreationData) {
    try {
      // Step 1: Get IGDB data and populate normalized tables
      const populatedData = await this.createConsoleWithIGDBData(consoleData);
      
      // Step 2: Create the console with populated IGDB references
      const console = await this.createConsole(populatedData);
      
      console.log(`🎉 Console "${console.name}" created successfully with full IGDB integration!`);
      return console;
      
    } catch (error) {
      console.error(`❌ Failed to create console with IGDB data:`, error);
      throw error;
    }
  }
}

export default IGDBDataPopulationService;
