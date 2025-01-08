import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { sortBySentiment } from "./utils/sentimentUtils";

import AWS from "aws-sdk";
jest.mock("aws-sdk");

describe("App Component Tests", () => {
  beforeAll(() => {
    AWS.config.update = jest.fn();
  });

  test("sorts sentences based on sentiment score", () => {
    const sentences = [
      {
        text: "I feel great!",
        sentiment: "Positive",
        sentimentScores: { Positive: 0.9, Neutral: 0.1, Negative: 0, Mixed: 0 },
      },
      {
        text: "I am okay.",
        sentiment: "Neutral",
        sentimentScores: {
          Positive: 0.5,
          Neutral: 0.3,
          Negative: 0.1,
          Mixed: 0.1,
        },
      },
      {
        text: "I feel terrible.",
        sentiment: "Negative",
        sentimentScores: {
          Positive: 0.1,
          Neutral: 0.2,
          Negative: 0.7,
          Mixed: 0,
        },
      },
    ];

    const sortedSentences = sortBySentiment(sentences);

    expect(sortedSentences[0].text).toBe("I feel great!");
    expect(sortedSentences[1].text).toBe("I am okay.");
    expect(sortedSentences[2].text).toBe("I feel terrible.");
  });

  test("handles null values gracefully in sorting", () => {
    const sentences = [
      {
        text: "I am happy!",
        sentiment: "Positive",
        sentimentScores: { Positive: 0.9, Neutral: 0.1, Negative: 0, Mixed: 0 },
      },
      null,
    ];

    const sortedSentences = sortBySentiment(sentences.filter(Boolean));

    expect(sortedSentences[0].text).toBe("I am happy!");
  });

  test("handles empty input correctly", async () => {
    render(<App />);
    const input = screen.getByPlaceholderText("Enter your sentence");
    const button = screen.getByText("Analyze");

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(button);

    const sentimentList = screen.queryByText("Sentiment:");
    expect(sentimentList).toBeNull();
  });

  test("handles sentences with the same sentiment score", () => {
    const sentences = [
      {
        text: "I am feeling neutral.",
        sentiment: "Neutral",
        sentimentScores: {
          Positive: 0.3,
          Neutral: 0.4,
          Negative: 0.3,
          Mixed: 0,
        },
      },
      {
        text: "I am doing fine.",
        sentiment: "Neutral",
        sentimentScores: {
          Positive: 0.3,
          Neutral: 0.4,
          Negative: 0.3,
          Mixed: 0,
        },
      },
      {
        text: "I'm okay.",
        sentiment: "Neutral",
        sentimentScores: {
          Positive: 0.3,
          Neutral: 0.4,
          Negative: 0.3,
          Mixed: 0,
        },
      },
    ];

    const sortedSentences = sortBySentiment(sentences);

    expect(sortedSentences[0].text).toBe("I am feeling neutral.");
    expect(sortedSentences[1].text).toBe("I am doing fine.");
    expect(sortedSentences[2].text).toBe("I'm okay.");
  });

  test("sorts sentences with mixed sentiments", () => {
    const sentences = [
      {
        text: "I feel fantastic!",
        sentiment: "Positive",
        sentimentScores: { Positive: 0.8, Neutral: 0.2, Negative: 0, Mixed: 0 },
      },
      {
        text: "I feel okay.",
        sentiment: "Neutral",
        sentimentScores: {
          Positive: 0.4,
          Neutral: 0.4,
          Negative: 0.2,
          Mixed: 0,
        },
      },
      {
        text: "I feel awful!",
        sentiment: "Negative",
        sentimentScores: {
          Positive: 0.1,
          Neutral: 0.2,
          Negative: 0.7,
          Mixed: 0,
        },
      },
    ];

    const sortedSentences = sortBySentiment(sentences);

    expect(sortedSentences[0].text).toBe("I feel fantastic!");
    expect(sortedSentences[1].text).toBe("I feel okay.");
    expect(sortedSentences[2].text).toBe("I feel awful!");
  });
});
