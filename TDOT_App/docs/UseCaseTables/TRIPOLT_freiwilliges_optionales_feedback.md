| Requirement | Description |
|--|--|
| Package | Station Management |
| Name | Freiwilliges, optionales Feedback zur Station erfassen | 
| ID | 43 |
| Description | Es wird weiteres Feedback von einem Guide erfasst, dieses Feedback bekommt der Guide von einem Besucher. Das Feedback wird vom Besucher nicht direkt eingegeben. Die Bewertung beinhaltet ein Sterne Rating und einen Kommentar, der vom Guide eingegeben wird. Die Bewertung hat eine Referenz auf den Guide und falls vorhanden, die Tour in der diese erfasst wurde. |
| Primary Actor | Guide |
| Actors | / |
| Preconditions | Eine Station existiert, der TDOT läuft, der Guide sollte in einer Tour sein. |
| Postconditions | Die Station bekommt die Bewertung. Die Bewertung wird zentralisiert abgespeichert. Die Bewertung bekommt eine Referenz auf den Guide. Falls eine Tour vorhanden ist wird auch eine Referenz auf diese aufgestellt. |
| Trigger | Das einreichen eines Bewertungsformulars via UI. |
| Happy Flow | Der Benutzer bewertet verbal die Station. Der Guide wartet bis zum Ende der Tour. Der Guide Öffnet die Bewertungsansicht und füllt diese aus. Der Guide Selektiert die richtige Station. Der Guide gibt die Bewertung ab. Die Bewertung läuft durch und wird in der Datenbank niedergeschrieben. Der Guide kann weitere Bewertungen abgeben. |
| Alternative Flow | Der Guide versucht die Bewertung außerhalb einer Tour einzureichen. Hier wird eine Warnung angezeigt und der Guide kann entweder die letzte Tour referenzieren oder die Warnung ignorieren. Wird die letzte tour referenziert so bekommt die Bewertung diese Tour als Referenz. / Alternativ wird keine Tour Referenz angefügt. /// Der Guide gibt in einer Tour mehrere Bewertungen auf dieselbe Station, hier wird eine Fehlermeldung angezeigt und das Input läuft nicht durch. /// Der Guide selektiert keine Station für die Bewertung, es wird eine Fehlermeldung angegeben und der Guide muss eine Station selektieren. /// Kein Sterne-Rating wird ausgewählt, es wird eine Fehlermeldung angezeigt und das Input läuft nicht durch. |
