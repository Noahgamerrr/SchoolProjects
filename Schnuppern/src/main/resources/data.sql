INSERT INTO schnuppertermin( datum, klasse, lehrer_informiert, zustaendiger_schueler) VALUES (DATE '2022-12-20', '1AHIF', '1', 'Kevin Kunze');
INSERT INTO schnuppertermin( datum, klasse, lehrer_informiert, zustaendiger_schueler) VALUES (DATE '2022-11-15', '1BHIF', '0', 'Thomas Tischler');
INSERT INTO schnuppertermin( datum, klasse, lehrer_informiert, zustaendiger_schueler) VALUES (DATE '2022-11-22', '1AHIF', '1', 'Sarah Surger');

INSERT INTO anmeldung( id_schnuppertermin,vorname, nachname, derzeitige_schule, derzeitige_klasse, telefonnummer, emailadresse, braucht_bestaetigung, sonstiges)
VALUES (1,'Adam', 'Auer', 'NMS Auen', '4a', '0699/9876453', 'adam.auer123@gmail.com', 0, null );
INSERT INTO anmeldung( id_schnuppertermin, vorname, nachname, derzeitige_schule, derzeitige_klasse, telefonnummer, emailadresse, braucht_bestaetigung, sonstiges)
VALUES (3, 'Berta', 'Berger', 'Peraugymnasium', '4e', null, null, 0, null );
INSERT INTO anmeldung( id_schnuppertermin, vorname, nachname, derzeitige_schule, derzeitige_klasse, telefonnummer, emailadresse, braucht_bestaetigung, sonstiges)
VALUES (1, 'Chris', 'Chaos', 'St. Martin Gymnasium', '4b', null, null, 0, null );
INSERT INTO anmeldung( id_schnuppertermin, vorname, nachname, derzeitige_schule, derzeitige_klasse, telefonnummer, emailadresse, braucht_bestaetigung, sonstiges)
VALUES (2, 'Doris', 'Dorfer', 'NMS Auen', '4a', '0664/12345678', 'doris@dorfer.at', 0, null );
INSERT INTO anmeldung( id_schnuppertermin, vorname, nachname, derzeitige_schule, derzeitige_klasse, telefonnummer, emailadresse, braucht_bestaetigung, sonstiges)
VALUES (1, 'Emil', 'Egger', 'NMS Völkendorf', '4a', null, null, 1, null );
INSERT INTO anmeldung( id_schnuppertermin, vorname, nachname, derzeitige_schule, derzeitige_klasse, telefonnummer, emailadresse, braucht_bestaetigung, sonstiges)
VALUES (3, 'Frieda', 'Forcher', 'Europagymnasium', '4c', null, null, 1, null );
COMMIT;