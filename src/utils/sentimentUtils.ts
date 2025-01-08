export const sortBySentiment = (sentencesList: any[]) => {
  return sentencesList.sort((a, b) => {
    const scoreA =
      a.sentimentScores.Positive -
      a.sentimentScores.Negative +
      a.sentimentScores.Neutral -
      a.sentimentScores.Mixed;
    const scoreB =
      b.sentimentScores.Positive -
      b.sentimentScores.Negative +
      b.sentimentScores.Neutral -
      b.sentimentScores.Mixed;

    return scoreB - scoreA;
  });
};
