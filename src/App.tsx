import React, { useState } from "react";
import "./App.css";
import AWS from "aws-sdk";
import { sortBySentiment } from "./utils/sentimentUtils";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Set up AWS SDK
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
  region: process.env.REACT_APP_AWS_REGION!,
});

const comprehend = new AWS.Comprehend();

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [inputText, setInputText] = useState("");
  const [sentences, setSentences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeSentiment = async (text: string) => {
    try {
      setIsLoading(true);
      const params = {
        TextList: [text],
        LanguageCode: "en",
      };

      const response = await comprehend.batchDetectSentiment(params).promise();
      const sentimentData = response.ResultList[0];

      const sentimentScores = sentimentData.SentimentScore;
      const sentiment = sentimentData.Sentiment;

      return {
        text,
        sentiment,
        sentimentScores,
      };
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setIsLoading(false);
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText) return;

    const sentimentResult = await analyzeSentiment(inputText);
    if (sentimentResult) {
      setSentences((prevSentences) => [...prevSentences, sentimentResult]);
      setInputText("");
      setHasAnalyzed(true);
    }
    setIsLoading(false);
  };

  const sentimentStats = () => {
    const stats = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
    sentences.forEach((sentence) => {
      if (sentence.sentiment === "POSITIVE") stats.positive++;
      else if (sentence.sentiment === "NEUTRAL") stats.neutral++;
      else if (sentence.sentiment === "NEGATIVE") stats.negative++;
      else if (sentence.sentiment === "MIXED") stats.mixed++;
    });

    return stats;
  };

  const sentimentData = {
    labels: ["Positive", "Neutral", "Negative", "Mixed"],
    datasets: [
      {
        label: "Sentiment Distribution",
        data: [
          sentimentStats().positive,
          sentimentStats().neutral,
          sentimentStats().negative,
          sentimentStats().mixed,
        ],
        backgroundColor: ["#4CAF50", "#f4a300", "#d9534f", "#6c757d"],
        borderColor: ["#4CAF50", "#f4a300", "#d9534f", "#6c757d"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="App">
      <h1>Sentiment Analysis Dashboard</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="text-input"
          placeholder="Enter your sentence"
        />
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      <div className="sentiment-list">
        {sortBySentiment(sentences).map((sentence, index) => (
          <div
            key={index}
            className={`sentiment-item ${sentence.sentiment.toLowerCase()}`}
          >
            <span>{sentence.text}</span>
            <div className="sentiment-score">
              <span className="label">Sentiment:</span> {sentence.sentiment}
            </div>
            <div className="sentiment-weight">
              <span className="label">Weight:</span>{" "}
              {sentence.sentimentScores.Positive >= 0.7
                ? "Super Positive"
                : sentence.sentimentScores.Positive >= 0.4
                ? "Slightly Positive"
                : "Neutral or Negative"}
            </div>
          </div>
        ))}
      </div>

      {hasAnalyzed && (
        <div className="chart-container">
          <Bar
            data={sentimentData}
            options={{
              responsive: true,
              plugins: {
                title: { display: true, text: "Sentiment Distribution" },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
