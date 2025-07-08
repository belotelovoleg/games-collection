/**
 * IGDB Data Population Service
 * 
 * Handles automatic population of all normalized IGDB tables when adding a Console.
 * This service ensures that all referenced IGDB data (platforms, platform versions,
 * companies,     // Step 1: Populate main manufacturer company (if exists)
    if (versionData.main_manufacturer) {
      // Handle case where main_manufacturer might just be an ID
      if (typeof versionData.main_manufacturer === 'number') {
        await this.upsertCompany({ id: versionData.main_manufacturer });
      } else {
        await this.upsertCompany(versionData.main_manufacturer);
      }
    }

    // Step 2: Populate all companies (if exists)
    if (versionData.companies && Array.isArray(versionData.companies)) {
      for (const company of versionData.companies) {
        // Handle case where company might just be an ID
        if (typeof company === 'number') {
          await this.upsertCompany({ id: company });
          await this.upsertPlatformVersionCompanyRelation(versionData.id, company);
        } else {
          await this.upsertCompany(company);
          await this.upsertPlatformVersionCompanyRelation(versionData.id, company.id);
        }
      }
    }es, types, etc.) are properly stored in the database.
 */

import { PrismaClient } from '@prisma/client';
import IGDBService from './igdbService';
import { IGDB_PLATFORM_FIELDS, IGDB_PLATFORM_VERSION_FIELDS, IGDB_COMPANY_FIELDS } from '@/constants/igdbFields';

const prisma = new PrismaClient();

export interface ConsoleCreationData {
  name: string;
  photo?: string;
  abbreviation?: string;
  alternativeName?: string;
  generation?: number;
  platformFamily?: string;
  platformType?: string;
  // IGDB data - can be provided directly instead of searching
  igdbPlatformID?: number;
  igdbPlatformVersionID?: number;
  // Raw IGDB data for direct population (from UI selection)
  igdbPlatformData?: any;
  igdbPlatformVersionData?: any;
}

export interface PopulatedConsoleData extends ConsoleCreationData {
  igdbPlatformID: number;
  igdbPlatformVersionID?: number;
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
   * Main method: Create a Console and automatically populate all IGDB data
   */
  async createConsoleWithIGDBData(consoleData: ConsoleCreationData): Promise<PopulatedConsoleData> {
    console.log(`🎮 Creating console: ${consoleData.name}`);
    
    let selectedPlatformId: number;
    let platformVersionId: number | undefined;

    // Check if we have pre-selected IGDB data (from UI selection)
    if (consoleData.igdbPlatformData && consoleData.igdbPlatformVersionData) {
      console.log(`🎯 Using pre-selected IGDB data`);
      console.log(`   Platform: ${consoleData.igdbPlatformData.name} (ID: ${consoleData.igdbPlatformData.id})`);
      console.log(`   Version: ${consoleData.igdbPlatformVersionData.name} (ID: ${consoleData.igdbPlatformVersionData.id})`);
      
      selectedPlatformId = consoleData.igdbPlatformData.id;
      platformVersionId = consoleData.igdbPlatformVersionData.id;
      
      // Populate using the provided data directly
      await this.populatePlatformDataFromObject(consoleData.igdbPlatformData);
      await this.populatePlatformVersionDataFromObject(consoleData.igdbPlatformVersionData);
      
      // Create platform-version relationship
      if (platformVersionId) {
        await this.upsertPlatformVersionRelation(selectedPlatformId, platformVersionId);
      }
      
    } else {
      // Fallback: Search for platform on IGDB by name
      console.log(`🔍 Searching IGDB for: ${consoleData.name}`);
      const platforms = await this.igdbService.searchPlatforms(consoleData.name);
      if (platforms.length === 0) {
        throw new Error(`No IGDB platform found for: ${consoleData.name}`);
      }

      const selectedPlatform = platforms[0]; // Use first match
      selectedPlatformId = selectedPlatform.id;
      console.log(`🎯 Found IGDB platform: ${selectedPlatform.name} (ID: ${selectedPlatformId})`);

      // Populate platform and all its dependencies
      await this.populatePlatformData(selectedPlatformId);

      // Search for platform version (optional)
      try {
        const platformVersions = await this.igdbService.searchPlatformVersions(consoleData.name);
        if (platformVersions.length > 0) {
          platformVersionId = platformVersions[0].id;
          console.log(`🔧 Found IGDB platform version: ${platformVersions[0].name} (ID: ${platformVersionId})`);
          await this.populatePlatformVersionData(platformVersionId);
          
          // Create platform-version relationship
          await this.upsertPlatformVersionRelation(selectedPlatformId, platformVersionId);
        }
      } catch (error) {
        console.log(`⚠️  No platform version found for ${consoleData.name}, continuing without...`);
      }
    }

    // Return populated console data
    return {
      ...consoleData,
      igdbPlatformID: selectedPlatformId,
      igdbPlatformVersionID: platformVersionId,
    };
  }

