import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import * as turf from '@turf/turf';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ZoomToData = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds);
        }
    }, [bounds, map]);
    return null;
};

const FieldMap = ({ center, fields, crops = [], farmBoundary, onBoundaryCreate, editable = true }) => {
    const mapRef = useRef();

    const handleCreated = (e) => {
        const layer = e.layer;
        const geojson = layer.toGeoJSON();
        const coordinates = geojson.geometry.coordinates[0];

        // Calculate area using turf
        const polygon = turf.polygon([coordinates]);
        const area = turf.area(polygon) / 10000; // hectares

        if (onBoundaryCreate) {
            onBoundaryCreate({
                coordinates,
                area: area.toFixed(2)
            });
        }
    };

    // Convert fields boundary format for React-Leaflet
    const fieldPolygons = fields?.map(field => ({
        id: field.id,
        name: field.name,
        positions: field.boundary?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]) || [] // [lat, lng]
    })) || [];

    // Convert farm boundary if present
    const farmPolygon = farmBoundary && farmBoundary.coordinates ?
        farmBoundary.coordinates[0].map(coord => [coord[1], coord[0]]) : null;

    const allBounds = [
        ...fieldPolygons.flatMap(p => p.positions),
        ...(farmPolygon || [])
    ];

    return (
        <div className="glass-card" style={{ height: '500px', padding: '0', overflow: 'hidden' }}>
            <MapContainer
                center={center || [0, 0]}
                zoom={center ? 13 : 2}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    opacity={0.6}
                />

                <FeatureGroup>
                    {editable && (
                        <EditControl
                            position="topright"
                            onCreated={handleCreated}
                            draw={{
                                rectangle: false,
                                circle: false,
                                circlemarker: false,
                                marker: false,
                                polyline: false,
                                polygon: {
                                    allowIntersection: false,
                                    showArea: true,
                                    metric: true,
                                    shapeOptions: {
                                        color: 'var(--primary)'
                                    }
                                }
                            }}
                        />
                    )}

                    {/* Farm Boundary Highlight */}
                    {farmPolygon && (
                        <Polygon
                            positions={farmPolygon}
                            pathOptions={{
                                color: '#ff9800',
                                weight: 3,
                                dashArray: '10, 10',
                                fillOpacity: 0.1
                            }}
                        />
                    )}

                    {fieldPolygons.map(field => (
                        <Polygon
                            key={field.id}
                            positions={field.positions}
                            pathOptions={{ color: 'var(--primary)', fillOpacity: 0.1, weight: 1.5 }}
                        >
                        </Polygon>
                    ))}

                    {/* Crop Allocations Highlight */}
                    {crops?.filter(c => c.boundary).map(crop => (
                        <Polygon
                            key={crop.id}
                            positions={crop.boundary.coordinates[0].map(coord => [coord[1], coord[0]])}
                            pathOptions={{
                                color: '#ffc107',
                                fillColor: '#ffc107',
                                fillOpacity: 0.6,
                                weight: 2
                            }}
                        >
                            <L.Popup>
                                <div style={{ fontSize: '12px' }}>
                                    <strong>{crop.crop_type}</strong><br />
                                    {crop.variety}<br />
                                    Area: {crop.planted_area} ha
                                </div>
                            </L.Popup>
                        </Polygon>
                    ))}
                </FeatureGroup>

                {allBounds.length > 0 && <ZoomToData bounds={allBounds} />}
            </MapContainer>
        </div>
    );
};

export default FieldMap;
