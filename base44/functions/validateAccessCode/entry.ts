import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { code } = await req.json();
    if (!code) {
      return Response.json({ valid: false, error: 'No code provided' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const entered = code.trim().toUpperCase();

    const matches = await base44.asServiceRole.entities.AccessCode.filter({ code: entered, is_active: true });

    if (matches.length === 0) {
      return Response.json({ valid: false });
    }

    const match = matches[0];
    if (!match.is_used) {
      await base44.asServiceRole.entities.AccessCode.update(match.id, {
        is_used: true,
        used_at: new Date().toISOString(),
      });
    }

    return Response.json({ valid: true });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});