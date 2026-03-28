'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { getLocationsInBounds } from '@/app/actions';
import { GuessLocation } from '@/types/guess';
import { GOOGLE_STREET_VIEW_BASE_URL } from '@/lib/constants';
import { formatDistance, formatRelativeTime } from '@/lib/utils';

interface VisitedPlacesMapProps {
  readonly onLoadingChange?: (isLoading: boolean) => void;
  readonly onZoomChange?: (isZoomTooLow: boolean) => void;
}

function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}

function buildPopupHTML(location: GuessLocation) {
  const dark = isDarkMode();
  const bg = dark ? 'rgba(15,30,55,0.85)' : 'rgba(255,255,255,0.85)';
  const border = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const text = dark ? '#e2e8f0' : '#1e293b';
  const textMuted = dark ? '#94a3b8' : '#64748b';
  const btnBg = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const btnHoverBg = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  const btnText = dark ? '#e2e8f0' : '#1e293b';

  const dist = formatDistance(location.distance);
  const time = formatRelativeTime(location.created_at);

  return `<div style="background:${bg};backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:0.75rem;padding:0.75rem;font-size:0.875rem;color:${text};border:1px solid ${border};min-width:200px;max-width:280px">
    <p style="font-weight:600;line-height:1.3;margin:0 0 0.375rem 0;word-wrap:break-word;overflow-wrap:break-word">${location.location ?? 'Unknown location'}</p>
    <p style="color:${textMuted};font-size:0.75rem;margin:0 0 0.625rem 0;line-height:1.4">
      Visited ${time} · Guessed ${dist} away
    </p>
    <div style="display:flex;flex-direction:column;gap:0.375rem">
      <a href="/guess/${location.id}"
         onmouseover="this.style.background='${btnHoverBg}'"
         onmouseout="this.style.background='${btnBg}'"
         style="text-align:center;color:${btnText};background:${btnBg};border:1px solid ${border};border-radius:0.5rem;padding:0.375rem 0.75rem;text-decoration:none;font-size:0.8125rem;transition:background 0.15s">
        Show Guess Details
      </a>
      <a href="${GOOGLE_STREET_VIEW_BASE_URL}${location.lat},${location.lng}"
         target="_blank"
         onmouseover="this.style.background='${btnHoverBg}'"
         onmouseout="this.style.background='${btnBg}'"
         style="text-align:center;color:${btnText};background:${btnBg};border:1px solid ${border};border-radius:0.5rem;padding:0.375rem 0.75rem;text-decoration:none;font-size:0.8125rem;transition:background 0.15s">
        View on Street View
      </a>
    </div>
  </div>`;
}

export function VisitedPlacesMap({
  onLoadingChange,
  onZoomChange,
}: VisitedPlacesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  const popupFeatureId = useRef<string | null>(null);
  const [locations, setLocations] = useState<GuessLocation[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const isLoading = useRef(false);
  const isFirstLoad = useRef(true);

  const checkZoom = useCallback(() => {
    if (!map.current) return;
    const zoom = map.current.getZoom();
    onZoomChange?.(zoom < 3);
  }, [onZoomChange]);

  const fetchLocations = useCallback(async () => {
    if (!map.current || isLoading.current) return;

    const bounds = map.current.getBounds();
    const zoom = map.current.getZoom();

    if (zoom < 3) {
      setLocations([]);
      return;
    }

    isLoading.current = true;
    onLoadingChange?.(true);

    try {
      const data = await getLocationsInBounds(
        bounds.getSouth(),
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast(),
      );
      setLocations(data);

      if (isFirstLoad.current && data.length > 0 && map.current) {
        isFirstLoad.current = false;
        const fitBounds = new maplibregl.LngLatBounds();
        data.forEach((loc) => fitBounds.extend([loc.lng, loc.lat]));
        map.current.fitBounds(fitBounds, { padding: 60, maxZoom: 12 });
      }
    } finally {
      isLoading.current = false;
      onLoadingChange?.(false);
    }
  }, [onLoadingChange]);

  const debouncedFetch = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(fetchLocations, 300);
  }, [fetchLocations]);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap Contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [0, 20],
      zoom: 2,
    });

    const nav = new maplibregl.NavigationControl();
    map.current.addControl(nav, 'top-right');

    map.current.on('moveend', debouncedFetch);
    map.current.on('zoomend', debouncedFetch);
    map.current.on('zoom', checkZoom);

    map.current.once('load', () => {
      if (!map.current) return;

      map.current.addSource('locations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#7c3aed',
            10, '#6d28d9',
            50, '#5b21b6',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10, 24,
            50, 32,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
        },
      });

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'locations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Noto Sans Regular'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'locations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#7c3aed',
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.current.on('click', 'clusters', async (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        if (!features.length) return;

        const clusterId = features[0].properties.cluster_id;
        const source = map.current.getSource('locations') as maplibregl.GeoJSONSource;

        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          map.current.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom,
          });
        } catch {
          // ignore
        }
      });

      map.current.on('click', 'unclustered-point', (e) => {
        if (!map.current || !e.features?.length) return;

        const feature = e.features[0];
        const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const props = feature.properties;

        if (!props) return;

        const loc: GuessLocation = {
          id: props.id,
          lat: coords[1],
          lng: coords[0],
          location: props.location || null,
          country: props.country || null,
          game_type: props.game_type,
          distance: Number(props.distance),
          created_at: props.created_at,
        };

        popup.current?.remove();
        popupFeatureId.current = props.id;
        popup.current = new maplibregl.Popup({ offset: 14, closeButton: false })
          .setLngLat(coords)
          .setHTML(buildPopupHTML(loc))
          .addTo(map.current);
      });

      map.current.on('moveend', () => {
        if (!map.current || !popup.current || !popupFeatureId.current) return;
        const visible = map.current.queryRenderedFeatures(undefined, {
          layers: ['unclustered-point'],
        });
        const stillVisible = visible.some(
          (f) => f.properties?.id === popupFeatureId.current,
        );
        if (!stillVisible) {
          popup.current.remove();
          popupFeatureId.current = null;
        }
      });

      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      checkZoom();
      fetchLocations();
    });

    return () => {
      map.current?.off('zoom', checkZoom);
      popup.current?.remove();
      map.current?.remove();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedFetch, fetchLocations, checkZoom]);

  useEffect(() => {
    if (!map.current) return;

    const source = map.current.getSource('locations') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: locations.map((loc) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat],
        },
        properties: {
          id: loc.id,
          location: loc.location,
          country: loc.country,
          game_type: loc.game_type,
          distance: loc.distance,
          created_at: loc.created_at,
        },
      })),
    };

    source.setData(geojson);
  }, [locations]);

  return <div ref={mapContainer} className='w-full h-full' />;
}
