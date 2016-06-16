# Final Solo Project for Prime Digital Academy

npm install to get started.

Using Postgres create the following tables and constraints

CREATE TABLE total (
	id SERIAL PRIMARY KEY,
	balance float,
	user_id int
)
CREATE TABLE next_total (
	id SERIAL PRIMARY KEY,
	balance float,
	user_id int
)

CREATE TABLE users (
 id SERIAL PRIMARY KEY,
 username VARCHAR(100) NOT NULL UNIQUE,
 password VARCHAR(120) NOT NULL
);

CREATE TABLE events (
	id SERIAL PRIMARY KEY,
	transaction character varying(30),
	name character varying(100),
	description character varying(500),
	amount float NOT NULL,
	recurring boolean,
	frequency character varying(100),
	execute_date character varying(100),
	user_id int NOT NULL
)

ALTER TABLE events
   ADD CONSTRAINT check_frequency
   CHECK (frequency = 'weekly' OR frequency = 'bi-weekly' OR frequency = 'monthly')

   ALTER TABLE events
   ADD CONSTRAINT check_types
   CHECK (transaction = 'income' OR transaction = 'expense');
