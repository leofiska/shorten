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

SELECT insert_sentences_page( 'ABOUT_DESCRIPTION_1', 'ABOUT', '"1033"=>"The service has been started on November 19th, 2018 and it is totally free of charge with no ads and no tracking, as it should be provided forever", "1046"=>"Este serviço foi iniciado em 19 de novembro de 2018 e é totalmente gratuito, livre de anúncios e rastreios, como deve permenecer para sempre"'::hstore );
SELECT insert_sentences_page( 'ABOUT_DESCRIPTION_2', 'ABOUT', '"1033"=>"Suggestions are welcome, please use the e-mail in the footer of the page. New features will continue to be implemented", "1046"=>"Sugestões são bem-vindas!! Utilize o e-mail que está no rodapé da página para fazê-las. Novas facilidades continuarão a ser implementadas"'::hstore );

SELECT insert_sentences_page( 'CLEAR_TOOLTIP', 'HOME', '"1033"=>"clears all", "1046"=>"limpar tudo"'::hstore );
SELECT insert_sentences_page( 'COPY_TOOLTIP', 'HOME', '"1033"=>"copy short url to clipboard", "1046"=>"copia url simplificada para área de transferência"'::hstore );
SELECT insert_sentences_page( 'TYPE_URL', 'HOME', '"1033"=>"type url here", "1046"=>"digite aqui a url"'::hstore );
SELECT insert_sentences_page( 'SHORTEN', 'HOME', '"1033"=>"Light URL Shortener", "1046"=>"Light URL Shortener"'::hstore );
SELECT insert_sentences_page( 'URL', 'HOME', '"1033"=>"URL", "1046"=>"URL"'::hstore );
SELECT insert_sentences_page( 'SHORT_URL', 'HOME', '"1033"=>"Short URL", "1046"=>"URL Simplificada"'::hstore );
SELECT insert_sentences_page( 'SHORT', 'HOME', '"1033"=>"Shorten URL", "1046"=>"Simplificar URL"'::hstore );
SELECT insert_sentences_page( 'DESCRIPTION', 'HOME', '"1033"=>"simplify your links and share them easily", "1046"=>"simplifique seus links e os compartilhe mais facilmente"'::hstore );
SELECT insert_sentences_page( 'COPIED', 'HOME', '"1033"=>"link copied", "1046"=>"link copiado"'::hstore );
SELECT insert_sentences_page( 'INVALIDDOMAIN', 'HOME', '"1033"=>"host/domain not found", "1046"=>"host/dominio não encontrado"'::hstore );


