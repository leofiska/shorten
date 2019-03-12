--# ADDING CONFIGURATION
INSERT INTO tb_config ( config_name, config_value, config_editable ) VALUES
  ( 'db_version', '1.2', false ),
  ( 'system|url', 'sho.ovh', false ),
  ( 'system|rights_reserved', '2018 Leonardo Fischer', true ),
  ( 'last_modified', '1426269600', false ),
  ( 'notification|email', 'notify@zxe.com.br', true ),
  ( 'contact|email', 'notify@zxe.com.br', true ),
  ( 'contact|name', 'Leonardo Fischer', true ),
  ( 'contact|address', 'Curitiba - Paraná', true ),
  ( 'debug', '1', false ),
  ( 'system|email|signature','signature-logo-white.png',true ),
  ( 'panic', '0', false ),
  ( 'table|tdldb|border','1px solid #d5d5d5', true );

UPDATE tb_config SET config_value=NOW() WHERE config_name='last_modified';

SELECT insert_sentences_page( 'LINKS', 'BOTTOM', '"1033"=>"Links", "1046"=>"Links"'::hstore );
SELECT insert_sentences_page( 'LANGUAGE', 'BOTTOM', '"1033"=>"Language", "1046"=>"Idioma"'::hstore );
SELECT insert_sentences_page( 'SIMPLIFY', 'BOTTOM', '"1033"=>"simplify your links", "1046"=>"simplifique seus links!"'::hstore );
SELECT insert_sentences_page( 'FOLLOW_ON_SOCIAL', 'BOTTOM', '"1033"=>"follow on social networks", "1046"=>"siga nas redes sociais"'::hstore );