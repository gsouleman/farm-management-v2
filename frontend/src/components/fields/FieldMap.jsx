import React, { useEffect, useRef, useState } from 'react';
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
    // Cereals - Vibrant & Strong
    maize: { color: '#FFEA00', font: "'Arial Black', sans-serif" }, // Electric Yellow
    rice: { color: '#00E5FF', font: "'Impact', sans-serif" }, // Aqua
    sorghum: { color: '#FF3D00', font: "'Impact', sans-serif" }, // Red-Orange

    // Roots - Earthy but distinctive
    cassava: { color: '#C6FF00', font: "'Arial Black', sans-serif" }, // Lime Yellow
    yam: { color: '#E040FB', font: "'Georgia', serif" }, // Bright Purple
    cocoyam: { color: '#FF4081', font: "'Georgia', serif" }, // Pink-Red

    // Cash Crops - Elegant but high contrast
    cocoa: { color: '#8D6E63', font: "'Verdana', sans-serif" }, // Lighter Brown
    coffee_robusta: { color: '#00E676', font: "'Verdana', sans-serif" }, // Spring Green
    coffee_arabica: { color: '#1DE9B6', font: "'Verdana', sans-serif" }, // Teal
    oil_palm: { color: '#76FF03', font: "'Verdana', sans-serif" }, // Brightest Lime

    // Fruits - Fruit colors
    plantain: { color: '#FFEE58', font: "'Arial Black', sans-serif" }, // Banana Yellow
    banana: { color: '#FFF176', font: "'Arial Black', sans-serif" },
    avocado: { color: '#64DD17', font: "'Impact', sans-serif" }, // Deep Lime
    pineapple: { color: '#FFAB00', font: "'Impact', sans-serif" }, // Amber

    // Vegetables
    tomato: { color: '#FF1744', font: "'Arial Black', sans-serif" }, // Bright Red
    pepper: { color: '#FF6D00', font: "'Arial Black', sans-serif" }, // Deep Orange
    penja_pepper: { color: '#FFFFFF', font: "'Courier New', monospace" }, // Stark White

    default: { color: '#FFFFFF', font: "sans-serif" }
};

const getCropStyle = (cropType) => {
    if (!cropType) return CROP_STYLES.default;
    const type = cropType.toLowerCase();
    return CROP_STYLES[type] || Object.entries(CROP_STYLES).find(([key]) => type.includes(key))?.[1] || CROP_STYLES.default;
};

