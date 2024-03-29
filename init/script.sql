CREATE TABLE IF NOT EXISTS "users_token" (
    "token_id"     serial,
    "token_value"  varchar(255) not null UNIQUE,
    "token_exp"    timestamptz  not null,
    PRIMARY KEY ("token_id")
);

CREATE TABLE IF NOT EXISTS "users" (
    "id"                       serial,
    "email"                    varchar(255) not null UNIQUE,
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

/* */

CREATE TABLE IF NOT EXISTS "app_trackmail" (
    "user_id"                int  not null UNIQUE,
    "trackmail_token"        varchar(255) not null UNIQUE,
    "log_email_from"         boolean      default true not null,
    "log_email_to"           boolean      default true not null,
    "log_subject"            boolean      default true not null,
    PRIMARY KEY ("user_id"),
    CONSTRAINT app_trackmail_user_id_fk FOREIGN KEY("user_id") REFERENCES users("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "app_trackmail_mail" (
    "email_id"               varchar(255) not null UNIQUE,
    "user_id"                int          not null,
    "email_from"             varchar(255) null,
    "email_to"               text null,
    "subject"                varchar(255) null,
    "created"                timestamptz  default now() not null,
    PRIMARY KEY ("email_id"),
    CONSTRAINT app_trackmail_mail_user_id_fk FOREIGN KEY("user_id") REFERENCES users("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "app_trackmail_pixel_log" (
    "log_id"                 serial,
    "email_id"               varchar(255) not null,
    "user_ip"                varchar(48)  not null,
    "log_date"               timestamptz  default now() not null,
    PRIMARY KEY ("log_id"),
    CONSTRAINT app_trackmail_log_email_id_fk FOREIGN KEY("email_id") REFERENCES app_trackmail_mail("email_id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "app_trackmail_link_log" (
    "link_url"               text         not null
) INHERITS ("app_trackmail_pixel_log");