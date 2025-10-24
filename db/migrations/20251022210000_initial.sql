-- migrate:up

CREATE TYPE fund_status_enum AS ENUM ('Closed', 'Fundraising', 'Investing');

CREATE TABLE fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  fund_name TEXT NOT NULL,
  fund_status fund_status_enum NOT NULL,
  target_size_usd DECIMAL(20, 2) NOT NULL,
  vintage_year INT NOT NULL
);

CREATE TYPE investor_type_enum AS ENUM ('Family Office', 'Individual', 'Institution');

CREATE TABLE investor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  email TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  investor_type investor_type_enum NOT NULL
);

CREATE TABLE investment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  amount_usd DECIMAL(20, 2) NOT NULL,
  fund_id UUID NOT NULL,
  investment_date DATE NOT NULL,
  investor_id UUID NOT NULL,
  CONSTRAINT fk_fund_id FOREIGN KEY (fund_id) REFERENCES fund(id) ON DELETE RESTRICT,
  CONSTRAINT fk_investor_id FOREIGN KEY (investor_id) REFERENCES investor(id) ON DELETE RESTRICT
);

-- migrate:down

DROP TABLE investment;

DROP TABLE investor;

DROP TYPE investor_type_enum;

DROP TABLE fund;

DROP TYPE fund_status_enum;