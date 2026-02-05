#!/usr/bin/env python3
"""
Bundle analyzer script for JavaScript/TypeScript projects

This script analyzes webpack/vite bundles to:
1. Identify large dependencies
2. Suggest code splitting opportunities
3. Calculate bundle size savings
4. Generate optimization recommendations

Usage:
    python analyze-bundle.py --bundle <bundle_path> --threshold 10
"""

import os
import json
import argparse
import subprocess
from pathlib import Path

def run_webpack_analyzer(bundle_path):
    """Run webpack-bundle-analyzer on the bundle"""
    try:
        # Check if webpack-bundle-analyzer is installed
        subprocess.run(['npx', 'webpack-bundle-analyzer', '--version'], 
                      capture_output=True, check=True)
        
        # Run analyzer and generate static report
        output_dir = Path('./bundle-report')
        output_dir.mkdir(exist_ok=True)
        
        cmd = [
            'npx', 'webpack-bundle-analyzer',
            str(bundle_path),
            '--report', str(output_dir / 'report.html'),
            '--json', str(output_dir / 'report.json')
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            return None, f"Error running webpack-bundle-analyzer: {result.stderr}"
        
        # Load the JSON report
        report_path = output_dir / 'report.json'
        if report_path.exists():
            with open(report_path, 'r') as f:
                report = json.load(f)
            return report, None
        else:
            return None, "Could not generate report.json"
    except subprocess.CalledProcessError:
        return None, "webpack-bundle-analyzer is not installed. Please run 'npm install -g webpack-bundle-analyzer'"
    except Exception as e:
        return None, f"Error: {str(e)}"

def analyze_bundle_size(bundle_path):
    """Analyze bundle size manually if analyzer is not available"""
    try:
        bundle_size = os.path.getsize(bundle_path)
        
        # Check for common large files in node_modules
        node_modules = Path('./node_modules')
        large_deps = []
        
        if node_modules.exists():
            for dep in node_modules.iterdir():
                if dep.is_dir():
                    dep_size = get_dir_size(dep)
                    if dep_size > 1024 * 1024:  # 1MB+
                        large_deps.append((dep.name, dep_size))
        
        return {
            'bundle_size': bundle_size,
            'large_dependencies': sorted(large_deps, key=lambda x: x[1], reverse=True)[:10],
            'manual_analysis': True
        }
    except Exception as e:
        return {'error': str(e)}

def get_dir_size(path):
    """Calculate directory size"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.exists(filepath):
                total_size += os.path.getsize(filepath)
    return total_size

def identify_code_splitting_opportunities(report):
    """Identify code splitting opportunities from the report"""
    opportunities = []
    
    if 'modules' in report:
        for module in report['modules']:
            if 'size' in module and module['size'] > 1024 * 50:  # 50KB+
                opportunities.append({
                    'name': module.get('name', 'Unknown'),
                    'size': module['size'],
                    'type': 'module'
                })
    
    if 'chunks' in report:
        for chunk in report['chunks']:
            if 'size' in chunk and chunk['size'] > 1024 * 200:  # 200KB+
                opportunities.append({
                    'name': chunk.get('names', ['Unknown'])[0],
                    'size': chunk['size'],
                    'type': 'chunk'
                })
    
    return sorted(opportunities, key=lambda x: x['size'], reverse=True)[:10]

def generate_recommendations(analysis):
    """Generate optimization recommendations"""
    recommendations = []
    
    if analysis.get('manual_analysis'):
        # Manual analysis recommendations
        if analysis.get('large_dependencies'):
            recommendations.append({
                'type': 'code_splitting',
                'title': 'Split large dependencies',
                'description': 'Consider code splitting for these large dependencies:',
                'details': [f"{dep[0]}: {dep[1]/1024/1024:.2f}MB" for dep in analysis['large_dependencies'][:5]]
            })
    else:
        # Webpack analyzer recommendations
        opportunities = identify_code_splitting_opportunities(analysis)
        if opportunities:
            recommendations.append({
                'type': 'code_splitting',
                'title': 'Code splitting opportunities',
                'description': 'These modules/chunks could be split:',
                'details': [f"{opp['name']}: {opp['size']/1024:.1f}KB" for opp in opportunities[:5]]
            })
    
    # General recommendations
    recommendations.extend([
        {
            'type': 'tree_shaking',
            'title': 'Enable tree shaking',
            'description': 'Ensure tree shaking is enabled in your build configuration',
            'details': [
                'Use ES modules (import/export)',
                'Avoid side effects in modules',
                'Check build output for unused code'
            ]
        },
        {
            'type': 'code_splitting',
            'title': 'Implement route-based splitting',
            'description': 'Split bundles by route or component',
            'details': [
                'Use dynamic imports for routes',
                'Split vendor code from application code',
                'Consider splitting third-party libraries'
            ]
        },
        {
            'type': 'compression',
            'title': 'Enable compression',
            'description': 'Compress assets for faster delivery',
            'details': [
                'Enable gzip/brotli compression on server',
                'Use compressed file formats',
                'Consider using a CDN with automatic compression'
            ]
        },
        {
            'type': 'lazy_loading',
            'title': 'Implement lazy loading',
            'description': 'Load components and resources on demand',
            'details': [
                'Lazy load below-the-fold content',
                'Use React.lazy() or Vue async components',
                'Implement intersection observer for images'
            ]
        }
    ])
    
    return recommendations

def main():
    parser = argparse.ArgumentParser(description='Analyze bundle size and identify optimization opportunities')
    parser.add_argument('--bundle', '-b', required=True, help='Path to bundle file (e.g., main.js)')
    parser.add_argument('--threshold', '-t', type=int, default=10, help='Threshold for large dependencies in KB')
    
    args = parser.parse_args()
    bundle_path = Path(args.bundle)
    
    if not bundle_path.exists():
        print(f"Error: Bundle file {args.bundle} does not exist")
        return
    
    print("Analyzing bundle...")
    print("-" * 60)
    
    # Try webpack-bundle-analyzer first
    report, error = run_webpack_analyzer(bundle_path)
    
    if report:
        print("✅ Using webpack-bundle-analyzer report")
        analysis = report
    else:
        print(f"⚠️  {error}")
        print("🔄 Falling back to manual analysis")
        analysis = analyze_bundle_size(bundle_path)
    
    if 'error' in analysis:
        print(f"❌ Error: {analysis['error']}")
        return
    
    # Print bundle size
    bundle_size = analysis.get('bundle_size', os.path.getsize(bundle_path))
    print(f"Bundle size: {bundle_size/1024:.1f}KB ({bundle_size/1024/1024:.2f}MB)")
    print()
    
    # Print large dependencies
    if 'large_dependencies' in analysis:
        print("Large dependencies:")
        for dep_name, dep_size in analysis['large_dependencies']:
            print(f"  - {dep_name}: {dep_size/1024/1024:.2f}MB")
        print()
    
    # Print code splitting opportunities
    if not analysis.get('manual_analysis'):
        opportunities = identify_code_splitting_opportunities(analysis)
        if opportunities:
            print("Code splitting opportunities:")
            for opp in opportunities:
                print(f"  - {opp['name']}: {opp['size']/1024:.1f}KB")
            print()
    
    # Print recommendations
    recommendations = generate_recommendations(analysis)
    print("Optimization recommendations:")
    print("-" * 60)
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['title']}")
        print(f"   {rec['description']}")
        if rec.get('details'):
            for detail in rec['details']:
                print(f"   - {detail}")
        print()
    
    print("-" * 60)
    print("📊 Analysis complete!")
    print("Check the 'bundle-report' directory for detailed visualization (if available)")

if __name__ == '__main__':
    main()