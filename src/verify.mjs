#!/usr/bin/env node
// verify.mjs — Validates every event in jurisdictions/*.ndjson against the
// schema AND enforces lifecycle ordering per-jurisdiction (per-(jurisdiction,
// docket_or_order_id) thread): events sorted by timestamp must form a legal
// transition chain. Different dockets within the same jurisdiction are
// independent threads.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, "../schema/disclosure-event.schema.json");
const DIR = join(HERE, "../jurisdictions");

// Source state → set of legal next states.
const TRANSITIONS = {
  "notice-of-proposed-rulemaking":     new Set(["in-stakeholder-comment", "order-issued", "guidance-issued", "rescinded", "under-review"]),
  "in-stakeholder-comment":              new Set(["order-issued", "guidance-issued", "notice-of-proposed-rulemaking", "rescinded", "under-review"]),
  "staff-guidance-issued":              new Set(["order-issued", "guidance-issued", "mandatory-compliance-effective", "rescinded", "superseded", "under-review"]),
  "order-issued":                        new Set(["mandatory-compliance-effective", "tariff-approval-granted", "pilot-program-approved", "enforcement-active", "waiver-granted", "rescinded", "superseded", "under-review"]),
  "guidance-issued":                     new Set(["mandatory-compliance-effective", "advisory-non-binding", "order-issued", "rescinded", "superseded", "under-review"]),
  "tariff-approval-granted":            new Set(["mandatory-compliance-effective", "enforcement-active", "rescinded", "superseded", "under-review"]),
  "pilot-program-approved":             new Set(["mandatory-compliance-effective", "enforcement-active", "rescinded", "superseded", "under-review"]),
  "mandatory-compliance-effective":     new Set(["enforcement-active", "enforcement-action-published", "waiver-granted", "rescinded", "superseded", "under-review"]),
  "enforcement-active":                  new Set(["enforcement-action-published", "rescinded", "superseded", "under-review"]),
  "enforcement-action-published":        new Set(["enforcement-active", "rescinded", "superseded", "under-review"]),
  "waiver-granted":                      new Set(["mandatory-compliance-effective", "enforcement-active", "rescinded", "superseded", "under-review"]),
  "advisory-non-binding":                new Set(["order-issued", "guidance-issued", "rescinded", "superseded", "under-review", "advisory-non-binding"]),
  "rescinded":                           new Set([]),
  "superseded":                          new Set([]),
  "under-review":                        new Set(["order-issued", "guidance-issued", "mandatory-compliance-effective", "rescinded", "superseded"])
};

function loadNdjson(path) {
  return readFileSync(path, "utf8").trim().split("\n").filter(Boolean).map((line, i) => {
    try { return JSON.parse(line); } catch (e) {
      throw new Error(`${path}:${i + 1} invalid JSON: ${e.message}`);
    }
  });
}

function main() {
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const files = readdirSync(DIR).filter((f) => f.endsWith(".ndjson")).sort();
  let totalEvents = 0;
  let totalJurisdictions = 0;

  for (const file of files) {
    const events = loadNdjson(join(DIR, file)).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (events.length === 0) continue;
    totalJurisdictions += 1;

    // Schema check
    for (const [i, event] of events.entries()) {
      if (!validate(event)) {
        console.error(`${file} event[${i}] (${event.event_id}) schema fail:`);
        for (const e of validate.errors || []) console.error(`  ${e.instancePath} ${e.message}`);
        process.exit(1);
      }
      totalEvents += 1;
    }

    // Lifecycle ordering — thread by (jurisdiction, docket_or_order_id).
    // Same jurisdiction can have multiple parallel dockets; sort within
    // each thread by timestamp + enforce legal transitions.
    const threads = new Map();
    for (const event of events) {
      const docket = event.citation?.docket_or_order_id || "(no-docket)";
      if (!threads.has(docket)) threads.set(docket, []);
      threads.get(docket).push(event);
    }
    for (const [docket, thread] of threads) {
      for (let i = 1; i < thread.length; i++) {
        const prev = thread[i - 1];
        const cur = thread[i];
        const legal = TRANSITIONS[prev.lifecycle_state];
        if (!legal) {
          console.error(`${file} docket=${docket} event[${i}] (${cur.event_id}) lifecycle: unknown previous state "${prev.lifecycle_state}"`);
          process.exit(2);
        }
        if (!legal.has(cur.lifecycle_state)) {
          console.error(`${file} docket=${docket} event[${i}] (${cur.event_id}) lifecycle: illegal transition ${prev.lifecycle_state} → ${cur.lifecycle_state} (allowed next: ${[...legal].sort().join(", ")})`);
          process.exit(2);
        }
      }
    }
  }

  console.log(`OK · ${totalEvents} events across ${totalJurisdictions} jurisdictions · schema ✓ · lifecycle transitions ✓`);
}

main();
