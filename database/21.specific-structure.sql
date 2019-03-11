DROP TABLE IF EXISTS tb_shortener;
CREATE TABLE tb_shortener (
  short_id              bigserial PRIMARY KEY,
  short_url             text NOT NULL,
  short_uuid            char(36) UNIQUE NOT NULL,
  short_session_id      bigint DEFAULT NULL REFERENCES tb_session_ids (session_id) ON DELETE SET NULL,
  short_user_id         bigint DEFAULT NULL REFERENCES tb_users (user_id) ON DELETE SET NULL,
  short_unique_counter	bigint DEFAULT 0 NOT NULL,
  short_time            timestamp DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, DELETE, INSERT ( short_url, short_uuid, short_session_id, short_user_id ), UPDATE ( short_unique_counter ) ON tb_shortener TO :var_user;
GRANT USAGE, SELECT ON SEQUENCE tb_shortener_short_id_seq TO :var_user;
