export interface RiskSignalInput {
  unknownDevice?: boolean;
  highRequestFrequency?: boolean;
  multipleFailedLogins?: boolean;
}

export interface RiskScoreResult {
  score: number;
  level: 'allow' | 'reauth' | 'block';
}

export const riskEngine = {
  evaluate(input: RiskSignalInput): RiskScoreResult {
    let score = 0;
    if (input.unknownDevice) score += 30;
    if (input.highRequestFrequency) score += 40;
    if (input.multipleFailedLogins) score += 50;

    if (score >= 70) return { score, level: 'block' };
    if (score >= 30) return { score, level: 'reauth' };
    return { score, level: 'allow' };
  },
};
