import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mundialSupabase } from './mundialSupabaseClient';

/**
 * Componente que centra el mapa automáticamente según los datos
 */
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center, map]);
  return null;
};

export const LeadsHeatmap: React.FC = () => {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const loadPoints = async () => {
      const { data } = await mundialSupabase
        .from('mundial_users')
        .select('latitude, longitude, team_alias, detected_building')
        .not('latitude', 'is', null);
      
      if (data) setPoints(data);
    };
    loadPoints();
  }, []);

  // Centro por defecto: Puerto Madero
  const defaultCenter: [number, number] = [-34.6118, -58.3615];

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-purple-500/30 bg-black/20">
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <MapController center={defaultCenter} />
        
        {points.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.latitude, p.longitude]}
            pathOptions={{ 
              fillColor: '#a855f7', // Color púrpura de Hermes
              color: '#d8b4fe',
              fillOpacity: 0.6,
              weight: 1
            }}
            radius={8}
          >
            <Popup className="text-black">
              <div className="font-bold">{p.team_alias}</div>
              <div className="text-xs">{p.detected_building}</div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};