import { ALL_PHOTOS, SPOTIFY_PLAYLISTS } from '../src/data/photos.ts';

async function verify() {
  const base = 'http://localhost:4173';
  console.log(`Verifying preview server at ${base}...`);

  // 1. Root HTML
  const rootRes = await fetch(base);
  if (rootRes.status !== 200) throw new Error(`Root returned ${rootRes.status}`);
  const html = await rootRes.text();
  console.log(`✓ Root HTML loaded (${html.length} bytes)`);

  // 2. Photos
  let photoPass = 0;
  for (const p of ALL_PHOTOS) {
    const full = await fetch(`${base}${p.fullUrl}`);
    const thumb = await fetch(`${base}${p.thumbUrl}`);
    if (full.status !== 200 || thumb.status !== 200) {
      throw new Error(`Photo ${p.id} failed: full=${full.status}, thumb=${thumb.status}`);
    }
    photoPass++;
  }
  console.log(`✓ All ${photoPass} photos and thumbnails verified with HTTP 200`);

  // 3. Spotify Covers
  for (const pl of SPOTIFY_PLAYLISTS) {
    const res = await fetch(`${base}${pl.coverUrl}`);
    if (res.status !== 200) {
      throw new Error(`Spotify cover ${pl.coverUrl} failed: ${res.status}`);
    }
  }
  console.log(`✓ All Spotify covers verified with HTTP 200`);

  console.log('✨ ALL VERIFICATION CHECKS PASSED PERFECTLY!');
}

verify().catch(e => {
  console.error('❌ Verification failed:', e);
  process.exit(1);
});
