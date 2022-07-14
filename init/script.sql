CREATE TABLE IF NOT EXISTS "users_token" (
    "token_id"     serial,
    "token_value"  text        not null UNIQUE,
    "token_exp"    timestamptz not null,
    PRIMARY KEY ("token_id")
);

CREATE TABLE IF NOT EXISTS "users" (
    "id"                       serial,
    "email"                    varchar(255) not null  UNIQUE,
    "username"                 varchar(64)  not null,
    "password"                 varchar(255) not null,
    "roles"                    varchar(128) not null,
    "is_active"                boolean      not null,
    "created_at"               timestamptz  default now() not null,
    "updated_at"               timestamptz  default now() not null,
    "registration_token_id"    int          null,
    "forgot_password_token_id" int          null,
    PRIMARY KEY ("id"),
    CONSTRAINT users_rti_fk FOREIGN KEY("registration_token_id") REFERENCES users_token("token_id")
);