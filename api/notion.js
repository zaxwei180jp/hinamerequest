export default async function handler(req, res) {
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
    // Get database schema
    if (action === 'getDatabase') {
      const response = await fetch(`${notionUrl}/databases/${databaseId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch database' });
      }

      return res.json(await response.json());
    }

    // Query database
    if (action === 'query') {
      const response = await fetch(`${notionUrl}/databases/${databaseId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sorts: [
            {
              property: 'title',
              direction: 'descending'
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      return res.json(await response.json());
    }

    // Update page
    if (action === 'update') {
      const response = await fetch(`${notionUrl}/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      return res.json(await response.json());
    }

    // Delete page (archive)
    if (action === 'delete') {
      const response = await fetch(`${notionUrl}/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ archived: true })
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      return res.json(await response.json());
    }

    // Create page
    if (req.method === 'POST') {
      const response = await fetch(`${notionUrl}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      return res.json(await response.json());
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Notion API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
