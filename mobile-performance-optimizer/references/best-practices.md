# Performance Optimization Best Practices

## Image Optimization

### Responsive Images
- **Use `<picture>` element**: For art direction and different formats
- **Implement `srcset`**: For different screen sizes
- **Specify `sizes` attribute**: Helps browser select appropriate image
- **Example**:
  ```html
  <picture>
    <source media="(max-width: 768px)" srcset="small.webp" type="image/webp">
    <source media="(max-width: 768px)" srcset="small.jpg">
    <source srcset="large.webp" type="image/webp">
    <img src="large.jpg" alt="Description" width="1200" height="600">
  </picture>
  ```

### Image Formats
- **WebP**: Best compression for most images
- **AVIF**: Even better compression than WebP
- **JPEG XL**: New format with excellent compression
- **SVG**: For icons and simple graphics
- **PNG**: Only for images with transparency

### Compression
- **Lossless compression**: For images where quality is critical
- **Lossy compression**: For photos and complex images
- **Recommended tools**:
  - Squoosh (web-based)
  - ImageOptim (macOS)
  - FileOptimizer (Windows)
  - sharp (Node.js library)

### Lazy Loading
- **Native lazy loading**: Use `loading="lazy"` attribute
- **Intersection Observer**: For more control
- **Example**:
  ```html
  <img src="image.jpg" alt="Description" loading="lazy">
  ```

### CDN Image Optimization
- **Use CDN with image processing**: Cloudinary, Imgix, Fastly
- **Dynamic resizing**: Resize images on-the-fly
- **Format conversion**: Serve optimal format based on browser
- **Compression**: Apply appropriate compression levels

## CSS Optimization

