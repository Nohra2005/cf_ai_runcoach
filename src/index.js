export { CoachSession } from './coach.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve frontend
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await env.ASSETS.fetch(request);
      return html;
    }

    // POST /api/chat
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const { message, sessionId } = await request.json();
      if (!message || !sessionId) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      const id = env.COACH_SESSION.idFromName(sessionId);
      const session = env.COACH_SESSION.get(id);
      const resp = await session.fetch(new Request('http://do/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }));
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // GET /api/history
    if (url.pathname === '/api/history' && request.method === 'GET') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) return new Response('Missing sessionId', { status: 400 });
      const id = env.COACH_SESSION.idFromName(sessionId);
      const session = env.COACH_SESSION.get(id);
      const resp = await session.fetch(new Request('http://do/history'));
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // POST /api/reset
    if (url.pathname === '/api/reset' && request.method === 'POST') {
      const { sessionId } = await request.json();
      if (!sessionId) return new Response('Missing sessionId', { status: 400 });
      const id = env.COACH_SESSION.idFromName(sessionId);
      const session = env.COACH_SESSION.get(id);
      const resp = await session.fetch(new Request('http://do/reset', { method: 'POST' }));
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  },
};
