| Requirement | Description |
|--|--|
| Name | Check-out from station | 
| ID | 02 |
| Description | In order to measure the time a guide has spent in a specific station for later statistics, guides need to check-out from a station, which stops the timer. |
| Primary Actor | Guide |
| Actors | Visitors |
| Preconditions | The guide was checked in the station |
| Postconditions | The guide is checked out from the station |
| Trigger | The guide goes into a new station |
| Happy Flow | 1. A guide check-in into a station with their visitor\
2. The guide waits until the visitor has fully explored the staion\
3. The guide and the visitor exit the station\
4. The guide and the visitor visit the next station\
5. The guide checks-in into the next station\
6. With the check-in into the next station, the guide will automatically be checked-out from the station. |
| Alternative Flow | 1. A guide check-in into a station with their visitor\
2. The guide waits until the visitor has fully explored the staion\
3. The guide and the visitor exit the station\
4. Since this was the last station the guide and the visitor visited, the guide ends the tour\
5. By ending the tour, the guide will automatically be checked-out from the station\
\
1. A guide check-in into a station with their visitor\
2. The guide waits until the visitor has fully explored the staion\
3. The guide and the visitor exit the station\
4. Since the visitor has no interest in / time for visiting the other stations, the guide ends the tour\
5. By ending the tour, the guide will automatically be checked-out from the station.|
