# Contributing to Metropolis Vision & Sensor Platform

Thank you for your interest in contributing to the **Metropolis Vision & Sensor Platform**! We welcome bug fixes, documentation improvements, sensor integrations, model parsers, and performance optimizations from the community.

---

## 📜 Contributor License Agreement (CLA)

Because this project is distributed under a **Dual-Licensing Model (AGPLv3 Community & Commercial Enterprise)**, all contributors must sign our Contributor License Agreement (CLA) before any Pull Request can be merged.

### How it works:
1. When you open a Pull Request, our automated **GitHub CLA Bot** (`@metropolis-cla-bot`) will inspect your PR.
2. If you haven't signed yet, the bot will leave a comment with a link to complete the electronic signature.
3. You can also view or sign your agreement in advance directly inside the application under the **CLA Manager** view (`/#cla`).
4. Once signed, the bot automatically verifies your PR status and marks the check as **PASSED (`cla/metropolis-vision`)**.

---

## 🛠️ Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/<your-username>/metropolis-vision-sensor-platform.git
   cd metropolis-vision-sensor-platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Dev Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to preview.

4. **Run TypeScript & Lint Validation**
   ```bash
   npm run lint
   ```
   Ensure zero errors or missing types before committing.

---

## 🔀 Branch & Commit Conventions

- Create a descriptive topic branch:
  ```bash
  git checkout -b feat/lidar-hesai-pandar-parser
  # or
  git checkout -b fix/bounding-box-coordinate-offset
  ```
- Use Conventional Commits formatting:
  - `feat: <description>` (new feature)
  - `fix: <description>` (bug fix)
  - `docs: <description>` (documentation update)
  - `perf: <description>` (performance improvement)
  - `refactor: <description>` (code cleanup)
  - `test: <description>` (test additions)

---

## 🧪 Testing Your Changes

- Check client bundle build:
  ```bash
  npm run build
  ```
- Verify the full-stack server starts cleanly:
  ```bash
  npm start
  ```
- Verify data ingestion pipelines:
  - Drop in a test video file into the **BYOD Data Hub**.
  - Test LiDAR point cloud CSV/JSON uploads.
  - Verify simulated MQTT sensor bursts and webhook dispatches.

---

## 📬 Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/lidar-hesai-pandar-parser
   ```
2. Open a Pull Request against the `main` branch.
3. Provide a clear summary of changes, motivation, and test steps in the PR description.
4. Verify the `@metropolis-cla-bot` check is green.

Thank you for helping push edge vision and autonomous systems forward! 🚀
