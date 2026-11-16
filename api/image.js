// POST /api/image  { prompt }  ->  { dataUrl }
// Pollinations 무료 이미지 생성. API 키 불필요. 결과를 data URL 로 변환해 돌려준다(내보내기 시 자체 포함).
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

    const w = parseInt(process.env.IMAGE_WIDTH || '1024', 10);
    const h = parseInt(process.env.IMAGE_HEIGHT || '1024', 10);
    const model = process.env.IMAGE_MODEL || 'flux';
    const seed = Math.floor(Math.random() * 1000000);
    let url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
      '?width=' + w + '&height=' + h + '&nologo=true&model=' + encodeURIComponent(model) + '&seed=' + seed;
    if (process.env.POLLINATIONS_TOKEN) url += '&token=' + encodeURIComponent(process.env.POLLINATIONS_TOKEN);

    const r = await fetch(url);
    if (!r.ok) {
      const t = await r.text().catch(function () { return ''; });
      res.status(r.status).json({ error: '이미지 생성 오류(Pollinations): ' + t.slice(0, 150) });
      return;
    }
    const ab = await r.arrayBuffer();
    const ct = r.headers.get('content-type') || 'image/jpeg';
    const b64 = Buffer.from(ab).toString('base64');
    res.status(200).json({ dataUrl: 'data:' + ct + ';base64,' + b64 });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
