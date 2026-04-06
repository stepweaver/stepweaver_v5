/** Static Meshtastic documentation bodies (Notion integration optional via NOTION_MESHTASTIC_DOCS_DB_ID). */

export type MeshtasticDoc = {
  slug: string;
  title: string;
  /** Short plain paragraphs and lists; rendered as simple blocks */
  sections: Array<{ type: "p" | "ul"; text?: string; items?: string[] }>;
};

export const MESHTASTIC_DOCS: MeshtasticDoc[] = [
  {
    slug: "about",
    title: "About Meshtastic",
    sections: [
      {
        type: "p",
        text: "Meshtastic is an open-source mesh networking stack for LoRa radios. Devices form a decentralized network: nodes relay packets without a central server, and clients (phone, desktop) pair over Bluetooth or USB to send text, telemetry, and lightweight data.",
      },
      {
        type: "p",
        text: "It is useful when cellular service is absent, expensive, or undesirable: trail coordination, rural property, event ops, and resilient neighborhood comms. Encryption is handled at the application layer; range depends on antennas, terrain, and regulatory power limits.",
      },
      {
        type: "ul",
        items: [
          "Off-grid by default: no ISP required for mesh payloads",
          "Community firmware and clients; active hardware ecosystem",
          "Regional duty-cycle and power rules still apply; plan legally",
        ],
      },
    ],
  },
  {
    slug: "overview",
    title: "Network overview",
    sections: [
      {
        type: "p",
        text: "A typical deployment includes mesh nodes (routers or repeaters) and one or more powered “supervisor” roles for bridging or MQTT if you add internet backhaul. Most hobby kits start with 2–3 handheld or vehicle nodes to learn RF behavior before optimizing.",
      },
      {
        type: "p",
        text: "Channels separate logical traffic. Many operators run a default public channel for discovery and a private primary for group messaging. Position packets can be toggled per channel; balance privacy against situational awareness.",
      },
      {
        type: "ul",
        items: [
          "Router: mains/solar powered; extends mesh efficiently",
          "Repeater: battery; extends range without phone paired",
          "Client: human-facing device paired to a phone",
        ],
      },
    ],
  },
  {
    slug: "getting-started",
    title: "Getting started",
    sections: [
      {
        type: "p",
        text: "1) Pick hardware that matches your band plan (e.g. US 915 MHz, EU 868 MHz). 2) Flash current stable firmware with the web flasher or platform tool. 3) Install the mobile app, pair, set region and role, then join or create a channel. 4) Walk test: log RSSI/SNR at fixed landmarks.",
      },
      {
        type: "p",
        text: "Expect learning through measurement; prediction is hard without line-of-sight data. Elevate antennas, reduce obstructions, and avoid detuning from metal cases. Document what works; field notes beat guessing.",
      },
      {
        type: "ul",
        items: [
          "Verify regional parameters before doing bench power tests",
          "Back up device configs after stable links are proven",
          "Label nodes with role + last battery swap date",
        ],
      },
    ],
  },
  {
    slug: "hardware",
    title: "Hardware notes",
    sections: [
      {
        type: "p",
        text: "Popular boards include Heltec V3, LILYGO T-Beam / T3S3, RAK WisBlock assemblies, and nRF52-based units for compact wearables. T-Beam adds GPS for mobile mapping; Heltec offers OLED for on-device status; WisBlock is modular for custom enclosures.",
      },
      {
        type: "p",
        text: "Antenna quality dominates anecdotal “range” stories. A mismatched or lossy feedline wastes link budget faster than firmware tweaks. For fixed sites, external antennas with known gain and lightning considerations outperform whip-on-desk setups.",
      },
      {
        type: "ul",
        items: [
          "Match antenna to frequency; torque SMA carefully",
          "Budget for batteries/solar if routers must stay up",
          "Waterproofing and strain relief matter more than chipset deltas",
        ],
      },
    ],
  },
];

export const MESHTASTIC_DOC_BY_SLUG: Record<string, MeshtasticDoc> = Object.fromEntries(
  MESHTASTIC_DOCS.map((d) => [d.slug, d])
);

export type FieldNote = {
  id: string;
  date: string;
  title: string;
  summary: string;
  bullets?: string[];
};

/** Operational snippets; replace or supplement with Notion when wired */
export const MESHTASTIC_FIELD_NOTES: FieldNote[] = [
  {
    id: "fn-001",
    date: "2025-11-18",
    title: "Urban canyon soak test",
    summary:
      "Two T-Beams as routers on rooftops, one Heltec client handheld. Through downtown grid, direct hops failed at ~0.4 mi street level; rooftop path held ~1.1 mi LoS with 5 dBi omni.",
    bullets: [
      "SNR collapsed near steel curtain wall; rerouted via roof router",
      " MQTT disabled for this run to isolate RF-only behavior",
    ],
  },
  {
    id: "fn-002",
    date: "2025-10-02",
    title: "Trail relay spacing",
    summary:
      "Forested ridge line: repeater nodes ~600–800 ft apart maintained usable text; beyond 900 ft without LoS saw delayed delivery and occasional store-and-forward stalls on low battery.",
    bullets: ["Role set to Repeater, GPS/position off to save power"],
  },
  {
    id: "fn-003",
    date: "2025-08-30",
    title: "Firmware bump checklist",
    summary:
      "Flashed 2.6.x → current stable on three nodes; re-applied channel PSKs and verified modem preset. Post-flash, re-pair Bluetooth on phones; the UUID cache was invalidated.",
  },
];
