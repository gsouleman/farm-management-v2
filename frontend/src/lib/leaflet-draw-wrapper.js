import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-draw/dist/leaflet.draw.css';

// leaflet-draw attaches to L. We export L as the default export 
// to satisfy react-leaflet-draw's "import L from 'leaflet-draw'"
export default L;
