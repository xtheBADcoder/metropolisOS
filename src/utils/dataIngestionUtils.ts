import { CustomPoint3D, CameraFeed, SensorTelemetry, SecurityIncident } from '../types/metropolis';

/**
 * Generate a realistic LiDAR scan of an automated logistics warehouse
 */
export function generateSampleLidarDataset(pointCount: number = 2400): CustomPoint3D[] {
  const points: CustomPoint3D[] = [];

  // Ground plane grid (800 points)
  for (let i = 0; i < 800; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const y = 0.02 + Math.random() * 0.08;
    points.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      z: Number(z.toFixed(2)),
      intensity: Math.floor(20 + Math.random() * 40),
      colorHex: '#38bdf8',
    });
  }

  // Warehouse Shelving / Racks (800 points)
  const rackXOffsets = [-12, -4, 4, 12];
  for (let i = 0; i < 800; i++) {
    const rackX = rackXOffsets[Math.floor(Math.random() * rackXOffsets.length)];
    const x = rackX + (Math.random() - 0.5) * 2.2;
    const z = (Math.random() - 0.5) * 30;
    const y = 0.1 + Math.random() * 5.8;
    points.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      z: Number(z.toFixed(2)),
      intensity: Math.floor(120 + Math.random() * 100),
      colorHex: '#76b900',
    });
  }

  // Forklift & Moving Pallets (400 points)
  for (let i = 0; i < 400; i++) {
    const x = -1 + (Math.random() - 0.5) * 3;
    const z = 2 + (Math.random() - 0.5) * 4;
    const y = 0.1 + Math.random() * 2.2;
    points.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      z: Number(z.toFixed(2)),
      intensity: Math.floor(180 + Math.random() * 75),
      colorHex: '#eab308',
    });
  }

  // Perimeter Fences & Gate Pillars (400 points)
  for (let i = 0; i < 400; i++) {
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let z = 0;
    if (side === 0) { x = -20; z = (Math.random() - 0.5) * 40; }
    else if (side === 1) { x = 20; z = (Math.random() - 0.5) * 40; }
    else if (side === 2) { x = (Math.random() - 0.5) * 40; z = -20; }
    else { x = (Math.random() - 0.5) * 40; z = 20; }

    const y = Math.random() * 3.5;
    points.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      z: Number(z.toFixed(2)),
      intensity: 220,
      colorHex: '#f43f5e',
    });
  }

  return points;
}

/**
 * Parse raw CSV string into 3D points
 * Accepts: x,y,z or x,y,z,intensity or x,y,z,r,g,b
 */
export function parseLidarCsv(csvText: string): { points: CustomPoint3D[]; errors: string[] } {
  const lines = csvText.trim().split(/\r?\n/);
  const points: CustomPoint3D[] = [];
  const errors: string[] = [];

  let startIdx = 0;
  // Check if first line is header
  if (lines.length > 0) {
    const first = lines[0].toLowerCase();
    if (first.includes('x') || first.includes('lat') || first.includes('coord')) {
      startIdx = 1;
    }
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/[,\t\s]+/).map((p) => p.trim());
    if (parts.length < 3) {
      if (errors.length < 5) {
        errors.push(`Line ${i + 1}: Expected at least 3 values (x,y,z), got: "${line}"`);
      }
      continue;
    }

    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    const z = parseFloat(parts[2]);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      if (errors.length < 5) {
        errors.push(`Line ${i + 1}: Non-numeric coordinates: "${line}"`);
      }
      continue;
    }

    const intensity = parts[3] ? parseFloat(parts[3]) : undefined;
    points.push({
      x,
      y,
      z,
      intensity: !isNaN(intensity as number) ? intensity : 100,
    });
  }

  return { points, errors };
}

/**
 * Parse JSON coordinates
 */
export function parseLidarJson(jsonText: string): { points: CustomPoint3D[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonText);
    const rawArray = Array.isArray(parsed) ? parsed : parsed.points || parsed.data || [];
    
    if (!Array.isArray(rawArray) || rawArray.length === 0) {
      return { points: [], error: 'JSON does not contain a valid array of points' };
    }

    const points: CustomPoint3D[] = [];
    for (const item of rawArray) {
      if (typeof item === 'object' && item !== null) {
        const x = Number(item.x ?? item[0]);
        const y = Number(item.y ?? item[1]);
        const z = Number(item.z ?? item[2]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          points.push({
            x,
            y,
            z,
            intensity: item.intensity !== undefined ? Number(item.intensity) : 100,
            colorHex: item.colorHex || item.color,
          });
        }
      }
    }
    return { points };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid JSON string';
    return { points: [], error: message };
  }
}

/**
 * Download a string payload as a client-side file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
