import { describe, it, expect } from 'vitest';
import { Sha256Hasher } from '@/core/engine-02-dsa-se/hasher';
import { EvidenceTreeManager, EvidenceNodeType } from '@/core/engine-02-dsa-se/evidence-tree';
import { HeuristicSemanticMatcher } from '@/core/engine-02-dsa-se/matcher';

describe('Engine 02 (DSA/SE) — SHA-256 Hasher', () => {
  const hasher = new Sha256Hasher();

  it('should compute exact 64-character hex SHA-256 digest', () => {
    const data = Buffer.from('milestone deliverable zip content proof');
    const digest = hasher.computeDigest(data);
    expect(digest).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(digest)).toBe(true);
  });

  it('should verify matching checksums and detect tampered content', () => {
    const original = Buffer.from('original code deliverable');
    const digest = hasher.computeDigest(original);

    expect(hasher.verifyDigest(original, digest)).toBe(true);

    const tampered = Buffer.from('tampered malicious code');
    expect(hasher.verifyDigest(tampered, digest)).toBe(false);
  });
});

describe('Engine 02 (DSA/SE) — N-ary EvidenceTree Hierarchical Index', () => {
  const treeManager = new EvidenceTreeManager();

  it('should build hierarchical tree and calculate Merkle integrity hashes', () => {
    const disputeId = 'dispute-001';
    const root = treeManager.createRoot(disputeId, 'Milestone Rejection Dispute');

    const claim1 = treeManager.addNode(root, {
      id: 'claim-1',
      type: EvidenceNodeType.CLAIM,
      title: 'Freelancer Deliverable Submission',
      metadata: { milestoneId: 'm-01' },
      payload: 'Deliverable ZIP uploaded on 2026-10-02',
    });

    const leaf1 = treeManager.addNode(claim1, {
      id: 'leaf-1',
      type: EvidenceNodeType.DELIVERABLE,
      title: 'm-01-final.zip',
      metadata: { fileSize: '1048576' },
      payload: 'binary-file-content-sample-a',
    });

    const leaf2 = treeManager.addNode(claim1, {
      id: 'leaf-2',
      type: EvidenceNodeType.TEST_LOG,
      title: 'unit-test-results.json',
      metadata: { testsPassed: '42' },
      payload: '{"passed": 42, "failed": 0}',
    });

    treeManager.computeMerkleHashes(root);

    expect(root.merkleHash).toHaveLength(64);
    expect(claim1.merkleHash).toHaveLength(64);
    expect(leaf1.merkleHash).toHaveLength(64);
    expect(leaf2.merkleHash).toHaveLength(64);

    // Assert that root hash is derived from children
    expect(root.merkleHash).not.toEqual(leaf1.merkleHash);
  });

  it('should detect altered leaf nodes during O(V+E) traversal', () => {
    const disputeId = 'dispute-002';
    const root = treeManager.createRoot(disputeId, 'Tamper Detection Test');
    const claim = treeManager.addNode(root, {
      id: 'claim-2',
      type: EvidenceNodeType.CLAIM,
      title: 'Claim with single artifact',
      metadata: {},
      payload: 'Original claim text',
    });

    const leaf = treeManager.addNode(claim, {
      id: 'leaf-tamper',
      type: EvidenceNodeType.DELIVERABLE,
      title: 'artifact.zip',
      metadata: {},
      payload: 'genuine-code-content',
    });

    treeManager.computeMerkleHashes(root);
    const recordedRootHash = root.merkleHash;

    // Verify pristine tree
    const pristineCheck = treeManager.verifyTreeIntegrity(root);
    expect(pristineCheck.isValid).toBe(true);

    // Tamper with the leaf payload directly
    leaf.payloadChecksum = 'badbeefbadbeefbadbeefbadbeefbadbeefbadbeefbadbeefbadbeefbadbeef00';

    // Verify tampered tree
    const tamperedCheck = treeManager.verifyTreeIntegrity(root, recordedRootHash);
    expect(tamperedCheck.isValid).toBe(false);
    expect(tamperedCheck.tamperedNodeIds).toContain('leaf-tamper');
  });
});

describe('Engine 02 (DSA/SE) — Heuristic Semantic Proposal Matcher (FR-11)', () => {
  const matcher = new HeuristicSemanticMatcher();

  it('should calculate deterministic composite score using Jaccard, Budget, and DevScore', () => {
    const project = {
      budget: 1000.0,
      skillTags: ['react', 'node', 'typescript'],
    };

    const proposal = {
      bidAmount: 900.0,
      freelancerSkills: ['react', 'node'],
      devScore: 85,
    };

    const result = matcher.calculateMatchScore(project, proposal);

    // Jaccard: 2 / 3 = 0.6667 -> 66.67
    // Budget: 900 / 1000 = 0.90 -> 90.00
    // Reputation: 85.00
    // Composite: (0.50 * 66.67) + (0.30 * 90.00) + (0.20 * 85.00) = 33.33 + 27.00 + 17.00 = 77.33
    expect(result.compositeScore).toBeGreaterThanOrEqual(77.0);
    expect(result.compositeScore).toBeLessThanOrEqual(78.0);
    expect(result.subScores.skillScore).toBeCloseTo(66.67, 1);
    expect(result.subScores.budgetScore).toBe(90.0);
    expect(result.subScores.reputationScore).toBe(85.0);
  });

  it('should be 100% deterministic across multiple identical runs', () => {
    const project = {
      budget: 2500.0,
      skillTags: ['python', 'sqlite', 'docker'],
    };

    const proposal = {
      bidAmount: 2500.0,
      freelancerSkills: ['python', 'sqlite', 'docker'],
      devScore: 90,
    };

    const run1 = matcher.calculateMatchScore(project, proposal);
    const run2 = matcher.calculateMatchScore(project, proposal);

    expect(run1.compositeScore).toBe(run2.compositeScore);
    expect(run1.compositeScore).toBe(98.0); // (0.50 * 100) + (0.30 * 100) + (0.20 * 90) = 50 + 30 + 18 = 98.0
  });

  it('should correctly break ties using higher DevScore', () => {
    const ranked = matcher.rankProposals([
      { id: 'prop-1', compositeScore: 80.0, devScore: 70, submittedAt: new Date('2026-10-02T10:00:00Z') },
      { id: 'prop-2', compositeScore: 80.0, devScore: 90, submittedAt: new Date('2026-10-02T11:00:00Z') },
      { id: 'prop-3', compositeScore: 85.0, devScore: 60, submittedAt: new Date('2026-10-02T09:00:00Z') },
    ]);

    expect(ranked[0].id).toBe('prop-3'); // Highest score
    expect(ranked[1].id).toBe('prop-2'); // Tied score, but higher devScore (90 vs 70)
    expect(ranked[2].id).toBe('prop-1');
  });
});
