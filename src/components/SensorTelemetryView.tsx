import React, { useState, useEffect } from 'react';
import { SensorTelemetry, SecurityIncident, CustomPoint3D } from '../types/metropolis';
import { DigitalTwin3DView } from './DigitalTwin3DView';
import {
  Radio,
  Activity,
  Layers,
  Thermometer,
  Volume2,
  Wind,
  ShieldAlert,
  Compass,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Box,
  Plus,
} from 'lucide-react';

interface SensorTelemetryViewProps {
  sensors: SensorTelemetry[];
  customPointCloud?: CustomPoint3D[] | null;
  onOpenDataHub?: (tab?: 'pointcloud' | 'iot' | 'video') => void;
  onTriggerAlert: (incident: SecurityIncident) => void;
}

export const SensorTelemetryView: React.FC<SensorTelemetryViewProps> = ({
  sensors: initialSensors,
  customPointCloud,
  onOpenDataHub,
  onTriggerAlert,
}) => {
  const [sensors, setSensors] = useState<SensorTelemetry[]>(initialSensors);
  const [selectedSensorId, setSelectedSensorId] = useState<string>(sensors[0]?.id || '');
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0);
  const [visualizerMode, setVisualizerMode] = useState<'3d' | '2d'>('3d');

  useEffect(() => {
    setSensors(initialSensors);
    if (!selectedSensorId && initialSensors.length > 0) {
      setSelectedSensorId(initialSensors[0].id);
    }
  }, [initialSensors, selectedSensorId]);

  // Animated sweep for radar/LiDAR
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarSweepAngle((prev) => (prev + 3) % 360);
      // Small simulated telemetry fluctuations
      setSensors((prevSensors) =>
        prevSensors.map((s) => {
          const jitter = (Math.random() - 0.5) * (s.max * 0.015);
          const newValue = Math.min(
            s.max,
            Math.max(s.min, Number((s.currentValue + jitter).toFixed(1)))
          );
          return {
            ...s,
            currentValue: newValue,
          };
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const selectedSensor =
    sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  const handleSimulateThresholdExceeded = () => {
    const incident: SecurityIncident = {
      id: `inc-sens-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      severity: 'high',
      title: `Sensor Anomaly: ${selectedSensor.name}`,
      description: `Sensor threshold violation! Reading reached ${selectedSensor.thresholdCrit} ${selectedSensor.unit} in ${selectedSensor.zone}.`,
      location: selectedSensor.zone,
      cameraId: 'cam-gate-04',
      cameraName: selectedSensor.zone,
      status: 'active',
      detectedBy: 'Metropolis IoT Fusion Agent',
      tags: ['IoT', 'Telemetry', 'Automated Triage'],
    };
    onTriggerAlert(incident);
  };

  return (
    <div className="space-y-6">
      {/* Sensor Hero Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {sensors.map((sensor) => {
          const isSelected = sensor.id === selectedSensorId;
          const isWarn = sensor.currentValue >= sensor.thresholdWarn;

          const getIcon = () => {
            switch (sensor.type) {
              case 'lidar_depth':
                return Compass;
              case 'doppler_radar':
                return Radio;
              case 'acoustic_spl':
                return Volume2;
              case 'thermal_ambient':
                return Thermometer;
              case 'co2_voc':
                return Wind;
              default:
                return Activity;
            }
          };

          const Icon = getIcon();

          const getSensorColors = () => {
            switch (sensor.type) {
              case 'lidar_depth':
                return {
                  text: 'text-cyan-600 dark:text-cyan-400',
                  border: 'border-cyan-500',
                  activeBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
                  bar: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
                  badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
                };
              case 'doppler_radar':
                return {
                  text: 'text-amber-600 dark:text-amber-400',
                  border: 'border-amber-500',
                  activeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
                  bar: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
                  badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
                };
              case 'acoustic_spl':
                return {
                  text: 'text-fuchsia-600 dark:text-fuchsia-400',
                  border: 'border-fuchsia-500',
                  activeBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
                  bar: 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]',
                  badge: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/30',
                };
              case 'thermal_ambient':
                return {
                  text: 'text-rose-600 dark:text-rose-400',
                  border: 'border-rose-500',
                  activeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
                  bar: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
                  badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
                };
              case 'co2_voc':
              default:
                return {
                  text: 'text-emerald-600 dark:text-emerald-400',
                  border: 'border-emerald-500',
                  activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
                  bar: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
                  badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
                };
            }
          };

          const colors = getSensorColors();

          return (
            <button
              key={sensor.id}
              onClick={() => setSelectedSensorId(sensor.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? `${colors.activeBg} ${colors.border} shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                  : 'bg-white/80 dark:bg-[#0B0E14]/60 border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] hover:bg-slate-50 dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]">
                  <Icon className={`w-4 h-4 ${isSelected ? colors.text : 'text-slate-400 dark:text-gray-400'}`} />
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    isWarn
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                      : colors.badge
                  }`}
                >
                  {isWarn ? 'WARN' : 'NOMINAL'}
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-900 dark:text-gray-200 truncate">{sensor.name}</div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 mb-2 truncate">{sensor.zone}</p>

              <div className="flex items-baseline space-x-1.5 tabular-nums">
                <span className={`text-xl font-bold font-mono ${isSelected ? colors.text : 'text-slate-900 dark:text-white'}`}>
                  {typeof sensor.currentValue === 'number'
                    ? sensor.currentValue.toLocaleString()
                    : sensor.currentValue}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">{sensor.unit}</span>
              </div>

              {isSelected && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.bar}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Sensor Fusion Radar & Analytics View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar & LiDAR Visualizer (2 Cols - Main Container) */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm dark:shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3 mb-4">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Metropolis Multi-Sensor Fusion Engine
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Real-time 3D spatial alignment with TI 77GHz Radar & Ouster OS1 LiDAR Point Clouds
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onOpenDataHub && (
                <button
                  onClick={() => onOpenDataHub('pointcloud')}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect Data</span>
                </button>
              )}

              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-black/60 p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
                <button
                  onClick={() => setVisualizerMode('3d')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    visualizerMode === '3d'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Digital Twin</span>
                </button>

                <button
                  onClick={() => setVisualizerMode('2d')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    visualizerMode === '2d'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>2D Planar Sweep</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-slate-500 dark:text-gray-300 ml-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[11px] font-semibold">CALIBRATED</span>
              </div>
            </div>
          </div>

          {/* Render 3D Digital Twin or 2D Planar Sweep */}
          {visualizerMode === '3d' ? (
            <DigitalTwin3DView
              sensors={sensors}
              activeSensorId={selectedSensorId}
              customPointCloud={customPointCloud}
              onOpenDataHub={() => onOpenDataHub?.('pointcloud')}
            />
          ) : (
            <div className="relative aspect-video max-h-[380px] w-full bg-slate-950/90 dark:bg-[#070A0F]/90 backdrop-blur-md rounded-xl border border-slate-800 dark:border-white/[0.08] flex items-center justify-center overflow-hidden shadow-inner">
              {/* Concentric radar range rings */}
              <div className="absolute w-[80%] h-[80%] rounded-full border border-gray-800/80"></div>
              <div className="absolute w-[60%] h-[60%] rounded-full border border-gray-800/80"></div>
              <div className="absolute w-[40%] h-[40%] rounded-full border border-gray-800/80"></div>
              <div className="absolute w-[20%] h-[20%] rounded-full border border-gray-800/80"></div>

              {/* Cross axes */}
              <div className="absolute inset-x-0 h-[1px] bg-gray-800/70"></div>
              <div className="absolute inset-y-0 w-[1px] bg-gray-800/70"></div>

              {/* Rotating radar sweep beam */}
              <div
                className="absolute w-[50%] h-[50%] origin-bottom-right pointer-events-none"
                style={{
                  transform: `rotate(${radarSweepAngle}deg)`,
                  transformOrigin: '100% 100%',
                  top: 0,
                  left: 0,
                  background:
                    'conic-gradient(from 180deg at 100% 100%, transparent 60deg, rgba(245, 158, 11, 0.4) 90deg)',
                }}
              ></div>

              {/* Simulated Multi-Color LiDAR Point Clusters */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Cluster 1: Cyan Human */}
                <div className="absolute top-[32%] left-[42%] w-3 h-3 rounded-full bg-cyan-400/80 animate-ping"></div>
                <div className="absolute top-[32%] left-[42%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]"></div>
                <div className="absolute top-[28%] left-[46%] text-[10px] font-mono text-cyan-300 bg-black/70 px-1 rounded border border-cyan-500/30">
                  OBJ#101 [34.2m]
                </div>

                {/* Cluster 2: Violet Vehicle */}
                <div className="absolute top-[65%] left-[70%] w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8B5CF6]"></div>
                <div className="absolute top-[68%] left-[70%] text-[10px] font-mono text-violet-300 bg-black/70 px-1 rounded border border-violet-500/30">
                  FORKLIFT#12 [58.1m]
                </div>

                {/* Cluster 3: Rose Tripwire */}
                <div className="absolute top-[22%] left-[24%] w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                <div className="absolute top-[18%] left-[26%] text-[10px] font-mono text-rose-300 bg-black/70 px-1 rounded border border-rose-500/30">
                  PERIMETER TRIPWIRE
                </div>
              </div>

              {/* Range markers */}
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-gray-400">
                RANGE: 100 METERS // AZIMUTH: 360° // RATE: 20Hz
              </div>
              <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-400">
                OUSTER OS1-32 // TI AWR1843 RADAR
              </div>
            </div>
          )}

          {/* Bottom telemetry control bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-4 font-mono text-slate-500 dark:text-gray-400 tabular-nums">
              <div>
                <span className="text-slate-400 dark:text-gray-500">POINT DENSITY: </span>
                <span className="text-slate-800 dark:text-white font-bold">128,400 pts/s</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-gray-500">RADAR DOPPLER: </span>
                <span className="text-slate-800 dark:text-white font-bold">77 GHz FMCW</span>
              </div>
            </div>

            <button
              onClick={handleSimulateThresholdExceeded}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-xl font-mono text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Simulate Telemetry Breach</span>
            </button>
          </div>
        </div>

        {/* Selected Sensor Deep Dive (Sidebar Panel) */}
        <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm dark:shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedSensor.name}</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">{selectedSensor.zone}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/[0.08]">
                {selectedSensor.type}
              </span>
            </div>

            {/* Big Readout */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] mb-4 text-center">
              <div className="text-slate-500 dark:text-gray-400 text-xs font-mono mb-1">REAL-TIME CURRENT VALUE</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono flex items-center justify-center space-x-2 tabular-nums">
                <span>{selectedSensor.currentValue.toLocaleString()}</span>
                <span className="text-sm font-normal text-slate-500 dark:text-gray-400">{selectedSensor.unit}</span>
              </div>

              {/* Progress gauge vs max with Multi-color gradient */}
              <div className="w-full bg-slate-200 dark:bg-[#18202F] h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((selectedSensor.currentValue - selectedSensor.min) /
                        (selectedSensor.max - selectedSensor.min)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-gray-500 mt-1.5 tabular-nums">
                <span>Min: {selectedSensor.min}</span>
                <span>Warn: {selectedSensor.thresholdWarn}</span>
                <span>Max: {selectedSensor.max}</span>
              </div>
            </div>

            {/* History Bar Chart */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400 tracking-wider">
                Telemetry Log (Last 5 mins)
              </div>
              <div className="space-y-2">
                {selectedSensor.history.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="text-slate-400 dark:text-gray-400">{item.time}</span>
                    <div className="flex items-center space-x-2 tabular-nums">
                      <div className="w-20 bg-slate-200 dark:bg-black/40 h-1.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/[0.05]">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          style={{
                            width: `${Math.min(
                              100,
                              ((item.value - selectedSensor.min) /
                                (selectedSensor.max - selectedSensor.min)) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-gray-200">
                        {item.value.toLocaleString()} {selectedSensor.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edge Sensor Node Specs */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.08] text-[11px] font-mono text-slate-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>PROTOCOL:</span>
              <span className="text-slate-800 dark:text-gray-200 font-semibold">MQTT / ZeroMQ Telemetry</span>
            </div>
            <div className="flex justify-between">
              <span>SAMPLING JITTER:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt; 0.4 ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
