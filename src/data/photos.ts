export interface PhotoItem {
  id: string;
  category: 'main' | 'sub' | 'pets';
  filename: string;
  title: string;
  statement: string;
  dateHint?: string;
  fullUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  featured?: boolean;
  group?: 'anniversary' | 'cafe' | 'playful' | 'latenight' | 'daily';
}

export const MAIN_PHOTOS: PhotoItem[] = [
  {
    id: 'main-wonderful',
    category: 'main',
    filename: 'IMG_6988.jpg',
    title: 'Wonderful in Every Way',
    statement: 'Back to back, matching sweaters and quiet confidence. Even in a simple mirror, everything feels right when you are there.',
    dateHint: 'Our Favorite Mirror',
    fullUrl: '/photos/main/IMG_6988.webp',
    thumbUrl: '/photos/main/IMG_6988_thumb.webp',
    width: 2160,
    height: 2723,
    aspectRatio: 0.793,
    featured: true
  },
  {
    id: 'main-heart',
    category: 'main',
    filename: 'IMG_6092.jpg',
    title: 'Our Half-Heart',
    statement: 'You make every regular cafe corner feel like our own private little world.',
    dateHint: 'Afternoon Sweetness',
    fullUrl: '/photos/main/IMG_6092.webp',
    thumbUrl: '/photos/main/IMG_6092_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    featured: true
  },
  {
    id: 'main-unfiltered',
    category: 'main',
    filename: 'IMG_6095.jpg',
    title: 'Unfiltered Us',
    statement: 'The moments between the serious poses are always my favorite ones with you.',
    dateHint: 'Laughing Out Loud',
    fullUrl: '/photos/main/IMG_6095.webp',
    thumbUrl: '/photos/main/IMG_6095_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333
  },
  {
    id: 'main-lockscreens',
    category: 'main',
    filename: 'IMG_5867.jpg',
    title: '8:32 AM Synchronicity',
    statement: 'Even our lock screens know where home is — waking up with you as the first thing I see.',
    dateHint: 'Saturday, January 25',
    fullUrl: '/photos/main/IMG_5867.webp',
    thumbUrl: '/photos/main/IMG_5867_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    featured: true
  }
];

export const PET_PHOTOS: PhotoItem[] = [
  {
    id: 'pet-baby',
    category: 'pets',
    filename: 'IMG_0591.jpg',
    title: 'Little Cloud',
    statement: 'So small you could fit in two hands, tucked beside a little crocheted bear.',
    dateHint: 'Early Days',
    fullUrl: '/photos/pets/IMG_0591.webp',
    thumbUrl: '/photos/pets/IMG_0591_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75
  },
  {
    id: 'pet-explorer',
    category: 'pets',
    filename: 'IMG_2058.jpg',
    title: 'Curious Explorer',
    statement: 'Learning the world one gentle nose boop at a time, keeping your favorite toy close.',
    dateHint: 'Terrace Afternoon',
    fullUrl: '/photos/pets/IMG_2058.webp',
    thumbUrl: '/photos/pets/IMG_2058_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75
  },
  {
    id: 'pet-sunshine',
    category: 'pets',
    filename: 'IMG_4447.jpg',
    title: 'Pure Sunshine',
    statement: 'That boundless, grassy smile that never fails to brighten even the longest days.',
    dateHint: 'Green Meadow Walk',
    fullUrl: '/photos/pets/IMG_4447.webp',
    thumbUrl: '/photos/pets/IMG_4447_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    featured: true
  },
  {
    id: 'pet-guardian',
    category: 'pets',
    filename: 'IMG_6879.jpg',
    title: 'Quiet Guardian',
    statement: 'Sitting by our side through late nights and lazy mornings, always listening.',
    dateHint: 'Cozy Living Room',
    fullUrl: '/photos/pets/IMG_6879.webp',
    thumbUrl: '/photos/pets/IMG_6879_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75
  }
];

