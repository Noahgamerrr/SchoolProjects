| Use Case Table  ||
| --- | --- |
| Use Case Package       |Student Management|
| ID                     |255|
| Use Case Name          |Show available/unavailable students|
| Use Case Description   |Show a list of available students which is used by teachers for requesting a guide|
| Primary Actor          |Teacher|
| Actors                 |Teacher|
| Precondition           |Students are not absent, open day is active|
| Postcondition          ||
| Trigger                |Manual action by teacher, refreshing list in app|
| Basic, normal Flow     |Student statuses are checked and shown properly in the app|
| alternative Flows      |Teacher has no network connection, so server cannot be reached<br>-> Warning message is shown, retry manually\
Open day is not active, so system is not running<br>-> Error message is shown|