### Critical CSS
- **Extract critical CSS**: Inline above-the-fold styles
- **Defer non-critical CSS**: Load after page load
- **Use critical CSS tools**:
  - Critical (Node.js)
  - Penthouse
  - Extract Critical CSS (this skill's script)

### CSS Efficiency
- **Minify CSS**: Remove whitespace and comments
- **Compress CSS**: Use gzip/brotli
- **Avoid CSS bloat**:
  - Remove unused CSS
  - Limit CSS selectors
  - Avoid deep nesting
  - Use CSS variables for repeated values

### CSS Delivery
- **Single CSS file**: Reduce HTTP requests
- **Media queries**: Use appropriate media types
- **Example**:
  ```html
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="print.css" media="print">
  ```

## JavaScript Optimization

### Code Splitting
- **Route-based splitting**: Split by page/route
- **Component-based splitting**: Split large components
- **Vendor splitting**: Separate third-party code
- **Example (React)**:
  ```javascript
  const LazyComponent = React.lazy(() => import('./LazyComponent'));
  ```

### Tree Shaking
- **Use ES modules**: Import/export syntax
- **Avoid side effects**: Pure functions
- **Configure build tools**: Enable tree shaking
- **Example**:
  ```javascript
  // Good: Tree shakeable
  import { debounce } from 'lodash-es';
  
  // Bad: Not tree shakeable
  import _ from 'lodash';
  ```

### Minification and Compression
- **Minify JavaScript**: Remove whitespace and comments
- **Compress JavaScript**: Use gzip/brotli
- **Use terser**: Modern JavaScript minifier

### Defer and Async
- **`async`**: Load script asynchronously, execute when ready
- **`defer`**: Load script asynchronously, execute in order
- **Example**:
  ```html
  <script src="critical.js"></script>
  <script src="non-critical.js" defer></script>
  <script src="analytics.js" async></script>
  ```

### Third-Party Scripts
- **Audit third-party scripts**: Remove unused ones
- **Load asynchronously**: Use `async` or `defer`
- **Consider self-hosting**: For critical scripts
- **Use tag managers carefully**: Limit tag manager scripts

## Server-Side Optimization

### Server Response Time
- **Optimize backend code**: Reduce processing time
- **Database optimization**:
  - Indexes
  - Query optimization
  - Connection pooling
- **Caching**:
  - Redis/Memcached
  - HTTP caching
  - CDN caching

### Compression
- **Enable gzip**: For all text-based assets
- **Enable Brotli**: For better compression
- **Configure server**:
  ```nginx
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  ```

### HTTP/2 and HTTP/3
- **Enable HTTP/2**: For multiplexing
- **Enable HTTP/3**: For better performance on unreliable networks
- **Benefits**:
  - Single connection for multiple requests
  - Server push (HTTP/2)
  - Reduced latency (HTTP/3)

### CDN Usage
- **Choose a global CDN**: Cloudflare, Fastly, Akamai
- **Cache static assets**: Set appropriate cache headers
- **Purge cache**: When assets change
- **Geo-routing**: Serve from nearest edge location

## Font Optimization

### Font Loading
- **Use `font-display: swap`**: Prevent FOIT
- **Preload critical fonts**: For above-the-fold text
- **Subset fonts**: Include only needed characters
- **Example**:
  ```html
  <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face {
      font-family: 'MyFont';
      src: url('font.woff2') format('woff2');
      font-display: swap;
    }
  </style>
  ```

### Font Formats
- **WOFF2**: Modern browsers
- **WOFF**: Older browsers
- **Avoid TTF/OTF**: Larger file sizes

### System Fonts
- **Use system fonts**: For fastest loading
- **Font stacks**: Provide fallbacks
- **Example**:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  ```

## Mobile-Specific Optimizations

### Viewport Meta Tag
- **Set appropriate viewport**: Control layout on mobile
- **Example**:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ```

### Touch Targets
- **Minimum size**: 48x48 pixels
- **Spacing**: At least 8 pixels between targets
- **Example**:
  ```css
  button {
    min-width: 48px;
    min-height: 48px;
    margin: 8px;
  }
  ```

### Network Conditions
- **Test on slow networks**: 3G, 4G
- **Implement adaptive loading**: Adjust based on network
- **Example**:
  ```javascript
  if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection.effectiveType === '4g') {
      // Load high-quality assets
    } else {
      // Load optimized assets
    }
  }
  ```

### Battery Life
- **Optimize JavaScript**: Reduce execution time
- **Limit animations**: Use CSS animations instead of JS
- **Avoid polling**: Use events instead
- **Optimize network requests**: Reduce number and size

## Build Tools Optimization

### Webpack
- **Configure for production**:
  ```javascript
  module.exports = {
    mode: 'production',
    optimization: {
      splitChunks: {
        chunks: 'all'
      },
      minimize: true
    }
  };
  ```

### Vite
- **Use Vite for development**: Fast HMR
- **Optimize production build**:
  ```javascript
  // vite.config.js
  export default {
    build: {
      minify: 'terser',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@material-ui/core']
          }
        }
      }
    }
  };
  ```

### Gulp/Grunt
- **Automate optimization tasks**:
  - Image optimization
  - CSS/JS minification
  - HTML minification
  - File revisioning

### CI/CD Integration
- **Run performance tests**:
  - Lighthouse CI
  - WebPageTest CI
- **Set performance budgets**:
  - Fail builds if budgets exceeded
  - Alert on performance regressions

## Monitoring and Maintenance

### Continuous Monitoring
- **Set up RUM**:
  - Google Analytics 4
  - New Relic
  - Datadog
- **Track Core Web Vitals**:
  - Google Search Console
  - Web Vitals dashboard

### Regular Audits
- **Weekly performance audits**:
  - Lighthouse reports
  - WebPageTest runs
- **Monthly deep dives**:
  - Bundle analysis
  - Resource usage analysis
  - Third-party script audit

### Performance Regressions
- **Identify regressions early**:
  - Git bisect for performance
  - Compare builds
- **Fix immediately**:
  - Revert problematic changes
  - Implement proper fixes

### Documentation
- **Document optimization strategies**:
  - Team guidelines
  - Optimization checklists
  - Performance budgets
- **Share knowledge**:
  - Internal workshops
  - Code reviews focused on performance
  - Performance case studies

## Accessibility and Performance

### Accessibility Considerations
- **Ensure fast load for screen readers**:
  - Optimize initial content
  - Avoid long JavaScript execution
- **Keyboard navigation**:
  - Ensure focusable elements are accessible
  - Reduce focus traversal
- **ARIA attributes**:
  - Use appropriately
  - Avoid overuse

### Inclusive Performance
- **Optimize for low-end devices**:
  - Older smartphones
  - Low-bandwidth connections
  - Limited processing power
- **Progressive enhancement**:
  - Core functionality first
  - Enhancements for capable devices

## Case Studies

### Example 1: E-commerce Site Optimization
- **Before**:
  - LCP: 3.8s
  - FCP: 2.5s
  - SI: 4.2s
- **Optimizations**:
  - Image optimization (WebP, responsive)
  - Critical CSS extraction
  - Code splitting
  - CDN implementation
- **After**:
  - LCP: 1.9s
  - FCP: 1.1s
  - SI: 2.3s
- **Results**:
  - 20% increase in conversion rate
  - 15% decrease in bounce rate
  - 30% faster page loads

### Example 2: Media Site Optimization
- **Before**:
  - LCP: 4.5s
  - FCP: 3.2s
  - SI: 5.1s
- **Optimizations**:
  - Lazy loading for images/videos
  - Font optimization
  - Third-party script audit
  - Server-side caching
- **After**:
  - LCP: 2.3s
  - FCP: 1.6s
  - SI: 2.8s
- **Results**:
  - 25% increase in page views
  - 18% decrease in bounce rate
  - Improved Core Web Vitals score

### Example 3: SaaS Application Optimization
- **Before**:
  - LCP: 3.2s
  - FCP: 2.1s
  - SI: 3.8s
- **Optimizations**:
  - Code splitting by route
  - Tree shaking
  - Server-side rendering
  - Database optimization
- **After**:
  - LCP: 1.7s
  - FCP: 1.0s
  - SI: 2.2s
- **Results**:
  - 15% increase in user engagement
  - 12% decrease in support tickets
  - Faster time to value for new users