  /**
   * Populate platform data directly from a provided IGDB object (no API call needed)
   */
  async populatePlatformDataFromObject(platformData: any): Promise<void> {
    console.log(`📋 Populating platform data from object: ${platformData.name} (ID: ${platformData.id})`);

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

    console.log(`✅ Platform ${platformData.id} populated successfully from object`);
  }

  /**
   * Populate platform version data directly from a provided IGDB object (no API call needed)
   */
  async populatePlatformVersionDataFromObject(versionData: any): Promise<void> {
    console.log(`🔧 Populating platform version data from object: ${versionData.name} (ID: ${versionData.id})`);

    // Step 1: Populate main manufacturer company (if exists)
    if (versionData.main_manufacturer) {
      // Handle case where main_manufacturer might just be an ID
      if (typeof versionData.main_manufacturer === 'number') {
        await this.upsertCompany({ id: versionData.main_manufacturer });
      } else {
        await this.upsertCompany(versionData.main_manufacturer);
      }
    }

    // Step 2: Populate all companies first (without relationships)
    if (versionData.companies && Array.isArray(versionData.companies)) {
      for (const company of versionData.companies) {
        // Handle case where company might just be an ID
        if (typeof company === 'number') {
          await this.upsertCompany({ id: company });
        } else {
          await this.upsertCompany(company);
        }
      }
    }

    // Step 3: Populate platform logo (if different from platform)
    if (versionData.platform_logo) {
      await this.upsertPlatformLogo(versionData.platform_logo);
    }

    // Step 4: Populate the platform version itself
    await this.upsertPlatformVersion(versionData);

    // Step 5: Now create company relationships (after platform version exists)
    if (versionData.companies && Array.isArray(versionData.companies)) {
      for (const company of versionData.companies) {
        // Handle case where company might just be an ID
        if (typeof company === 'number') {
          await this.upsertPlatformVersionCompanyRelation(versionData.id, company);
        } else {
          await this.upsertPlatformVersionCompanyRelation(versionData.id, company.id);
        }
      }
    }

    console.log(`✅ Platform version ${versionData.id} populated successfully from object`);
  }

