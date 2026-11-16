// POST /api/copy  { prompt }  ->  파싱된 JSON 객체
// OpenAI Chat Completions 로 상세페이지 카피를 생성한다. 키는 서버 환경변수에만 둔다.
module.exports = async (req, res) => {
  // 같은 도메인에서 호출하므로 CORS는 필요 없지만, 안전하게 허용해 둔다.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST 요청만 가능합니다.' }); return; }

  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) { res.status(500).json({ error: '서버에 OPENAI_API_KEY 가 설정되지 않았습니다.' }); return; }

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
    const prompt = body && body.prompt;
    if (!prompt) { res.status(400).json({ error: 'prompt 가 필요합니다.' }); return; }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: process.env.COPY_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '너는 한국 이커머스(쿠팡/스마트스토어) 상세페이지 전문 기획자다. 반드시 유효한 JSON 객체만 반환한다. 설명/코드블록 금지.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.85
      })
    });

    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: (data.error && data.error.message) || 'OpenAI 호출 오류' });
      return;
    }
    const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '{}';
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (e) { res.status(502).json({ error: 'AI 응답을 JSON 으로 해석하지 못했습니다.' }); return; }
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
