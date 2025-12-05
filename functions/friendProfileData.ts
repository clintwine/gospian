import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get friend email from request body
    const { friendEmail } = await req.json();
    
    if (!friendEmail) {
      return Response.json({ error: 'Friend email is required' }, { status: 400 });
    }

    // Fetch friend data using service role
    const allUsers = await base44.asServiceRole.entities.User.list();
    const friendUser = allUsers.find(u => u.email === friendEmail);
    
    const friendStats = await base44.asServiceRole.entities.UserStats.filter({ created_by: friendEmail });
    const friendResults = await base44.asServiceRole.entities.ExerciseResult.filter(
      { created_by: friendEmail },
      '-created_date',
      20
    );
    
    return Response.json({ 
      friendUser,
      friendStats: friendStats[0] || null,
      friendResults
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});