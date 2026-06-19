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
    const { dog_id, name, country, city, age, gender } = JSON.parse(event.body);

    if (!name) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dog name is required' }) };
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
    }

    const locationParts = [city, country].filter(Boolean);
    const locationStr = locationParts.length > 0 ? `living in ${locationParts.join(', ')}` : '';
    const ageStr = age ? ` who is ${age}` : '';
    const genderStr = gender ? ` ${gender}` : '';

    const prompt = `Write a warm, personal, and detailed biography (2-4 sentences) for a stray dog named ${name}${genderStr}${ageStr} ${locationStr}. The bio should be written as if by a local feeder who knows this dog personally. Include details about the dog's personality, daily life, habits, relationship with the local community, and how they survive on the streets. Make it heartwarming and unique. Do not use markdown or quotes — just plain text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a volunteer for a charity that feeds stray dogs. You write warm, personal biographies for each dog to help people connect with them.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 250,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: `OpenAI API error: ${error}` }) };
    }

    const data = await response.json();
    const bio = data.choices?.[0]?.message?.content?.trim();

    if (!bio) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'No bio generated' }) };
    }

    if (dog_id) {
      const { error: upsertError } = await supabase
        .from('dog_bios')
        .upsert(
          { dog_id, dog_name: name, bio },
          { onConflict: 'dog_id' }
        );

      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
      }
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
