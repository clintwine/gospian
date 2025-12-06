import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user stats and exercise results using service role
    const allStats = await base44.asServiceRole.entities.UserStats.list('-xp', 100);
    const allResults = await base44.asServiceRole.entities.ExerciseResult.list('-created_date', 1000);
    
    return Response.json({ allStats, allResults });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});