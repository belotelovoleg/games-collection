/**
 * Simple test script to verify IGDB Data Population Service
 * This tests the integration between the service and the database
 */

import IGDBDataPopulationService from '../src/services/igdbDataPopulationService';

async function testService() {
  try {
    console.log('🧪 Testing IGDB Data Population Service...');
    
    const service = IGDBDataPopulationService.getInstance();
    
    // Test with a well-known platform (Nintendo Entertainment System)
    const testConsoleData = {
      name: 'Nintendo Entertainment System',
      abbreviation: 'NES',
      alternativeName: 'Famicom',
      generation: 3,
      platformFamily: 'Nintendo',
      platformType: 'console',
    };
    
    console.log('📝 Test console data:', testConsoleData);
    
    // This will:
    // 1. Search for NES platform on IGDB
    // 2. Populate all normalized tables (platform, logo, family, type, etc.)
    // 3. Return populated console data
    const populatedData = await service.createConsoleWithIGDBData(testConsoleData);
    
    console.log('✅ Populated console data:', populatedData);
    
    // Create the actual console record
    const console = await service.createConsole(populatedData);
    
    console.log('🎮 Created console:', console);
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the test
testService();
