'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { getLocationsInBounds } from '@/app/actions';
import { GuessLocation } from '@/types/guess';
import { GOOGLE_STREET_VIEW_BASE_URL } from '@/lib/constants';

interface VisitedPlacesMapProps {
  readonly onLoadingChange?: (isLoading: boolean) => void;
  readonly onZoomChange?: (isZoomTooLow: boolean) => void;
}

export function VisitedPlacesMap({
  onLoadingChange,
  onZoomChange,
}: VisitedPlacesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [locations, setLocations] = useState<GuessLocation[]>([]);
  const markers = useRef<maplibregl.Marker[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const isLoading = useRef(false);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
  }, []);

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
      clearMarkers();
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
    } finally {
      isLoading.current = false;
      onLoadingChange?.(false);
    }
  }, [onLoadingChange, clearMarkers]);

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
      center: [-46.6333, -23.5505], // São Paulo
      zoom: 3,
    });

    const nav = new maplibregl.NavigationControl();
    map.current.addControl(nav, 'top-right');

    map.current.on('moveend', debouncedFetch);
    map.current.on('zoomend', debouncedFetch);
    map.current.on('zoom', checkZoom);

    map.current.once('load', () => {
      checkZoom();
      fetchLocations();
    });

    return () => {
      map.current?.off('zoom', checkZoom);
      clearMarkers();
      map.current?.remove();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedFetch, clearMarkers, fetchLocations, checkZoom]);

  useEffect(() => {
    if (!map.current) return;

    clearMarkers();

    const newMarkers = locations.map((location) =>
      new maplibregl.Marker({ color: '#1E3A8A' })
        .setLngLat([location.lng, location.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 15 }).setHTML(
            `<div style="background:rgba(255,255,255,0.7);backdrop-filter:blur(12px);border-radius:0.75rem;padding:0.75rem;font-size:0.875rem;color:#1e293b;border:1px solid rgba(255,255,255,0.3)">
              <p style="font-weight:500;color:#1e3a5f;line-height:1.25">${
                location.location ?? 'Unknown location'
              }</p>
              <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
                <a href="${GOOGLE_STREET_VIEW_BASE_URL}${location.lat},${
                  location.lng
                }"
                   target="_blank"
                   style="text-align:center;color:white;background:#1e3a8a;border-radius:0.375rem;padding:0.25rem 0.75rem;text-decoration:none">
                  View in Street View
                </a>
                <a href="/guess/${location.id}"
                   style="text-align:center;color:white;background:#1e3a8a;border-radius:0.375rem;padding:0.25rem 0.75rem;text-decoration:none">
                  Show Guess Details
                </a>
              </div>
            </div>`,
          ),
        )
        .addTo(map.current!),
    );

    markers.current = newMarkers;
  }, [locations, clearMarkers]);

  return <div ref={mapContainer} className='w-full h-full' />;
}
