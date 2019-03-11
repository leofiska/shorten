\set var_database DB_NAME_HERE
\set var_user USER_HERE

\c postgres

UPDATE pg_database SET datallowconn = 'false' WHERE datname = ':var_database';

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = ':var_database';

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE datname = 'DB_NAME_HERE'
AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS :var_database;
DROP USER IF EXISTS :var_user;
CREATE USER :var_user WITH PASSWORD 'PASSWORD_HERE';

CREATE DATABASE :var_database
  WITH OWNER :var_user
  ENCODING 'UTF8'
  TABLESPACE = pg_default
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  TEMPLATE template0;

\c :var_database;

