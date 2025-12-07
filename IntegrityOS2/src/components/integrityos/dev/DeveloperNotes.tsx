import { Code, Map, Database, Cpu, Globe, FileCode } from 'lucide-react';

export function DeveloperNotes() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2 flex items-center gap-2">
            <Code className="w-8 h-8" />
            Developer Implementation Notes
          </h1>
          <p className="text-slate-600">
            Technical documentation for IntegrityOS platform implementation
          </p>
        </div>

        {/* React + Leaflet Architecture */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-900 mb-4 flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-600" />
            React + Leaflet Implementation Notes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-slate-900 mb-2">Technology Stack</h3>
              <ul className="text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  <strong>React 18+</strong> with TypeScript for type safety
                </li>
                <li>
                  <strong>React-Leaflet</strong> or <strong>MapLibre GL JS</strong>{' '}
                  for map rendering
                </li>
                <li>
                  <strong>deck.gl HeatmapLayer</strong> for WebGL-accelerated
                  heatmap visualization
                </li>
                <li>
                  <strong>Supercluster</strong> for efficient marker clustering
                  (10,000+ points)
                </li>
                <li>
                  <strong>React Query</strong> for data fetching and caching
                </li>
                <li>
                  <strong>Zustand</strong> or <strong>Redux Toolkit</strong> for
                  state management
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-slate-900 mb-2">Map Optimization Techniques</h3>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                <li>Viewport-only rendering (only render visible markers)</li>
                <li>WebGL clustering with Supercluster for performance</li>
                <li>Debounced zoom/pan handlers to prevent excessive re-renders</li>
                <li>Canvas-based marker rendering for large datasets</li>
                <li>Marker anchor point stabilization to prevent drift on zoom</li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-900 mb-2">Code Example: Marker Clustering</h3>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                {`import Supercluster from 'supercluster';

const cluster = new Supercluster({
  radius: 40,
  maxZoom: 16,
});

cluster.load(points.map(p => ({
  type: 'Feature',
  properties: { ...p },
  geometry: {
    type: 'Point',
    coordinates: [p.lng, p.lat]
  }
})));

const clusters = cluster.getClusters(
  [west, south, east, north],
  zoom
);`}
              </pre>
            </div>
          </div>
        </div>

        {/* GeoJSON Integration */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-green-600" />
            kz_1.json Layer Integration
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-slate-900 mb-2">
                ⚠️ Important: Kazakhstan Boundary Layer
              </p>
              <p className="text-slate-600">
                The kz_1.json file is NOT stored inside this Figma design. It will
                be loaded manually in the React/Leaflet code at runtime. This file
                contains the GeoJSON boundary data for Kazakhstan regions.
              </p>
            </div>

            <div>
              <h3 className="text-slate-900 mb-2">Visual Placeholder</h3>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                <svg
                  className="w-32 h-32 mx-auto mb-4 text-blue-400"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M 10,30 Q 30,10 50,30 T 90,30 L 85,70 Q 70,85 50,70 T 15,70 Z" />
                </svg>
                <p className="text-slate-600">
                  Kazakhstan Boundary Placeholder
                  <br />
                  <span className="text-slate-500">
                    (Actual GeoJSON loaded from kz_1.json)
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-slate-900 mb-2">
                Loading GeoJSON in React/Leaflet
              </h3>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                {`import { GeoJSON } from 'react-leaflet';
import kazakhstanBoundary from './data/kz_1.json';

function MapComponent() {
  const onEachRegion = (feature, layer) => {
    layer.on('click', () => {
      // Show region summary panel
      setSelectedRegion(feature.properties);
    });
  };

  return (
    <MapContainer>
      <GeoJSON
        data={kazakhstanBoundary}
        style={{
          color: '#3b82f6',
          weight: 2,
          fillOpacity: 0.1
        }}
        onEachFeature={onEachRegion}
      />
    </MapContainer>
  );
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-slate-900 mb-2">Region Click Handler</h3>
              <p className="text-slate-600 mb-2">
                When a user clicks on a region boundary:
              </p>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                <li>Extract region properties from GeoJSON feature</li>
                <li>Query backend for aggregated defect data in that region</li>
                <li>Display RegionSummaryPanel with statistics</li>
                <li>Show sensor readings for monitoring stations in the region</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" />
            API Endpoints Documentation
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-slate-900 mb-2">Authentication</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">POST /auth/login</code>
                  <p className="text-slate-600 mt-1">
                    Payload: {'{'}email, password{'}'}
                    <br />
                    Response: {'{'}token, user{'}'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">POST /auth/register</code>
                  <p className="text-slate-600 mt-1">
                    Payload: {'{'}name, email, password{'}'}
                    <br />
                    Response: {'{'}success, message{'}'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">POST /auth/forgot-password</code>
                  <p className="text-slate-600 mt-1">
                    Payload: {'{'}email{'}'}
                    <br />
                    Response: {'{'}success, message{'}'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-slate-900 mb-2">Map Data</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">
                    GET /map/defects?bbox=west,south,east,north&zoom=10
                  </code>
                  <p className="text-slate-600 mt-1">
                    Returns defects within viewport bounds
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">GET /map/pipelines</code>
                  <p className="text-slate-600 mt-1">
                    Returns all pipeline polyline coordinates
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">
                    GET /map/regions/:regionId/summary
                  </code>
                  <p className="text-slate-600 mt-1">
                    Returns aggregated statistics for a region
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-slate-900 mb-2">AI/ML Endpoints</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">POST /ml/predict</code>
                  <p className="text-slate-600 mt-1">
                    Run ML model for defect risk prediction
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">GET /ml/explain/:defectId</code>
                  <p className="text-slate-600 mt-1">
                    Get feature importance for AI prediction
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-blue-600">
                    GET /ml/history/:defectId
                  </code>
                  <p className="text-slate-600 mt-1">
                    Get probability timeline for defect
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-900 mb-4 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-orange-600" />
            Performance Recommendations
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-slate-900 mb-1">✓ Use WebWorkers</p>
              <p className="text-slate-600">
                Process clustering calculations in a Web Worker to avoid blocking
                the main thread
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-slate-900 mb-1">✓ Implement Virtual Scrolling</p>
              <p className="text-slate-600">
                Use react-window or react-virtualized for large data tables
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-slate-900 mb-1">✓ Lazy Load Routes</p>
              <p className="text-slate-600">
                Use React.lazy() and Suspense for code-splitting by route
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-slate-900 mb-1">✓ Cache API Responses</p>
              <p className="text-slate-600">
                Implement proper caching strategy with React Query or SWR
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-slate-900 mb-1">✓ Optimize Re-renders</p>
              <p className="text-slate-600">
                Use React.memo, useMemo, and useCallback to prevent unnecessary
                re-renders
              </p>
            </div>
          </div>
        </div>

        {/* Deployment Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-900 mb-4 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-indigo-600" />
            Deployment Checklist
          </h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">
                Configure environment variables (API_URL, MAP_TOKEN)
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">
                Set up CORS policies for backend API
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">
                Load kz_1.json GeoJSON file into /public/data/
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">
                Configure CDN for static assets and map tiles
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">
                Set up monitoring and error tracking (Sentry, LogRocket)
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">
                Enable HTTPS and configure SSL certificates
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">
                Test map performance with 10,000+ markers
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
