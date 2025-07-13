#!/usr/bin/env node

const express = require('express');
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Universal delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
const PORT = 3030;

app.use(express.json({ limit: '50mb' }));
app.use(express.static('videos'));

console.log(`
╔════════════════════════════════════════════════════╗
║           ROOFING VIDEO GENERATOR                  ║
║              Running on port ${PORT}                    ║
║                                                    ║
║  🏠 Simple scrolling videos for roofing websites   ║
║  📝 POST /generate-video - Generate video          ║
║  📋 GET  /videos-list - List all videos           ║
║  🎥 GET  /videos/:filename - Download video        ║
║  ❤️  GET  /health - Health check                   ║
╚════════════════════════════════════════════════════╝
`);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Roofing Video Generator',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// List videos endpoint
app.get('/videos-list', (req, res) => {
    const videosDir = path.join(__dirname, 'videos');
    
    if (!fs.existsSync(videosDir)) {
        return res.json({ videos: [], total: 0 });
    }
    
    const files = fs.readdirSync(videosDir)
        .filter(file => file.endsWith('.mp4'))
        .map(file => {
            const filePath = path.join(videosDir, file);
            const stats = fs.statSync(filePath);
            return {
                filename: file,
                size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                created: stats.birthtime,
                url: `/videos/${file}`
            };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({ videos: files, total: files.length });
});

// Download video endpoint
app.get('/videos/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'videos', filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Video not found' });
    }
    
    res.sendFile(filePath);
});

// Main video generation endpoint
app.post('/generate-video', async (req, res) => {
    try {
        const { business_name, html_content } = req.body;
        
        if (!business_name) {
            return res.status(400).json({ error: 'business_name is required' });
        }
        
        if (!html_content) {
            return res.status(400).json({ error: 'html_content is required' });
        }
        
        console.log(`🎬 Starting video generation for: ${business_name}`);
        
        const result = await generateRoofingVideo(business_name, html_content);
        
        res.json({
            success: true,
            message: 'Video generated successfully',
            business_name: business_name,
            video_url: result.video_url,
            file_name: result.file_name,
            file_size: result.file_size,
            file_size_readable: result.file_size_readable,
            duration_estimate: result.duration_estimate,
            settings_used: result.settings_used
        });
        
    } catch (error) {
        console.error('❌ Video generation failed:', error);
        res.status(500).json({ 
            error: 'Video generation failed', 
            details: error.message 
        });
    }
});

