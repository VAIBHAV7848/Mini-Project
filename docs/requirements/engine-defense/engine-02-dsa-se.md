# Engine 02 Defense — DSA & Software Engineering Engine

> **Student Owner**: Darshan Kittur (Roll No: 18, SRN: `02FE24BCS053`)
> **Owning Engine**: Engine 02 — Evidence & Quality Assurance
> **Academic Subject**: Data Structures & Algorithms (DSA) and Software Engineering (SE)
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1)

---

## 1. Academic Subject & Curricular Alignment
- **Foundational Subject**: Data Structures & Algorithms, Software Engineering
- **Core Curricular Principles**:
  - Non-linear data structures: Hierarchical N-ary Trees and directed graphs.
  - Tree traversal algorithms: Depth-First Search (DFS) and Breadth-First Search (BFS) with $O(V+E)$ complexity.
  - Cryptographic hashing: Deterministic, collision-resistant message digests (SHA-256).
  - Information retrieval heuristics: Set intersection, Jaccard similarity, and weighted scoring.
  - Software Engineering V&V: Verification & Validation planning, Bidirectional Requirements Traceability Matrix (RTM), and acceptance testing.

---

## 2. Problem Being Solved
1. **Deliverable Tampering & Repudiation**: Clients may claim a delivered file was corrupt or incomplete; freelancers may attempt to covertly swap files after submission deadlines.
2. **Chaotic Dispute Information**: Disorganized chat logs, revisions, and screenshots make it impossible for arbiters to establish a chronological, causal chain of evidence.
3. **Inefficient Skill Matching**: Clients receive dozens of mismatched proposals, requiring heuristic algorithmic scoring to rank relevant freelancers.
4. **Software Quality Gaps**: Without formal requirements engineering and traceability, systems accumulate orphan requirements and untestable features.

---

## 3. Functional Requirements Owned
- **FR-03: Cryptographic Checksum Verification**: Generates and verifies SHA-256 digests for all submitted deliverables, preventing silent alteration or post-submission tampering.
- **FR-04: Tamper-Evident Evidence Tree Construction**: Constructs an in-memory hierarchical N-ary tree representing the dispute claim, milestone contract, deliverable artifacts, and chronological audit nodes.
- **FR-11: Heuristic Tag-Based Semantic Proposal Matcher (Primary Owner)**: Computes a weighted matching score between project requirement tags and freelancer profile skills.
- **Software Engineering Quality Assurance**: Authors and maintains the Bidirectional Requirements Traceability Matrix (RTM) and Verification & Validation plan.

---

## 4. Core Concepts Demonstrated
1. **Hierarchical Evidence Tree Data Structure**:
   - Root Node: Dispute Case.
   - Child Nodes: Contract Clauses, Milestones, Submission Deliverables, Revision Requests, and Cryptographic Hash Leaves.
   - Invariant: Every leaf artifact contains a verified SHA-256 digest linked to an immutable parent submission node.
2. **Algorithm Complexity Optimization**:
   - Evidence tree compilation and topological chronological traversal executes in $O(V + E)$ time, where $V$ is evidence artifacts and $E$ is chronological dependencies.
3. **Cryptographic Checksumming (Node.js Crypto / SHA-256)**:
   - Streamed chunk calculation yielding a 64-character hexadecimal digest.
4. **Software Engineering V&V**:
   - 100% bidirectional traceability from Gate 0 needs to FRs, NFRs, Use Cases, and acceptance criteria.

---

## 5. Why This Belongs to DSA & Software Engineering
- **DSA Justification**: Evidence is fundamentally non-linear and hierarchical. A flat list cannot model parent-child relationships between contract revisions, submitted deliverables, and dispute claims. Modeling this as an N-ary tree and traversing it chronologically demonstrates core tree algorithm competencies.
- **Software Engineering Justification**: Quality Assurance is an SE discipline. The SE lead owns the SRS integrity, verification methods, acceptance criteria boundaries, and the RTM that guarantees every stakeholder need is implemented and verified.

---

## 6. Expected Gate 1 Evidence
- **Evidence Tree Node Schema & Invariant Specification**: Node class definition, child pointers, and hash integrity fields.
- **Traversal Complexity Analysis**: Mathematical derivation showing $O(V+E)$ traversal and serialization performance.
- **Heuristic Matching Formula**:
  $$\text{MatchScore} = w_1 \cdot \frac{|T_{\text{project}} \cap T_{\text{freelancer}}|}{|T_{\text{project}} \cup T_{\text{freelancer}}|} + w_2 \cdot \text{RateCompatibility}$$
- **Bidirectional RTM**: Matrix connecting Need $\rightarrow$ FR $\rightarrow$ Engine $\rightarrow$ Use Case $\rightarrow$ NFR.

---

## 7. Likely Evaluator Questions & Exact Defenses

### Q1: "Why do you need an Evidence Tree? Why not just use a simple SQL table of uploaded files?"
> **Defense**: "A simple flat database table records records independently, losing hierarchical causality. When a dispute is adjudicated, the reviewer needs to understand context: 'Deliverable B was submitted as Revision 2 in response to Client Rejection A on Milestone 1'. An in-memory Evidence Tree captures this as a directed acyclic graph/tree of evidence nodes. This allows the system to traverse the tree in topological or chronological order, verifying every leaf node's SHA-256 hash against its submission node, producing a complete, verifiable timeline for arbitration."

### Q2: "What is the computational complexity of the Evidence Tree, and how does it scale?"
> **Defense**: "For a typical milestone dispute, the number of nodes $V$ (contract, milestones, submissions, messages) is bounded (typically $V < 100$). Compiling the tree from normalized database records requires $O(V)$ time. Traversing and rendering the tree using Depth-First Search takes $O(V + E)$ time. Because $V$ is small and $E \le V - 1$ in a tree, traversal completes in under 2 milliseconds in memory, well within our NFR-01 latency budget of 500 ms."

### Q3: "How does a SHA-256 hash prove that the work was done correctly? Doesn't it only prove the file wasn't changed?"
> **Defense**: "That is an important distinction. A cryptographic hash provides *integrity* and *non-repudiation*, not qualitative correctness. It guarantees that the exact byte stream uploaded by the freelancer at timestamp $T_1$ is identical to what the client inspected at $T_2$ and what the arbiter inspects at $T_3$. Qualitative validation is the responsibility of the client or human dispute reviewer. SHA-256 eliminates file tampering, bait-and-switch submissions, and false claims of file corruption."

### Q4: "Why is FR-11 (AI/Semantic Matching) assigned to Engine 02 instead of Engine 03 (DBMS)?"
> **Defense**: "Slide 11 of our authoritative presentation explicitly places AI matching under Cluster B (Evidence & Verification - Darshan Kittur). Algorithmic matching involves string tokenization, stop-word elimination, tag similarity set calculation (Jaccard similarity), and weight matrix scoring. These are algorithmic and information-retrieval concepts belonging to DSA and Software Engineering. Engine 03 provides the persistence layer (fetching candidate records), but Engine 02 owns the matching logic and scoring accuracy."
