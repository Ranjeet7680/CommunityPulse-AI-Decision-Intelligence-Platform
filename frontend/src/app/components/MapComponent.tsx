"use client";

import React, { useEffect, useRef } from 'react';

export default function MapComponent({ layer }: { layer: 'traffic' | 'flood' | 'aqi' }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const layersRef = useRef<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Add CSS CDN
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add JS CDN
    const jsId = 'leaflet-js';
    let script = document.getElementById(jsId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = jsId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current || leafletMapRef.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([23.7957, 86.4304], 12); // Dhanbad Center

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      leafletMapRef.current = map;
      updateLayers();
    };

    const updateLayers = () => {
      const L = (window as any).L;
      const map = leafletMapRef.current;
      if (!L || !map) return;

      layersRef.current.forEach(l => l.remove());
      layersRef.current = [];

      if (layer === 'traffic') {
        const roads = [
          { coords: [[23.3441, 85.3096], [23.36, 85.33], [23.38, 85.37]], color: '#EA4335', name: 'NH-33 (Heavy Traffic)' },
          { coords: [[23.3441, 85.3096], [23.32, 85.28]], color: '#34A853', name: 'Kanke Road (Normal)' },
          { coords: [[23.7957, 86.4304], [23.82, 86.45]], color: '#FBBC04', name: 'NH-18 (Moderate)' }
        ];
        roads.forEach(r => {
          const pl = L.polyline(r.coords, { color: r.color, weight: 6, opacity: 0.8 });
          pl.bindPopup(`<b>${r.name}</b>`);
          pl.addTo(map);
          layersRef.current.push(pl);
        });
      } else if (layer === 'aqi') {
        const aqis = [
          { name: 'Ranchi AQI Station', coords: [23.3441, 85.3096], aqi: 184, color: '#EA4335' },
          { name: 'Dhanbad Industrial Zone', coords: [23.7957, 86.4304], aqi: 147, color: '#FBBC04' }
        ];
        aqis.forEach(a => {
          const circle = L.circle(a.coords, {
            color: a.color,
            fillColor: a.color,
            fillOpacity: 0.35,
            radius: 4000
          });
          circle.bindPopup(`<b>${a.name}</b><br/>AQI: <b>${a.aqi}</b>`);
          circle.addTo(map);
          layersRef.current.push(circle);
        });
      } else if (layer === 'flood') {
        const floods = [
          { name: 'Damodar River Basin Plain', coords: [23.63, 86.35], color: '#4285F4' }
        ];
        floods.forEach(f => {
          const circle = L.circle(f.coords, {
            color: f.color,
            fillColor: f.color,
            fillOpacity: 0.4,
            radius: 5500
          });
          circle.bindPopup(`<b>${f.name}</b>`);
          circle.addTo(map);
          layersRef.current.push(circle);
        });
      }

      // Add alert markers
      const alerts = [
        { id: '1', title: 'Flood Warning (High)', coords: [23.63, 86.35] },
        { id: '2', title: 'Traffic Congestion', coords: [23.82, 86.45] }
      ];
      alerts.forEach(a => {
        const marker = L.circleMarker(a.coords, {
          color: '#EA4335',
          fillColor: '#EA4335',
          fillOpacity: 0.9,
          radius: 8
        }).addTo(map);
        marker.bindPopup(`<b>🚨 Alert: ${a.title}</b>`);
        layersRef.current.push(marker);
      });
    };

    if ((window as any).L) {
      initMap();
    } else {
      script.addEventListener('load', initMap);
    }

    return () => {
      script.removeEventListener('load', initMap);
    };
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map) return;

    layersRef.current.forEach(l => l.remove());
    layersRef.current = [];

    if (layer === 'traffic') {
      const roads = [
        { coords: [[23.3441, 85.3096], [23.36, 85.33], [23.38, 85.37]], color: '#EA4335', name: 'NH-33 (Heavy Traffic)' },
        { coords: [[23.3441, 85.3096], [23.32, 85.28]], color: '#34A853', name: 'Kanke Road (Normal)' },
        { coords: [[23.7957, 86.4304], [23.82, 86.45]], color: '#FBBC04', name: 'NH-18 (Moderate)' }
      ];
      roads.forEach(r => {
        const pl = L.polyline(r.coords, { color: r.color, weight: 6, opacity: 0.8 });
        pl.bindPopup(`<b>${r.name}</b>`);
        pl.addTo(map);
        layersRef.current.push(pl);
      });
    } else if (layer === 'aqi') {
      const aqis = [
        { name: 'Ranchi AQI Station', coords: [23.3441, 85.3096], aqi: 184, color: '#EA4335' },
        { name: 'Dhanbad Industrial Zone', coords: [23.7957, 86.4304], aqi: 147, color: '#FBBC04' }
      ];
      aqis.forEach(a => {
        const circle = L.circle(a.coords, {
          color: a.color,
          fillColor: a.color,
          fillOpacity: 0.35,
          radius: 4000
        });
        circle.bindPopup(`<b>${a.name}</b><br/>AQI: <b>${a.aqi}</b>`);
        circle.addTo(map);
        layersRef.current.push(circle);
      });
    } else if (layer === 'flood') {
      const floods = [
        { name: 'Damodar River Basin Plain', coords: [23.63, 86.35], color: '#4285F4' }
      ];
      floods.forEach(f => {
        const circle = L.circle(f.coords, {
          color: f.color,
          fillColor: f.color,
          fillOpacity: 0.4,
          radius: 5500
        });
        circle.bindPopup(`<b>${f.name}</b>`);
        circle.addTo(map);
        layersRef.current.push(circle);
      });
    }

    const alerts = [
      { id: '1', title: 'Flood Warning (High)', coords: [23.63, 86.35] },
      { id: '2', title: 'Traffic Congestion', coords: [23.82, 86.45] }
    ];
    alerts.forEach(a => {
      const marker = L.circleMarker(a.coords, {
        color: '#EA4335',
        fillColor: '#EA4335',
        fillOpacity: 0.9,
        radius: 8
      }).addTo(map);
      marker.bindPopup(`<b>🚨 Alert: ${a.title}</b>`);
      layersRef.current.push(marker);
    });
  }, [layer]);

  return <div ref={mapRef} className="w-full h-full min-h-[384px] bg-[#0b1329] z-0" />;
}
