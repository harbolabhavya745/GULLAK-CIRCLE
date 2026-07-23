// supabase/functions/aa-consent/index.ts
// Called by the frontend when a user clicks "Connect Bank Account".
// Creates a consent request with Setu's AA sandbox and returns the
// hosted URL to redirect the user to for approval.

import { createClient } from 'npm:@supabase/supabase-js'

const SETU_BASE = 'https://fiu-sandbox.setu.co'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

Deno.serve(async (req) => {
  // Browser preflight request — must return 2xx with CORS headers, no body needed.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing auth' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Identify the calling user from their JWT
  const { data: userData, error: userErr } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  const userId = userData.user.id

  // 1. Create the consent request with Setu
  const consentRes = await fetch(`${SETU_BASE}/consents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': Deno.env.get('SETU_CLIENT_ID')!,
      'x-client-secret': Deno.env.get('SETU_CLIENT_SECRET')!,
      'x-product-instance-id': Deno.env.get('SETU_PRODUCT_INSTANCE_ID')!
    },
    body: JSON.stringify({
      consentDuration: { unit: 'MONTH', value: '12' },
      dataRange: { from: '2025-01-01T00:00:00.000Z', to: new Date().toISOString() },
      fetchType: 'PERIODIC',
      frequency: { unit: 'DAY', value: '1' },
      consentTypes: ['TRANSACTIONS'],
      fiTypes: ['DEPOSIT'],
      Purpose: {
        code: '101',
        text: 'Roundup savings for Gullak Circle',
        refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
        Category: { type: 'purposeCategory' }
      },
      redirectUrl: Deno.env.get('AA_REDIRECT_URL') ?? 'https://your-app.vercel.app/profile',
      context: [{ key: 'userId', value: userId }]
    })
  })

  if (!consentRes.ok) {
    const errText = await consentRes.text()
    return new Response(JSON.stringify({ error: 'Setu consent creation failed', detail: errText }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const consent = await consentRes.json()

  // 2. Store the pending consent
  await supabase.from('aa_consents').insert({
    user_id: userId,
    consent_id: consent.id,
    status: 'PENDING'
  })

  // 3. Return the hosted approval URL for the frontend to redirect to
  return new Response(JSON.stringify({ url: consent.url, consentId: consent.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
