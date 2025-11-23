| Requirement  |Description|
| --- | --- |
| Use Case Number        |09|
| Use Case Name          |Schuelereinteilung vornehmen|
| Use Case Description   |Man waehlt Schueler aus den vorhandendn registrierten schuelern aus, und teilt diese ihren stationen zu. Man kann an der Station selbst auf ein "+" klicken um einen schueler per liste/suchleiste auszuwaehlen. Zusaetzlich kann man bei der Schueleruebersicht selbst, den schueler direkt einer station zuweisen (diese wird wieder per liste/suchleiste ausgewaehlt)|
| Primary Actor          |Lehrer|
| Actors                 |Lehrer|
| Precondition           |Die Station der man einen schueler zuteilen will existiert und hat noch freie Plaetze. Der zuzuteilende schuler ist im system bereits eingetragen.|
| Postcondition          |Der schueler wird der station zugewiesen, dies kann nun von anderen Aktoren im system gesehen werden.|
| Trigger                |Das betaetigen des jeweiligen "+" knopfes und das auswaehlen des Schuelers/ der Station.|
| Basic, normal Flow     |Der Lehrer waehlt einen Schueler aus und teilt ihm einer Station zu. Dies wird daraufhin in die Datenbank gespeichert, und nach einem Refresh koennen nun auch andere Aktoren diese Zuweisung wahrnehmen.|
| alternative Flows      |Der Lehrer will einen Schueler zu einer Vollen station zuweisen. Diese erscheint in der auswahl rot. Es kommt ein hinweis, dass diese Station keinen Platz fuer weitere user hat. // Der Lehrer will einen Schueler zuweisen welcher bereits in einer station ist (dieser wird grau angezeigt). Er wird gefragt ob er sich sicher ist, dass er den Schueler verschieben will. Bei nein -> Abbruch. Bei ja -> wird der schueler von seiner momentanen Station entfernt und der neuen zugewiesen.|
