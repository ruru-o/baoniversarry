import { WAM_TRACKS, BAO_TRACKS, type PlaylistTrack } from './playlists';
import { assetUrl } from '../utils/assetUrl';

export type { PlaylistTrack };

export interface PhotoItem {
  id: string;
  source: 'main' | 'sub' | 'pets';
  filename: string;
  fullUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  constellationPhrase?: string;
  constellationStars: Array<[number, number]>; // [x%, y%] coordinates 0-100
  constellationLines: Array<[number, number]>; // pairs of star indices to connect
}

const RAW_PHOTOS: PhotoItem[] = [
  // ─── Main Portraits & Moments ──────────────────────────────────
  {
    id: 'main-hoodie-mirror',
    source: 'main',
    filename: 'IMG_6988.jpg',
    fullUrl: '/photos/main/IMG_6988.webp',
    thumbUrl: '/photos/main/IMG_6988_thumb.webp',
    width: 2160,
    height: 2723,
    aspectRatio: 0.793,
    constellationPhrase: "Always my favorite person.",
    constellationStars: [[20, 30], [45, 20], [70, 40], [80, 75], [50, 85], [30, 65]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    id: 'main-cafe-heart',
    source: 'main',
    filename: 'IMG_6092.jpg',
    fullUrl: '/photos/main/IMG_6092.webp',
    thumbUrl: '/photos/main/IMG_6092_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    constellationPhrase: "I'm glad I met you.",
    constellationStars: [[30, 20], [50, 40], [70, 20], [85, 50], [50, 90], [15, 50]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    id: 'main-lockscreens',
    source: 'main',
    filename: 'IMG_5867.jpg',
    fullUrl: '/photos/main/IMG_5867.webp',
    thumbUrl: '/photos/main/IMG_5867_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Right where I want to be.",
    constellationStars: [[30, 25], [70, 25], [70, 75], [30, 75], [50, 50]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [2, 4]],
  },

  // ─── Sub Shared Memories ───────────────────────────────────────
  {
    id: 'sub-anniv-close',
    source: 'sub',
    filename: '20251112_182315.jpg',
    fullUrl: '/photos/subs/20251112_182315.webp',
    thumbUrl: '/photos/subs/20251112_182315_thumb.webp',
    width: 2736,
    height: 3648,
    aspectRatio: 0.75,
    constellationPhrase: "Holding onto you.",
    constellationStars: [[20, 50], [40, 25], [60, 35], [80, 60], [50, 80]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 'sub-window-lights',
    source: 'sub',
    filename: '20251112_210610.jpg',
    fullUrl: '/photos/subs/20251112_210610.webp',
    thumbUrl: '/photos/subs/20251112_210610_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Fairy lights and you.",
    constellationStars: [[25, 20], [75, 20], [80, 80], [20, 80]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
  },
  {
    id: 'sub-frappe-thumbs',
    source: 'sub',
    filename: 'IMG_1823.jpg',
    fullUrl: '/photos/subs/IMG_1823.webp',
    thumbUrl: '/photos/subs/IMG_1823_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    constellationPhrase: "I love having you around.",
    constellationStars: [[15, 60], [35, 30], [65, 30], [85, 60], [50, 75]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 'sub-cheek-squish',
    source: 'sub',
    filename: 'IMG_1827.jpg',
    fullUrl: '/photos/subs/IMG_1827.webp',
    thumbUrl: '/photos/subs/IMG_1827_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    constellationPhrase: "The peepo with a beepo brain.",
    constellationStars: [[25, 30], [50, 20], [75, 45], [60, 80], [35, 70]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 'sub-black-rings',
    source: 'sub',
    filename: 'IMG_1830.jpg',
    fullUrl: '/photos/subs/IMG_1830.webp',
    thumbUrl: '/photos/subs/IMG_1830_thumb.webp',
    width: 4032,
    height: 3024,
    aspectRatio: 1.333,
    constellationPhrase: "Matching hands.",
    constellationStars: [[20, 50], [50, 25], [80, 50], [50, 75]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
  {
    id: 'sub-commute-ride',
    source: 'sub',
    filename: 'IMG_5620.jpg',
    fullUrl: '/photos/subs/IMG_5620.webp',
    thumbUrl: '/photos/subs/IMG_5620_thumb.webp',
    width: 2316,
    height: 3088,
    aspectRatio: 0.75,
    constellationPhrase: "Next to you on the ride home.",
    constellationStars: [[20, 25], [45, 50], [75, 30], [80, 75], [30, 80]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]],
  },
  {
    id: 'sub-hug-warmth',
    source: 'sub',
    filename: 'IMG_6116.jpg',
    fullUrl: '/photos/subs/IMG_6116.webp',
    thumbUrl: '/photos/subs/IMG_6116_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "My peace.",
    constellationStars: [[30, 30], [70, 30], [50, 60], [50, 85]],
    constellationLines: [[0, 1], [1, 2], [2, 0], [2, 3]],
  },
  {
    id: 'sub-quiet-profile',
    source: 'sub',
    filename: 'IMG_6314.jpg',
    fullUrl: '/photos/subs/IMG_6314.webp',
    thumbUrl: '/photos/subs/IMG_6314_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Quiet afternoons.",
    constellationStars: [[30, 20], [60, 40], [80, 70], [40, 80], [20, 50]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 'sub-discord-night',
    source: 'sub',
    filename: 'IMG_6760.jpg',
    fullUrl: '/photos/subs/IMG_6760.webp',
    thumbUrl: '/photos/subs/IMG_6760_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Late night calls.",
    constellationStars: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    constellationLines: [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4]],
  },
  {
    id: 'sub-funny-faces',
    source: 'sub',
    filename: 'IMG_7780.jpg',
    fullUrl: '/photos/subs/IMG_7780.webp',
    thumbUrl: '/photos/subs/IMG_7780_thumb.webp',
    width: 2160,
    height: 2741,
    aspectRatio: 0.788,
    constellationPhrase: "Always with you.",
    constellationStars: [[20, 40], [50, 20], [80, 40], [65, 80], [35, 80]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 'sub-fanta-cans',
    source: 'sub',
    filename: 'IMG_8058.webp',
    fullUrl: '/photos/subs/IMG_8058.webp',
    thumbUrl: '/photos/subs/IMG_8058_thumb.webp',
    width: 768,
    height: 1024,
    aspectRatio: 0.75,
    constellationPhrase: "Cheers.",
    constellationStars: [[30, 30], [70, 30], [50, 70]],
    constellationLines: [[0, 1], [1, 2], [2, 0]],
  },
  {
    id: 'sub-pasta-table',
    source: 'sub',
    filename: 'IMG_8408.webp',
    fullUrl: '/photos/subs/IMG_8408.webp',
    thumbUrl: '/photos/subs/IMG_8408_thumb.webp',
    width: 1280,
    height: 960,
    aspectRatio: 1.333,
    constellationPhrase: "1964 cafe was one of the first wamming day we had, and honestly, would like to revisit again.",
    constellationStars: [[20, 30], [50, 20], [80, 30], [70, 75], [30, 75]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 'sub-ink-drawing',
    source: 'sub',
    filename: 'IMG_8520.jpg',
    fullUrl: '/photos/subs/IMG_8520.webp',
    thumbUrl: '/photos/subs/IMG_8520_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Hubby & Wipey.",
    constellationStars: [[30, 25], [70, 25], [85, 60], [50, 85], [15, 60]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },

  // ─── Pets (Integrated in Gallery) ──────────────────────────────
  {
    id: 'pet-puppy-bear',
    source: 'pets',
    filename: 'IMG_0591.jpg',
    fullUrl: '/photos/pets/IMG_0591.webp',
    thumbUrl: '/photos/pets/IMG_0591_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Tiny puppy days.",
    constellationStars: [[25, 30], [75, 30], [65, 75], [35, 75]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
  {
    id: 'pet-boop-toy',
    source: 'pets',
    filename: 'IMG_2058.jpg',
    fullUrl: '/photos/pets/IMG_2058.webp',
    thumbUrl: '/photos/pets/IMG_2058_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Curious boop.",
    constellationStars: [[30, 20], [70, 35], [55, 75], [20, 60]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
  {
    id: 'pet-grass-smile',
    source: 'pets',
    filename: 'IMG_4447.jpg',
    fullUrl: '/photos/pets/IMG_4447.webp',
    thumbUrl: '/photos/pets/IMG_4447_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "Pure sunshine.",
    constellationStars: [[50, 15], [80, 45], [65, 85], [35, 85], [20, 45]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 'pet-calm-home',
    source: 'pets',
    filename: 'IMG_6879.jpg',
    fullUrl: '/photos/pets/IMG_6879.webp',
    thumbUrl: '/photos/pets/IMG_6879_thumb.webp',
    width: 3024,
    height: 4032,
    aspectRatio: 0.75,
    constellationPhrase: "The Ploo.",
    constellationStars: [[25, 25], [75, 25], [75, 75], [25, 75]],
    constellationLines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
];

export const ALL_PHOTOS: PhotoItem[] = RAW_PHOTOS.map((photo) => ({
  ...photo,
  fullUrl: assetUrl(photo.fullUrl),
  thumbUrl: assetUrl(photo.thumbUrl),
}));

export interface PlaylistSide {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  externalUrl: string;
  embedUrl: string;
  audioUrl: string;
  trackTitle: string;
  trackArtist: string;
  duration: number;
  tracks: PlaylistTrack[];
}

const RAW_SPOTIFY_PLAYLISTS: PlaylistSide[] = [
  {
    id: '049ExphVBIdjni1fmkxBEt',
    name: 'Wam',
    title: '‧₊˚🩵💙🎐💎  ‧₊𓏲 ๋࣭ ࣪ ˖',
    subtitle: 'I Choose You',
    coverUrl: '/photos/spotify/playlist_blue.jpg',
    externalUrl: 'https://open.spotify.com/playlist/049ExphVBIdjni1fmkxBEt?si=561c91f102504b2c',
    embedUrl: 'https://open.spotify.com/embed/playlist/049ExphVBIdjni1fmkxBEt?utm_source=generator&theme=0',
    audioUrl: 'https://p.scdn.co/mp3-preview/b27c2b7844d8d1e5db9f176388bb825d754ee408',
    trackTitle: 'I Choose You',
    trackArtist: 'keshi',
    duration: 168,
    tracks: WAM_TRACKS,
  },
  {
    id: '5k0G8TEnK1gCv3KTID48oE',
    name: 'Bao',
    title: '☁️',
    subtitle: 'Cloud',
    coverUrl: '/photos/spotify/playlist_cloud.jpg',
    externalUrl: 'https://open.spotify.com/playlist/5k0G8TEnK1gCv3KTID48oE?si=ab86dcd540014272',
    embedUrl: 'https://open.spotify.com/embed/playlist/5k0G8TEnK1gCv3KTID48oE?utm_source=generator&theme=0',
    audioUrl: '/audio/bao-beside-you.mp3',
    trackTitle: 'beside you',
    trackArtist: 'keshi',
    duration: 166,
    tracks: BAO_TRACKS,
  },
];

export const SPOTIFY_PLAYLISTS: PlaylistSide[] = RAW_SPOTIFY_PLAYLISTS.map((side) => ({
  ...side,
  coverUrl: assetUrl(side.coverUrl),
  audioUrl: assetUrl(side.audioUrl),
}));
