export default async function handler(req, res) {
  // 允許 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;

  if (!NOTION_TOKEN) {
    return res.status(500).json({ error: 'NOTION_TOKEN not configured' });
  }

  const { action, databaseId, pageId } = req.query;
  const notionUrl = 'https://api.notion.com/v1';
  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    // 取得資料庫 schema
    if (action === 'getDatabase') {
      const response = await fetch(`${notionUrl}/databases/${databaseId}`, {
        method: 'GET',
        headers
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // 查詢資料庫
    if (action === 'query') {
      const response = await fetch(`${notionUrl}/databases/${databaseId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sorts: [{ property: 'title', direction: 'descending' }]
        })
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // 更新頁面
    if (action === 'update' && pageId) {
      const response = await fetch(`${notionUrl}/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // 刪除頁面 (歸檔)
    if (action === 'delete' && pageId) {
      const response = await fetch(`${notionUrl}/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ archived: true })
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // 建立頁面
    if (req.method === 'POST') {
      const response = await fetch(`${notionUrl}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Notion API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
