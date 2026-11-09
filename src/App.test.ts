import { describe, it, expect } from 'vitest';
import { ALL_PHOTOS, SPOTIFY_PLAYLISTS } from './data/photos';

describe('Anniversary Experience Verification', () => {
  it('loads all 21 authentic photographs across main, sub, and pets', () => {
    expect(ALL_PHOTOS.length).toBe(21);

    const sources = ALL_PHOTOS.map(p => p.source);
    expect(sources.filter(s => s === 'main').length).toBe(4);
    expect(sources.filter(s => s === 'sub').length).toBe(13);
    expect(sources.filter(s => s === 'pets').length).toBe(4);
  });

  it('provides signature constellation geometry for every photo', () => {
    for (const photo of ALL_PHOTOS) {
      expect(photo.constellationStars.length).toBeGreaterThanOrEqual(3);
      expect(photo.constellationLines.length).toBeGreaterThanOrEqual(2);
      expect(photo.fullUrl).toMatch(/^\/photos\//);
      expect(photo.thumbUrl).toMatch(/^\/photos\//);
    }
  });

  it('contains authentic Spotify playlists for Wam and Bao', () => {
    expect(SPOTIFY_PLAYLISTS.length).toBe(2);
    expect(SPOTIFY_PLAYLISTS[0].name).toBe('Wam');
    expect(SPOTIFY_PLAYLISTS[1].name).toBe('Bao');
    expect(SPOTIFY_PLAYLISTS[0].embedUrl).toContain('spotify.com/embed');
    expect(SPOTIFY_PLAYLISTS[1].embedUrl).toContain('spotify.com/embed');
  });
});
