const sensationalWords = [
  "shocking", "breaking", "miracle", "secret", "urgent", "unbelievable",
  "100%", "guaranteed", "you won't believe", "share now", "exposed"
];

const credibleSignals = [
  "according to", "study", "research", "report", "official", "government",
  "university", "journal", "data", "evidence"
];

export function analyzeNews(headline, content) {
  const text = `${headline} ${content}`.toLowerCase();
  let score = 50;
  const reasons = [];

  const sensationalHits = sensationalWords.filter(word => text.includes(word));
  const credibleHits = credibleSignals.filter(word => text.includes(word));

  score -= Math.min(sensationalHits.length * 8, 32);
  score += Math.min(credibleHits.length * 5, 25);

  if (content.length < 80) {
    score -= 10;
    reasons.push("The supplied claim is very short, so there is limited context.");
  }

  if (sensationalHits.length) {
    reasons.push(`Sensational wording detected: ${sensationalHits.slice(0, 3).join(", ")}.`);
  }

  if (credibleHits.length) {
    reasons.push(`Credibility-related wording detected: ${credibleHits.slice(0, 3).join(", ")}.`);
  }

  if (!reasons.length) {
    reasons.push("No strong linguistic signal was detected. The claim needs external fact-checking.");
  }

  score = Math.max(0, Math.min(100, score));

  let verdict;
  if (score >= 70) verdict = "Likely True";
  else if (score <= 35) verdict = "Likely False";
  else verdict = "Needs Review";

  return {
    verdict,
    confidence_score: score,
    explanation: reasons.join(" ")
  };
}
