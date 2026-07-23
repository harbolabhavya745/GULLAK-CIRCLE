// supabase/functions/aa-webhook/index.ts
// Configure this URL as the webhook/notification endpoint in your Setu
// dashboard. Handles two event types:
//   CONSENT_STATUS_UPDATE -> consent approved, open a data session
//   FI_NOTIFICATION        -> bank data is ready, fetch + process it

import { createClient } from 'npm:@supabase/supabase-js'

const SETU_BASE = 'https://fiu-sandbox.setu.co'

function setuHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-client-id': Deno.env.get('SETU_CLIENT_ID')!,
    'x-client-secret': Deno.env.get('SETU_CLIENT_SECRET')!,
    'x-product-instance-id': Deno.env.get('SETU_PRODUCT_INSTANCE_ID')!
  }
}

// Same rule as RoundupSimulatorPage.tsx: round up to the nearest ₹10
function computeRoundup(amount: number): number {
  const remainder = amount % 10
  return remainder === 0 ? 10 : 10 - remainder
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const payload = await req.json()

  // --- 1. Consent approved -> open a data fetch session ---
  if (payload.type === 'CONSENT_STATUS_UPDATE' && payload.consentStatus === 'ACTIVE') {
    const consentId = payload.consentId

    const sessionRes = await fetch(`${SETU_BASE}/sessions`, {
      method: 'POST',
      headers: setuHeaders(),
      body: JSON.stringify({
        consentId,
        dataRange: {
          from: '2025-01-01T00:00:00.000Z',
          to: new Date().toISOString()
        },
        format: 'json' // Setu decrypts + parses for you
      })
    })
    const session = await sessionRes.json()

    await supabase
      .from('aa_consents')
      .update({ status: 'ACTIVE', session_id: session.id, updated_at: new Date().toISOString() })
      .eq('consent_id', consentId)

    return new Response(JSON.stringify({ ok: true }))
  }

  // --- 2. Bank data ready -> fetch, compute roundups, insert ---
  if (payload.type === 'FI_NOTIFICATION' && payload.sessionStatus === 'COMPLETED') {
    const sessionId = payload.sessionId

    const { data: consentRow } = await supabase
      .from('aa_consents')
      .select('user_id')
      .eq('session_id', sessionId)
      .single()

    if (!consentRow) {
      return new Response(JSON.stringify({ error: 'Unknown session' }), { status: 404 })
    }

    const dataRes = await fetch(`${SETU_BASE}/sessions/${sessionId}`, {
      headers: setuHeaders()
    })
    const fiData = await dataRes.json()

    // fiData.accounts[].transactions[] — shape per Setu's decrypted JSON format
    const rowsToInsert = []
    for (const account of fiData.accounts ?? []) {
      for (const txn of account.transactions ?? []) {
        if (txn.type !== 'DEBIT') continue // only spends get rounded up

        const amount = parseFloat(txn.amount)
        const roundup = computeRoundup(amount)

        rowsToInsert.push({
          user_id: consentRow.user_id,
          merchant: txn.narration ?? 'Bank Transaction',
          amount,
          roundup,
          timestamp: txn.transactionTimestamp,
          status: 'Completed',
          category: 'Shopping', // refine with categorization later if needed
          source: 'aa',
          raw_txn_ref: txn.txnId
        })
      }
    }

    if (rowsToInsert.length > 0) {
      // raw_txn_ref has a unique index, so re-deliveries of the same
      // webhook won't double-insert
      await supabase.from('transactions').upsert(rowsToInsert, {
        onConflict: 'raw_txn_ref',
        ignoreDuplicates: true
      })
    }

    return new Response(JSON.stringify({ ok: true, inserted: rowsToInsert.length }))
  }

  return new Response(JSON.stringify({ ok: true, ignored: payload.type }))
})
