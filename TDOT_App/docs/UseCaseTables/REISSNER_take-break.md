| Use Case Table||
|---|---|
| Use Case Package||
| Use Case Name| take break|
| Use Case Description| a guide or station worker wants to take a break from work; this does not include toilet breaks or any non-planned absences|
| Primary Actor| station worker / guide|
| Actors| team leader|
| Precondition| the respective prospect's station is able to be sustained during their absence|
| Postcondition| the primary actor begins taking their time off and is not able to entertain visitors during their absence|
| Trigger| the station worker / guide wants to take a break|
| Basic, normal Flow| 1. the break prospect asks their respective team leader to take a break\
2. the team leader allows for a break to be taken\
3. the system acknowledges the absence of the person taking a break due to either the student or the team leader telling it to\
4. the student will be shown as not available in each view displaying information about them|
| alternative Flow 1   | 1. the student asks their respective team leader for a break\
2. the team leader declines due to:\
    1. the student taking too many breaks\
    2. the station being completely full and there not being a window of opportunity to take any breaks\
3. the student will not be taking a break and continues their station work|
| alternative Flow 2   | 1. the student wants to ask for a break\
2.the team leader is not available\
3. the student adds the validation for a break to a queue with a time limit\
4a. the team leader comes back in time and the flow proceeds to one of the above\
4b. the team leader does not come back before the request expires and the student is automatically allowed to take a |