export const SUB_PHOTOS: PhotoItem[] = [
  {
    id: 'sub-anniv-dinner',
    category: 'sub',
    filename: '20251112_182315.jpg',
    title: 'One Year Behind Us',
    statement: 'November 12, exactly one year ago — holding onto you just as tightly as day one.',
    dateHint: 'November 12, 2025 · 6:23 PM',
    fullUrl: '/photos/subs/20251112_182315.webp',
    thumbUrl: '/photos/subs/20251112_182315_thumb.webp',
    width: 2736,
    height: 3648,
    aspectRatio: 0.75,
    featured: true,
    group: 'anniversary'
  },
  {
    id: 'sub-fairylights',
    category: 'sub',
    filename: '20251112_210610.jpg',
    title: 'Reflections & Fairy Lights',
    statement: 'Nightfall on our anniversary, catching your reflection in the glass while the world outside blurred away.',
    dateHint: 'November 12, 2025 · 9:06 PM',
    fullUrl: '/photos/subs/20251112_210610.webp',
    thumbUrl: '/photos/subs/20251112_210610_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    group: 'anniversary'
  },
  {
    id: 'sub-frappe',
    category: 'sub',
    filename: 'IMG_1823.jpg',
    title: 'Frappe & Thumbs Up',
    statement: 'Big sips, funny faces, and the easiest kind of joy that only you bring out in me.',
    dateHint: 'Cafe Table #4',
    fullUrl: '/photos/subs/IMG_1823.webp',
    thumbUrl: '/photos/subs/IMG_1823_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    group: 'cafe'
  },
  {
    id: 'sub-cheek-poke',
    category: 'sub',
    filename: 'IMG_1827.jpg',
    title: 'Squishy Cheek Tax',
    statement: 'You never miss a chance to poke my cheek, and I never really want you to stop.',
    dateHint: 'Close-up Mischief',
    fullUrl: '/photos/subs/IMG_1827.webp',
    thumbUrl: '/photos/subs/IMG_1827_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    group: 'playful'
  },
  {
    id: 'sub-matching-rings',
    category: 'sub',
    filename: 'IMG_1830.jpg',
    title: 'Matching Hands',
    statement: 'Matching rings, blue nails, and shared laughter that made the whole table shake.',
    dateHint: 'Blue Polish & Black Rings',
    fullUrl: '/photos/subs/IMG_1830.webp',
    thumbUrl: '/photos/subs/IMG_1830_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    featured: true,
    group: 'playful'
  },
  {
    id: 'sub-commute',
    category: 'sub',
    filename: 'IMG_5620.jpg',
    title: 'Through Every Commute',
    statement: 'Even traffic and long rides turn into an adventure when I get to sit next to you.',
    dateHint: 'On the Way Home',
    fullUrl: '/photos/subs/IMG_5620.webp',
    thumbUrl: '/photos/subs/IMG_5620_thumb.webp',
    width: 2316,
    height: 3088,
    aspectRatio: 0.75,
    group: 'daily'
  },
  {
    id: 'sub-back-hug',
    category: 'sub',
    filename: 'IMG_6116.jpg',
    title: 'In Your Hands',
    statement: 'The warmth of your hands holding my face — there is no place safer than right here.',
    dateHint: 'Windbreaker Hugs',
    fullUrl: '/photos/subs/IMG_6116.webp',
    thumbUrl: '/photos/subs/IMG_6116_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    featured: true,
    group: 'cafe'
  },
  {
    id: 'sub-cafe-reading',
    category: 'sub',
    filename: 'IMG_6314.jpg',
    title: 'A Quiet Afternoon',
    statement: 'I love watching you in quiet spaces when you think nobody is looking.',
    dateHint: 'Cozy Bookshop Cafe',
    fullUrl: '/photos/subs/IMG_6314.webp',
    thumbUrl: '/photos/subs/IMG_6314_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    group: 'cafe'
  },
  {
    id: 'sub-discord',
    category: 'sub',
    filename: 'IMG_6760.jpg',
    title: 'Midnight Frequency',
    statement: 'Glowing screens at 8:06 PM, talking about everything and nothing until our eyes grew heavy.',
    dateHint: 'Discord Calls & Neon Glow',
    fullUrl: '/photos/subs/IMG_6760.webp',
    thumbUrl: '/photos/subs/IMG_6760_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    featured: true,
    group: 'latenight'
  },
  {
    id: 'sub-cheek-kiss',
    category: 'sub',
    filename: 'IMG_7780.jpg',
    title: 'Two Of A Kind',
    statement: 'Two weirdos who found each other and decided never to be serious all the time.',
    dateHint: 'Cafe Smiles',
    fullUrl: '/photos/subs/IMG_7780.webp',
    thumbUrl: '/photos/subs/IMG_7780_thumb.webp',
    width: 2160,
    height: 2741,
    aspectRatio: 0.788,
    group: 'playful'
  },
  {
    id: 'sub-fanta-toast',
    category: 'sub',
    filename: 'IMG_8058.webp',
    title: 'A Little Toast',
    statement: 'Cheers to our favorite snacks, midnight sodas, and the sweetest ordinary nights.',
    dateHint: 'Berry & Orange',
    fullUrl: '/photos/subs/IMG_8058.webp',
    thumbUrl: '/photos/subs/IMG_8058_thumb.webp',
    width: 768,
    height: 1024,
    aspectRatio: 0.75,
    group: 'daily'
  },
  {
    id: 'sub-pasta-date',
    category: 'sub',
    filename: 'IMG_8408.webp',
    title: 'Carbs & Good Company',
    statement: 'Big bowls of pasta, iced coffee, and that face across the table that makes my chest warm.',
    dateHint: 'Dinner for Two',
    fullUrl: '/photos/subs/IMG_8408.webp',
    thumbUrl: '/photos/subs/IMG_8408_thumb.webp',
    width: 1280,
    height: 960,
    aspectRatio: 1.333,
    group: 'daily'
  },
  {
    id: 'sub-blue-memo',
    category: 'sub',
    filename: 'IMG_8520.jpg',
    title: 'The Blue Ink Promise',
    statement: 'November 21, 2024. Pinned on paper, etched in ink, and kept in my heart ever since.',
    dateHint: 'Pinned Memo · Nov 21, 2024',
    fullUrl: '/photos/subs/IMG_8520.webp',
    thumbUrl: '/photos/subs/IMG_8520_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    featured: true,
    group: 'anniversary'
  }
];

