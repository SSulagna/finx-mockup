const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function responseText(data) {
  if (data && typeof data.output_text === 'string') return data.output_text;
  const output = Array.isArray(data && data.output) ? data.output : [];
  const parts = [];
  for (const item of output) {
    const content = Array.isArray(item && item.content) ? item.content : [];
    for (const block of content) {
      if (block && typeof block.text === 'string') parts.push(block.text);
    }
  }
  return parts.join('\n').trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 501, { error: 'LLM endpoint is not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (_) {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const question = String((body && body.question) || '').trim().slice(0, 800);
  const scope = body && body.scope === 'signed-in' ? 'signed-in' : 'public';
  const contexts = Array.isArray(body && body.contexts) ? body.contexts.slice(0, 6) : [];

  if (!question) return sendJson(res, 400, { error: 'Question is required' });
  if (!contexts.length) {
    return sendJson(res, 200, {
      answer: 'I could not find enough matching portal content to answer that. Try asking about FinX Glue, FinX Glass, modernization paths, BIAN, KYC, or API reference.',
      sources: []
    });
  }

  const sourceText = contexts.map((item, index) => {
    const title = String(item.title || item.label || 'Untitled').slice(0, 120);
    const route = String(item.route || '').slice(0, 120);
    const text = String(item.text || '').replace(/\s+/g, ' ').trim().slice(0, 1200);
    return `[${index + 1}] ${title}\nRoute: ${route}\n${text}`;
  }).join('\n\n');

  const instructions = [
    'You are Ask FinX, a concise assistant for the UST FinX Documentation Portal.',
    'Answer only from the supplied portal excerpts.',
    'If the excerpts do not answer the question, say that the portal content does not contain enough detail.',
    'Respect the supplied access scope. Do not imply hidden internal content unless it appears in the excerpts.',
    'Use UST FinX terminology: FinX Glue, FinX Glass, BIAN-aligned APIs, modernization, coexistence, and operations console.',
    'Avoid em dashes. Use short paragraphs and bullets when useful.',
    'End with a Sources line listing the source numbers used.'
  ].join('\n');

  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Access scope: ${scope}\n\nQuestion:\n${question}\n\nPortal excerpts:\n${sourceText}`
              }
            ]
          }
        ],
        max_output_tokens: 700
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return sendJson(res, upstream.status, {
        error: data && data.error && data.error.message ? data.error.message : 'OpenAI request failed'
      });
    }

    return sendJson(res, 200, {
      answer: responseText(data) || 'I could not generate an answer from the supplied portal excerpts.',
      sources: contexts.map(item => ({
        label: item.label || item.title || 'Source',
        route: item.route || ''
      }))
    });
  } catch (error) {
    return sendJson(res, 500, { error: error && error.message ? error.message : 'LLM request failed' });
  }
};
