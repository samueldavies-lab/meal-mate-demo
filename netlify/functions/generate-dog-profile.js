const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qbsylqashtvdbizzmkoa.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFic3lscWFzaHR2ZGJpenpta29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzU4NTcsImV4cCI6MjA5NzI1MTg1N30.lxOqrxOa8C2TqXD70ZQnpiaGI9_4hK3thVZe0AE5wdE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { dog_id, name, country, city, description } = JSON.parse(event.body);

    if (!name) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dog name is required' }) };
    }

    if (dog_id) {
      const { data: existing } = await supabase
        .from('dog_profiles')
        .select('age, gender')
        .eq('dog_id', dog_id)
        .maybeSingle();

      if (existing?.age && existing?.gender) {
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ age: existing.age, gender: existing.gender }),
        };
      }
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
    }

    const prompt = `You are estimating the age and gender of a stray dog based on limited information.

Dog name: ${name}
Location: ${[city, country].filter(Boolean).join(', ') || 'Unknown'}
Description: ${description || 'No description available'}

Respond with ONLY a JSON object in this exact format, no other text:
{"age": "Puppy|Young|Adult|Senior", "gender": "male|female"}

Pick the most likely values based on the name, location, and description. ${name.toLowerCase().endsWith('a') || name.toLowerCase().endsWith('e') ? "The name sounds feminine." : name.toLowerCase().endsWith('o') ? "The name sounds masculine." : ""}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a volunteer who helps estimate the profile of stray dogs. You always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: `OpenAI API error: ${error}` }) };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    let age = 'Adult';
    let gender = 'male';

    if (content) {
      try {
        const parsed = JSON.parse(content);
        const validAges = ['Puppy', 'Young', 'Adult', 'Senior'];
        if (validAges.includes(parsed.age)) age = parsed.age;
        if (parsed.gender === 'male' || parsed.gender === 'female') gender = parsed.gender;
      } catch {
        // fall back to defaults
      }
    }

    if (dog_id) {
      await supabase
        .from('dog_profiles')
        .upsert(
          { dog_id, dog_name: name, age, gender },
          { onConflict: 'dog_id' }
        )
        .then(({ error }) => {
          if (error) console.error('Supabase upsert error:', error);
        });
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ age, gender }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
