# Pflichtenheft

## Inhaltsverzeichnis

**1. Ausgangslage**
    Es soll eine digitale Lösung gefunden werden um Daten bezüglich des TDOTs zu sammeln und in Echtzeit auszutauschen.

**2. Ist-Zustand**
    Die momentane Lösung findet mit Stift und Papier analog, und auch mit Hilfe einer Excel-Tabelle für die Eintragung von Schülern statt.
    - Die analogen Systeme sind für die digitale Lösung nicht von großer Hilfe
    - Die Excel-Tabellen können jedoch weiterverwendet werden, und als Input-Quelle für die digitale Lösung verwendet werden. Punkte, die vor allem dafür sprechen wären z.B. dass das Personal schon auf diese Technologie eingespielt ist und eine Veränderung nicht unbedingt notwendig ist, da die Kosten nicht gesenkt würden und da die Lehrkräfte neu eingeschult werden müssten..
**3. Ziele**
    - Der momentane Zettel-Workflow wird digitalisiert, und bestmöglich automatisiert.
    - Das neue System wird nahtlos an die bestehenden Excel-Systeme angeknüpft.
    - Dieses System sollte in der Form einer Web-Applikation implementiert werden, um Kompatibilität mit allen Geräten zu ermöglichen.
    - Die Applikation sollte noch vor dem [TDOT Datum hier] funktionsfähig und ausreichend getestet sein, Stabilität ist hierbei die Hauptpriorität. Weitere, noch instabile Features können vorerst exkludiert werden, um mehr Zeit in die Stabilität der TDOT-Applikation zu investieren.
**4. Anforderungen**
    1. Applikationssoftware
        Die Software soll mittels MERN-Stack als Web-App implementiert werden (da der Kunde uns diesen Technologiestack vorgeschrieben hat [Hier könnte auch ein objektiver Grund stehen warum diese Technologie für diesen Use-Case am besten geeignet wäre]). Nutzerverwaltung soll mittels Azure durch ein Microsoft-Login möglich sein, da jede Person schon ein Schulkonto besitzt, und man somit durch wenig Aufwand versichern kann, dass jeder (nur) ein Konto hat.
    2. Systemplattform
        Da der Webserver auf Node laufen wird, gibt es nicht viele Einschränkungen bezüglich der Hardware auf der dieser dann deployed werden soll, es sollte jedoch sichergestellt werden, dass zum Einsatzzeitpunkt (dem TDOT) genug Resourcen zur Verfügung gestellt sind. Dies kann auch durch horizontale Skalierung erreicht werden, da die Webserver stateless gehalten werden.
    3. Anbieter
        Als Anbieter ist Azure aufgrund des schon bestehenden gratis-Guthabens eine gute Wahl, auch wenn dies nicht für den gesammten TDOT ausreichen sollte, wären es immernoch bis zu 100 eingesparte Euro.
**5. Mengengerüst, Verarbeitungshäufigkeiten**
    Das Programm wird nur an einem Tag im Jahr produktiv genutzt. Hierbei soll man mit einer relativ hohen Anzahl von Anfragen und auch Daten rechnen. Schätzungsweise wären dies ca. 1-5 Writes/Minute/Guide, wobei mit ca. 100 Guides gerechnet werden kann. Die Anzahl an Leseanfragen sollte auf ein 2-3-Faches davon geschätzt werden.

    Da das Programm jedoch nur über einen Tag in Betrieb sein wird, und dadurch nicht sehr kostenlastig ist, sollte man bestenfalls mehr Resourcen als nötig-geschätzt bereitstellen, um Überlastung zu vermeiden. Die Stärke der Hardware kann dann für zukünfige Jahre empirisch adjustiert werden.
**6. Testen**
    Das Testen der Applikation kann während der Implementierung durch Backend-Tests erfolgen (Frontend-Tests sind out of Scope für diese recht kleine Applikation)

    In den Wochen vor dem TDOT können dann noch echte Szenarien nachgestellt werden, um Fehler in Bezug auf reele Use-Cases zu finden. Das einzige, das hierbei ungetestet bleiben würde, ist die Belastung des Webservers, da dies zu viel Aufwand wäre, da ein realistischer Test über 100 Nutzer bräuchte, jedoch kann man dies (auch wenn inakkurat) hochrechnen, um eine grobe Idee zu bekommen.


***Kommentar***
*Im Vergleich zum Lastenheft, findet man hier viel mehr (vorallem technisch-)spezifischere Informationen bezüglich der internen Umsetzung des Projektes. Hierbei werden zum Beispiel die Vorteile von gewissen Technologien abgewogen, und Entscheidungen über die zu verwendenden Herangehensweisen und Systeme niedergeschrieben.*