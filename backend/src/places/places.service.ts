import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class PlacesService {
  private OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

  // Query Overpass with a bbox (south,west,north,east) and an array of categories (e.g. ['restaurant','cafe','supermarket'])
  async fetchPOIs(bbox: string, categories: string[] = []): Promise<any[]> {
    // basic bbox validation: four comma-separated numbers
    const parts = bbox.split(',').map((p) => p.trim());
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(Number(p)))) {
      throw new HttpException('Invalid bbox parameter', HttpStatus.BAD_REQUEST);
    }

    // prevent huge queries: limit bbox span to ~2 degrees each direction
    const south = parseFloat(parts[0]);
    const west = parseFloat(parts[1]);
    const north = parseFloat(parts[2]);
    const east = parseFloat(parts[3]);
    if (Math.abs(north - south) > 2 || Math.abs(east - west) > 2) {
      throw new HttpException('BBox too large', HttpStatus.BAD_REQUEST);
    }

    // sanitize categories
    const safeCategories = (categories || []).map(c => c.replace(/[^a-zA-Z0-9_\-]/g, '')).filter(Boolean);

    // map friendly category names to OSM tag filters
    const categoryToFilters = (cat: string) => {
      const lower = cat.toLowerCase();
      switch (lower) {
        case 'restaurant': return [{ k: 'amenity', v: 'restaurant' }];
        case 'cafe': return [{ k: 'amenity', v: 'cafe' }];
        case 'bar': return [{ k: 'amenity', v: 'bar' }];
        case 'supermarket': return [{ k: 'shop', v: 'supermarket' }];
        case 'convenience': return [{ k: 'shop', v: 'convenience' }];
        case 'fuel': return [{ k: 'amenity', v: 'fuel' }];
        default:
          // fallback: try amenity and shop with the category as value
          return [{ k: 'amenity', v: lower }, { k: 'shop', v: lower }];
      }
    };

    const filters = safeCategories.length ? safeCategories.flatMap(categoryToFilters) : [
      { k: 'amenity', v: 'restaurant' },
      { k: 'amenity', v: 'cafe' },
      { k: 'shop', v: 'supermarket' }
    ];

    // Build Overpass QL parts per filter
    const makeFilter = (f: {k:string,v:string}) => `["${f.k}"="${f.v}"]`;
    const nodeQueries = filters.map(f => `node${makeFilter(f)}(${south},${west},${north},${east});`).join('\n  ');
    const wayQueries = filters.map(f => `way${makeFilter(f)}(${south},${west},${north},${east});`).join('\n  ');
    const relQueries = filters.map(f => `relation${makeFilter(f)}(${south},${west},${north},${east});`).join('\n  ');

    const query = `\n[out:json][timeout:25];\n(\n  ${nodeQueries}\n  ${wayQueries}\n  ${relQueries}\n);\nout center;`;

    try {
      // simple retry: attempt up to 2 times for transient Overpass/network errors
      let res = await fetch(this.OVERPASS_URL, { method: 'POST', body: query });
      if (!res.ok) {
        const txt1 = await res.text().catch(() => '');
        console.warn('Overpass first attempt non-ok', res.status, txt1);
        // brief delay then retry once
        await new Promise(r => setTimeout(r, 400));
        res = await fetch(this.OVERPASS_URL, { method: 'POST', body: query });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('Overpass error after retry', res.status, txt);
          return [];
        }
      }
      const data = await res.json();

      // convert to simplified GeoJSON-like features
      const features = (data.elements || []).map(el => {
        let coords: [number, number] | null = null;
        if (el.type === 'node') coords = [el.lon as number, el.lat as number];
        else if (el.type === 'way' || el.type === 'relation') {
          if (el.center) coords = [el.center.lon as number, el.center.lat as number];
        }
        if (!coords) return null;
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coords },
          properties: { id: el.id, tags: el.tags || {}, osm_type: el.type }
        };
      }).filter(Boolean);

      return features;
    } catch (err) {
      console.error('PlacesService.fetchPOIs error:', err?.message || err);
      // Bubble up validation/http exceptions, otherwise return empty array to avoid 500 on transient Overpass/network errors
      if (err instanceof HttpException) throw err;
      return [];
    }
  }
}
