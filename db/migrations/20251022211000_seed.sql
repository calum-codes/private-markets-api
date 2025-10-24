-- migrate:up

INSERT INTO fund (
  fund_name,
  fund_status,
  target_size_usd,
  vintage_year
) VALUES (
  'Brownfield Fund',
  'Investing',
  '30000000.00',
  2007
);

INSERT INTO investor (
  email,
  investor_name,
  investor_type
) VALUES (
  'michaelburry@example.com',
  'Michael Burry',
  'Individual'
);

INSERT INTO investment (
  amount_usd,
  fund_id,
  investment_date,
  investor_id
) VALUES (
  '1000000.00',
  (SELECT id FROM fund WHERE fund_name = 'Brownfield Fund'),
  '2025-10-22',
  (SELECT id FROM investor WHERE investor_name = 'Michael Burry')
);

-- migrate:down
