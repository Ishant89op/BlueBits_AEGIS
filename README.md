# AEGIS - Cyber Infrastructure Defense Console

```
       _____  _____ _____ _____
      /  _  \|  ___|  __ \_   _|  ____
     / /_\  \| |_  | |  \/ | |  / ___|
    / _____ \|  _| | | __  | |  \___ \
   / /     \ \ |___| |_\ \_| |_ ___) |
  /_/       \_\____/\____/\___/ |____/
         CYBER DEFENSE CONSOLE v4.0
```

> Built for the Rosetta Code Hackathon at NIT Hamirpur

---

## The Mission

A rogue Shadow Controller has infiltrated a network of 500 nodes, silently coordinating a botnet through infected sleeper nodes that masquerade as healthy infrastructure. AEGIS is a forensic defense console that strips away deceptive JSON status labels, reclassifies every node using raw HTTP response codes, decodes hidden Base64 serial numbers, detects anomalous response-time patterns, and ultimately identifies the Shadow Controller node orchestrating the attack.

## How It Works

### Forensic City Map
Visualizes all 500 nodes in a 20x25 grid, color-coded by their true HTTP status (200=green, 206=red, 429=amber). The `json_status` field is deliberately ignored because it always reports "OPERATIONAL" - the real truth is derived from `http_response_code` classification.

### Sleeper Node Heatmap
Tracks response time anomalies across all 10,000 log entries using a time-series chart. Nodes with a mean response time above 180ms are flagged as potential sleeper nodes harboring hidden malware. A vertical reference line marks the schema rotation event at log_id 5000.

### Dynamic Schema Console
Displays the schema version switching mechanism in a terminal-style interface. The system uses `load_val` for log_ids 0-4999 (Schema v1) and `L_V1` for log_ids 5000-9999 (Schema v2), as defined in `schema_config.csv`. Rotation events are highlighted in amber.

### Asset Registry
A searchable, sortable, paginated table of all 500 nodes showing their UUID, Base64-encoded serial, decoded serial (extracted from the last token of `user_agent` and Base64-decoded), and infection status. Supports CSV export of filtered views.

## Detection Engine

| Engine Module | Input | Output | Logic |
|---|---|---|---|
| classifyHttpStatus | HTTP response code | Status enum + label | 200=OPERATIONAL, 206=HIJACKED, 429=DDOS |
| decodeSerials | user_agent string | Decoded serial (SN-XXXX) | Extract last space-token, Base64 decode |
| resolveSchema | log_id + schema config | Active version + column | Find latest version where time_start <= log_id |
| detectSleepers | All system logs | Ranked sleeper list | Group by node, compute mean response_time_ms, flag >180ms |
| identifyShadowController | Infected nodes + 429 logs | Controller node ID + serial | Cross-join infected=True with code=429, find max count |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS custom properties |
| Charts | Recharts |
| State Management | Zustand |
| CSV Parsing | PapaParse |
| Theming | next-themes (dark/light) |

## Project Structure

```
BlueBits_AEGIS/
    src/
        app/
            layout.tsx
            page.tsx
            globals.css
            api/
                nodes/route.ts
                logs/route.ts
                schema/route.ts
                threat-report/route.ts
            city-map/page.tsx
            sleeper/page.tsx
            schema/page.tsx
            registry/page.tsx
            threat-report/page.tsx
        components/
            layout/
                Sidebar.tsx
                Navbar.tsx
                ThemeToggle.tsx
            panels/
                CityMap.tsx
                SleeperHeatmap.tsx
                SchemaConsole.tsx
                AssetRegistry.tsx
                ThreatReport.tsx
            ui/
                Badge.tsx
                StatCard.tsx
                NodeTooltip.tsx
                NodeDetailPanel.tsx
                AlertBanner.tsx
                SkeletonTable.tsx
        lib/
            data/
                parseNodeRegistry.ts
                parseSystemLogs.ts
                parseSchemaConfig.ts
            engine/
                classifyHttpStatus.ts
                decodeSerials.ts
                resolveSchema.ts
                detectSleepers.ts
                identifyShadowController.ts
            cache/
                dataCache.ts
        types/
            index.ts
        store/
            useAegisStore.ts
    datasets/
        Aegis/
            node_registry.csv
            schema_config.csv
            system_logs.csv
```

## Getting Started

```bash
cd BlueBits_AEGIS
npm install
npm run dev
```

Datasets must be placed at `datasets/Aegis/*.csv` before running.

## Team

| Name |
|---|
| Ishant Yadav |
| Shreyash Chaurasia |
| Kavya Siddh Sharma |

## Hackathon

NIT Hamirpur - The Rosetta Code Hackathon
Problem Statement: Project AEGIS (Cyber Infrastructure Defense)

## License

MIT License - see [LICENSE](LICENSE) file.
