const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

/* 🔹 Local fallback jokes */
const FALLBACK_JOKES = [
  {
    category: "Light",
    setup: "Why don’t programmers like nature?",
    punchline: "Too many bugs 🐛😂",
    mood: "cheerful",
  },
  {
    category: "Silly",
    setup: "Why was the computer cold?",
    punchline: "It forgot to close its Windows ❄️",
    mood: "playful",
  },
  {
    category: "Wordplay",
    setup: "Why do Java developers wear glasses?",
    punchline: "Because they don’t C# 🤓",
    mood: "witty",
  },
  {
    category: "Light",
    setup: "Why did the API cross the road?",
    punchline: "To avoid another timeout 😄",
    mood: "cheerful",
  },
];

router.get("/joke", async (req, res) => {
  try {
    /* 🔹 Public Joke API */
    const response = await fetch(
      "https://official-joke-api.appspot.com/random_joke"
    );

    if (!response.ok) throw new Error("Public API failed");

    const data = await response.json();

    return res.json({
      success: true,
      joke: {
        category: "Light",
        setup: data.setup,
        punchline: data.punchline + " 😂",
        mood: "cheerful",
      },
    });
  } catch (err) {
    console.error("⚠️ Joke API failed, using fallback");

    const randomFallback =
      FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)];

    return res.json({
      success: true,
      joke: randomFallback,
    });
  }
});

module.exports = router;
