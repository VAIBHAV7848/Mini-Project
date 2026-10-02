import { describe, it, expect } from 'vitest';
import { Sha256Hasher } from '@/core/engine-02-dsa-se/hasher';
import { EvidenceTreeManager, EvidenceNodeType } from '@/core/engine-02-dsa-se/evidence-tree';
import { HeuristicSemanticMatcher } from '@/core/engine-02-dsa-se/matcher';

describe('Engine 02 (DSA/SE) — Cryptographic SHA-256 Boundary & Edge Case Audit', () => {
  const hasher = new Sha256Hasher();

  it('should compute canonical SHA-256 digest for an empty buffer', () => {
    const emptyBuffer = Buffer.from('');
    const digest = hasher.computeDigest(emptyBuffer);
    expect(digest).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(hasher.verifyDigest(emptyBuffer, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')).toBe(true);
  });

  it('should correctly process large 5MB deliverable buffers with zero corruption', () => {
    // 5MB buffer
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024, 0x41); // 'A'
    const digest = hasher.computeDigest(largeBuffer);
    expect(digest).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(digest)).toBe(true);
    expect(hasher.verifyDigest(largeBuffer, digest)).toBe(true);

    // Single byte flip must cause verification failure
    largeBuffer[2 * 1024 * 1024] = 0x42; // flip 'A' to 'B'
    expect(hasher.verifyDigest(largeBuffer, digest)).toBe(false);
  });
});

describe('Engine 02 (DSA/SE) — Hierarchical EvidenceTree Structural & Merkle Integrity Audit', () => {
  const treeManager = new EvidenceTreeManager();

  it('should build deep hierarchical tree and detect tampering at any intermediate depth', () => {
    const root = treeManager.createRoot('dispute-deep', 'Complex Multi-Stage Milestone Dispute');

    // Build 4-level deep hierarchy
    const claim = treeManager.addNode(root, {
      id: 'node-claim-1',
      type: EvidenceNodeType.CLAIM,
      title: 'Claim: Defective Architecture Deliverable',
      metadata: { milestoneId: 'm-100' },
      payload: 'Client asserts missing unit test reports.',
    });

    const subclaim = treeManager.addNode(claim, {
      id: 'node-subclaim-1',
      type: EvidenceNodeType.CLAIM,
      title: 'Subclaim: Broken CI Pipeline',
      metadata: {},
      payload: 'Build artifacts failed on commit abc.',
    });

    const deliverableLeaf = treeManager.addNode(subclaim, {
      id: 'node-leaf-deliverable',
      type: EvidenceNodeType.DELIVERABLE,
      title: 'deliverable.tar.gz',
      metadata: { size: '4096' },
      payload: 'original-binary-data-stream',
    });

    treeManager.computeMerkleHashes(root);
    const recordedRootHash = root.merkleHash;

    // Pristine verification
    const pristineCheck = treeManager.verifyTreeIntegrity(root, recordedRootHash);
    expect(pristineCheck.isValid).toBe(true);

    // Tamper with intermediate node payload
    subclaim.payloadChecksum = 'f'.repeat(64);

    const tamperedCheck = treeManager.verifyTreeIntegrity(root, recordedRootHash);
    expect(tamperedCheck.isValid).toBe(false);
    expect(tamperedCheck.tamperedNodeIds).toContain('node-subclaim-1');
  });

  it('should support multiple parallel leaf nodes across claims', () => {
    const root = treeManager.createRoot('dispute-broad', 'Broad Dispute');
    const claim = treeManager.addNode(root, {
      id: 'claim-broad',
      type: EvidenceNodeType.CLAIM,
      title: 'Multiple deliverables',
      metadata: {},
      payload: 'Summary of artifacts',
    });

    for (let i = 0; i < 10; i++) {
      treeManager.addNode(claim, {
        id: `leaf-item-${i}`,
        type: EvidenceNodeType.TEST_LOG,
        title: `Test Log #${i}`,
        metadata: { run: i.toString() },
        payload: `Log output content for run ${i}`,
      });
    }

    treeManager.computeMerkleHashes(root);
    expect(root.children[0].children).toHaveLength(10);
    const check = treeManager.verifyTreeIntegrity(root);
    expect(check.isValid).toBe(true);
  });
});

