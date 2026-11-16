// POST /api/copy  { prompt }  ->  파싱된 JSON 객체
// Pollinations 무료 텍스트 생성(OpenAI 호환 엔드포인트) 사용. API 키 불필요.
function extractJSON(text) {
  if (!text) return null;
  text = String(text).replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(text); } catch (e) {}
  var s = text.indexOf('{'), e2 = text.lastIndexOf('}');
  if (s >= 0 && e2 > s) { try { return JSON.parse(text.slice(s, e2 + 1)); } catch (e) {} }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST 요청만 가능합니다.' }); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
    const prompt = body && body.prompt;
    if (!prompt) { res.status(400).json({ error: 'prompt 가 필요합니다.' }); return; }

    const headers = { 'Content-Type': 'application/json' };
    // (선택) 더 높은 사용 한도가 필요하면 POLLINATIONS_TOKEN 환경변수에 토큰을 넣으세요.
    if (process.env.POLLINATIONS_TOKEN) headers['Authorization'] = 'Bearer ' + process.env.POLLINATIONS_TOKEN;

    const r = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: process.env.TEXT_MODEL || 'openai',
        messages: [
          { role: 'system', content: '너는 한국 이커머스(쿠팡/스마트스토어) 상세페이지 전문 기획자다. 반드시 유효한 JSON 객체만 반환한다. 설명/코드블록 금지.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.85,
        private: true,
        referrer: 'detail-maker-ai'
      })
    });

    const raw = await r.text();
    if (!r.ok) { res.status(r.status).json({ error: 'AI(Pollinations) 호출 오류: ' + raw.slice(0, 200) }); return; }

    // 응답은 OpenAI 형태(JSON) 또는 순수 텍스트일 수 있어 모두 대응한다.
    let content = raw;
    try {
      const j = JSON.parse(raw);
      if (j && j.choices && j.choices[0] && j.choices[0].message) content = j.choices[0].message.content;
      else if (typeof j === 'object') content = raw; // 이미 우리가 원한 JSON일 수도
    } catch (e) { /* raw 가 그대로 텍스트 */ }

    const parsed = extractJSON(content) || extractJSON(raw);
    if (!parsed) { res.status(502).json({ error: 'AI 응답을 JSON 으로 해석하지 못했습니다. 다시 시도해 주세요.' }); return; }
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
