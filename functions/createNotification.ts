import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, type, title, message, actionUrl, senderEmail } = await req.json();
    
    if (!recipientEmail || !type || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create notification using service role to bypass RLS
    const notification = await base44.asServiceRole.entities.Notification.create({
      recipient_email: recipientEmail,
      type,
      title,
      message,
      action_url: actionUrl || null,
      sender_email: senderEmail || user.email,
      read: false,
    });

    return Response.json({ success: true, notification });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});