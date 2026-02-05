#!/usr/bin/env python3
"""
Critical CSS extraction script for mobile performance

This script extracts critical CSS from your stylesheets to:
1. Improve First Contentful Paint (FCP)
2. Reduce render-blocking CSS
3. Inline critical CSS in HTML
4. Defer non-critical CSS loading

Usage:
    python extract-critical-css.py --url <website_url> --output <output_dir>
"""

import os
import json
import argparse
import subprocess
from pathlib import Path

def install_dependencies():
    """Install required dependencies"""
    try:
        # Check if puppeteer is installed
        subprocess.run(['npm', 'list', 'puppeteer'], 
                      capture_output=True, check=True)
    except subprocess.CalledProcessError:
        print("Installing puppeteer...")
        try:
            subprocess.run(['npm', 'install', 'puppeteer'], 
                          capture_output=True, check=True)
            print("✅ puppeteer installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install puppeteer: {e}")
            return False
    return True

def extract_critical_css(url, output_dir):
    """Extract critical CSS using puppeteer"""
    try:
        # Create output directory
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        # Create a temporary puppeteer script
        puppeteer_script = output_dir / 'extract-critical.js'
        
        script_content = """
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extractCriticalCSS(url, outputDir) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Intercept requests to capture stylesheets
    const stylesheets = [];
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
        if (request.resourceType() === 'stylesheet') {
            stylesheets.push(request.url());
        }
        request.continue();
    });
    
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Extract critical CSS
    const criticalCSS = await page.evaluate(() => {
        // Get all visible elements in the viewport
        const viewportHeight = window.innerHeight;
        const visibleElements = [];
        
        // Recursively find visible elements
        function findVisibleElements(element) {
            const rect = element.getBoundingClientRect();
            if (rect.top < viewportHeight && rect.bottom > 0) {
                visibleElements.push(element);
            }
            
            // Check children
            for (const child of element.children) {
                findVisibleElements(child);
            }
        }
        
        findVisibleElements(document.body);
        
        // Get computed styles for visible elements
        const styles = new Set();
        const styleSheets = Array.from(document.styleSheets);
        
        visibleElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            
            // Get all CSS properties
            for (let i = 0; i < computedStyle.length; i++) {
                const property = computedStyle[i];
                const value = computedStyle[property];
                styles.add(`${property}: ${value};`);
            }
        });
        
        // Also include @media queries that affect the viewport
        styleSheets.forEach(styleSheet => {
            try {
                const rules = styleSheet.cssRules || styleSheet.rules;
                for (const rule of rules) {
                    if (rule.type === 4) { // MEDIA_RULE
                        const mediaQuery = rule.conditionText;
                        if (mediaQuery.includes('max-width') || mediaQuery.includes('min-width')) {
                            styles.add(`@media ${mediaQuery} {`);
                            for (const mediaRule of rule.cssRules) {
                                if (mediaRule.type === 1) { // STYLE_RULE
                                    styles.add(`${mediaRule.selectorText} {`);
                                    for (let i = 0; i < mediaRule.style.length; i++) {
                                        const property = mediaRule.style[i];
                                        const value = mediaRule.style[property];
                                        styles.add(`  ${property}: ${value};`);
                                    }
                                    styles.add(`}`);
                                }
                            }
                            styles.add(`}`);
                        }
                    }
                }
            } catch (e) {
                // Cross-origin stylesheets may throw errors
            }
        });
        
        return Array.from(styles).join('\n');
    });
    
    // Save critical CSS
    const criticalCSSPath = path.join(outputDir, 'critical.css');
    fs.writeFileSync(criticalCSSPath, criticalCSS);
    
    // Save full CSS (for reference)
    const fullCSS = await page.evaluate(() => {
        let css = '';
        const styleSheets = Array.from(document.styleSheets);
        
        styleSheets.forEach(styleSheet => {
            try {
                const rules = styleSheet.cssRules || styleSheet.rules;
                for (const rule of rules) {
                    css += rule.cssText + '\n';
                }
            } catch (e) {
                // Cross-origin stylesheets may throw errors
            }
        });
        
        return css;
    });
    
    const fullCSSPath = path.join(outputDir, 'full.css');
    fs.writeFileSync(fullCSSPath, fullCSS);
    
    // Generate HTML with inlined critical CSS
    const originalHTML = await page.content();
    const htmlWithInlinedCSS = originalHTML.replace(
        '</head>',
        `<style>\n${criticalCSS}\n</style>\n</head>`
    );
    
    // Remove original stylesheet links
    const htmlWithoutStylesheetLinks = htmlWithInlinedCSS.replace(
        /<link[^>]+rel="stylesheet"[^>]+>/g,
        ''
    );
    
    // Add deferred loading for non-critical CSS
    const htmlWithDeferredCSS = htmlWithoutStylesheetLinks.replace(
        '</body>',
        `<script>\n// Load non-critical CSS asynchronously\nconst link = document.createElement('link');\nlink.rel = 'stylesheet';\nlink.href = 'full.css';\ndocument.head.appendChild(link);\n</script>\n</body>`
    );
    
    const htmlPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlWithDeferredCSS);
    
    await browser.close();
    
    return {
        critical_css_path: criticalCSSPath,
        full_css_path: fullCSSPath,
        html_path: htmlPath,
        critical_css_size: fs.statSync(criticalCSSPath).size,
        full_css_size: fs.statSync(fullCSSPath).size
    };
}

// Get command line arguments
const args = process.argv.slice(2);
const url = args[0];
const outputDir = args[1];

extractCriticalCSS(url, outputDir)
    .then(result => {
        console.log(JSON.stringify(result));
    })
    .catch(error => {
        console.error(JSON.stringify({ error: error.message }));
    });
"""
        
        with open(puppeteer_script, 'w') as f:
            f.write(script_content)
        
        # Run the puppeteer script
        cmd = ['node', str(puppeteer_script), url, str(output_dir)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            return None, f"Error running puppeteer script: {result.stderr}"
        
        # Parse the result
        try:
            output = json.loads(result.stdout)
            if 'error' in output:
                return None, output['error']
            return output, None
        except json.JSONDecodeError:
            return None, f"Invalid output from puppeteer script: {result.stdout}"
    except Exception as e:
        return None, f"Error: {str(e)}"

def generate_inline_css_html(html_path, critical_css_path, output_path):
    """Generate HTML with inlined critical CSS"""
    try:
        # Read the original HTML
        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Read the critical CSS
        with open(critical_css_path, 'r', encoding='utf-8') as f:
            critical_css = f.read()
        
        # Inline the critical CSS
        if '</head>' in html:
            modified_html = html.replace(
                '</head>',
                f'<style>\n{critical_css}\n</style>\n</head>'
            )
        else:
            # If no </head> tag, add it to the beginning
            modified_html = f'<html><head><style>\n{critical_css}\n</style></head>' + html
        
        # Write the modified HTML
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(modified_html)
        
        return True
    except Exception as e:
        return False, str(e)

def main():
    parser = argparse.ArgumentParser(description='Extract critical CSS for improved FCP')
    parser.add_argument('--url', '-u', required=True, help='Website URL to analyze')
    parser.add_argument('--output', '-o', default='./critical-css', help='Output directory')
    parser.add_argument('--html', '-h', help='Path to HTML file (optional, will use URL if not provided)')
    
    args = parser.parse_args()
    
    # Install dependencies
    if not install_dependencies():
        return
    
    print(f"Extracting critical CSS from {args.url}...")
    print("-" * 60)
    
    # Extract critical CSS
    result, error = extract_critical_css(args.url, args.output)
    
    if error:
        print(f"❌ Error: {error}")
        return
    
    # Print results
    print("✅ Critical CSS extraction completed!")
    print(f"- Critical CSS saved to: {result['critical_css_path']}")
    print(f"- Full CSS saved to: {result['full_css_path']}")
    print(f"- HTML with inlined CSS saved to: {result['html_path']}")
    print()
    
    # Calculate savings
    critical_size = result['critical_css_size']
    full_size = result['full_css_size']
    savings = (1 - (critical_size / full_size)) * 100
    
    print("Size comparison:")
    print(f"- Critical CSS: {critical_size/1024:.1f}KB")
    print(f"- Full CSS: {full_size/1024:.1f}KB")
    print(f"- Savings: {savings:.1f}%")
    print()
    
    print("Optimization recommendations:")
    print("1. Replace your original stylesheet links with the inlined critical CSS")
    print("2. Load non-critical CSS asynchronously using the defer pattern")
    print("3. Test the performance improvement with Lighthouse")
    print("4. Repeat this process for different page templates")
    print()
    print("Example implementation:")
    print("<!DOCTYPE html>")
    print("<html>")
    print("<head>")
    print("  <!-- Inline critical CSS here -->")
    print("  <style>")
    print("    /* Paste content of critical.css here */")
    print("  </style>")
    print("</head>")
    print("<body>")
    print("  <!-- Page content -->")
    print("  ")
    print("  <!-- Load non-critical CSS asynchronously -->")
    print("  <script>")
    print("    // Load non-critical CSS")
    print("    const link = document.createElement('link');")
    print("    link.rel = 'stylesheet';")
    print("    link.href = 'full.css';")
    print("    document.head.appendChild(link);")
    print("  </script>")
    print("</body>")
    print("</html>")

if __name__ == '__main__':
    main()