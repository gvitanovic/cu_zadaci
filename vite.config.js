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

                    // Dynamically find all HTML files in src/pages
                    const pagesDir = 'src/pages';
                    if (fs.existsSync(pagesDir)) {
                        const htmlFiles = fs.readdirSync(pagesDir)
                            .filter(file => file.endsWith('.html'))
                            .map(file => path.join(pagesDir, file));

                        htmlFiles.forEach(filePath => {
                            const fileName = path.basename(filePath, '.html');
                            const pageHtml = fs.readFileSync(filePath, 'utf8');
                            let pageBody = pageHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';

                            // Remove script tags from extracted content
                            pageBody = pageBody.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

                            // Create page ID based on filename
                            let pageId = fileName;
                            // Handle special case mappings for existing functionality
                            if (fileName === 'registration-weather-container') {
                                pageId = 'registration';
                            }

                            additionalContent += `<div id="${pageId}-page" style="display:none;">${pageBody}</div>`;
                        });
                    }

                    // Fix asset paths to point to single files
                    htmlContent = htmlContent
                        .replace(/src="\.\/assets\/[^"]+\.js"/g, 'src="./app.js"')
                        .replace(/href="\.\/assets\/[^"]+\.css"/g, 'href="./app.css"')
                        .replace(/src="\.\/([^"]+\.(png|jpg|jpeg|gif|svg))"/g, 'src="../$1"')
                        .replace(/href="\.\/([^"]+\.(png|jpg|jpeg|gif|svg))"/g, 'href="../$1"');

                    // Dynamically replace onclick handlers for all HTML files
                    if (fs.existsSync(pagesDir)) {
                        const htmlFiles = fs.readdirSync(pagesDir)
                            .filter(file => file.endsWith('.html'));

                        htmlFiles.forEach(file => {
                            const fileName = path.basename(file, '.html');
                            let pageId = fileName;

                            // Handle special case mappings
                            if (fileName === 'registration-weather-container') {
                                pageId = 'registration';
                            }

                            // Replace onclick handlers for this file
                            const onclickPattern = new RegExp(`onclick="location\\.href='[^']*${fileName}\\.html'"`, 'g');
                            htmlContent = htmlContent.replace(onclickPattern, `onclick="showPage('${pageId}')"`);
                        });
                    }

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