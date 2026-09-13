import { SentimentLabel, SentimentScore } from "./types";

const POSITIVE_MARKERS = [
  "great", "excellent", "awesome", "impressive", "perfect", "excited",
  "love", "sounds good", "ready", "interested", "valuable", "thank you",
  "thanks", "cool", "helpful", "forward", "schedule", "book", "hire", "yes"
];

const NEGATIVE_MARKERS = [
  "terrible", "bad", "disappointed", "slow", "broken", "unhappy",
  "expensive", "hate", "useless", "confused", "frustrated", "buggy",
  "horrible", "cannot", "fail", "no", "problem", "dislike", "poor"
];

const URGENT_MARKERS = [
  "urgent", "asap", "immediately", "critical", "emergency", "deadline",
  "outage", "blocking", "now", "rush", "high priority", "yesterday"
];

export const sentimentAnalyzer = {
  /**
   * Analyze sentiment for an individual spoken turn
   */
  analyzeTurn(text: string): SentimentLabel {
    const lower = text.toLowerCase();

    // Check urgent markers first
    if (URGENT_MARKERS.some((m) => lower.includes(m))) {
      return "urgent";
    }

    let posCount = 0;
    let negCount = 0;

    POSITIVE_MARKERS.forEach((m) => {
      if (lower.includes(m)) posCount++;
    });

    NEGATIVE_MARKERS.forEach((m) => {
      if (lower.includes(m)) negCount++;
    });

    if (posCount > negCount) return "positive";
    if (negCount > posCount) return "negative";
    return "neutral";
  },

  /**
   * Calculate aggregate sentiment score and overall label for a conversation
   */
  calculateCallSentiment(turns: { text: string; role?: string }[]): SentimentScore {
    if (!turns || turns.length === 0) {
      return { score: 0.0, label: "neutral" };
    }

    let rawScore = 0;
    let urgentCount = 0;
    let scoredTurns = 0;

    for (const turn of turns) {
      const label = this.analyzeTurn(turn.text);
      if (label === "positive") {
        rawScore += 1.0;
        scoredTurns++;
      } else if (label === "negative") {
        rawScore -= 1.2;
        scoredTurns++;
      } else if (label === "urgent") {
        rawScore -= 0.5;
        urgentCount++;
        scoredTurns++;
      } else {
        scoredTurns++;
      }
    }

    if (scoredTurns === 0) {
      return { score: 0.0, label: "neutral" };
    }

    // Normalize between -1.0 and 1.0
    const normalized = Math.max(-1.0, Math.min(1.0, rawScore / Math.max(1, scoredTurns / 2)));
    const rounded = Math.round(normalized * 100) / 100;

    let overallLabel: SentimentLabel = "neutral";
    if (urgentCount >= 2 || (urgentCount >= 1 && rounded < 0.2)) {
      overallLabel = "urgent";
    } else if (rounded >= 0.2) {
      overallLabel = "positive";
    } else if (rounded <= -0.2) {
      overallLabel = "negative";
    }

    return {
      score: rounded,
      label: overallLabel,
    };
  },
};
