import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
    base: './',
    build: {
        minify: 'terser',
        rollupOptions: {
            input: 'index.html',
            output: {
                entryFileNames: 'assets/app.js',
                chunkFileNames: 'assets/app.js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'assets/app.css';
                    }
                    return 'assets/[name].[ext]';
                },
                manualChunks: undefined
            }
        },
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    plugins: [
        {
            name: 'html-minifier-and-bundler',
            writeBundle(options, bundle) {
                try {
                    const htmlPath = path.join(options.dir, 'index.html');
                    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

                    // Read and extract content from other pages
                    let additionalContent = '';

                    if (fs.existsSync('src/pages/job.html')) {
                        const jobHtml = fs.readFileSync('src/pages/job.html', 'utf8');
                        let jobBody = jobHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
                        // Remove script tags from extracted content
                        jobBody = jobBody.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                        additionalContent += `<div id="job-page" style="display:none;">${jobBody}</div>`;
                    }

                    if (fs.existsSync('src/pages/registration-weather-container.html')) {
                        const regHtml = fs.readFileSync('src/pages/registration-weather-container.html', 'utf8');
                        let regBody = regHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
                        // Remove script tags from extracted content
                        regBody = regBody.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                        additionalContent += `<div id="registration-page" style="display:none;">${regBody}</div>`;
                    }

                    // Fix asset paths to point to single files
                    htmlContent = htmlContent
                        .replace(/src="\.\/assets\/[^"]+\.js"/g, 'src="./app.js"')
                        .replace(/href="\.\/assets\/[^"]+\.css"/g, 'href="./app.css"')
                        .replace(/src="\.\/([^"]+\.(png|jpg|jpeg|gif|svg))"/g, 'src="../$1"')
                        .replace(/href="\.\/([^"]+\.(png|jpg|jpeg|gif|svg))"/g, 'href="../$1"')
                        .replace(/onclick="location\.href='[^']*job\.html'"/g, "onclick=\"showPage('job')\"")
                        .replace(/onclick="location\.href='[^']*registration-weather-container\.html'"/g, "onclick=\"showPage('registration')\"");

                    // Add navigation script and additional content
                    const script = `<script>function showPage(page){document.querySelectorAll('[id$="-page"]').forEach(el=>el.style.display='none');document.querySelector('main').style.display='none';if(page==='home'){document.querySelector('main').style.display='block'}else{const pageEl=document.getElementById(page+'-page');if(pageEl)pageEl.style.display='block'}}</script>`;

                    // Insert additional content and script before closing body
                    htmlContent = htmlContent.replace('</body>', additionalContent + script + '</body>');

                    // **AGGRESSIVE HTML MINIFICATION**
                    htmlContent = htmlContent
                        // Remove all comments
                        .replace(/<!--[\s\S]*?-->/g, '')
                        // Remove unnecessary whitespace between tags
                        .replace(/>\s+</g, '><')
                        // Remove leading/trailing whitespace on lines
                        .replace(/^\s+|\s+$/gm, '')
                        // Collapse multiple spaces into single space
                        .replace(/\s{2,}/g, ' ')
                        // Remove newlines
                        .replace(/\n/g, '')
                        // Remove spaces around = in attributes
                        .replace(/\s*=\s*/g, '=')
                        // Remove optional quotes from simple attributes
                        .replace(/=([a-zA-Z0-9\-_]+)/g, '=$1')
                        // Remove spaces before >
                        .replace(/\s+>/g, '>')
                        // Final trim
                        .trim();

                    // Create assets directory
                    const assetsDir = path.join(options.dir, 'assets');
                    if (!fs.existsSync(assetsDir)) {
                        fs.mkdirSync(assetsDir, { recursive: true });
                    }

                    // Write minified app.html
                    fs.writeFileSync(path.join(assetsDir, 'app.html'), htmlContent);

                    // Remove original index.html
                    fs.unlinkSync(htmlPath);

                    console.log('✅ Created minified single-file app.html');
                    console.log(`📊 Final size: ${htmlContent.length} characters`);

                } catch (error) {
                    console.error('❌ Error creating minified bundle:', error);
                }
            }
        }
    ]
})