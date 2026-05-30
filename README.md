# state-puc-ai-disclosure-tracker

> **EnergyTech jurisdiction-spanning lifecycle tracker (Spec #2 of the EnergyTech 6-pack).** Tracks state Public Utility Commission AI rules, FERC orders, NERC reliability standards, DOE executive-order implementation, TSA Security Directives, and ISO/RTO Business Practice Manuals that govern AI use in utility operations + grid reliability. Covers **utility-regulator + grid-reliability-regulator AI rules** — distinct from sibling-vertical trackers (state bars in LegalTech, government-AI in GovTech, financial regulators in FinTech).

Part of the [Kinetic Gain Protocol Suite](https://suite.kineticgain.com).

> Status: v0.1 draft. Schema at [`schema/disclosure-event.schema.json`](./schema/disclosure-event.schema.json), seed data at [`jurisdictions/*.ndjson`](./jurisdictions/), verifier at [`src/verify.mjs`](./src/verify.mjs).

## Seed coverage (v0.1)

| Jurisdiction | Anchor citation | Lifecycle state |
| --- | --- | --- |
| CA-CPUC | [D.24-06-008](https://docs.cpuc.ca.gov/PublishedDocs/Published/G000/M533/K811/533811432.PDF) — AI in IOU operations | order-issued |
| NY-PSC | Case 15-E-0751 Supplemental Order — DER aggregation AI oversight | order-issued |
| TX-PUCT | Staff Guidance 55718 — ERCOT market-participant AI | staff-guidance-issued |
| MA-DPU | DPU 24-15 — AI by distribution companies | order-issued |
| IL-ICC | NOPR 24-0589 — Smart Grid AI disclosure | notice-of-proposed-rulemaking |
| WA-UTC | UE-240122 — AI in CETA Clean Energy plans | guidance-issued |
| **FERC** | **Order 2222** — DER aggregation participation (federal baseline) | order-issued |
| **NERC** | **CIP-013-3** — Cyber Security Supply Chain Risk Management | mandatory-compliance-effective |
| **TSA** | **SD-2021-02C** — Critical Pipeline Cybersecurity (post-Colonial) | mandatory-compliance-effective |
| **CAISO** | BPM Market Operations Rev 71 — AI-aided bid validation | tariff-approval-granted |

10 jurisdictions seeded — 6 state PUCs + 4 federal/standards-body/ISO actors. The cross-jurisdiction shape distinguishes this tracker from sibling-vertical trackers: NERC's reliability standards are mandatory across the entire continent, FERC orders preempt state rules in wholesale markets, ISO BPMs are FERC-approved tariff revisions, TSA SDs sit in a separate critical-infrastructure stack — all four live in the same data model alongside the state PUCs.

## Event schema

`jurisdiction` pattern accepts:
- `US` (federal generic) or `US-XX-PUC` / `US-XX-UTC` / `US-XX-PSC` / `US-XX-ICC` / `US-XX-DPU` / `US-XX-OCC` / `US-XX-CC` (state PUC — name varies by state)
- `ERCOT` / `MISO` / `PJM` / `CAISO` / `NYISO` / `ISO-NE` / `SPP` (ISO/RTO)
- `FERC` / `NERC` / `NERC-WECC` / `NERC-MRO` / `NERC-RFC` / `NERC-SERC` / `NERC-NPCC` / `NERC-TRE` (federal + NERC regional entities)
- `DOE` / `TSA` / `EPA` (other federal energy-adjacent agencies)

`lifecycle_state` covers 15 transitions including `notice-of-proposed-rulemaking → in-stakeholder-comment → order-issued / guidance-issued → mandatory-compliance-effective → enforcement-active → enforcement-action-published`, plus `tariff-approval-granted`, `pilot-program-approved`, `waiver-granted`, `advisory-non-binding`, `rescinded`, `superseded`, `under-review`.

`obligation_kinds` is a 21-item enum spanning: ai-tool-disclosure-in-tariff-filing, prudency review, BES categorization attestation, NERC CIP attestation, TSA pipeline controls, FERC Order 2222 DER fairness, environmental-justice impact assessment, rate-impact disclosure, demand-response fairness, EV-charging equity, load-shed allocation publication, outage-restoration priority publication, AI-vendor prudency attestation, CIP-008 tier-1 reporting, CISA Shields-Up tier-2 reporting, CIP-013 supply-chain risk management, human-operator-in-loop, NERC-certified operator attestation, OT-IT data-diode attestation, low-income customer impact assessment, consumer disclosure on AI-mediated bills.

## Verify

```bash
npm install
npm run verify
# OK · 10 events across 10 jurisdictions · schema ✓ · lifecycle transitions ✓
```

The verifier enforces:
1. **Schema validation** against `disclosure-event.schema.json`.
2. **Lifecycle ordering per (jurisdiction, docket)** — within the same jurisdiction + docket thread, events sorted by timestamp must form a legal transition chain. Different dockets within the same jurisdiction are independent threads (a state PUC can have multiple parallel proceedings).

## Composes with

- [`grid-decision-record-audit-stream`](https://github.com/mizcausevic-dev/grid-decision-record-audit-stream) — the EnergyTech Operator audit-stream that this tracker provides regulatory context to
- [`nerc-cip-readiness-evidence-bundle`](https://github.com/mizcausevic-dev/nerc-cip-readiness-evidence-bundle) — readiness evidence bundle that consumes lifecycle events
- [`state-bar-ai-disclosure-tracker`](https://github.com/mizcausevic-dev/state-bar-ai-disclosure-tracker) — sibling-vertical (LegalTech)
- [`state-government-ai-disclosure-tracker`](https://github.com/mizcausevic-dev/state-government-ai-disclosure-tracker) — sibling-vertical (GovTech)
- [Kinetic Gain Protocol Suite](https://suite.kineticgain.com) — umbrella

## Compliance posture

Tracking-readiness scaffolding for utilities + grid operators + AI vendors. Awareness of state-PUC + federal-regulator obligations does not constitute compliance with those obligations — per the standing public-language guardrail across the Suite. Verify all citations against the current published order before relying on them; this dataset is a starting point, not legal advice.

## License

Spec text + JSON schemas + lifecycle data: MIT.
