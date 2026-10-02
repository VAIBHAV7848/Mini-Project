# ADR-009: Cryptographic SHA-256 Hashing and Hierarchical EvidenceTree Verification

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Darshan Kittur — Engine 02 Lead)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
In freelance marketplaces, dispute resolution is frequently sabotaged by claims of post-submission deliverable tampering, missing test evidence, or altered agreement terms. To enable impartial, evidence-based dispute arbitration, the system requires an indisputable mechanism to prove that submitted files, test runs, and claims have remained byte-for-byte identical from the exact instant of submission.

---

## 2. Decision Outcome
> **Chosen Option**: Mandatory streaming SHA-256 cryptographic hashing on all deliverable uploads coupled with an in-memory N-ary `EvidenceTree` data structure with Merkle-style bottom-up integrity validation.
> **Rationale**: Hardware-accelerated SHA-256 ensures sub-100ms digest generation with mathematical collision resistance. The `EvidenceTree` organizes claims and artifacts into a navigable hierarchy where any byte tampering bubbles up to the root hash in $O(V + E)$ time.

---

## 3. Considered Options
1. **SHA-256 Hashes with N-ary EvidenceTree (Chosen)**:
   - *Pros*: FIPS PUB 180-4 standard; collision resistance; $O(V + E)$ traversal complexity; Merkle-style root verification immediately exposes altered nodes; strong academic DSA alignment.
   - *Cons*: Modest storage overhead for storing 64-character hex checksums.
2. **MD5 / SHA-1 Checksums**:
   - *Pros*: Slightly faster execution.
   - *Cons*: Cryptographically broken; vulnerable to collision attacks; violates modern security baselines.
3. **Simple File Storage Without Checksums**:
   - *Pros*: Zero computation overhead.
   - *Cons*: Fails FR-03 and FR-04; impossible to prove whether files were tampered with during dispute arbitration.

---

## 4. Key Rules Enforced
- **Upload Digesting**: Node.js `crypto.createHash('sha256')` computed over file binary buffers upon upload.
- **Tree Verification**: An in-memory N-ary tree organizes dispute evidence into Root, Claim, Deliverable, and Test Log nodes.
- **Tamper Detection**: Breadth-first search traverses all nodes in $O(V + E)$ time; any hash mismatch halts milestone approval and flags the dispute console.

---

## 5. Consequences
- **Positive Consequences**:
  - Impartial, tamper-evident evidence presented to Dispute Reviewers.
  - Satisfies Engine 02 curriculum requirements for advanced data structures and algorithms.
- **Negative Consequences / Trade-offs**:
  - Requires maintaining the in-memory tree building module.

---

## 6. Links & References
- DSA Architecture: `docs/architecture/dsa-algorithms.md`
- Security Baseline: `docs/security/security-model.md`
