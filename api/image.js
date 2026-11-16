// POST /api/image  { prompt }  ->  { dataUrl }
// OpenAI 이미지 생성(gpt-image-1 기본, dall-e-3 대체 가능). 키는 서버 환경변수에만 둔다.
module.exports = async (req, res) => {
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

    const model = process.env.IMAGE_MODEL || 'gpt-image-1';
    const size = process.env.IMAGE_SIZE || '1024x1024';
    const payload = { model: model, prompt: prompt, size: size, n: 1 };
    // gpt-image-1 은 b64_json 을 기본 반환하고 quality 를 받는다. dall-e-3 는 response_format 로 b64 를 요청한다.
    if (model.indexOf('gpt-image') === 0) { payload.quality = process.env.IMAGE_QUALITY || 'high'; }
    else { payload.response_format = 'b64_json'; }

    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: (data.error && data.error.message) || '이미지 생성 오류' });
      return;
    }
    const item = data.data && data.data[0];
    let dataUrl = null;
    if (item && item.b64_json) dataUrl = 'data:image/png;base64,' + item.b64_json;
    else if (item && item.url) dataUrl = item.url;
    if (!dataUrl) { res.status(502).json({ error: '이미지 응답 형식을 해석하지 못했습니다.' }); return; }
    res.status(200).json({ dataUrl: dataUrl });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
