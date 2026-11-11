import fs from 'node:fs';
import path from 'node:path';

async function downloadFile(url, destPath) {
  console.log(`Downloading ${url} -> ${destPath}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
  console.log(`Saved ${destPath} (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  const audioDir = path.resolve('public/audio');
  fs.mkdirSync(audioDir, { recursive: true });

  await downloadFile(
    'https://raw.githubusercontent.com/Virgotex/valentine_site/main/yung%20kai%20-%20blue.mp3',
    path.join(audioDir, 'wam-blue.mp3')
  );

  await downloadFile(
    'https://raw.githubusercontent.com/Aghita-04/besideu/main/beside%20u%20-%20keshi.mp3',
    path.join(audioDir, 'bao-beside-you.mp3')
  );

  console.log('Audio downloads complete!');
}

main().catch(console.error);
