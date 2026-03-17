const SYSTEM_PROMPT = `You are RunCoach AI — a knowledgeable, motivating, and honest endurance sports coach. You specialise in running, triathlon, cycling, and general athletic training.

Your role:
- Analyse workouts the user shares (distance, pace, heart rate, RPE, how they felt)
- Track patterns across their history to give personalised advice
- Build training plans, suggest recovery strategies, and prevent overtraining
- Answer questions about nutrition, gear, race strategy, and injury prevention
- Be direct and specific — no generic advice. Reference the user's actual data when you have it.

Tone: Encouraging but honest. Like a coach who respects you enough to tell you the truth.

Important:
- If the user logs a workout, acknowledge the key metrics and give 1-2 specific insights.
- If you notice trends (e.g. increasing fatigue, dropping pace), flag them proactively.
- Keep responses concise and actionable — under 150 words unless a detailed plan is requested.
- Always remember previous workouts in this session when giving advice.`;

export class CoachSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/chat' && request.method === 'POST') {
      const body = await request.json();
      const { message } = body;
      const activeEnv = this.env;

      let history = (await this.storage.get('history')) || [];
      history.push({ role: 'user', content: message });
      const trimmed = history.slice(-20);

      const aiResponse = await activeEnv.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
        max_tokens: 512,
        temperature: 0.7,
      });

      const reply = aiResponse.response;
      history.push({ role: 'assistant', content: reply });
      await this.storage.put('history', history);

      return new Response(JSON.stringify({ reply, messageCount: history.length }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/history') {
      const history = (await this.storage.get('history')) || [];
      return new Response(JSON.stringify({ history }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/reset' && request.method === 'POST') {
      await this.storage.delete('history');
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  }
}
