/**
 * Database Reset Script
 * Clears all IGDB and Console tables for testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...');

    // Count existing records before deletion
    const counts = {
      consoles: await prisma.console.count(),
      platforms: await prisma.igdbPlatform.count(),
      platformVersions: await prisma.igdbPlatformVersion.count(),
      companies: await prisma.igdbCompany.count(),
      platformLogos: await prisma.igdbPlatformLogo.count(),
      companyLogos: await prisma.igdbCompanyLogo.count(),
      websites: await prisma.igdbPlatformWebsite.count(),
      websiteTypes: await prisma.igdbWebsiteType.count(),
      platformFamilies: await prisma.igdbPlatformFamily.count(),
      platformTypes: await prisma.igdbPlatformType.count(),
      versionRelations: await prisma.igdbPlatformVersionRelation.count(),
      websiteRelations: await prisma.igdbPlatformWebsiteRelation.count(),
      companyRelations: await prisma.igdbPlatformVersionCompanyRelation.count()
    };

    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (totalRecords === 0) {
      console.log('📊 Database is already empty - no records to clear.');
      return;
    }

    console.log(`📊 Found ${totalRecords} records across all tables:`);
    console.log(`   - Consoles: ${counts.consoles}`);
    console.log(`   - IGDB Platforms: ${counts.platforms}`);
    console.log(`   - IGDB Platform Versions: ${counts.platformVersions}`);
    console.log(`   - IGDB Companies: ${counts.companies}`);
    console.log(`   - IGDB Logos & Types: ${counts.platformLogos + counts.companyLogos + counts.websiteTypes + counts.platformFamilies + counts.platformTypes}`);
    console.log(`   - Relationships: ${counts.versionRelations + counts.websiteRelations + counts.companyRelations}`);
    console.log('');

    // Delete in proper order to avoid foreign key constraint issues
    console.log('📋 Clearing relationship tables...');
    await prisma.igdbPlatformVersionCompanyRelation.deleteMany();
    await prisma.igdbPlatformVersionRelation.deleteMany();
    await prisma.igdbPlatformWebsiteRelation.deleteMany();

    console.log('🎮 Clearing Console table...');
    await prisma.console.deleteMany();

    console.log('🔧 Clearing IGDB Platform Version table...');
    await prisma.igdbPlatformVersion.deleteMany();

    console.log('🖥️  Clearing IGDB Platform table...');
    await prisma.igdbPlatform.deleteMany();

    console.log('🏢 Clearing IGDB Company tables...');
    await prisma.igdbCompany.deleteMany();
    await prisma.igdbCompanyLogo.deleteMany();

    console.log('🔗 Clearing IGDB Website tables...');
    await prisma.igdbPlatformWebsite.deleteMany();
    await prisma.igdbWebsiteType.deleteMany();

    console.log('🏠 Clearing IGDB Platform reference tables...');
    await prisma.igdbPlatformFamily.deleteMany();
    await prisma.igdbPlatformType.deleteMany();
    await prisma.igdbPlatformLogo.deleteMany();

    console.log('');
    console.log('✅ Database cleanup completed successfully!');
    console.log(`📊 Cleared ${totalRecords} records from all IGDB and Console tables.`);
    console.log('🧪 Database is now ready for fresh testing.');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearDatabase();
