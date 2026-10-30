export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Returns empty data list so the client utilizes its fast client-side IndexedDB & broadsheet cache
  res.status(200).json({
    success: true,
    data: [],
    message: 'IncogniRead client-first offline architecture active',
  });
}