  /**
   * Populate a platform and all its dependencies (logo, family, type, etc.)
   */
  async populatePlatformData(platformId: number): Promise<void> {
    console.log(`📋 Populating platform data for ID: ${platformId}`);

    // Fetch full platform data from IGDB using the service
    const query = `fields ${IGDB_PLATFORM_FIELDS}; where id = ${platformId};`;
    const platforms = await this.igdbService.makeRequest(
      'https://api.igdb.com/v4/platforms',
      query
    );

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
   * Populate a platform version and all its dependencies
   */
  async populatePlatformVersionData(platformVersionId: number): Promise<void> {
    console.log(`🔧 Populating platform version data for ID: ${platformVersionId}`);

    // Fetch full platform version data from IGDB
    const query = `fields ${IGDB_PLATFORM_VERSION_FIELDS}; where id = ${platformVersionId};`;
    const versionDataArray = await this.igdbService.makeRequest(
      'https://api.igdb.com/v4/platform_versions',
      query
    );

    const versionData = versionDataArray[0];
    if (!versionData) {
      throw new Error(`Platform version ${platformVersionId} not found on IGDB`);
    }

    // Step 1: Populate main manufacturer company (if exists)
    if (versionData.main_manufacturer) {
      await this.upsertCompany(versionData.main_manufacturer);
    }

    // Step 2: Populate all companies (if exists)
    if (versionData.companies && Array.isArray(versionData.companies)) {
      for (const company of versionData.companies) {
        await this.upsertCompany(company);
        // Create relationship
        await this.upsertPlatformVersionCompanyRelation(platformVersionId, company.id);
      }
    }

    // Step 3: Populate platform logo (if different from platform)
    if (versionData.platform_logo) {
      await this.upsertPlatformLogo(versionData.platform_logo);
    }

    // Step 4: Populate the platform version itself
    await this.upsertPlatformVersion(versionData);

    console.log(`✅ Platform version ${platformVersionId} populated successfully`);
  }

  /**
   * Fetch complete company data from IGDB if we only have an ID
   */
  private async fetchCompleteCompanyData(companyId: number): Promise<any> {
    console.log(`🔍 Fetching complete company data for ID: ${companyId}`);
    
    const query = `fields ${IGDB_COMPANY_FIELDS}; where id = ${companyId};`;
    const companies = await this.igdbService.makeRequest(
      'https://api.igdb.com/v4/companies',
      query
    );
    
    if (companies.length === 0) {
      throw new Error(`Company ${companyId} not found on IGDB`);
    }
    
    return companies[0];
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

  private async upsertCompany(companyData: any): Promise<void> {
    let finalCompanyData = companyData;
    
    // Check if we have essential data (name is required)
    if (!companyData.name && companyData.id) {
      console.log(`⚠️  Company ${companyData.id} missing essential data, fetching from IGDB...`);
      try {
        finalCompanyData = await this.fetchCompleteCompanyData(companyData.id);
        console.log(`✅ Fetched complete data for company ${finalCompanyData.id}: ${finalCompanyData.name}`);
      } catch (error) {
        console.log(`❌ Failed to fetch company ${companyData.id}:`, error);
        return; // Skip this company if we can't fetch its data
      }
    } else if (!companyData.name) {
      console.log(`⚠️  Company missing both name and ID, skipping...`);
      console.log('Company data:', JSON.stringify(companyData, null, 2));
      return;
    }

    // First upsert company logo if exists
    if (finalCompanyData.logo) {
      await prisma.igdbCompanyLogo.upsert({
        where: { id: finalCompanyData.logo.id },
        update: {
          alphaChannel: finalCompanyData.logo.alpha_channel,
          animated: finalCompanyData.logo.animated,
          checksum: finalCompanyData.logo.checksum,
          height: finalCompanyData.logo.height,
          imageId: finalCompanyData.logo.image_id,
          url: finalCompanyData.logo.url,
          width: finalCompanyData.logo.width,
        },
        create: {
          id: finalCompanyData.logo.id,
          alphaChannel: finalCompanyData.logo.alpha_channel,
          animated: finalCompanyData.logo.animated,
          checksum: finalCompanyData.logo.checksum,
          height: finalCompanyData.logo.height,
          imageId: finalCompanyData.logo.image_id,
          url: finalCompanyData.logo.url,
          width: finalCompanyData.logo.width,
        },
      });
    }

    // Then upsert the company
    await prisma.igdbCompany.upsert({
      where: { id: finalCompanyData.id },
      update: {
        changeDate: finalCompanyData.change_date,
        changeDateFormatId: finalCompanyData.change_date_format_id,
        changedCompanyId: finalCompanyData.changed_company_id,
        checksum: finalCompanyData.checksum,
        country: finalCompanyData.country,
        description: finalCompanyData.description,
        logoId: finalCompanyData.logo?.id,
        name: finalCompanyData.name,
        parentId: finalCompanyData.parent_id,
        slug: finalCompanyData.slug,
        startDate: finalCompanyData.start_date,
        startDateFormatId: finalCompanyData.start_date_format_id,
        statusId: finalCompanyData.status_id,
        url: finalCompanyData.url,
      },
      create: {
        id: finalCompanyData.id,
        changeDate: finalCompanyData.change_date,
        changeDateFormatId: finalCompanyData.change_date_format_id,
        changedCompanyId: finalCompanyData.changed_company_id,
        checksum: finalCompanyData.checksum,
        country: finalCompanyData.country,
        description: finalCompanyData.description,
        logoId: finalCompanyData.logo?.id,
        name: finalCompanyData.name,
        parentId: finalCompanyData.parent_id,
        slug: finalCompanyData.slug,
        startDate: finalCompanyData.start_date,
        startDateFormatId: finalCompanyData.start_date_format_id,
        statusId: finalCompanyData.status_id,
        url: finalCompanyData.url,
      },
    });
    console.log(`  🏢 Company ${finalCompanyData.id} (${finalCompanyData.name}) stored`);
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
        versions: platformData.versions || [], // Array of platform version IDs
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
        versions: platformData.versions || [],
        igdbData: JSON.stringify(platformData),
      },
    });
    console.log(`  🎮 Platform ${platformData.id} (${platformData.name}) stored`);
  }

  private async upsertPlatformVersion(versionData: any): Promise<void> {
    await prisma.igdbPlatformVersion.upsert({
      where: { id: versionData.id },
      update: {
        checksum: versionData.checksum,
        connectivity: versionData.connectivity,
        cpu: versionData.cpu,
        graphics: versionData.graphics,
        mainManufacturerId: versionData.main_manufacturer?.id,
        media: versionData.media,
        memory: versionData.memory,
        name: versionData.name,
        os: versionData.os,
        output: versionData.output,
        platformLogoId: versionData.platform_logo?.id,
        resolutions: versionData.resolutions,
        slug: versionData.slug,
        sound: versionData.sound,
        storage: versionData.storage,
        summary: versionData.summary,
        url: versionData.url,
        igdbData: JSON.stringify(versionData), // Store complete IGDB response
      },
      create: {
        id: versionData.id,
        checksum: versionData.checksum,
        connectivity: versionData.connectivity,
        cpu: versionData.cpu,
        graphics: versionData.graphics,
        mainManufacturerId: versionData.main_manufacturer?.id,
        media: versionData.media,
        memory: versionData.memory,
        name: versionData.name,
        os: versionData.os,
        output: versionData.output,
        platformLogoId: versionData.platform_logo?.id,
        resolutions: versionData.resolutions,
        slug: versionData.slug,
        sound: versionData.sound,
        storage: versionData.storage,
        summary: versionData.summary,
        url: versionData.url,
        igdbData: JSON.stringify(versionData),
      },
    });
    console.log(`  🔧 Platform version ${versionData.id} (${versionData.name}) stored`);
  }

  private async upsertPlatformVersionRelation(platformId: number, versionId: number): Promise<void> {
    // Create the platform-version relationship
    await prisma.igdbPlatformVersionRelation.upsert({
      where: {
        platformId_versionId: {
          platformId,
          versionId,
        },
      },
      update: {}, // No updates needed for relationship table
      create: {
        platformId,
        versionId,
      },
    });
    console.log(`  🔗 Platform ${platformId} ↔ Version ${versionId} relation stored`);
  }

  private async upsertPlatformVersionCompanyRelation(platformVersionId: number, companyId: number): Promise<void> {
    // Simple upsert without foreign key constraints - just store the IDs
    await prisma.igdbPlatformVersionCompanyRelation.upsert({
      where: {
        platformVersionId_companyId: {
          platformVersionId,
          companyId,
        },
      },
      update: {}, // No updates needed for relationship table
      create: {
        platformVersionId,
        companyId,
      },
    });
    console.log(`  🔗 Platform version ${platformVersionId} ↔ Company ${companyId} relation stored`);
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
        igdbPlatformVersionID: consoleData.igdbPlatformVersionID,
      },
    });
  }
}

export default IGDBDataPopulationService;
