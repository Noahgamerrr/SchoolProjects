| Requirement | Description |
|--|--|
| Package | Tour Management |
| Name | Tour beenden | 
| ID | 44 |
| Description | Es wird eine bestehende Tour von dem ausführendem Guide beendet. Die Daten der Tour werden abgespeichert und der Guide bekommt die Tour Zeit zugeschrieben. |
| Primary Actor | Guide |
| Actors | / |
| Preconditions | Eine Tour ist vorhanden. Die Tour hat für länger als 10 Minuten angedauert. Die Tour beinhaltet Besucher. Der Guide ist mit der Tour beschäftigt. |
| Postconditions | Die Tour ist abgespeichert. Der Guide hat die Zeit gutgeschrieben bekommen. Der Guide ist wieder frei und kann weitere Touren entgegennehmen. Jegliche Bewertungen der Tour können nun auf diese Referenzieren. |
| Trigger | Das Stoppen der Tour via UI. Inkl. Bestätigung des Beendens |
| Happy Flow | Der Guide erreicht das Ende der Tour. Der Guide beendet die Tour. Der Guide bestätigt die Beendigung der Tour. Die Tour hat 1 Stunde angedauert also bekommt der Guide diese Stunde gutgeschrieben. Die Tour wird abgespeichert und die Referenz zu den Bewertungen wird hergestellt. Der Guide wird auf verfügbar gesetzt. |
| Alternative Flow | Der Guide beendet eine Tour, obwohl er keine gestartet hat, hier wird ein Fehler ausgegeben. /// Der Guide versucht eine Tour von weniger als 10 Minuten zu beenden, hier wird statt Bestätigung eine Warnung ausgegeben, dass der Guide keine Gutschrift bekommt. Bestätigt der Guide diese Warnung so wird die Tour beendet und der Guide wird auf verfügbar gesetzt. Sonst wird das Beenden der Tour abgebrochen. /// Der Guide beendet die Tour und bestätigt das Beenden nicht, das beenden wird abgebrochen. /// Der Guide beendet die Tour ohne eingetragene Besucher, hier wird ein Fehler ausgegeben und der Guide muss seine Eingabe korrigieren. |