const PolygonLabel = ({ coordinates, label, cropType }) => {
    if (!coordinates || coordinates.length < 3) return null;
    try {
        const style = getCropStyle(cropType);
        const textColor = '#FFFFFF'; // Force Bold White as requested
        const fontFamily = style.font;

        const polygon = turf.polygon([coordinates]);
        const centroid = turf.centroid(polygon);
        const [lng, lat] = centroid.geometry.coordinates;

        const icon = L.divIcon({
            className: 'polygon-label',
            html: `<div style="
                color: ${textColor}; 
                font-family: ${fontFamily}; 
                font-weight: 900; 
                text-shadow: 
                    -1.5px -1.5px 0 #000,  
                     1.5px -1.5px 0 #000,
                    -1.5px  1.5px 0 #000,
                     1.5px  1.5px 0 #000,
                     2px 2px 4px rgba(0,0,0,0.8);
                white-space: nowrap; 
                pointer-events: none; 
                font-size: 16px; 
                transform: translate(-50%, -50%); 
                text-transform: uppercase; 
                letter-spacing: 1.5px;
            ">${label}</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
        });

        return <Marker position={[lat, lng]} icon={icon} interactive={false} />;
    } catch (e) {
        return null;
    }
};

const FieldMap = ({ center, fields, crops = [], infrastructure = [], farms = [], manualCoordinates, onBoundaryCreate, editable = true, currentLabel }) => {
    const mapRef = useRef();
    const containerRef = useRef();
    const navigate = useNavigate();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            // Invalidate map size after fullscreen change to ensure proper rendering
            if (mapRef.current) {
                setTimeout(() => {
                    mapRef.current.invalidateSize();
                }, 100);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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

    // Convert fields boundary format
    const fieldPolygons = fields?.map(field => ({
        id: field.id,
        name: field.name,
        positions: field.boundary?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]) || []
    })) || [];

    // Process all farms for visualization
    const farmPolygons = farms?.filter(f => f.boundary && f.boundary.coordinates).map(f => ({
        id: f.id,
        name: f.name,
        positions: f.boundary.coordinates[0].map(coord => [coord[1], coord[0]]),
        rawCoords: f.boundary.coordinates[0]
    })) || [];


    return (
        <div
            ref={containerRef}
            className={isFullscreen ? "" : "glass-card"}
            style={{
                height: isFullscreen ? '100vh' : '500px',
                padding: '0',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Fullscreen Toggle Button */}
            <button
                onClick={toggleFullscreen}
                type="button"
                title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 1000,
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'white',
                    color: '#000',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s'
                }}
            >
                {isFullscreen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />
                    </svg>
                )}
            </button>

            <MapContainer
                center={center || [0, 0]}
                zoom={center ? 13 : 2}
                style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                ref={mapRef}
                attributionControl={false}
            >
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
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
                                    showArea: false,
                                    metric: true,
                                    shapeOptions: {
                                        color: 'var(--primary)'
                                    }
                                }
                            }}
                        />
                    )}

                    {/* Render ALL Farm Boundaries */}
                    {farmPolygons.map(farm => (
                        <React.Fragment key={farm.id}>
                            <Polygon
                                positions={farm.positions}
                                pathOptions={{
                                    color: '#ff9800', // Orange for Farm Boundary
                                    weight: 4,
                                    dashArray: '10, 10',
                                    fillOpacity: 0.1,
                                    fillColor: '#ff9800'
                                }}
                            >
                                <Popup>{farm.name} Boundary</Popup>
                            </Polygon>
                            {/* Farm Name Label */}
                            <PolygonLabel
                                coordinates={farm.rawCoords}
                                label={farm.name}
                                cropType="infrastructure" // Use strong font
                            />
                        </React.Fragment>
                    ))}

                    {fieldPolygons.map(field => (
                        <Polygon
                            key={field.id}
                            positions={field.positions}
                            pathOptions={{ color: 'var(--primary)', fillOpacity: 0.1, weight: 1.5 }}
                        >
                        </Polygon>
                    ))}

                    {/* Crop Allocations Highlight */}
                    {crops?.filter(c => c?.boundary?.coordinates?.[0]).map(crop => {
                        const style = getCropStyle(crop.crop_type);
                        return (
                            <React.Fragment key={crop.id}>
                                <Polygon
                                    positions={crop.boundary.coordinates[0].map(coord => [coord[1], coord[0]])}
                                    pathOptions={{
                                        color: style.color,
                                        fillColor: style.color,
                                        fillOpacity: 0.5,
                                        weight: 2
                                    }}
                                >
                                    <Popup>
                                        <div style={{ fontSize: '13px', minWidth: '220px', padding: '5px' }}>
                                            <div style={{ borderBottom: `2px solid ${style.color}`, paddingBottom: '8px', marginBottom: '8px' }}>
                                                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a365d' }}>{crop.crop_type}</div>
                                                <div style={{ fontSize: '12px', color: '#718096' }}>{crop.variety}</div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', backgroundColor: '#fffbe6', padding: '8px', borderRadius: '4px' }}>
                                                <span style={{ fontWeight: '600' }}>Surface Area:</span>
                                                <span style={{ color: '#b7791f', fontWeight: 'bold' }}>{crop.planted_area} ha</span>
                                            </div>

                                            <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => navigate(`/crops?view=details&id=${crop.id}`)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px',
                                                        backgroundColor: style.color,
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
                        );
                    })}

                    {/* Infrastructure Highlight */}
                    {infrastructure?.filter(i => i?.boundary?.coordinates?.[0]).map(infra => (
                        <React.Fragment key={infra.id}>
                            <Polygon
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
                                    </div>
                                </Popup>
                            </Polygon>
                            <PolygonLabel
                                coordinates={infra.boundary.coordinates[0]}
                                label={infra.name}
                                cropType="infrastructure"
                            />
                        </React.Fragment>
                    ))}

                    {/* Manual Entry Highlight */}
                    {manualCoordinates?.length > 0 && (() => {
                        const style = getCropStyle(currentLabel);
                        return (
                            <>
                                {manualCoordinates.filter(c => c && c.length >= 2).map((coord, idx) => (
                                    <CircleMarker
                                        key={`manual-point-${idx}`}
                                        center={[coord[1], coord[0]]}
                                        pathOptions={{ color: style.color, fillColor: style.color, fillOpacity: 1 }}
                                        radius={4}
                                    />
                                ))}
                                {manualCoordinates.length === 2 && manualCoordinates.every(c => c && c.length >= 2) && (
                                    <Polyline
                                        positions={manualCoordinates.map(coord => [coord[1], coord[0]])}
                                        pathOptions={{ color: style.color, weight: 2, dashArray: '5, 5' }}
                                    />
                                )}
                                {manualCoordinates.length >= 3 && manualCoordinates.every(c => c && c.length >= 2) && (
                                    <Polygon
                                        positions={manualCoordinates.map(coord => [coord[1], coord[0]])}
                                        pathOptions={{ color: style.color, weight: 2, dashArray: '5, 5', fillOpacity: 0.3 }}
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
                        );
                    })()}
                </FeatureGroup>

                {(() => {
                    // Priority: Manual coordinates currently being entered
                    if (manualCoordinates?.length > 0) {
                        const validCoords = manualCoordinates.filter(c => c && c.length >= 2).map(coord => [coord[1], coord[0]]);
                        if (validCoords.length > 0) {
                            return <ZoomToData bounds={validCoords} />;
                        }
                    }
                    // Zoom to ALL farms and fields
                    const allB = [
                        ...(farmPolygons.flatMap(p => p.positions)),
                        ...(fieldPolygons.flatMap(p => p.positions))
                    ];
                    return allB.length > 0 ? <ZoomToData bounds={allB} /> : null;
                })()}
            </MapContainer>
        </div>
    );
};

export default FieldMap;
