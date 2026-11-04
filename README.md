# Metropolis Vision & Sensor Platform 🛸

> **Industrial Multi-Sensor Computer Vision & Autonomous Agent Ops Platform** with Real-Time Video Analytics, Edge Model Training Studio, 3D LiDAR Digital Twin, and Dual-Licensing Architecture.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_LiDAR-black?logo=three.js)](https://threejs.org/)
[![NVIDIA DeepStream](https://img.shields.io/badge/NVIDIA-DeepStream_Pipeline-76B900?logo=nvidia)](https://developer.nvidia.com/deepstream-sdk)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## ⚡ Key Capabilities

1. **Multi-Camera Vision Stream Hub**:
   - Hardware-accelerated simulated DeepStream GStreamer pipeline with TensorRT FP8 inference.
   - Dynamic object detection, optical tracking, license plate OCR, heatmapping, and zone dwell counters.
   - Multi-channel grid view with per-feed FPS, latency, and model metrics.

2. **Bring-Your-Own-Data (BYOD) Hub**:
   - **Local Webcams**: Direct browser hardware camera feed ingestion with auto-resolution negotiation.
   - **Video Upload**: Drop in MP4/WebM files for automated bounding-box processing and speed estimation.
   - **LiDAR Point Cloud Ingestion**: Parse custom 3D point cloud telemetry (`.csv` / `.json` with `x, y, z, intensity, label`).
   - **MQTT Telemetry Broker**: Configurable broker URL, topic subscription, and simulated IoT sensor burst injection.
   - **Alert Webhook Dispatcher**: Trigger REST endpoints (e.g. Slack, PagerDuty, Discord, Custom API) on safety violations.
   - **Configuration Backup**: Full JSON export/import of camera topologies and threshold parameters.

3. **Autonomous Agent Operations (Agentic Ops)**:
   - Multimodal Gemini 2.5 Flash reasoning agent synthesizing video frames and spatial telemetry.
   - Automated perimeter violation dispatch, forklift collision mitigation, and cross-camera suspect tracking.
   - Step-by-step reasoning logs with Confidence score and actionable dispatch recommendations.

4. **Edge AI Model Training Studio (TAO & LoRA)**:
   - Fine-tune YOLOv11, CenterNet, and ViT models on synthetic or imported edge datasets.
   - Configurable epochs, learning rates, batch sizes, and automated TensorRT FP8 quantization engine export.
   - Interactive training loss / mAP convergence curves and synthetic dataset generator.

5. **3D LiDAR / Radar Digital Twin**:
   - High-performance Three.js WebGL canvas rendering 360° point clouds (16/32/64 beam LiDAR).
   - Real-time 3D bounding boxes, cluster segmentation, radar velocity vectors, and coordinate projection.
   - Interactive orbit controls, intensity color ramps, and ground-grid reference.

6. **Cluster Mesh & Fleet Orchestration**:
   - Edge node health monitoring (Jetson Orin AGX, DGX H100 clusters, edge gateways).
   - Real-time thermal curves, GPU VRAM allocation, TensorRT utilization, and container failover.

7. **Incident Management Desk**:
   - Severity-tiered alerts (Critical, High, Medium, Info) with timeline playback and snapshot evidence.
   - One-click incident acknowledgment, audio sirens, and exportable forensics logs.

8. **Enterprise Dual-Licensing Matrix & CLA Bot**:
   - Dual-licensing enforcement: Free AGPLv3 Community Tier vs. Commercial Enterprise License with proprietary entitlement unlock.
   - Automated GitHub Contributor License Agreement (CLA) bot simulator for open-source contributors with signature verification and webhook dispatch.
   - Light and Dark aerospace-grade UI theme toggle with multi-color palette (Cyan, Violet, Fuchsia, Amber, Emerald, Rose).

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Metropolis Client UI (React 19)                 │
│  ┌───────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────┐ │
│  │ Vision Stream │ │ 3D LiDAR Twin  │ │ AI Train Studio│ │ Agent Ops │ │
│  └───────┬───────┘ └────────┬───────┘ └────────┬───────┘ └─────┬─────┘ │
└──────────┼──────────────────┼──────────────────┼───────────────┼───────┘
           │                  │                  │               │
┌──────────▼──────────────────▼──────────────────▼───────────────▼───────┐
│                      Express API Proxy & Server Engine                 │
│  - /api/train/jobs        - /api/telemetry/lidar    - /api/webhook     │
│  - /api/gemini/analyze    - /api/cla/verify         - /api/license     │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           │                                                     │
┌──────────▼───────────────┐                       ┌─────────────▼─────────────┐
│ Google Gemini Multimodal │                       │ Edge IoT / MQTT Brokering │
│ Flash 2.5 Vision Engine  │                       │ RTSP / GStreamer Streams  │
└──────────────────────────┘                       └───────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/metropolis-vision-sensor-platform.git
cd metropolis-vision-sensor-platform
npm install
```

### 2. Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env
```

Edit `.env` if you wish to configure your Gemini API Key:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
*(The application includes built-in offline simulation mode with realistic synthetic telemetry if no API key is provided).*

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

```bash
# Compile and bundle client application
npm run build

# Run the production full-stack server
npm start
```

---

## 🔒 Dual-Licensing Model

This project is licensed under a **Dual-Licensing Framework**:

1. **GNU AGPLv3 (Community Open Source)**:
   - Free for research, prototyping, and open-source applications.
   - Any network-accessible derivative software must also make its complete source code available under AGPLv3.
2. **Commercial Enterprise License**:
   - Royalty-free closed-source commercial distribution, proprietary model protection, enterprise SLA, multi-cluster federation, and dedicated support.
   - For commercial license inquiries, visit the in-app **Dual Licensing** module or contact licensing@metropolis-vision.io.

---

## 🤝 Contributing & Contributor License Agreement (CLA)

We welcome pull requests from the open-source community!

1. Fork the repo and create your feature branch: `git checkout -b feature/awesome-sensor`.
2. Follow commit message guidelines (e.g., `feat: add velodyne-128 lidar parser`).
3. Ensure TypeScript type checks pass: `npm run lint`.
4. Submit your Pull Request.
5. Our automated **CLA Bot** will prompt you to electronically sign the Contributor License Agreement via the built-in [CLA Portal](CONTRIBUTING.md).

For detailed contribution instructions, read [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🛡️ Security

To report security vulnerabilities, please email security@metropolis-vision.io instead of opening public GitHub issues.
