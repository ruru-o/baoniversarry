async function check(id) {
  try {
    const res = await fetch('https://open.spotify.com/playlist/' + id, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const titleMatch = text.match(/<title>([^<]+)<\/title>/);
    const metaDesc = text.match(/<meta property="og:description" content="([^"]+)"/);
    const metaImg = text.match(/<meta property="og:image" content="([^"]+)"/);
    console.log(id, {
      title: titleMatch ? titleMatch[1] : null,
      desc: metaDesc ? metaDesc[1] : null,
      img: metaImg ? metaImg[1] : null
    });
  } catch(e) {
    console.error(id, e.message);
  }
}
await check('049ExphVBIdjni1fmkxBEt');
await check('5k0G8TEnK1gCv3KTID48oE');
