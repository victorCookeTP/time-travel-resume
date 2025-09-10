import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { resumeText, futureCount = 4, spanYears = 20 } = body;
    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    const client = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

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
          content: `Here is the resume/work history (plain text):\n\n${resumeText}\n\nTask: Normalize the given experiences into the schema above (use "years" with YYYY-YYYY, converting single years to ranges when needed), THEN append exactly ${futureCount} future roles that logically follow from the last year, covering exactly the next ${spanYears} years in total.\nRules for the future roles:\n- Use realistic job titles, fake company names, and concise, vivid descriptions (<= 2 sentences)\n- Keep tone witty yet professional\n- Use plausible, non-overlapping ranges that fit within ~${spanYears} years overall\n- Preserve the original experiences (do not remove or rewrite them, only normalize years)\n- Sort the entire array ascending by the starting year.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return res.status(200).json({ content: response.choices[0]?.message?.content ?? '[]' });
  } catch (err) {
    console.error('[api/generate] error:', err);
    return res.status(500).json({ error: 'OpenAI request failed' });
  }
}


