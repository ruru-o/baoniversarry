import { assetUrl } from '../utils/assetUrl';

export interface FloralPartMeta {
  name: string;
  url: string;
  width: number;
  height: number;
  originXFrac: number;
  originYFrac: number;
}

export const FLORAL_PARTS = {
  "cosmos_sky_head": {
    "name": "cosmos_sky_head",
    "url": assetUrl("/floral/cosmos_sky_head.webp"),
    "width": 202,
    "height": 182,
    "originXFrac": 0.6535,
    "originYFrac": 0.7967
  },
  "cosmos_twin_hero": {
    "name": "cosmos_twin_hero",
    "url": assetUrl("/floral/cosmos_twin_hero.webp"),
    "width": 202,
    "height": 165,
    "originXFrac": 0.401,
    "originYFrac": 0.9212
  },
  "cosmos_twin_cobalt": {
    "name": "cosmos_twin_cobalt",
    "url": assetUrl("/floral/cosmos_twin_cobalt.webp"),
    "width": 157,
    "height": 166,
    "originXFrac": 0.3185,
    "originYFrac": 0.8072
  },
  "blossom_frost_hero": {
    "name": "blossom_frost_hero",
    "url": assetUrl("/floral/blossom_frost_hero.webp"),
    "width": 249,
    "height": 249,
    "originXFrac": 0.4819,
    "originYFrac": 0.5382
  },
  "blossom_frost_left": {
    "name": "blossom_frost_left",
    "url": assetUrl("/floral/blossom_frost_left.webp"),
    "width": 183,
    "height": 235,
    "originXFrac": 0.5956,
    "originYFrac": 0.4766
  },
  "blossom_frost_cup": {
    "name": "blossom_frost_cup",
    "url": assetUrl("/floral/blossom_frost_cup.webp"),
    "width": 128,
    "height": 151,
    "originXFrac": 0.3281,
    "originYFrac": 0.5629
  },
  "blossom_frost_bud": {
    "name": "blossom_frost_bud",
    "url": assetUrl("/floral/blossom_frost_bud.webp"),
    "width": 67,
    "height": 79,
    "originXFrac": 0.4328,
    "originYFrac": 0.8354
  },
  "petal_frost_veined": {
    "name": "petal_frost_veined",
    "url": assetUrl("/floral/petal_frost_veined.webp"),
    "width": 64,
    "height": 101,
    "originXFrac": 0.5781,
    "originYFrac": 0.1188
  },
  "petal_painted_ice": {
    "name": "petal_painted_ice",
    "url": assetUrl("/floral/petal_painted_ice.webp"),
    "width": 63,
    "height": 76,
    "originXFrac": 0.6984,
    "originYFrac": 0.8553
  },
  "petal_cosmos_glow": {
    "name": "petal_cosmos_glow",
    "url": assetUrl("/floral/petal_cosmos_glow.webp"),
    "width": 64,
    "height": 92,
    "originXFrac": 0.7969,
    "originYFrac": 0.913
  },
  "painted_star_blossom": {
    "name": "painted_star_blossom",
    "url": assetUrl("/floral/painted_star_blossom.webp"),
    "width": 189,
    "height": 177,
    "originXFrac": 0.5661,
    "originYFrac": 0.5367
  },
  "painted_sapphire_blossom": {
    "name": "painted_sapphire_blossom",
    "url": assetUrl("/floral/painted_sapphire_blossom.webp"),
    "width": 160,
    "height": 137,
    "originXFrac": 0.4562,
    "originYFrac": 0.5328
  },
  "painted_cerulean_blossom": {
    "name": "painted_cerulean_blossom",
    "url": assetUrl("/floral/painted_cerulean_blossom.webp"),
    "width": 123,
    "height": 134,
    "originXFrac": 0.6341,
    "originYFrac": 0.4776
  },
  "painted_radiant_hero": {
    "name": "painted_radiant_hero",
    "url": assetUrl("/floral/painted_radiant_hero.webp"),
    "width": 206,
    "height": 126,
    "originXFrac": 0.432,
    "originYFrac": 0.7937
  },
  "painted_cup_blossom": {
    "name": "painted_cup_blossom",
    "url": assetUrl("/floral/painted_cup_blossom.webp"),
    "width": 98,
    "height": 106,
    "originXFrac": 0.6327,
    "originYFrac": 0.6792
  },
  "painted_leaf_spray": {
    "name": "painted_leaf_spray",
    "url": assetUrl("/floral/painted_leaf_spray.webp"),
    "width": 170,
    "height": 106,
    "originXFrac": 0.7706,
    "originYFrac": 0.2736
  }
} as const satisfies Record<string, FloralPartMeta>;
