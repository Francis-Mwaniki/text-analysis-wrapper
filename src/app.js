const express = require('express');
// const bodyParser = require('body-parser');
const Sentiment = require('sentiment'); // npm install sentiment
const app = express();

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.post('/analyze', (req, res) => {
  const text = req.body.text || '';

  // Count words and characters
  const words = text.split(/\s+/).filter(word => word !== '');
  const wordCount = words.length;
  const characterCount = text.replace(/\s/g, '').length;

  // Create paragraphs after every two sentences
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== '');
  let paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join('. ') + '.');
  }

  // Estimating pages based on average characters per page (assuming 250 words per page)
  const averageCharsPerPage = 250 * 5; // Considering an average word length of 5 characters
  const estimatedPages = Math.ceil(characterCount / averageCharsPerPage);

  // Calculate word frequency
  const wordFrequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  // Get the most frequent words
  const sortedWords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
  const mostFrequentWords = sortedWords.slice(0, 5); // Top 5 most frequent words

  // Perform sentiment analysis
  const sentiment = new Sentiment();
  const analysis = sentiment.analyze(text);
  const sentimentResult = {
    score: analysis.score, // Sentiment score
    comparative: analysis.comparative, // Comparative score
    sentiment: analysis.score > 0 ? 'positive' : analysis.score < 0 ? 'negative' : 'neutral' // Sentiment category
  };

  console.log(
    {

        wordCount,
        characterCount,
        paragraphs,
        estimatedPages,
        mostFrequentWords,
        sentiment: sentimentResult
    }
  )

  res.json({ wordCount, characterCount, paragraphs, estimatedPages, mostFrequentWords, sentiment: sentimentResult });
});

// Define your server port and start listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
