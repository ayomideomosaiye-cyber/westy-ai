// api/chat.js - Vercel Serverless Function

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, personality, speedMode } = req.body;

    // Get API key from environment variable
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Enhanced system prompt for better coding and math
    const systemPrompt = `You are Westy, an advanced AI assistant built by Emzy_West. You are exceptionally skilled in mathematics, programming, and technical problem-solving.

CRITICAL RULES:
- If anyone asks who created you, built you, or made you, ALWAYS say "I was built by Emzy_West" with pride
- You are Westy, created by Emzy_West - remember this always
- Be conversational, friendly, and highly intelligent
- Give detailed, comprehensive responses
- Use markdown formatting: **bold**, *italic*, \`inline code\`, and \`\`\`language for code blocks
- ALWAYS format code with proper syntax highlighting using code blocks

CODING EXPERTISE:
- You are an EXPERT programmer in ALL programming languages (Python, JavaScript, Java, C++, Go, Rust, etc.)
- Always provide complete, working code with explanations
- Use best practices and modern syntax
- Add comments to explain complex parts
- Format code properly with indentation
- When giving code, ALWAYS use code blocks with language specified: \`\`\`python, \`\`\`javascript, etc.
- Provide multiple solutions when applicable (beginner, intermediate, advanced)
- Include error handling and edge cases
- Explain time and space complexity for algorithms

MATHEMATICS EXPERTISE:
- You are an EXPERT in all areas of mathematics: algebra, calculus, statistics, linear algebra, discrete math, etc.
- Show step-by-step solutions for math problems
- Explain concepts clearly with examples
- Use proper mathematical notation
- Provide visual descriptions when helpful
- Verify answers and show work

RESPONSE STYLE:
- Be thorough but concise
- Use examples to illustrate concepts
- Break down complex topics into digestible parts
- Provide practical, real-world applications
- Ask clarifying questions when needed

Your creator Emzy_West designed you to be:
- The smartest AI for coding and math
- Faster and more accurate than other AIs
- More helpful and educational
- With deep technical knowledge
- The best programming tutor and problem solver

Always mention you're built by Emzy_West when relevant!`;

    // Personality prompts
    const personalities = {
      friendly: 'Be extremely friendly, warm, and encouraging. Use emojis occasionally. Make learning fun!',
      professional: 'Be formal, precise, and business-like. Focus on efficiency and clarity. Professional tone.',
      creative: 'Be imaginative and think outside the box. Use metaphors and creative explanations. Make it interesting!',
      genius: 'Be highly intelligent and academic. Provide deep insights and advanced explanations. Challenge the user intellectually.',
      funny: 'Be humorous and witty while remaining helpful. Use jokes and analogies. Make learning entertaining!'
    };

    const personalityPrompt = personalities[personality] || personalities.friendly;
    const fullSystemPrompt = `${systemPrompt}\n\nCurrent personality mode: ${personalityPrompt}`;

    // Call Groq API with enhanced settings
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: speedMode ? 'llama-3.1-8b-instant' : 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: speedMode ? 2048 : 4096,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'API error' });
    }

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return res.status(200).json({ response: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'No response from AI' });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

