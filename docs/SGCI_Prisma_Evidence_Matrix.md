# SGCI — Prisma Evidence Matrix

**Purpose:** technical traceability for rules in `SGCI_Prisma_Engineering_Standard.md`  
**Status:** Evidence governance baseline  
**Review model:** rule-by-rule, version-aware, provider-aware  
**Last verification baseline:** 2026-09-07

---

# 1. Classification

| Status | Meaning |
|---|---|
| CONFIRMED | Directly supported by applicable official documentation |
| CONDITIONAL | Correct only under stated conditions |
| PROVIDER-DEPENDENT | Depends on database provider/version |
| VERSION-DEPENDENT | Depends on Prisma generation/version |
| ENGINEERING-PRINCIPLE | Architectural recommendation, not Prisma API behavior |
| CORRECTION-REQUIRED | Evidence found that requires document correction |

---

# 2. Evidence record format

Every high-impact rule should eventually contain:

```text
RULE-ID
Status
Rule
Prisma version/generation
Provider
Database version
Capability/feature
Evidence type
Official source
Last verified
Owner/reviewer
Review trigger
Notes
```

A source must be evaluated against the exact version/provider to which the rule applies.

---

# 3. Certified rule register

| RULE-ID | Rule | Status | Prisma | Provider | Evidence classification |
|---|---|---|---|---|---|
| PRISMA-VERSION-001 | Do not mix APIs or concepts from different Prisma generations | CONFIRMED | Version-dependent | Any | Official behavior |
| PRISMA-MODEL-001 | Do not use Contract and Database Schema as synonyms where the generation distinguishes them | CONFIRMED | Prisma 8-specific | Capability-dependent | Official behavior |
| PRISMA-CAP-001 | Advanced features must be verified against version/provider/capability | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-REL-001 | Logical relations do not imply identical physical guarantees in every mode/provider | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-IDX-001 | Indexes must answer a query or integrity requirement | CONFIRMED + ENGINEERING-PRINCIPLE | Version-dependent | Provider-dependent | Official + engineering |
| PRISMA-QUERY-001 | Choose query surface per query requirement | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-RAW-001 | Raw access is an escape hatch governed by version/provider | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-TRX-001 | Transactional operations must use the applicable transaction context/handle | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| ARCH-TXN-001 | Database transaction is not a business workflow | ENGINEERING-PRINCIPLE | Any | Any | Architecture |
| ARCH-CONC-001 | Check-then-insert alone is not a concurrency guarantee | ENGINEERING-PRINCIPLE | Any | Provider-dependent | Concurrency engineering |
| ARCH-IDEMP-001 | Retriable operations need durable identity/idempotency semantics | ENGINEERING-PRINCIPLE | Any | Any | Distributed systems |
| PRISMA-MIG-001 | Existing data is part of migration design | CONFIRMED + ENGINEERING-PRINCIPLE | Version-dependent | Provider-dependent | Official + engineering |
| ARCH-MIG-002 | Expand/backfill/dual-compatibility/switch/contract is conditional migration strategy | ENGINEERING-PRINCIPLE | Any | Provider-dependent | Operations |
| PRISMA-UNIQUE-001 | Critical uniqueness needs durable enforcement | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-REL-003 | Explicit join entity is appropriate when the relationship has domain meaning | ENGINEERING-PRINCIPLE | Any | Any | Domain modeling |
| PRISMA-REF-001 | Referential actions are lifecycle decisions and provider-dependent | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| ARCH-SOFTDELETE-001 | Soft delete is not universal | ENGINEERING-PRINCIPLE | Any | Any | Architecture |
| ARCH-AUDIT-001 | Timestamps are not automatically a full audit trail | ENGINEERING-PRINCIPLE | Any | Any | Architecture |
| ARCH-PERF-001 | Relationship loading must be evaluated against access pattern and query count | ENGINEERING-PRINCIPLE | Any | Any | Performance |
| PRISMA-QUERY-SELECT-001 | Select only data required by the use case | CONFIRMED | Version-dependent | Any | Official behavior |
| PRISMA-PAGE-001 | Offset and cursor pagination serve different workloads | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-PAGE-002 | Stable pagination requires deterministic ordering and tie-breaking where necessary | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-BULK-001 | Evaluate bulk operations for bulk workloads without bypassing invariants | CONFIRMED + CONDITIONAL | Version-dependent | Provider-dependent | Official + engineering |
| ARCH-SEC-001 | ORM does not replace authentication/authorization/runtime validation | ENGINEERING-PRINCIPLE | Any | Any | Security architecture |
| ARCH-SEC-002 | External payload must not become persistence data without explicit shape control | ENGINEERING-PRINCIPLE | Any | Any | Application security |
| PRISMA-OBS-001 | Query/error logging must be configured consciously | CONFIRMED | Version-dependent | Any | Official behavior |
| PRISMA-ERROR-001 | Error categories require different handling | CONFIRMED | Version-dependent | Any | Official behavior |
| PRISMA-CONN-001 | Reuse the client appropriately; do not create one indiscriminately per request | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-POOL-001 | Pool sizing is global across instances and workloads | CONFIRMED | Version-dependent | Provider-dependent | Official + operational |
| PRISMA-POOL-002 | Pool timeout is a pressure signal requiring diagnosis | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-TRX-ISO-001 | Isolation is a concurrency decision and provider-dependent | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| PRISMA-CONC-002 | Retry transient transaction conflicts only when safe and bounded | CONFIRMED + CONDITIONAL | Version-dependent | Provider-dependent | Official + engineering |
| ARCH-TRX-LOAD-001 | Long transactions consume resources and increase contention | ENGINEERING-PRINCIPLE | Any | Provider-dependent | Database engineering |
| PRISMA-MIG-PROD-001 | Production migrations require controlled deployment process | CONFIRMED | Version-dependent | Any | Official behavior |
| PRISMA-MIG-002 | Applied migration history must not be casually rewritten | CONFIRMED | Version-dependent | Provider-dependent | Official behavior |
| ARCH-MIG-ROLLBACK-001 | Application rollback, schema rollback and data recovery are separate concerns | ENGINEERING-PRINCIPLE | Any | Any | Operations |
| ARCH-COMP-001 | External effects require compensation/reconciliation rather than local rollback assumptions | ENGINEERING-PRINCIPLE | Any | Any | Distributed systems |
| ARCH-JOB-001 | Long-running jobs need durable identity and state | ENGINEERING-PRINCIPLE | Any | Any | Workflow architecture |
| ARCH-JOB-002 | Distributed jobs must tolerate duplicate execution | ENGINEERING-PRINCIPLE | Any | Any | Distributed systems |
| ARCH-SEC-003 | Database secrets do not belong in source control | ENGINEERING-PRINCIPLE | Any | Any | Security |
| PRISMA-CONN-002 | Connection topology depends on workload and provider | CONFIRMED + PROVIDER-DEPENDENT | Version-dependent | Provider-dependent | Official behavior |
| ARCH-OBS-003 | Critical workflows need correlation and investigability | ENGINEERING-PRINCIPLE | Any | Any | Observability |
| ARCH-OPS-001 | Critical workflows must be diagnosable and repairable | ENGINEERING-PRINCIPLE | Any | Any | Operations |

