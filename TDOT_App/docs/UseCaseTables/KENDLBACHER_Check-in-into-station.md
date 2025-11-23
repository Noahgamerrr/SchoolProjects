| Use Case Table  ||
| --- | --- |
| Use Case Package       |Station management|
| ID                     |254|
| Use Case Name          |Check in into station|
| Use Case Description   |A currently running tour is checked into a station|
| Primary Actor          |Guide|
| Actors                 |Station worker, Guide|
| Precondition           |Tour is running, station is not abandoned, station has free spots|
| Postcondition          |Tour has been checked into station|
| Trigger                |Tour guide reaches station with their visitor, visitor is interested in the station and decides to look at it|
| Basic, normal Flow     |1. Tour guide and visitor approch a station\
2. Station is occupied by at least one station worker\
3. Station capacity is sufficient for visitor\
4. Tour is booked into station\
5. Visitor enjoys station visit|
| alternative Flows      |1. Tour guide and visitor don't take a route which passes by the station\
\
1. Tour guide and visitor approach station\
2. Station has been abandoned - no station workers can be found\
\
1. Tour guide and visitor approach station\
2. Visitor shows no interest in the station, tour continues normally\
\
1. Tour guide and visitor approach station\
2. Station is occupied by at least one station worker\
3. Station is at capacity and cannot take any more visitors\
\
1. Tour guide and visitor approch a station\
2. Station is occupied by at least one station worker\
3. Station capacity is sufficient for visitor\
4. Tour cannot be booked into station due to issues of any kind (can be technical, such as no network or not, such as the visitor losing interest and therefore not wanting to stay at the station)|
