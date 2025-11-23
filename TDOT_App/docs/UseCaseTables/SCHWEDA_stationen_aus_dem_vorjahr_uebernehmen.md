| Requirement  |Description|
| --- | --- |
| Use Case Number        |10|
| Use Case Name          |Stationen aus dem Vorjahr uebernehmen|
| Use Case Description   |Aktivieren von bereits kreierten stationen, wodurch diese im momenteanen TdoT wiederverwendet werden koennen.|
| Primary Actor          |Lehrer|
| Actors                 |Lehrer|
| Precondition           |Die station muss bereits kriert worden sein und muss noch im Archiv vorhanden sein (darf nicht geloescht worden sein)|
| Postcondition          |Die station wurde in das jetzige jahr aufgenommen und bringt damit ihre volle funktionalitaet (schueler zuweisen, hilfe anfragen, bewertungen usw.)|
| Trigger                |Beim hinzufuegen einer neuen Station kann auf das Feld "Station aus Vorjahr aktivieren" gedrueckt werden. Dann kann man sich aus einer Liste eine Station aus dem Archiv aussuchen.|
| Basic, normal Flow     |Es wird auf "Station aus Vorjahr aktivieren" gedrueckt. Eine Station wird ausgewaehlt und damit hinzugefuegt. Im hintergrund wird ein neuer Jahrgang zu der station hinzugefuegt, in welchem die diesjaehrigen daten erfasst werden.|
| alternative Flows      |Es sind keine Stationen im Archiv vorhanden, weshalb keine ausgewaehlt werden kann. / Die station kann nicht gefunden werden, da diese bereits fuer den diesjaehrigen TdoT aktiviert wurde. |
