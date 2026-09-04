const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Parse JSON requests & serve static files from the 'public' directory
app.use(express.json());
app.use(express.static("public"));

// Endpoint for handling subject queries
app.post("/api/chat", async (req, res) => {
    const { subject, topic, message } = req.body;

    // Direct instructions grounding the AI in the UNEB curriculum
    const systemPrompt = `You are an expert UACE (Uganda Advanced Certificate of Education) tutor for ${subject}, specifically covering the topic: ${topic}.
- Follow UNEB/NCDC syllabus standards strictly.
- Provide clear, step-by-step working out.
- Do NOT use complex LaTeX block structures (e.g., \\frac{}{}). Instead, use clean, mobile-readable text formatting for math (e.g., dy/dx, x^2, sqrt(x), or step-by-step equations).`;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "google/gemini-2.5-flash",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("OpenRouter API Error:", error.response?.data || error.message);
        res.status(500).json({ reply: "Sorry, I ran into an error processing that question." });
    }
});

// Use port assigned by cloud host, or default to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UACE Coach server running on port ${PORT}`));
         
