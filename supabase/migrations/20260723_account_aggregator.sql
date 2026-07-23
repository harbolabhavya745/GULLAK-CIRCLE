-- Account Aggregator consent + data session tracking
create table if not exists aa_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_id text,            -- Setu consent id
  session_id text,            -- Setu data session id (set once opened)
  status text not null default 'PENDING', -- PENDING | ACTIVE | REVOKED | EXPIRED
  fip_ids text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table aa_consents enable row level security;

create policy "Users can view their own AA consents"
  on aa_consents for select
  using (auth.uid() = user_id);

-- service role (edge functions) bypasses RLS by default, no insert/update policy needed for users

-- Tag transactions by where they came from, dedupe real bank txns
alter table transactions
  add column if not exists source text not null default 'manual', -- 'manual' | 'aa'
  add column if not exists raw_txn_ref text; -- Setu's transaction id, prevents double-processing

create unique index if not exists transactions_raw_txn_ref_unique
  on transactions (raw_txn_ref) where raw_txn_ref is not null;
