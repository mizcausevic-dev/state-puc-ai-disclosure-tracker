# Changelog

## 1.0.0-prod — 2026-05-31

- Hardened to v1.0-prod per squad doctrine; member of the EnergyTech vertical 6-pack.
- Spec-component repo (no Pages deploy required); AGPL-3.0-or-later, synthetic example data only.
- Pulse universe entry not applicable (no custom subdomain).



## [0.1] — 2026-05-30

### Added

- Initial schema + lifecycle-aware verifier.
- 15-value `lifecycle_state` enum covering notice-of-proposed-rulemaking → stakeholder comment → order/guidance issuance → tariff approval / pilot program approval → mandatory compliance → enforcement, plus rescission / supersession / under-review and the `waiver-granted` PUC-specific path.
- 13-value `regulatory_vehicle` enum (state PUC formal order / rulemaking / staff guidance / tariff approval, FERC order / rule, NERC reliability standard / glossary update, DOE EO, TSA SD, EPA Section 114, ISO/RTO BPM / tariff revision).
- 21-item `obligation_kinds` enum spanning utility-regulator + grid-reliability-regulator + cybersecurity obligations. Includes EnergyTech-distinctive: BES categorization attestation, NERC CIP attestation, TSA pipeline controls, OT/IT data-diode attestation, load-shed allocation publication, outage restoration priority publication.
- 20-value `scope.covered_operations` enum spanning wholesale market bidding/clearing, load forecasting, demand-response, outage detection/restoration, load-shed, transmission switching, protective relay, generator dispatch, DER aggregation, EV charging, rate-class design, tariff filing, pipeline operations, cybersecurity/physical-security monitoring, energy efficiency, low-income enrollment.
- 14-value `scope.covered_actors` enum spanning utility ownership models (IOU / publicly-owned / cooperative / rural electric coop), competitive retail, wholesale market participants, ISO/RTO, regional transmission organization, balancing authority, transmission operator, distribution utility, pipeline operators (interstate + intrastate), AI-vendor.
- Seed coverage: 10 jurisdictions — 6 state PUCs (CA / NY / TX / MA / IL / WA), 4 federal+standards+ISO (FERC Order 2222, NERC CIP-013-3, TSA SD-2021-02C, CAISO BPM Rev 71).
- Lifecycle-ordering verifier enforces legal transitions per (jurisdiction, docket) thread — same jurisdiction can have multiple parallel dockets.
- CI workflow.

### Notable design

- The `jurisdiction` field accepts state PUCs, federal agencies, NERC regional entities, ISO/RTOs, and the TSA/DOE/EPA all in one shape. The energy sector's regulatory geography is fundamentally multi-layered (FERC preempts state in wholesale markets, NERC standards apply continent-wide, TSA owns pipeline cybersecurity, state PUCs own retail rates) — collapsing them all into one tracker reflects that reality.
- The per-(jurisdiction, docket) lifecycle threading is necessary because a single state PUC can have multiple parallel AI-related dockets (CA CPUC currently has at least 4). Threading by docket means a CPUC retail-rate AI proceeding can't accidentally pollute a CPUC DER-aggregation proceeding's lifecycle state.

### Not yet

- Full 50-state PUC coverage (only 6 seeded).
- NERC regional entity individual seed events (WECC / MRO / RFC / SERC / NPCC / TRE all have authority but seed shows NERC continent-level).
- Smaller ISOs (SPP) not yet seeded.
- Foreign jurisdictions (Ontario Energy Board, AEMO Australia, Ofgem UK) — would require schema extension to non-US jurisdictions.
- CISA + DHS cybersecurity directives that touch energy critical infrastructure.