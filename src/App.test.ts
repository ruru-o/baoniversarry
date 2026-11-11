import { describe, it, expect } from 'vitest';
import { FLORAL_PARTS } from './data/floralAssets';
import { ALL_PHOTOS, SPOTIFY_PLAYLISTS } from './data/photos';
import { assetUrl } from './utils/assetUrl';

describe('Anniversary Experience Verification', () => {
  it('loads all 20 curated photographs across main, sub, and pets', () => {
    expect(ALL_PHOTOS.length).toBe(20);
    expect(ALL_PHOTOS.some(p => p.fullUrl.includes('IMG_6095'))).toBe(false);

    const sources = ALL_PHOTOS.map(p => p.source);
    expect(sources.filter(s => s === 'main').length).toBe(3);
    expect(sources.filter(s => s === 'sub').length).toBe(13);
    expect(sources.filter(s => s === 'pets').length).toBe(4);

    const cafePhoto = ALL_PHOTOS.find(p => p.id === 'sub-pasta-table');
    expect(cafePhoto?.constellationPhrase).toBe(
      '1964 cafe was one of the first wamming day we had, and honestly, would like to revisit again.'
    );
  });

  it('provides signature constellation geometry and resolves subpath assets for GitHub Pages', () => {
    for (const photo of ALL_PHOTOS) {
      expect(photo.constellationStars.length).toBeGreaterThanOrEqual(3);
      expect(photo.constellationLines.length).toBeGreaterThanOrEqual(2);
      expect(photo.fullUrl).toMatch(/^\/photos\//);
      expect(photo.thumbUrl).toMatch(/^\/photos\//);
    }

    for (const part of Object.values(FLORAL_PARTS)) {
      expect(part.url).toMatch(/^\/floral\//);
      expect(assetUrl(part.url, '/baoniversarry/')).toBe(`/baoniversarry${part.url}`);
    }

    expect(assetUrl('/bao-signature.png', '/baoniversarry/')).toBe('/baoniversarry/bao-signature.png');
    expect(assetUrl('/audio/bao-beside-you.mp3', '/baoniversarry')).toBe('/baoniversarry/audio/bao-beside-you.mp3');
    expect(assetUrl('https://example.com/a.mp3', '/baoniversarry/')).toBe('https://example.com/a.mp3');
  });

  it('contains authentic Spotify playlists with Wam defaulting to I Choose You and Bao to beside you', () => {
    expect(SPOTIFY_PLAYLISTS.length).toBe(2);
    expect(SPOTIFY_PLAYLISTS[0].name).toBe('Wam');
    expect(SPOTIFY_PLAYLISTS[0].trackTitle).toBe('I Choose You');
    expect(SPOTIFY_PLAYLISTS[0].trackArtist).toBe('keshi');
    expect(SPOTIFY_PLAYLISTS[0].tracks.some(t => t.id === '41EnM4giX9PJYZIBUCPmiI' && t.title === 'I Choose You')).toBe(true);
    expect(SPOTIFY_PLAYLISTS[1].name).toBe('Bao');
    expect(SPOTIFY_PLAYLISTS[1].trackTitle).toBe('beside you');
    expect(SPOTIFY_PLAYLISTS[0].embedUrl).toContain('spotify.com/embed');
    expect(SPOTIFY_PLAYLISTS[1].embedUrl).toContain('spotify.com/embed');

    for (const side of SPOTIFY_PLAYLISTS) {
      for (const track of side.tracks) {
        expect(Boolean(track.previewUrl || track.localAudioUrl)).toBe(true);
        expect(track.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
        expect(track.duration).toBeGreaterThan(60);
      }
    }
  });
});
