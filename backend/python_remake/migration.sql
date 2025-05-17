-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id serial4 NOT NULL,
	first_name varchar NULL,
	last_name varchar NULL,
	email varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" public."role" NULL,
	enabled bool NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);
CREATE INDEX ix_users_id ON public.users USING btree (id);


INSERT INTO public.users
(first_name, last_name, email, "password", "role", enabled)
VALUES('Admin', 'User', 'admin@example.com', '$2b$12$4DWMDfBhe9eFQSxUiWeAR..tRtNbGmkALnevt0B1uDcPSxbm8xwY2', 'ADMIN'::public."role", true);
INSERT INTO public.users
(first_name, last_name, email, "password", "role", enabled)
VALUES('Test', 'User', 'user@example.com', '$2b$12$s9NRFaU/s34Srlqb3RhllOcy.4DYXtjTiKvHvW3R6uPdQlI3dAzFi', 'USER'::public."role", true);


-- public.pdf_operation_history definition

-- Drop table

-- DROP TABLE public.pdf_operation_history;

CREATE TABLE public.pdf_operation_history (
	id serial4 NOT NULL,
	user_id int4 NULL,
	operation_type varchar NOT NULL,
	"timestamp" timestamptz DEFAULT now() NOT NULL,
	source_type varchar NOT NULL,
	ip_address varchar NULL,
	country varchar NULL,
	state varchar NULL,
	user_agent varchar NULL,
	request_details text NULL,
	CONSTRAINT pdf_operation_history_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_pdf_operation_history_id ON public.pdf_operation_history USING btree (id);


-- public.pdf_operation_history foreign keys

ALTER TABLE public.pdf_operation_history ADD CONSTRAINT pdf_operation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);