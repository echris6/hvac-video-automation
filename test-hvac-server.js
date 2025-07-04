const axios = require('axios');

const HVAC_SERVER_URL = 'http://localhost:3025';

async function testHVACServer() {
    console.log('🧪 Testing HVAC Server - Single Video Generation');
    console.log('⏳ Starting HVAC video generation...');
    
    try {
        // Test server health first
        console.log('🏥 Checking HVAC server health...');
        const healthResponse = await axios.get(`${HVAC_SERVER_URL}/health`);
        console.log('✅ Server Status:', healthResponse.data.status);
        
        // Generate single HVAC video
        const response = await axios.post(`${HVAC_SERVER_URL}/generate-video`, {
            businessName: 'Professional HVAC Services',
            niche: 'hvac'
        });
        
        if (response.data.success) {
            console.log('✅ SUCCESS!');
            console.log(`📁 Video: ${response.data.videoPath}`);
            console.log(`📊 Size: ${response.data.fileSizeInMB} MB`);
            console.log(`⏱️ Duration: ${response.data.duration}s`);
            console.log(`🎬 FPS: ${response.data.fps}`);
            console.log(`📄 Message: ${response.data.message}`);
            
            console.log(`\n🎥 Your HVAC video is ready in the videos/ folder!`);
            console.log(`👀 Expected behavior:`);
            console.log(`   • Emergency chat interaction with "I need HVAC repair service"`);
            console.log(`   • Professional site tour showing HVAC services`);
            console.log(`   • 30 seconds duration with smooth scrolling`);
        } else {
            console.error('❌ Failed:', response.data.error);
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ HVAC server not running! Start it with: npm start');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

// Run test
testHVACServer();