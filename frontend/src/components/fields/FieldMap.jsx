import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, FeatureGroup, Polygon, CircleMarker, Polyline, Popup, Marker, useMap } from 'react-leaflet';
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
            try {
                map.fitBounds(bounds);
            } catch (e) {
                console.warn('Error fitting bounds:', e);
            }
        }
    }, [bounds, map]);
    return null;
};

const CROP_STYLES = {
    // Cereals
    maize: { color: '#FFD700', font: "'Arial Black', Gadget, sans-serif" },
    rice: { color: '#E0FFFF', font: "'Courier New', Courier, monospace" },
    sorghum: { color: '#FFA500', font: "Impact, Charcoal, sans-serif" },

    // Roots
    cassava: { color: '#D2B48C', font: "Georgia, serif" },
    yam: { color: '#8B4513', font: "Georgia, serif" },
    cocoyam: { color: '#BC8F8F', font: "Georgia, serif" },

    // Cash Crops
    cocoa: { color: '#8B4513', font: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
    coffee_robusta: { color: '#2E8B57', font: "'Times New Roman', Times, serif" },
    coffee_arabica: { color: '#3CB371', font: "'Times New Roman', Times, serif" },
    oil_palm: { color: '#556B2F', font: "'Bookman Old Style', serif" },

    // Fruits
    plantain: { color: '#9ACD32', font: "Verdana, Geneva, sans-serif" },
    banana: { color: '#FFF700', font: "Verdana, Geneva, sans-serif" },
    avocado: { color: '#556B2F', font: "Tahoma, Geneva, sans-serif" },
    pineapple: { color: '#FFEB3B', font: "'Trebuchet MS', sans-serif" },

    // Vegetables
    tomato: { color: '#FF6347', font: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif" },
    pepper: { color: '#FF4500', font: "Monaco, 'Lucida Console', monospace" },
    penja_pepper: { color: '#F5F5F5', font: "monospace" },

    default: { color: '#FFFFFF', font: "sans-serif" }
};

const getCropStyle = (cropType) => {
    if (!cropType) return CROP_STYLES.default;
    const type = cropType.toLowerCase();
    return CROP_STYLES[type] || Object.entries(CROP_STYLES).find(([key]) => type.includes(key))?.[1] || CROP_STYLES.default;
};

const PolygonLabel = ({ coordinates, label, cropType, color: overrideColor }) => {
    if (!coordinates || coordinates.length < 3) return null;
    try {
        const style = getCropStyle(cropType);
        const textColor = overrideColor || style.color;
        const fontFamily = style.font;

        const polygon = turf.polygon([coordinates]);
        const centroid = turf.centroid(polygon);
        const [lng, lat] = centroid.geometry.coordinates;

        const icon = L.divIcon({
            className: 'polygon-label',
            html: `<div style="color: ${textColor}; font-family: ${fontFamily}; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); white-space: nowrap; pointer-events: none; font-size: 14px; transform: translate(-50%, -50%); text-transform: uppercase; letter-spacing: 1px;">${label}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
        });

        return <Marker position={[lat, lng]} icon={icon} interactive={false} />;
    } catch (e) {
        return null;
    }
};

const FieldMap = ({ center, fields, crops = [], infrastructure = [], farmBoundary, manualCoordinates, onBoundaryCreate, editable = true, currentLabel }) => {
    const mapRef = useRef();
    const navigate = useNavigate();

    const handleCreated = (e) => {
        const layer = e.layer;
        const geojson = layer.toGeoJSON();
        const coordinates = geojson.geometry.coordinates[0];

        // Calculate area and perimeter using turf
        const polygon = turf.polygon([coordinates]);
        const area = turf.area(polygon) / 10000; // hectares
        const perimeter = turf.length(polygon, { units: 'meters' });

        if (onBoundaryCreate) {
            onBoundaryCreate({
                coordinates,
                area: area.toFixed(2),
                perimeter: perimeter.toFixed(2)
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
                                rectangle: {
                                    showArea: false, // Set to false to avoid ReferenceError: type is not defined
                                    shapeOptions: {
                                        color: 'var(--primary)'
                                    }
                                },
                                circle: false,
                                circlemarker: false,
                                marker: false,
                                polyline: false,
                                polygon: {
                                    allowIntersection: false,
                                    showArea: false, // Set to false to avoid ReferenceError: type is not defined
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
                    {crops?.filter(c => c?.boundary?.coordinates?.[0]).map(crop => (
                        <React.Fragment key={crop.id}>
                            <Polygon
                                positions={crop.boundary.coordinates[0].map(coord => [coord[1], coord[0]])}
                                pathOptions={{
                                    color: '#ffc107',
                                    fillColor: '#ffc107',
                                    fillOpacity: 0.6,
                                    weight: 2
                                }}
                            >
                                <Popup>
                                    <div style={{ fontSize: '13px', minWidth: '220px', padding: '5px' }}>
                                        <div style={{ borderBottom: '2px solid #ffc107', paddingBottom: '8px', marginBottom: '8px' }}>
                                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a365d' }}>{crop.crop_type}</div>
                                            <div style={{ fontSize: '12px', color: '#718096' }}>{crop.variety}</div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', backgroundColor: '#fffbe6', padding: '8px', borderRadius: '4px' }}>
                                            <span style={{ fontWeight: '600' }}>Surface Area:</span>
                                            <span style={{ color: '#b7791f', fontWeight: 'bold' }}>{crop.planted_area} ha</span>
                                        </div>

                                        <div style={{ fontWeight: '600', fontSize: '11px', color: '#4a5568', textTransform: 'uppercase', marginBottom: '5px' }}>
                                            Allocation Corners (lat, lng):
                                        </div>
                                        <div style={{
                                            backgroundColor: '#f7fafc',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            fontSize: '10.5px',
                                            maxHeight: '120px',
                                            overflowY: 'auto',
                                            fontFamily: 'monospace',
                                            lineHeight: '1.4',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            {crop.boundary.coordinates[0].map((c, i) => (
                                                <div key={i} style={{ borderBottom: i < crop.boundary.coordinates[0].length - 1 ? '1px solid #edf2f7' : 'none', padding: '2px 0' }}>
                                                    <span style={{ color: '#718096', marginRight: '5px' }}>{i + 1}.</span>
                                                    {c[1].toFixed(6)}, {c[0].toFixed(6)}
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => navigate(`/crops?view=details&id=${crop.id}`)}
                                                style={{
                                                    width: '100%',
                                                    padding: '6px',
                                                    backgroundColor: '#ffc107',
                                                    color: '#1a365d',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                View Full Timeline
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Polygon>
                            <PolygonLabel
                                coordinates={crop.boundary.coordinates[0]}
                                label={crop.crop_type}
                                cropType={crop.crop_type}
                            />
                        </React.Fragment>
                    ))}

                    {/* Infrastructure Highlight */}
                    {infrastructure?.filter(i => i?.boundary?.coordinates?.[0]).map(infra => (
                        <Polygon
                            key={infra.id}
                            positions={infra.boundary.coordinates[0].map(coord => [coord[1], coord[0]])}
                            pathOptions={{
                                color: '#2196f3',
                                fillColor: '#2196f3',
                                fillOpacity: 0.5,
                                weight: 2
                            }}
                        >
                            <Popup>
                                <div style={{ fontSize: '13px', minWidth: '220px', padding: '5px' }}>
                                    <div style={{ borderBottom: '2px solid #2196f3', paddingBottom: '8px', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a365d' }}>{infra.name}</div>
                                        <div style={{ fontSize: '12px', color: '#718096' }}>{infra.type}</div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', backgroundColor: '#ebf8ff', padding: '8px', borderRadius: '4px' }}>
                                        <span style={{ fontWeight: '600' }}>Surface Area:</span>
                                        <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>{infra.area_sqm} m²</span>
                                    </div>

                                    <div style={{ fontWeight: '600', fontSize: '11px', color: '#4a5568', textTransform: 'uppercase', marginBottom: '5px' }}>
                                        Infrastructure Corners (lat, lng):
                                    </div>
                                    <div style={{
                                        backgroundColor: '#f7fafc',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        fontSize: '10.5px',
                                        maxHeight: '120px',
                                        overflowY: 'auto',
                                        fontFamily: 'monospace',
                                        lineHeight: '1.4',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        {infra.boundary.coordinates[0].map((c, i) => (
                                            <div key={i} style={{ borderBottom: i < infra.boundary.coordinates[0].length - 1 ? '1px solid #edf2f7' : 'none', padding: '2px 0' }}>
                                                <span style={{ color: '#718096', marginRight: '5px' }}>{i + 1}.</span>
                                                {c[1].toFixed(6)}, {c[0].toFixed(6)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Popup>
                        </Polygon>
                    ))}

                    {/* Manual Entry Highlight */}
                    {manualCoordinates?.length > 0 && (
                        <>
                            {manualCoordinates.filter(c => c && c.length >= 2).map((coord, idx) => (
                                <CircleMarker
                                    key={`manual-point-${idx}`}
                                    center={[coord[1], coord[0]]}
                                    pathOptions={{ color: '#f44336', fillColor: '#f44336', fillOpacity: 1 }}
                                    radius={4}
                                />
                            ))}
                            {manualCoordinates.length === 2 && manualCoordinates.every(c => c && c.length >= 2) && (
                                <Polyline
                                    positions={manualCoordinates.map(coord => [coord[1], coord[0]])}
                                    pathOptions={{ color: '#f44336', weight: 2, dashArray: '5, 5' }}
                                />
                            )}
                            {manualCoordinates.length >= 3 && manualCoordinates.every(c => c && c.length >= 2) && (
                                <Polygon
                                    positions={manualCoordinates.map(coord => [coord[1], coord[0]])}
                                    pathOptions={{ color: '#f44336', weight: 2, dashArray: '5, 5', fillOpacity: 0.2 }}
                                />
                            )}
                            {manualCoordinates.length >= 3 && currentLabel && (
                                <PolygonLabel
                                    coordinates={manualCoordinates}
                                    label={currentLabel}
                                    cropType={currentLabel}
                                />
                            )}
                        </>
                    )}
                </FeatureGroup>

                {(() => {
                    // Priority: Manual coordinates currently being entered
                    if (manualCoordinates?.length > 0) {
                        const validCoords = manualCoordinates.filter(c => c && c.length >= 2).map(coord => [coord[1], coord[0]]);
                        if (validCoords.length > 0) {
                            return <ZoomToData bounds={validCoords} />;
                        }
                    }
                    const allB = [
                        ...fieldPolygons.flatMap(p => p.positions),
                        ...(farmPolygon || [])
                    ];
                    return allB.length > 0 ? <ZoomToData bounds={allB} /> : null;
                })()}
            </MapContainer>
        </div>
    );
};

export default FieldMap;
