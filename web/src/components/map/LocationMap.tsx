import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}

function createMarkerElement(pinColor: string, textColor: string, label: string) {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer';

  container.innerHTML = `
    <svg width="24" height="36" viewBox="0 0 24 36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${pinColor}"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>
    <span style="font-size:0.5rem;font-weight:600;color:${textColor};text-transform:uppercase;letter-spacing:0.03em;margin-top:1px;opacity:0.7">${label}</span>
  `;

  return container;
}

function buildMarkerPopupHTML(label: string, accentColor: string, locationName: string) {
  const dark = isDarkMode();
  const bg = dark ? 'rgba(15,30,55,0.85)' : 'rgba(255,255,255,0.85)';
  const border = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const text = dark ? '#e2e8f0' : '#1e293b';

  return `<div style="background:${bg};backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:0.75rem;padding:0.75rem;font-size:0.875rem;color:${text};border:1px solid ${border};max-width:260px">
    <div style="display:flex;align-items:center;gap:0.375rem;margin:0 0 0.25rem 0">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${accentColor};flex-shrink:0"></span>
      <span style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.025em">${label}</span>
    </div>
    <p style="font-weight:500;line-height:1.3;margin:0">${locationName}</p>
  </div>`;
}

interface LocationMapProps {
  readonly guessLat: number;
  readonly guessLng: number;
  readonly actualLat: number;
  readonly actualLng: number;
  readonly guessLocation?: string | null;
  readonly actualLocation?: string | null;
  readonly className?: string;
}

export function LocationMap({
  guessLat,
  guessLng,
  actualLat,
  actualLng,
  guessLocation = 'Guess',
  actualLocation = 'Actual location',
  className = 'w-full h-96',
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

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
      center: [(guessLng + actualLng) / 2, (guessLat + actualLat) / 2],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
    });

    const nav = new maplibregl.NavigationControl();
    map.current.addControl(nav, 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      const guessEl = createMarkerElement('#8A2BE2', '#5B1A99', 'Guess');
      const actualEl = createMarkerElement('#10B981', '#0A7B5C', 'Actual Location');

      const guessMarker = new maplibregl.Marker({ element: guessEl })
        .setLngLat([guessLng, guessLat])
        .addTo(map.current);

      const actualMarker = new maplibregl.Marker({ element: actualEl })
        .setLngLat([actualLng, actualLat])
        .addTo(map.current);

      const guessPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        offset: 24,
      }).setHTML(
        buildMarkerPopupHTML('Guess', '#8A2BE2', guessLocation ?? 'Unknown'),
      );

      const actualPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        offset: 24,
      }).setHTML(
        buildMarkerPopupHTML('Actual Location', '#10B981', actualLocation ?? 'Unknown'),
      );

      function bindMarkerInteraction(
        marker: maplibregl.Marker,
        popup: maplibregl.Popup,
        lngLat: [number, number],
        otherPopup: maplibregl.Popup,
      ) {
        const el = marker.getElement();
        el.addEventListener('mouseenter', () => {
          popup.setLngLat(lngLat).addTo(map.current!);
        });
        el.addEventListener('mouseleave', () => {
          popup.remove();
        });
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          otherPopup.remove();
          if (popup.isOpen()) {
            popup.remove();
          } else {
            popup.setLngLat(lngLat).addTo(map.current!);
          }
        });
      }

      bindMarkerInteraction(guessMarker, guessPopup, [guessLng, guessLat], actualPopup);
      bindMarkerInteraction(actualMarker, actualPopup, [actualLng, actualLat], guessPopup);

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [guessLng, guessLat],
              [actualLng, actualLat],
            ],
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#6B7280',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      const bounds = new maplibregl.LngLatBounds()
        .extend([guessLng, guessLat])
        .extend([actualLng, actualLat]);

      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 10,
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [guessLat, guessLng, actualLat, actualLng, guessLocation, actualLocation]);

  return <div ref={mapContainer} className={className} />;
}
