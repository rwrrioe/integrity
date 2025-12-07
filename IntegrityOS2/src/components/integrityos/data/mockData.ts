import { LatLngExpression } from 'leaflet';

export interface Defect {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  method: string;
  coordinates: LatLngExpression;
  date: string;
  pipelineId: string;
  param1: number;
  param2: number;
  param3: number;
}

export interface Pipeline {
  id: string;
  name: string;
  length: number;
  status: 'active' | 'inactive' | 'maintenance';
  coordinates: LatLngExpression[];
  material: string;
  diameter: number;
  installDate: string;
}

export interface InfraObject {
  id: string;
  name: string;
  type: string;
  coordinates: LatLngExpression;
  status: 'operational' | 'maintenance' | 'offline';
  pipelineId: string;
}

export const mockDefects: Defect[] = [
  {
    id: 'DEF-001',
    type: 'Corrosion',
    severity: 'critical',
    method: 'ILI',
    coordinates: [48.7194, 67.7094],
    date: '2024-11-15',
    pipelineId: 'PL-001',
    param1: 8.5,
    param2: 42.3,
    param3: 0.85,
  },
  {
    id: 'DEF-002',
    type: 'Crack',
    severity: 'high',
    method: 'UT',
    coordinates: [49.8047, 73.1094],
    date: '2024-11-20',
    pipelineId: 'PL-001',
    param1: 6.2,
    param2: 38.7,
    param3: 0.72,
  },
  {
    id: 'DEF-003',
    type: 'Wall Thinning',
    severity: 'medium',
    method: 'RT',
    coordinates: [47.2286, 65.1772],
    date: '2024-11-18',
    pipelineId: 'PL-002',
    param1: 4.8,
    param2: 35.2,
    param3: 0.58,
  },
  {
    id: 'DEF-004',
    type: 'Dent',
    severity: 'medium',
    method: 'VT',
    coordinates: [50.2839, 57.1674],
    date: '2024-11-22',
    pipelineId: 'PL-002',
    param1: 3.9,
    param2: 28.4,
    param3: 0.45,
  },
  {
    id: 'DEF-005',
    type: 'Weld Defect',
    severity: 'high',
    method: 'ILI',
    coordinates: [46.9475, 71.9836],
    date: '2024-11-25',
    pipelineId: 'PL-003',
    param1: 7.3,
    param2: 41.1,
    param3: 0.79,
  },
  {
    id: 'DEF-006',
    type: 'Corrosion',
    severity: 'low',
    method: 'UT',
    coordinates: [48.5132, 69.1897],
    date: '2024-11-28',
    pipelineId: 'PL-001',
    param1: 2.1,
    param2: 22.8,
    param3: 0.32,
  },
  {
    id: 'DEF-007',
    type: 'Crack',
    severity: 'critical',
    method: 'RT',
    coordinates: [49.1542, 66.5267],
    date: '2024-12-01',
    pipelineId: 'PL-002',
    param1: 9.2,
    param2: 45.6,
    param3: 0.91,
  },
  {
    id: 'DEF-008',
    type: 'Lamination',
    severity: 'medium',
    method: 'ILI',
    coordinates: [47.8954, 68.3421],
    date: '2024-12-03',
    pipelineId: 'PL-003',
    param1: 5.4,
    param2: 33.9,
    param3: 0.62,
  },
];

export const mockPipelines: Pipeline[] = [
  {
    id: 'PL-001',
    name: 'Main Gas Pipeline A',
    length: 450,
    status: 'active',
    coordinates: [
      [48.0196, 66.9237],
      [48.7194, 67.7094],
      [49.8047, 73.1094],
    ],
    material: 'Steel',
    diameter: 1420,
    installDate: '2015-06-12',
  },
  {
    id: 'PL-002',
    name: 'Oil Transport Line B',
    length: 380,
    status: 'active',
    coordinates: [
      [47.2286, 65.1772],
      [48.0196, 66.9237],
      [50.2839, 57.1674],
    ],
    material: 'Steel',
    diameter: 1220,
    installDate: '2018-03-22',
  },
  {
    id: 'PL-003',
    name: 'Water Supply Network C',
    length: 290,
    status: 'maintenance',
    coordinates: [
      [46.9475, 71.9836],
      [48.0196, 66.9237],
      [47.8954, 68.3421],
    ],
    material: 'Composite',
    diameter: 820,
    installDate: '2020-09-15',
  },
];

export const mockObjects: InfraObject[] = [
  {
    id: 'OBJ-001',
    name: 'Compressor Station Alpha',
    type: 'Compressor',
    coordinates: [48.7194, 67.7094],
    status: 'operational',
    pipelineId: 'PL-001',
  },
  {
    id: 'OBJ-002',
    name: 'Valve Station Beta',
    type: 'Valve',
    coordinates: [49.8047, 73.1094],
    status: 'operational',
    pipelineId: 'PL-001',
  },
  {
    id: 'OBJ-003',
    name: 'Pump Station Gamma',
    type: 'Pump',
    coordinates: [47.2286, 65.1772],
    status: 'maintenance',
    pipelineId: 'PL-002',
  },
  {
    id: 'OBJ-004',
    name: 'Metering Station Delta',
    type: 'Metering',
    coordinates: [50.2839, 57.1674],
    status: 'operational',
    pipelineId: 'PL-002',
  },
  {
    id: 'OBJ-005',
    name: 'Storage Tank Epsilon',
    type: 'Storage',
    coordinates: [46.9475, 71.9836],
    status: 'offline',
    pipelineId: 'PL-003',
  },
];
