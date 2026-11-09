import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const DIRS = {
  main: 'resources/main',
  pets: 'resources/pets',
  subs: 'resources/subs'
};

const OUT_BASE = 'public/photos';

// Ensure directories
['main', 'pets', 'subs', 'spotify'].forEach(d => {
  fs.mkdirSync(path.join(OUT_BASE, d), { recursive: true });
});

async function processImage(inputPath, outDir, baseName) {
  const meta = await sharp(inputPath).metadata();
  const width = meta.width;
  const height = meta.height;

  // Optimized display image (max 1920px width/height)
  const fullWebp = `${baseName}.webp`;
  const fullWebpPath = path.join(outDir, fullWebp);
  await sharp(inputPath)
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(fullWebpPath);

  // Thumbnail (max 720px width/height)
  const thumbWebp = `${baseName}_thumb.webp`;
  const thumbWebpPath = path.join(outDir, thumbWebp);
  await sharp(inputPath)
    .resize(720, 720, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbWebpPath);

  console.log(`✓ Processed ${baseName} (${width}x${height})`);

  return {
    width,
    height,
    aspectRatio: +(width / height).toFixed(3),
    fullUrl: `/photos/${path.basename(outDir)}/${fullWebp}`,
    thumbUrl: `/photos/${path.basename(outDir)}/${thumbWebp}`,
  };
}

async function downloadSpotifyCovers() {
  const covers = [
    {
      id: '049ExphVBIdjni1fmkxBEt',
      name: 'playlist_blue.jpg',
      url: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da84aaad5736e0bebc52f3ca5b3a'
    },
    {
      id: '5k0G8TEnK1gCv3KTID48oE',
      name: 'playlist_cloud.jpg',
      url: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8444ffc8864bbefd823ea3293d'
    }
  ];

  for (const c of covers) {
    try {
      const res = await fetch(c.url);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(path.join(OUT_BASE, 'spotify', c.name), buf);
      console.log(`✓ Downloaded Spotify cover: ${c.name}`);
    } catch (e) {
      console.warn(`Failed to download ${c.name}:`, e.message);
    }
  }
}

async function run() {
  console.log('Optimizing images...');
  const results = {};

  for (const [cat, dir] of Object.entries(DIRS)) {
    results[cat] = {};
    const files = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|webp)$/i));
    for (const f of files) {
      const ext = path.extname(f);
      const baseName = path.basename(f, ext);
      const info = await processImage(path.join(dir, f), path.join(OUT_BASE, cat), baseName);
      results[cat][f] = info;
    }
  }

  await downloadSpotifyCovers();

  console.log('All images processed successfully!');
}

run().catch(console.error);
