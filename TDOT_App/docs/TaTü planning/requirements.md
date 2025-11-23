# Requirements

## Nomenclature
|Phrase|Meaning|
|---|---|
|Guide|Student responsible for showing visitors around|
|Status|What a guide or station worker is currently doing; can be any of: `READY`, `ONTOUR` (or `WORKING` for station workers), `ONBREAK`, `OFFSITE`|
|Teamleader|Responsible for his team members|
|Team|Group of guides, managed by a "Teamleader"|
|Station|An exhibit, often related to a specific subject|
|Station worker|Student responsible for showing people around, answering questions about and explaining details of a station|
|Station leader|Student responsible for other station workers and keeping a station in order|
|Teacher|_Any_ teacher|
|Organiser|Teacher responsible for organising the event|

## Open Day Management

### Create Open Day

## Main Management System

### Guide Team Management
Only available to organisers.

#### Create Guide Team.

#### Add to Guide Team.
Adds a guide to a guide team. 

#### Remove from Guide Team.
Removes a guide from the guide team.

#### Set Guide Team leader.
Sets a guide in the team to be the team leader.

#### View Guide Teams
Shows a list of guide teams.  
Available to all students and teachers.

#### View Guide Team Detailed
Shows a detailed view of a guide team, including member status and leader.  
Available to team members and teachers.

### Guide Management [Guide Package]

#### Assign Guide
Assign a student to be a guide.  
Available to teachers.

#### Unassign Guide
Only available to teachers.

#### Archive Assignment
Unassign a student and archive their previous assignment to be accessed later.
(ex. They were a guide from 9:00 to 11:00)

#### Ability to change their status
- `READY`: A guest can be assigned to the guide  
- `ONBREAK`: Guide is taking a break  
- `ONTOUR`: Guide is on a tour right now  
- `OFFSITE`: Guide is not in the building (or occupied otherwise), thus cannot participate  

Available only to the respective guide.

#### Log of completed tours
A list of tours that have been completed.
Available to the guide and superiors.

### View Timetable
View a timetable that displays past breaks and tours of a guide.
Visible to both the respective guide and superiors.

### Station Management [Station Package]
Only available to organisers

#### Add new station
##### Station attributes
###### People at the station
- Teacher responsible for the station (1) - SVL
- Student responsible for the station (1) - SVS
- Student working at the station (many) - STM
###### simple attributes
- Tile
- Description
- Required amount of STM to run station smothly
- Station capacity
- Average Use time
(the amount of time it usually takes "put a visitor through the station")
- picture of station
(for ease of identification)

#### Import station from last year
stations from previous years can be reeused in following years

#### Delete stations
remove stations which will not be needed anymore (including future years), should be used carefully

#### Activate/Deactivate station
activate stations that will be used this year, deactivate the res (usefull when imorting old stations in bulk)

#### Edit station
edit a stations attributes

#### Call for support
SVS can alert STM (which are eg. currently on break) when the station is busy and in need of extra personal

#### Change Status (for relevant Stations)
- `FULLY OCCUPIED`: Every station worker is occupied; Do not send any visitors to this station right now!
- `BUSY`: The station is frequented as usual. New visitors may enter the station.
- `FREE`: There is no visitor in this station right now; Please send visitors to this station!

#### Access work times and status of all station workers in that station.
- Can only be done by station workers

#### Change station status.
- Can only be done by station workers

#### Require list of not oversaturated stations

#### Check-in to station
- When a guide enters a station with a visitor, he should check himself in
to measure the time spent at the respective station.

#### Check-out from station
- Can be automatically done by checking-in to another station

#### Show station data

#### Report abandoned stations

#### Get optional feedback from visitors
- Must be easily accomplishable

#### Create Station
Creates a station in a given year.

#### Release station

#### View Stations
Gives a list of stations by name.

#### View Status of all station workers in that station.
Can only be done by station leaders and above

#### View station team
Gives a list of station workers and the leader for that station

#### Set station leader
Sets a leader

#### Add station worker
Add a station worker to be in this station. Only available to teachers.

### Station Worker Management [Station Worker Package]

#### Archive Assignment
Unassign a student and archive their previous assignment to be accessed later.  
(e.g. They were a guide from 9:00 to 11:00)  
Available to teachers.

#### Ability to change their status.
`READY`: Could be working, but there is no guest at the station right now  
`WORKING`: Worker is presenting his station to guests  
`ONBREAK`: Worker is taking a break  
`OFFSITE`: Worker is not at the building, thus cannot participate  
Available only to the respective station worker

#### Log of working hours
A log from when to when the guide has been actively stationed.  
Summarises their total working hours.  
Important to ensure equal workload for guides.  
Provides accountablity for (unwanted) actions.  
Available to students and teachers.

#### Assign Station Worker
Assign a student to be a station worker.  
Available to teachers.

#### Unassign Station Worker
Available to teachers.

### Student Management [Student Package]
Available to teachers.

#### Organize students

#### Import Student Data from current year
Import students from a given CSV file.

#### Set Student as absent
Status of student will change to `OFFSITE` automatically

#### Print list of absent students

#### Set Student absence time.
Invokes "Set Student as absent" at the given time

#### View Archived Assignments
View the previously archived assignments
(ex. Student was a station worker from 8 to 11)

#### Show available/unavailable students

#### Take a break

#### End break

### User Interface

#### Manually change status
For station workers and tour guides to change their own status.  
Notifiy teachers if a student is taking an exceptionally long break.

#### View Group
For station workers and tour guides to view their group members

### Tours management

#### Start tour
Requests a guide; If accepted, status of guide will be changed to `ONTOUR`

#### End tour
Guide can mark a tour as complete.  
Guide's status will be reset to `READY` (or `OFFSITE` if there is not enough time for starting another tour)

#### Cancel tour
End the tour before it is finished.  
e.g. if a visitor didn't expect a tour to be as time-consuming.  


#### Require list of available guides

#### Request guide to start tour

#### Decline tour
By guide, if he is hindered in any way

### Visitors management

#### Save visitor's data

#### Assign visitor to guide

## Tour Feedback

### Tour Feedback Quiz

#### Rating from 1 - 5 in different categories.
Categories include stations, tour, variety.

### Generate statistics
How popular are the tours? How long did they last on average? Reasons for stopping the tour etc.

### View Statistics
Displays a list of statistics sorted by time

### View Statistic
Displays a singular statistic in a detailed view.


