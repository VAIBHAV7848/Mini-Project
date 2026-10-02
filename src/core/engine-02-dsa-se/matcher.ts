export interface ProjectMatchInput {
  budget: number;
  skillTags: string[];
}

export interface ProposalMatchInput {
  bidAmount: number;
  freelancerSkills: string[];
  devScore: number;
}

export interface MatchScoreResult {
  compositeScore: number;
  subScores: {
    skillScore: number;
    budgetScore: number;
    reputationScore: number;
  };
  weights: {
    skillWeight: number;
    budgetWeight: number;
    reputationWeight: number;
  };
}

export interface ProposalRankingItem {
  id: string;
  compositeScore: number;
  devScore: number;
  submittedAt: Date;
  [key: string]: unknown;
}

export class HeuristicSemanticMatcher {
  private static readonly WEIGHT_SKILL = 0.5;
  private static readonly WEIGHT_BUDGET = 0.3;
  private static readonly WEIGHT_REPUTATION = 0.2;

  calculateMatchScore(
    project: ProjectMatchInput,
    proposal: ProposalMatchInput
  ): MatchScoreResult {
    // 1. Skill Score: Jaccard Set Similarity over normalized tokens
    const projectTags = new Set(project.skillTags.map((t) => t.trim().toLowerCase()));
    const devSkills = new Set(proposal.freelancerSkills.map((s) => s.trim().toLowerCase()));

    let intersectionSize = 0;
    for (const tag of projectTags) {
      if (devSkills.has(tag)) {
        intersectionSize++;
      }
    }

    const unionSize = new Set([...projectTags, ...devSkills]).size;
    const jaccard = unionSize > 0 ? intersectionSize / unionSize : 0.0;
    const skillScore = Number((jaccard * 100).toFixed(2));

    // 2. Budget Score: Bid-to-budget ratio fit
    const budgetRatio = project.budget > 0 ? proposal.bidAmount / project.budget : 0.0;
    let budgetScore = 0.0;

    if (budgetRatio >= 0.5 && budgetRatio <= 1.5) {
      const deviation = Math.abs(budgetRatio - 1.0);
      budgetScore = Math.max(0.0, 100.0 - deviation * 100.0);
    }
    budgetScore = Number(budgetScore.toFixed(2));

    // 3. Reputation Score: Clamped developer score (0 to 100)
    const reputationScore = Math.max(0, Math.min(100, proposal.devScore));

    // 4. Composite Weighted Score
    const compositeRaw =
      HeuristicSemanticMatcher.WEIGHT_SKILL * skillScore +
      HeuristicSemanticMatcher.WEIGHT_BUDGET * budgetScore +
      HeuristicSemanticMatcher.WEIGHT_REPUTATION * reputationScore;

    const compositeScore = Number(compositeRaw.toFixed(2));

    return {
      compositeScore,
      subScores: {
        skillScore,
        budgetScore,
        reputationScore,
      },
      weights: {
        skillWeight: HeuristicSemanticMatcher.WEIGHT_SKILL,
        budgetWeight: HeuristicSemanticMatcher.WEIGHT_BUDGET,
        reputationWeight: HeuristicSemanticMatcher.WEIGHT_REPUTATION,
      },
    };
  }

  rankProposals<T extends ProposalRankingItem>(proposals: T[]): T[] {
    return [...proposals].sort((a, b) => {
      // 1. Primary: Composite Match Score descending
      if (b.compositeScore !== a.compositeScore) {
        return b.compositeScore - a.compositeScore;
      }
      // 2. Secondary (Tie-breaker): DevScore descending
      if (b.devScore !== a.devScore) {
        return b.devScore - a.devScore;
      }
      // 3. Tertiary: Earlier submission timestamp
      return a.submittedAt.getTime() - b.submittedAt.getTime();
    });
  }
}

export const globalMatcher = new HeuristicSemanticMatcher();