---

# 4. Mandatory source hierarchy

1. Official documentation for the exact Prisma version.
2. Official provider/database documentation for provider behavior.
3. Official migration/runtime/security documentation.
4. Reproducible tests against representative infrastructure.
5. Explicit engineering principles, clearly labeled as such.

Blogs, snippets and memory are not sufficient evidence for a version-sensitive rule.

---

# 5. Review triggers

A rule must be revalidated when any of the following changes:

- Prisma major version;
- Prisma minor version affecting the feature;
- provider;
- database major version;
- adapter/driver;
- preview/experimental feature status;
- deployment topology;
- connection pooling architecture;
- migration strategy.

---

# 6. Certification gate for new rules

No high-impact rule enters the standard without:

- RULE-ID;
- classification;
- scope;
- version/provider statement;
- evidence or explicit engineering-principle label;
- last verification date;
- review trigger.

---

# 7. Open evidence queue

The following areas require continuing exact-version verification before being described as universal:

1. Exact Prisma version installed by SGCI.
2. Exact database provider and version used by SGCI environments.
3. Query API surface actually available in the installed Prisma generation.
4. Transaction API and supported isolation configuration.
5. Migration workflow available to the installed generation.
6. Connection pooling topology in production.
7. Provider-specific relation/integrity mode.
8. Preview or experimental features, if any.

---

# 8. Governance principle

> A rule is not “officially true” merely because it is plausible or widely repeated. Its scope must be known.

The canonical interpretation model is:

```text
API behavior
→ Prisma version

Database behavior
→ Provider + database version

Advanced feature
→ Capability + configuration

Architecture recommendation
→ Engineering principle

Operational recommendation
→ Workload + deployment dependent
```

This matrix is a living evidence register. The engineering standard defines the rules; this file defines why each rule is trusted and when it must be reviewed.
