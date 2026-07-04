// supabase/functions/fraud-check/index.ts
import Anthropic from 'npm:@anthropic-ai/sdk'

Deno.serve(async (req) => {
  const { claim } = await req.json()
  
  const client = new Anthropic()
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `You are a fraud detection system for a peer mutual aid pool.
      
Analyze this claim and respond in JSON only:
{
  "risk_label": "Looks Legitimate" | "Needs Review" | "High Risk",
  "confidence": <0-100>,
  "reason": "<one sentence explanation>"
}

Claim details:
- Reason: ${claim.reason}
- Amount: ₹${claim.amount}
- Description: ${claim.description}
- Claimant contribution score: ${claim.contributor_score}/100
- Previous claims this month: ${claim.previous_claims}`
    }]
  })
  
  const result = JSON.parse(response.content[0].text)
  
  // Update the claim row with AI result
  const { createClient } = await import('npm:@supabase/supabase-js')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  await supabase.from('claims').update({
    ai_risk_label: result.risk_label,
    ai_risk_confidence: result.confidence,
    ai_risk_reason: result.reason
  }).eq('id', claim.id)
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})