import { Sha256Hasher, globalSha256Hasher } from './hasher';

export enum EvidenceNodeType {
  ROOT = 'ROOT',
  CLAIM = 'CLAIM',
  DELIVERABLE = 'DELIVERABLE',
  TEST_LOG = 'TEST_LOG',
  COMMUNICATION = 'COMMUNICATION',
}

export interface EvidenceNode {
  id: string;
  parentId: string | null;
  type: EvidenceNodeType;
  title: string;
  metadata: Record<string, string>;
  payloadChecksum: string;
  merkleHash: string;
  children: EvidenceNode[];
  timestamp: string;
}

export interface TreeVerificationResult {
  isValid: boolean;
  tamperedNodeIds: string[];
  rootHash: string;
}

export class EvidenceTreeManager {
  constructor(private hasher: Sha256Hasher = globalSha256Hasher) {}

  createRoot(disputeId: string, title: string): EvidenceNode {
    return {
      id: disputeId,
      parentId: null,
      type: EvidenceNodeType.ROOT,
      title,
      metadata: {},
      payloadChecksum: this.hasher.computeDigest(title),
      merkleHash: '',
      children: [],
      timestamp: new Date().toISOString(),
    };
  }

  addNode(
    parent: EvidenceNode,
    params: {
      id: string;
      type: EvidenceNodeType;
      title: string;
      metadata: Record<string, string>;
      payload: Buffer | string;
    }
  ): EvidenceNode {
    const node: EvidenceNode = {
      id: params.id,
      parentId: parent.id,
      type: params.type,
      title: params.title,
      metadata: params.metadata,
      payloadChecksum: this.hasher.computeDigest(params.payload),
      merkleHash: '',
      children: [],
      timestamp: new Date().toISOString(),
    };

    parent.children.push(node);
    return node;
  }

  computeMerkleHashes(node: EvidenceNode): string {
    // Post-order DFS traversal (children first)
    for (const child of node.children) {
      this.computeMerkleHashes(child);
    }

    if (node.children.length === 0) {
      // Leaf node
      node.merkleHash = node.payloadChecksum;
    } else {
      // Internal or root node: hash concatenation of payload checksum and all children's merkle hashes
      const combinedChildrenHash = node.children.map((c) => c.merkleHash).join('');
      node.merkleHash = this.hasher.computeDigest(`${node.payloadChecksum}:${combinedChildrenHash}`);
    }

    return node.merkleHash;
  }

  verifyTreeIntegrity(root: EvidenceNode, expectedRootHash?: string): TreeVerificationResult {
    const tamperedNodeIds: string[] = [];

    // Recompute and verify bottom-up
    const recomputeAndCheck = (node: EvidenceNode): string => {
      for (const child of node.children) {
        recomputeAndCheck(child);
      }

      const expected =
        node.children.length === 0
          ? node.payloadChecksum
          : this.hasher.computeDigest(
              `${node.payloadChecksum}:${node.children.map((c) => c.merkleHash).join('')}`
            );

      if (node.merkleHash !== expected) {
        tamperedNodeIds.push(node.id);
      }

      return expected;
    };

    const calculatedRoot = recomputeAndCheck(root);

    if (expectedRootHash && calculatedRoot !== expectedRootHash) {
      if (!tamperedNodeIds.includes(root.id)) {
        tamperedNodeIds.push(root.id);
      }
    }

    return {
      isValid: tamperedNodeIds.length === 0,
      tamperedNodeIds,
      rootHash: calculatedRoot,
    };
  }
}

export const globalEvidenceTreeManager = new EvidenceTreeManager();
