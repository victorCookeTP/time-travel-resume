import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

// Use server-side key only
const client = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

app.post('/api/generate', async (req, res) => {
  try {
    const { resumeText, futureCount = 4, spanYears = 20 } = req.body || {};
    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a career AI that extends career timelines. Use a light, witty, professional tone. Output ONLY a compact JSON array of objects using this schema strictly: [{"title":"string","years":"YYYY-YYYY","company":"string","description":"string"}]. No markdown fences or extra text.',
        },
        {
          role: 'user',
          content: `Here is the resume/work history (plain text):\n\n${resumeText}\n\nTask: Normalize the given experiences into the schema above (use "years" with YYYY-YYYY), THEN append exactly ${futureCount} future roles that logically follow from the last year, covering exactly the next ${spanYears} years in total.\nRules for the future roles:\n- Realistic job titles, fake companies, concise descriptions (<=2 sentences)\n- Witty yet professional tone\n- Non-overlapping ranges fitting within ~${spanYears} years\n- Preserve original experiences (only normalize years)\n- Sort ascending by start year.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    res.json({ content: response.choices[0]?.message?.content ?? '[]' });
  } catch (err) {
    console.error('[server] OpenAI error:', err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

export default app;


