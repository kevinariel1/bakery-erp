CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  low_threshold NUMERIC(10,2) NOT NULL,
  max_quantity NUMERIC(10,2) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  flour_needed NUMERIC(8,3) DEFAULT 0,
  sugar_needed NUMERIC(8,3) DEFAULT 0,
  yeast_needed NUMERIC(8,3) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS production_orders (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  quantity_ordered INT NOT NULL,
  quantity_done INT NOT NULL DEFAULT 0,
  due_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finished_goods (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(100) UNIQUE NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  sold_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO ingredients (name, quantity, unit, low_threshold, max_quantity) VALUES
  ('flour', 150, 'kg', 30, 250),
  ('sugar', 80, 'kg', 20, 150),
  ('yeast', 25, 'kg', 5, 50)
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, price, flour_needed, sugar_needed, yeast_needed) VALUES
  ('Vanilla Sponge Cake', 85000, 0.5, 0.3, 0.008),
  ('Chocolate Fudge Cake', 95000, 0.6, 0.4, 0.006),
  ('Sourdough Bread', 45000, 0.8, 0.05, 0.015),
  ('Croissant', 28000, 0.15, 0.08, 0.003)
ON CONFLICT (name) DO NOTHING;

INSERT INTO finished_goods (product_name, quantity) VALUES
  ('Vanilla Sponge Cake', 0),
  ('Chocolate Fudge Cake', 0),
  ('Sourdough Bread', 0),
  ('Croissant', 0)
ON CONFLICT (product_name) DO NOTHING;