describe('Engine 02 (DSA/SE) — Heuristic Proposal Matcher Boundary & Tie-Breaking Audit (FR-11)', () => {
  const matcher = new HeuristicSemanticMatcher();

  it('should calculate 0% skill match score for disjoint sets', () => {
    const project = {
      budget: 1000.0,
      skillTags: ['csharp', 'dotnet', 'azure'],
    };

    const proposal = {
      bidAmount: 1000.0,
      freelancerSkills: ['python', 'django', 'aws'],
      devScore: 50,
    };

    const result = matcher.calculateMatchScore(project, proposal);

    // Skill score: 0
    // Budget score: 100
    // DevScore: 50
    // Composite: (0.50 * 0) + (0.30 * 100) + (0.20 * 50) = 0 + 30 + 10 = 40.0
    expect(result.subScores.skillScore).toBe(0);
    expect(result.subScores.budgetScore).toBe(100.0);
    expect(result.compositeScore).toBe(40.0);
  });

  it('should calculate 100% skill match score for identical sets', () => {
    const project = {
      budget: 1000.0,
      skillTags: ['react', 'nextjs', 'typescript'],
    };

    const proposal = {
      bidAmount: 1000.0,
      freelancerSkills: ['typescript', 'react', 'nextjs'],
      devScore: 100,
    };

    const result = matcher.calculateMatchScore(project, proposal);

    // Composite: (0.50 * 100) + (0.30 * 100) + (0.20 * 100) = 100.0
    expect(result.subScores.skillScore).toBe(100.0);
    expect(result.subScores.budgetScore).toBe(100.0);
    expect(result.compositeScore).toBe(100.0);
  });

  it('should handle proposal where bid exceeds project budget according to 50% tolerance window', () => {
    const project = {
      budget: 1000.0,
      skillTags: ['typescript'],
    };

    // Case 1: 1500 bid (50% above budget, boundary of tolerance) -> score 50.0
    const proposalBoundary = {
      bidAmount: 1500.0,
      freelancerSkills: ['typescript'],
      devScore: 80,
    };
    const resultBoundary = matcher.calculateMatchScore(project, proposalBoundary);
    expect(resultBoundary.subScores.budgetScore).toBe(50.0);

    // Case 2: 2000 bid (100% above budget, beyond 50% tolerance) -> score 0.0
    const proposalExceeding = {
      bidAmount: 2000.0,
      freelancerSkills: ['typescript'],
      devScore: 80,
    };
    const resultExceeding = matcher.calculateMatchScore(project, proposalExceeding);
    expect(resultExceeding.subScores.budgetScore).toBe(0.0);
    expect(resultExceeding.compositeScore).toBeGreaterThan(0); // Still gets points from skill and devScore
  });

  it('should deterministically break ties using devScore, then submission timestamp', () => {
    const timeA = new Date('2026-10-02T10:00:00Z');
    const timeB = new Date('2026-10-02T11:00:00Z');

    const proposals = [
      { id: 'p-lower-reputation', compositeScore: 80.0, devScore: 70, submittedAt: timeA },
      { id: 'p-higher-reputation', compositeScore: 80.0, devScore: 95, submittedAt: timeB },
      { id: 'p-top-score', compositeScore: 90.0, devScore: 50, submittedAt: timeB },
    ];

    const ranked = matcher.rankProposals(proposals);

    expect(ranked[0].id).toBe('p-top-score');
    expect(ranked[1].id).toBe('p-higher-reputation');
    expect(ranked[2].id).toBe('p-lower-reputation');
  });
});
