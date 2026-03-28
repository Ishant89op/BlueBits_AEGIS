# AEGIS Forensic Dashboard

Automated Extraction and Graphical Information System for forensic analysis of network nodes in Nexus City.


## Project Overview

Project AEGIS is a cyber defense infrastructure console designed to identify complex infiltration attempts by a "Shadow Controller" within Nexus City. By correlating live telemetry streams with underlying HTTP protocols, the dashboard uncovers hidden malware, hijacked nodes, and DDOS attacks that mask themselves behind deceptively healthy JSON status indicators.

## Technology Stack

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next JS" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react-router&logoColor=white" alt="Zustand" />
</p>

## Features

- Forensic City Map: A visual mapping tool that categorizes nodes by underlying HTTP status rather than misleading JSON labels.
- Sleeper Node Detection Heatmap: Tracks API response times to identify anomalies indicating dormant malware.
- Dynamic Schema Console: A live terminal monitoring decoding rotations and data parsing versions.
- Asset Registry: A comprehensive, sortable directory correlating Node UUIDs and encoded serials.

## Installation

1. Verify environment configuration: Ensure Node.js and npm are installed.
2. The site logo has already been imported from your Downloads folder to \`public/logo.png\`. If you wish to change it, simply replace that file.
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Launch the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Sample Datasets

We have included two separate dataset arrays to test the system capabilities:
- Main Dataset: Located inside `datasets/Aegis/`
- Alternate Stress Test Dataset: Located inside `datasets/Aegis_StressTest/` (Use this for validating scaling and performance).

To switch datasets, simply alter the reading directory path to `datasets/Aegis_StressTest` in `src/lib/cache/dataCache.ts` if necessary.

## AI Usage Justification

The use of AI in this project was limited to development support tasks such as brainstorming interface ideas, refining written documentation, and accelerating small implementation decisions. AI assistance helped reduce time spent on repetitive work and improved iteration speed during development, allowing the team to focus more attention on the forensic dashboard logic, dataset handling, and overall user experience.

AI was used as a support tool rather than as an autonomous decision-maker. All architecture choices, feature selection, code integration, testing, and final review remained the responsibility of the project team. Any AI-generated suggestions were manually evaluated, adapted where necessary, and validated against the project requirements before being included in the final system.

This approach was justified because it improved productivity without replacing human understanding or accountability. The final application design, behavior, and report content reflect the team's own judgment, with AI serving only as an assistive resource to speed up drafting, troubleshooting, and polish.

## License

MIT License. See LICENSE for details.
