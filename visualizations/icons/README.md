# PWA Icons

This directory should contain PNG icons in the following sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Generating Icons

You can use tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Any image editor to create PNG files

## Temporary Placeholder

For now, you can use a simple colored square as a placeholder:
1. Create a 512x512 PNG with your brand colors
2. Use an online tool to resize it to all required sizes
3. Name them as: icon-{size}.png (e.g., icon-512x512.png)

## Quick Generation Script

```bash
# Using ImageMagick (if available)
convert -size 512x512 xc:#2563eb -fill white -font Arial -pointsize 200 -gravity center -annotate +0+0 "ZR" icon-512x512.png

# Then resize for other sizes
for size in 72 96 128 144 152 192 384; do
  convert icon-512x512.png -resize ${size}x${size} icon-${size}x${size}.png
done
```
