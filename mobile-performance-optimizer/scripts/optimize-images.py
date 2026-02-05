#!/usr/bin/env python3
"""
Image optimization script for mobile performance

This script optimizes images for web use by:
1. Converting to WebP format
2. Resizing images for different screen sizes
3. Compressing images to reduce file size
4. Generating responsive image srcset attributes

Usage:
    python optimize-images.py --input <input_dir> --output <output_dir> --quality 80
"""

import os
import argparse
from PIL import Image
from pathlib import Path

def optimize_image(input_path, output_path, quality=80, max_width=1920):
    """Optimize a single image"""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if needed
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Resize if image is larger than max_width
            if img.width > max_width:
                new_height = int((max_width / img.width) * img.height)
                img = img.resize((max_width, new_height), Image.LANCZOS)
            
            # Save as WebP
            webp_path = output_path.with_suffix('.webp')
            img.save(webp_path, 'WEBP', quality=quality)
            
            # Generate responsive sizes
            sizes = [480, 768, 1024, 1280, 1600]
            responsive_images = []
            
            for size in sizes:
                if img.width > size:
                    responsive_width = size
                    responsive_height = int((size / img.width) * img.height)
                    responsive_img = img.resize((responsive_width, responsive_height), Image.LANCZOS)
                    responsive_path = output_path.parent / f"{output_path.stem}-{size}{output_path.suffix}"
                    responsive_webp_path = responsive_path.with_suffix('.webp')
                    responsive_img.save(responsive_webp_path, 'WEBP', quality=quality)
                    responsive_images.append((size, responsive_webp_path))
            
            return {
                'original': str(input_path),
                'optimized': str(webp_path),
                'responsive': responsive_images,
                'original_size': os.path.getsize(input_path),
                'optimized_size': os.path.getsize(webp_path)
            }
    except Exception as e:
        return {
            'original': str(input_path),
            'error': str(e)
        }

def generate_srcset(base_path, responsive_images):
    """Generate srcset attribute for responsive images"""
    srcset = []
    for size, path in responsive_images:
        srcset.append(f"{path} {size}w")
    return ', '.join(srcset)

def main():
    parser = argparse.ArgumentParser(description='Optimize images for web performance')
    parser.add_argument('--input', '-i', required=True, help='Input directory containing images')
    parser.add_argument('--output', '-o', required=True, help='Output directory for optimized images')
    parser.add_argument('--quality', '-q', type=int, default=80, help='Image quality (1-100)')
    parser.add_argument('--max-width', '-w', type=int, default=1920, help='Maximum image width')
    
    args = parser.parse_args()
    
    input_dir = Path(args.input)
    output_dir = Path(args.output)
    
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Supported image formats
    supported_formats = {'.jpg', '.jpeg', '.png', '.gif', '.tiff'}
    
    # Process all images in input directory
    results = []
    for img_path in input_dir.rglob('*'):
        if img_path.suffix.lower() in supported_formats:
            relative_path = img_path.relative_to(input_dir)
            output_path = output_dir / relative_path
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            result = optimize_image(img_path, output_path, args.quality, args.max_width)
            results.append(result)
    
    # Print summary
    print("Image optimization summary:")
    print("-" * 60)
    
    success_count = 0
    error_count = 0
    total_original_size = 0
    total_optimized_size = 0
    
    for result in results:
        if 'error' in result:
            print(f"❌ Error processing {result['original']}: {result['error']}")
            error_count += 1
        else:
            success_count += 1
            total_original_size += result['original_size']
            total_optimized_size += result['optimized_size']
            savings = (1 - (result['optimized_size'] / result['original_size'])) * 100
            print(f"✅ Optimized {result['original']} → {result['optimized']}")
            print(f"   Size: {result['original_size']/1024:.1f}KB → {result['optimized_size']/1024:.1f}KB ({savings:.1f}% savings)")
            
            if result['responsive']:
                print(f"   Generated {len(result['responsive'])} responsive versions")
                srcset = generate_srcset(result['optimized'], result['responsive'])
                print(f"   Srcset: {srcset}")
            print()
    
    print("-" * 60)
    print(f"Total images processed: {len(results)}")
    print(f"Successful: {success_count}")
    print(f"Errors: {error_count}")
    
    if total_original_size > 0:
        total_savings = (1 - (total_optimized_size / total_original_size)) * 100
        print(f"Total savings: {total_original_size/1024/1024:.2f}MB → {total_optimized_size/1024/1024:.2f}MB ({total_savings:.1f}% savings)")

if __name__ == '__main__':
    main()