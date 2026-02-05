---
name: Mobile Performance Optimizer
description: Optimize mobile web performance metrics (LCP, FCP, SI) while maintaining PC compatibility. Use for: (1) Improving mobile page load times, (2) Optimizing Core Web Vitals, (3) Ensuring cross-device compatibility, (4) Implementing performance best practices, (5) Reducing bundle sizes and resource loading times
---

# Mobile Performance Optimizer

## Overview

This skill provides comprehensive guidance for optimizing mobile web performance while maintaining full PC compatibility. It focuses on improving Core Web Vitals, specifically Largest Contentful Paint (LCP), First Contentful Paint (FCP), and Speed Index (SI), through proven best practices and actionable workflows.

## Key Performance Metrics

### LCP (Largest Contentful Paint)
- **Target**: Under 2.5 seconds
- **What it measures**: Time to render the largest content element in the viewport
- **Common bottlenecks**: Large images, slow server response, render-blocking resources

### FCP (First Contentful Paint)
- **Target**: Under 1.8 seconds
- **What it measures**: Time to render the first piece of DOM content
- **Common bottlenecks**: Render-blocking resources, slow server response

### SI (Speed Index)
- **Target**: Under 3 seconds
- **What it measures**: How quickly content visually loads on screen
- **Common bottlenecks**: Unoptimized images, inefficient CSS, slow resource loading

## Optimization Workflow

### 1. Audit and Analysis

**Before making changes, audit your site to identify bottlenecks:**

- **Use Lighthouse**: Run mobile and desktop audits to compare performance
- **Analyze with Chrome DevTools**: Use Network and Performance panels
- **Check Core Web Vitals**: Use Google Search Console or Web Vitals extension

### 2. Image Optimization

**Critical for LCP improvement:**

- **Responsive images**: Use `<picture>` element and `srcset`
- **Next-gen formats**: Convert images to WebP or AVIF
- **Compression**: Use appropriate compression levels
- **Lazy loading**: Implement native lazy loading for below-the-fold images
- **CDN optimization**: Use CDN with image optimization capabilities

**Script**: Use `scripts/optimize-images.py` for batch image processing

### 3. Resource Loading Optimization

**Critical for FCP improvement:**

- **Minimize render-blocking resources**: Defer non-critical JavaScript/CSS
- **Inline critical CSS**: Include critical CSS directly in HTML
- **Async/defer scripts**: Use `async` or `defer` attributes
- **Resource hints**: Use `preconnect`, `preload`, `prefetch` appropriately
- **Reduce CSS complexity**: Minimize CSS selectors and remove unused styles

### 4. JavaScript Optimization

**Critical for all metrics:**

- **Code splitting**: Split bundles by route or component
- **Tree shaking**: Remove unused code
- **Minification**: Minify and compress JavaScript
- **Service workers**: Implement for caching static resources
- **Third-party scripts**: Audit and optimize third-party dependencies

**Script**: Use `scripts/analyze-bundle.py` to identify large dependencies

### 5. Server-Side Optimization

**Critical for initial load times:**

- **Server response time**: Optimize backend performance
- **Caching strategy**: Implement effective caching
- **Compression**: Enable GZIP or Brotli compression
- **CDN usage**: Distribute content globally
- **HTTP/2 or HTTP/3**: Enable for better resource loading

### 6. Cross-Device Compatibility

**Ensure PC functionality is maintained:**

- **Responsive design**: Use flexible layouts
- **Feature detection**: Use feature detection instead of user-agent sniffing
- **Progressive enhancement**: Build core functionality first, then enhance
- **Breakpoint testing**: Test at multiple viewport sizes
- **Graceful degradation**: Ensure basic functionality works on all devices

## Implementation Guidelines

### For Vue.js Projects

1. **Optimize Vue build**: Use production mode and enable code splitting
2. **Lazy load routes**: Implement dynamic imports for routes
3. **Optimize images**: Use responsive image components
4. **Minimize bundle size**: Analyze and reduce dependencies
5. **Server-side rendering**: Consider SSR for critical pages

### For React Projects

1. **Code splitting**: Use React.lazy() and Suspense
2. **Optimize images**: Use next/image (Next.js) or responsive image libraries
3. **Bundle analysis**: Use webpack-bundle-analyzer
4. **Server-side rendering**: Consider Next.js for better performance
5. **Memoization**: Use useMemo and useCallback appropriately

### For General Projects

1. **HTML optimization**: Minify HTML and use semantic elements
2. **CSS optimization**: Use CSS-in-JS sparingly, optimize selectors
3. **Font optimization**: Use font-display: swap, preload critical fonts
4. **Network optimization**: Reduce redirects, use HTTPS
5. **Testing**: Test on real mobile devices and slow networks

## Reference Materials

- **Performance metrics explained**: See [references/metrics.md](references/metrics.md)
- **Best practices checklist**: See [references/best-practices.md](references/best-practices.md)
- **Compatibility guide**: See [references/compatibility.md](references/compatibility.md)
- **Optimization examples**: See [references/examples.md](references/examples.md)

## Scripts

- **Image optimizer**: `scripts/optimize-images.py` - Batch process and optimize images
- **Bundle analyzer**: `scripts/analyze-bundle.py` - Identify large dependencies
- **Critical CSS extractor**: `scripts/extract-critical-css.py` - Extract and inline critical CSS

## Assets

- **Configuration templates**: `assets/config-templates/` - Webpack, Vite, and other build tool configurations
- **Optimization examples**: `assets/examples/` - Before/after optimization examples
- **Performance budget**: `assets/performance-budget.json` - Sample performance budget configuration

## Testing and Validation

After implementing optimizations:

1. **Run Lighthouse**: Compare mobile and desktop scores
2. **Test Core Web Vitals**: Ensure metrics meet targets
3. **Cross-browser testing**: Test on multiple browsers
4. **Device testing**: Test on real mobile devices
5. **Load testing**: Test under different network conditions

## Continuous Improvement

- **Monitor performance**: Set up continuous monitoring
- **Performance budgets**: Establish and enforce budgets
- **Regular audits**: Conduct periodic performance audits
- **Update dependencies**: Keep dependencies updated
- **Stay informed**: Follow performance best practices and web standards