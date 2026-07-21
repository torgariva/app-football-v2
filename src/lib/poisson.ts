import { MatchProbabilities, ScoreProbability } from '../types';

/**
 * Calculates the factorial of a number.
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculates the Poisson probability of observing 'k' events
 * given an expected rate of 'lambda'.
 */
function poissonProbability(k: number, lambda: number): number {
  if (lambda <= 0) {
    return k === 0 ? 1 : 0;
  }
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Calculates match probabilities using the Poisson distribution model.
 * 
 * @param homeAttackAvg Average goals scored by home team at home
 * @param homeDefenseAvg Average goals conceded by home team at home
 * @param awayAttackAvg Average goals scored by away team away
 * @param awayDefenseAvg Average goals conceded by away team away
 * @param leagueHomeScoredAvg Average goals scored by home teams in the league
 * @param leagueAwayScoredAvg Average goals scored by away teams in the league
 * @param matchId The identifier of the match
 * @param h2hWeight Optional weighting factor (0 to 1) to adjust expected goals based on H2H history
 * @param h2hHomeAvgGoles Optional historical H2H average goals scored by home team against this away team
 * @param h2hAwayAvgGoles Optional historical H2H average goals scored by away team against this home team
 */
export function calculatePoissonProbabilities(
  homeAttackAvg: number,
  homeDefenseAvg: number,
  awayAttackAvg: number,
  awayDefenseAvg: number,
  leagueHomeScoredAvg: number,
  leagueAwayScoredAvg: number,
  matchId: string,
  h2hWeight: number = 0.15,
  h2hHomeAvgGoles?: number,
  h2hAwayAvgGoles?: number
): MatchProbabilities {
  // 1. Calculate attack and defense strengths relative to league averages
  // Guard against division by zero
  const leagueHomeScored = leagueHomeScoredAvg || 1.4;
  const leagueAwayScored = leagueAwayScoredAvg || 1.2;

  const homeAttackStrength = homeAttackAvg / leagueHomeScored;
  const homeDefenseStrength = homeDefenseAvg / leagueAwayScored;
  const awayAttackStrength = awayAttackAvg / leagueAwayScored;
  const awayDefenseStrength = awayDefenseAvg / leagueHomeScored;

  // 2. Calculate initial expected goals
  let expectedHomeGoals = homeAttackStrength * awayDefenseStrength * leagueHomeScored;
  let expectedAwayGoals = awayAttackStrength * homeDefenseStrength * leagueAwayScored;

  // Ensure positive values
  expectedHomeGoals = Math.max(0.1, expectedHomeGoals);
  expectedAwayGoals = Math.max(0.1, expectedAwayGoals);

  // 3. Optional adjustment based on H2H history weight
  if (h2hHomeAvgGoles !== undefined && h2hAwayAvgGoles !== undefined) {
    expectedHomeGoals = (1 - h2hWeight) * expectedHomeGoals + h2hWeight * h2hHomeAvgGoles;
    expectedAwayGoals = (1 - h2hWeight) * expectedAwayGoals + h2hWeight * h2hAwayAvgGoles;
  }

  // 4. Generate Poisson vectors for scorelines 0 to 5 (6x6 matrix)
  const maxGoals = 5;
  const homeProbVector: number[] = [];
  const awayProbVector: number[] = [];

  let homeSum = 0;
  let awaySum = 0;

  for (let i = 0; i <= maxGoals; i++) {
    const pHome = poissonProbability(i, expectedHomeGoals);
    const pAway = poissonProbability(i, expectedAwayGoals);
    homeProbVector.push(pHome);
    awayProbVector.push(pAway);
    homeSum += pHome;
    awaySum += pAway;
  }

  // Normalize vectors to sum to 100% (to adjust for the 5+ goals truncation)
  for (let i = 0; i <= maxGoals; i++) {
    homeProbVector[i] = homeProbVector[i] / homeSum;
    awayProbVector[i] = awayProbVector[i] / awaySum;
  }

  // 5. Build joint probability matrix
  let probHomeWin = 0;
  let probDraw = 0;
  let probAwayWin = 0;
  let probOver1_5 = 0;
  let probOver2_5 = 0;
  let probOver3_5 = 0;
  let probBTTSYes = 0;

  const scores: ScoreProbability[] = [];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const pJoint = homeProbVector[h] * awayProbVector[a]; // probability between 0 and 1

      // 1X2 outcomes
      if (h > a) {
        probHomeWin += pJoint;
      } else if (h === a) {
        probDraw += pJoint;
      } else {
        probAwayWin += pJoint;
      }

      // Over/Under outcomes
      const totalGoals = h + a;
      if (totalGoals > 1.5) probOver1_5 += pJoint;
      if (totalGoals > 2.5) probOver2_5 += pJoint;
      if (totalGoals > 3.5) probOver3_5 += pJoint;

      // Both Teams To Score (BTTS)
      if (h > 0 && a > 0) {
        probBTTSYes += pJoint;
      }

      // Add to potential scorelines list
      scores.push({
        score: `${h}-${a}`,
        prob: Math.round(pJoint * 1000) / 10 // round to 1 decimal place
      });
    }
  }

  // Double Chance Calculations
  const prob1X = probHomeWin + probDraw;
  const prob12 = probHomeWin + probAwayWin;
  const probX2 = probDraw + probAwayWin;

  // Under calculations
  const probUnder1_5 = 1 - probOver1_5;
  const probUnder2_5 = 1 - probOver2_5;
  const probUnder3_5 = 1 - probOver3_5;
  const probBTTSNo = 1 - probBTTSYes;

  // Sort scorelines by probability to get the most probable scores
  scores.sort((a, b) => b.prob - a.prob);
  const mostProbableScores = scores.slice(0, 5); // Take top 5

  // Helper to safely convert values to percentage integers/rounded floats
  const toPct = (val: number) => Math.min(100, Math.max(0, Math.round(val * 1000) / 10));

  return {
    matchId,
    probHomeWin: toPct(probHomeWin),
    probDraw: toPct(probDraw),
    probAwayWin: toPct(probAwayWin),
    prob1X: toPct(prob1X),
    prob12: toPct(prob12),
    probX2: toPct(probX2),
    probOver1_5: toPct(probOver1_5),
    probUnder1_5: toPct(probUnder1_5),
    probOver2_5: toPct(probOver2_5),
    probUnder2_5: toPct(probUnder2_5),
    probOver3_5: toPct(probOver3_5),
    probUnder3_5: toPct(probUnder3_5),
    probBTTSYes: toPct(probBTTSYes),
    probBTTSNo: toPct(probBTTSNo),
    expectedHomeGoals: Math.round(expectedHomeGoals * 100) / 100,
    expectedAwayGoals: Math.round(expectedAwayGoals * 100) / 100,
    mostProbableScores
  };
}