export const ALL_PHOTOS: PhotoItem[] = [...MAIN_PHOTOS, ...PET_PHOTOS, ...SUB_PHOTOS];

export const GALLERY_GROUPS = [
  { id: 'all', label: 'All Preserved Memories', count: SUB_PHOTOS.length },
  { id: 'anniversary', label: 'Anniversary Moments', count: SUB_PHOTOS.filter(p => p.group === 'anniversary').length },
  { id: 'cafe', label: 'Cafe Afternoons', count: SUB_PHOTOS.filter(p => p.group === 'cafe').length },
  { id: 'playful', label: 'Playful Hearts', count: SUB_PHOTOS.filter(p => p.group === 'playful').length },
  { id: 'latenight', label: 'Late Night Calls', count: SUB_PHOTOS.filter(p => p.group === 'latenight').length },
  { id: 'daily', label: 'Ordinary Days', count: SUB_PHOTOS.filter(p => p.group === 'daily').length },
] as const;

export const SPOTIFY_PLAYLISTS = [
  {
    id: '049ExphVBIdjni1fmkxBEt',
    curator: 'Wam (Puchoo)',
    title: '‧₊˚🩵💙🎐💎  ‧₊𓏲 ๋࣭ ࣪ ˖',
    subtitle: 'BLUE',
    description: 'A deep sea of mellow rhythms, late-night acoustic thoughts, and cosmic nostalgia.',
    coverUrl: '/photos/spotify/playlist_blue.jpg',
    externalUrl: 'https://open.spotify.com/playlist/049ExphVBIdjni1fmkxBEt?si=561c91f102504b2c',
    embedUrl: 'https://open.spotify.com/embed/playlist/049ExphVBIdjni1fmkxBEt?utm_source=generator&theme=0',
    accentColor: '#718FB8'
  },
  {
    id: '5k0G8TEnK1gCv3KTID48oE',
    curator: 'Bao',
    title: '☁️',
    subtitle: 'Cloud Playlist',
    description: 'Soft cloud harmonies, cozy afternoon songs, and the melodies that keep us close.',
    coverUrl: '/photos/spotify/playlist_cloud.jpg',
    externalUrl: 'https://open.spotify.com/playlist/5k0G8TEnK1gCv3KTID48oE?si=ab86dcd540014272',
    embedUrl: 'https://open.spotify.com/embed/playlist/5k0G8TEnK1gCv3KTID48oE?utm_source=generator&theme=0',
    accentColor: '#B7D2F0'
  }
];
