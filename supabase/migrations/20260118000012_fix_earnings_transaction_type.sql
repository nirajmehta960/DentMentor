-- Fix missing transaction_type column in earnings table
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'transaction_type') then
    alter table public.earnings add column transaction_type text default 'earning';
  end if;
end;
$$;
