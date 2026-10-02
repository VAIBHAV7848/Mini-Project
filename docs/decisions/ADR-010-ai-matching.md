# ADR-010: Deterministic Heuristic Multi-Attribute Proposal Matching (FR-11)

## Metadata
- **Status**: Accepted
- **Date**: 2026-10-02
- **Author(s)**: Team 07 (Darshan Kittur — Engine 02 Lead & Purvi Sammatshetti — Engine 03 Lead)
- **Deciders**: Team 07, Project Guide
- **Consulted**: Department of Computer Science and Engineering, KLE Technological University

---

## 1. Context and Problem Statement
Functional Requirement FR-11 describes "AI Semantic Matching" to score incoming freelancer proposals against client project specifications. In academic and production contexts, there is a risk of confusion between stochastic generative AI (e.g. OpenAI GPT API calls) and deterministic algorithmic heuristics.

Using external generative AI APIs introduces external network dependencies, non-deterministic scoring variations between runs, recurring API subscription costs, and potential token exfiltration of client project details.

---

## 2. Decision Outcome
> **Chosen Option**: Implement a deterministic mathematical multi-attribute heuristic scoring model combining Jaccard set similarity on normalized skill tags ($w = 0.50$), budget ratio fit ($w = 0.30$), and developer reputation rating ($w = 0.20$).
> **Rationale**: Deterministic mathematical formulation guarantees $100\%$ score reproducibility across evaluations, zero external API costs or network latency, full transparency and explainability for clients, and direct grading alignment with Engine 02 (DSA & SE).

---

## 3. Considered Options
1. **Deterministic Heuristic Multi-Attribute Model (Chosen)**:
   - *Pros*: $100\%$ deterministic; $O(M \cdot N)$ complexity; explainable sub-score breakdown; zero operational cost; runs offline on local lab machines.
   - *Cons*: Does not parse unconstrained natural language cover letters with deep semantic vector embeddings.
2. **External Generative LLM API (OpenAI / Anthropic)**:
   - *Pros*: Rich natural language semantic parsing.
   - *Cons*: Stochastic output (different score on every run); breaks offline local lab evaluation; introduces cost and external API rate-limiting risks.
3. **Local Vector Embeddings (Transformers.js / ONNX)**:
   - *Pros*: Local semantic vector search.
   - *Cons*: Heavier memory footprint ($> 500\text{ MB}$ model weights); adds dependency bloat; unnecessary for tag-based matching scope.

---

## 4. Key Rules Enforced
- **Mathematical Formula**:
  $$S_{\text{match}} = (0.50 \cdot S_{\text{skill}}) + (0.30 \cdot S_{\text{budget}}) + (0.20 \cdot S_{\text{rep}})$$
- **Score Range**: Strictly normalized $\in [0.00, 100.00]$.
- **Explainability**: API response returns both composite score and granular sub-score breakdowns.
- **Engine Ownership**: Primary ownership assigned to Engine 02 (Darshan Kittur) for the algorithmic computation; Engine 03 (Purvi Sammatshetti) provides supporting relational data queries (ratified in Decision D-01).

---

## 5. Consequences
- **Positive Consequences**:
  - Predictable, testable, and demonstrable in faculty Viva sessions.
  - Satisfies FR-11 and Decision D-01 with zero external cloud dependencies.
- **Negative Consequences / Trade-offs**:
  - Developers must enter normalized skill tags rather than unstructured free-form text.

---

## 6. Links & References
- DSA Architecture: `docs/architecture/dsa-algorithms.md`
- Team Decisions: `docs/requirements/gate-1-team-decisions.md` (Decision D-01)