async function generateRoofingVideo(businessName, htmlContent) {
    console.log(`🏠 ROOFING VIDEO GENERATOR`);
    console.log(`📋 Business: ${businessName}`);
    console.log(`📄 Generating simple scrolling video...`);

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
        const page = await browser.newPage();
        console.log('🚀 Launching browser...');
        
        // Set the HTML content
        await page.setContent(htmlContent);
        console.log('📄 Loading website content...');
        
        // Wait for content to load
        await delay(3000);
        console.log('⏳ Waiting for fonts and CSS to fully load...');
        
        // Wait for Google Maps and other embeds to load
        console.log('🗺️ Waiting for Google Maps and embeds to load...');
        await page.waitForFunction(() => {
            // Check for Google Maps iframes
            const mapIframes = document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google.com"]');
            if (mapIframes.length > 0) {
                // Wait for maps to be loaded (check if they have content)
                return Array.from(mapIframes).every(iframe => {
                    try {
                        return iframe.contentDocument || iframe.contentWindow;
                    } catch (e) {
                        // Cross-origin iframe, assume loaded after timeout
                        return true;
                    }
                });
            }
            return true; // No maps found, continue
        }, { timeout: 10000 }).catch(() => {
            console.log('⏰ Maps loading timeout - continuing anyway');
        });
        
        // Additional wait for any remaining embeds
        await delay(2000);
        
        // Disable animations and fix sticky/fixed elements for smooth scrolling
        await page.evaluate(() => {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                }
                
                /* Ensure body and html can scroll */
                html, body {
                    overflow: auto !important;
                    height: auto !important;
                    min-height: 100vh !important;
                }
                
                /* Fix sticky/fixed navigation and headers */
                .header,
                .navbar,
                nav,
                [class*="nav"],
                [class*="header"],
                [class*="sticky"],
                [class*="fixed"] {
                    position: static !important;
                    top: auto !important;
                    left: auto !important;
                    right: auto !important;
                    z-index: auto !important;
                }
                
                /* Common fixed element selectors */
                header,
                .site-header,
                .main-header,
                .top-bar,
                .navigation,
                .main-nav {
                    position: static !important;
                    top: auto !important;
                    left: auto !important;
                    right: auto !important;
                }
            `;
            document.head.appendChild(style);
            
            // Also manually find and fix any elements with fixed/sticky positioning
            let fixedCount = 0;
            const fixedElements = document.querySelectorAll('*');
            fixedElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.position === 'fixed' || computedStyle.position === 'sticky') {
                    el.style.position = 'static';
                    el.style.top = 'auto';
                    el.style.left = 'auto';
                    el.style.right = 'auto';
                    el.style.bottom = 'auto';
                    fixedCount++;
                }
            });
            
            console.log(`🔧 Fixed ${fixedCount} positioning elements converted to static positioning`);
        });
        
        await delay(1000);
        console.log('✅ Content loaded and animations disabled!');
        
        // Get page dimensions and test scrolling
        const pageInfo = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            
            // Get the full page height using multiple methods
            const pageHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
            
            // Test if scrolling works
            const initialScroll = window.pageYOffset || document.documentElement.scrollTop;
            window.scrollTo(0, 100);
            const testScroll = window.pageYOffset || document.documentElement.scrollTop;
            window.scrollTo(0, initialScroll); // Reset
            
            return {
                pageHeight,
                initialScroll,
                testScroll,
                canScroll: testScroll > initialScroll,
                bodyHeight: body.scrollHeight,
                htmlHeight: html.scrollHeight,
                clientHeight: html.clientHeight
            };
        });
        
        const viewportHeight = 1080;
        const maxScroll = Math.max(0, pageInfo.pageHeight - viewportHeight);
        
        console.log(`📏 Page height: ${pageInfo.pageHeight}px`);
        console.log(`📏 Body height: ${pageInfo.bodyHeight}px`);
        console.log(`📏 HTML height: ${pageInfo.htmlHeight}px`);
        console.log(`📏 Client height: ${pageInfo.clientHeight}px`);
        console.log(`📏 Max scroll: ${maxScroll}px`);
        console.log(`🔍 Can scroll: ${pageInfo.canScroll}`);
        console.log(`🔍 Test scroll: ${pageInfo.initialScroll} → ${pageInfo.testScroll}`);
        
        // Video settings
        const fps = 60;
        const duration = 16; // 16 seconds total (1 second hero pause + 15 seconds scrolling)
        const totalFrames = fps * duration;
        
        console.log(`🎬 Generating ${totalFrames} frames at ${fps}fps...`);
        console.log(`⏱️ Video duration: ${duration} seconds`);
        
        // Create frames directory
        const framesDir = path.join(__dirname, 'frames');
        if (!fs.existsSync(framesDir)) {
            fs.mkdirSync(framesDir);
        }
        
        // Clean up old frames
        const existingFrames = fs.readdirSync(framesDir).filter(f => f.startsWith('frame_'));
        existingFrames.forEach(frame => {
            fs.unlinkSync(path.join(framesDir, frame));
        });
        
        // Take ONE full page screenshot (like HVAC server)
        console.log('📸 Taking full page screenshot...');
        
        // Ensure all content is loaded and visible
        await page.evaluate(() => {
            // Force reveal all elements
            const revealElements = document.querySelectorAll('.reveal-element, .reveal-left, .reveal-right');
            revealElements.forEach(element => {
                element.classList.add('revealed');
                element.style.opacity = '1';
                element.style.transform = 'none';
                element.style.visibility = 'visible';
            });
            
            // Force sections to be visible
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                section.style.opacity = '1';
                section.style.visibility = 'visible';
            });
            
            // Reset scroll position
            window.scrollTo(0, 0);
        });
        
        // Wait for content to be ready
        await delay(1000);
        
        // Take full page screenshot
        const fullPageBuffer = await page.screenshot({ 
            fullPage: true,
            type: 'png'
        });
        console.log('📸 Full page screenshot captured');
        
        // Generate frames by cropping the full page screenshot
        const heroFrames = fps * 1; // 1 second at hero section
        const scrollFrames = totalFrames - heroFrames; // Remaining frames for scrolling
        
        for (let i = 0; i < totalFrames; i++) {
            let scrollY = 0;
            
            if (i < heroFrames) {
                // First 1 second: stay at hero section (top)
                scrollY = 0;
            } else {
                // Remaining time: scroll from top to bottom
                const scrollProgress = (i - heroFrames) / (scrollFrames - 1);
                scrollY = Math.round(maxScroll * scrollProgress);
            }
            
            // Crop the full page screenshot instead of scrolling
            const frameBuffer = await sharp(fullPageBuffer)
                .extract({ left: 0, top: scrollY, width: 1920, height: 1080 })
                .png()
                .toBuffer();
            
            // Save frame
            const frameFile = path.join(framesDir, `frame_${i.toString().padStart(4, '0')}.png`);
            fs.writeFileSync(frameFile, frameBuffer);
            
            // Progress logging
            if (i % 60 === 0 || i === totalFrames - 1) {
                const overallProgress = (i / (totalFrames - 1)) * 100;
                if (i < heroFrames) {
                    console.log(`📸 Frame ${i + 1}/${totalFrames} - Hero: ${scrollY}px (${overallProgress.toFixed(1)}%)`);
                } else {
                    console.log(`📸 Frame ${i + 1}/${totalFrames} - Crop: ${scrollY}px (${overallProgress.toFixed(1)}%)`);
                }
            }
        }
        
        console.log('✅ All frames captured successfully!');
        
        // Create videos directory
        const videosDir = path.join(__dirname, 'videos');
        if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir);
        }
        
        // Generate video filename
        const timestamp = Date.now();
        const safeBusinessName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const videoFileName = `roofing_${safeBusinessName}_${timestamp}.mp4`;
        const videoPath = path.join(videosDir, videoFileName);
        
        console.log(`🎬 Creating video: ${videoFileName}`);
        
        // Create video using FFmpeg
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(path.join(framesDir, 'frame_%04d.png'))
                .inputFPS(fps)
                .outputOptions([
                    '-c:v libx264',
                    '-preset fast',
                    '-crf 18',
                    '-pix_fmt yuv420p',
                    '-movflags +faststart'
                ])
                .output(videoPath)
                .on('start', (commandLine) => {
                    console.log('🎥 FFmpeg started:', commandLine);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`🎬 Encoding: ${Math.round(progress.percent)}%`);
                    }
                })
                .on('end', () => {
                    console.log('✅ Video created successfully!');
                    resolve();
                })
                .on('error', (error) => {
                    console.error('❌ FFmpeg error:', error);
                    reject(error);
                })
                .run();
        });
        
        // Clean up frames
        const frameFiles = fs.readdirSync(framesDir).filter(f => f.startsWith('frame_'));
        frameFiles.forEach(frame => {
            fs.unlinkSync(path.join(framesDir, frame));
        });
        console.log('🧹 Cleaned up temporary frames');
        
        // Get video file stats
        const videoStats = fs.statSync(videoPath);
        const fileSizeBytes = videoStats.size;
        const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
        
        console.log(`✅ Video generation complete!`);
        console.log(`📁 File: ${videoFileName}`);
        console.log(`📊 Size: ${fileSizeMB} MB`);
        console.log(`⏱️ Duration: ${duration} seconds`);
        
        return {
            video_url: `/videos/${videoFileName}`,
            file_name: videoFileName,
            file_size: fileSizeBytes,
            file_size_readable: `${fileSizeMB} MB`,
            duration_estimate: `${duration} seconds`,
            settings_used: {
                width: 1920,
                height: 1080,
                fps: fps,
                duration: duration,
                frames: totalFrames,
                videoCRF: 18,
                videoCodec: 'libx264'
            }
        };
        
    } finally {
        await browser.close();
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Roofing Video Generator running on http://localhost:${PORT}`);
    console.log(`📋 Ready to generate roofing videos!`);
}); 