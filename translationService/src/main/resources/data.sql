INSERT INTO language (identifier) VALUES ('German');
INSERT INTO language (identifier) VALUES ('English');
INSERT INTO language (identifier) VALUES ('Italian');

INSERT INTO word( idLanguage, vocable ) VALUES ( 1, 'Haus');     --1
INSERT INTO word ( idLanguage, vocable) VALUES ( 1, 'Ferien' );  --2
INSERT INTO word( idLanguage, vocable ) VALUES ( 1, 'Schule');   --3
INSERT INTO word ( idLanguage, vocable) VALUES ( 1, 'laufen');   --4

INSERT INTO word( idLanguage, vocable ) VALUES ( 2, 'house');    --5
INSERT INTO word ( idLanguage, vocable) VALUES ( 2, 'holidays' ); --6
INSERT INTO word( idLanguage, vocable ) VALUES ( 2, 'school');   --7
INSERT INTO word ( idLanguage, vocable) VALUES ( 2, 'to run');   --8

INSERT INTO word( idLanguage, vocable ) VALUES ( 3, 'casa');    --9
INSERT INTO word ( idLanguage, vocable) VALUES ( 3, 'vacanza' ); --10
INSERT INTO word( idLanguage, vocable ) VALUES ( 3, 'ferie');   --11
INSERT INTO word ( idLanguage, vocable) VALUES ( 3, 'scuola');  --12

INSERT INTO word( idLanguage, vocable ) VALUES ( 3, 'correre');  --13
INSERT INTO word ( idLanguage, vocable) VALUES ( 3, 'camminare'); --14

INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (1, 5, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (1, 9, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (2, 6, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (2, 10, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (2, 11, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (3, 7, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (3, 12, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (4, 8, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (4, 13, 1);
INSERT INTO translation (idtotranslate, idtranslated, difficulty) VALUES (4, 14, 1);