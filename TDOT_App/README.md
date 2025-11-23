# SYP - Template 2024

[![coverage report](https://gitlab.com/htl-villach/informatik/2024-5bhif/syp/TeamA/badges/main/coverage.svg?min_good=85&min_medium=60)](https://gitlab.com/htl-villach/informatik/2024-5bhif/syp/TeamA/-/commits/main)
[![pipeline status](https://gitlab.com/htl-villach/informatik/2024-5bhif/syp/TeamA/badges/main/pipeline.svg)](https://gitlab.com/htl-villach/informatik/2024-5bhif/syp/TeamA/-/commits/main)

## Prerequisites

-   Merge all your branches into main (remote)
-   update local main branch
-   create a new branch "playground-{lastname}" from main
-   create a folder "docs" and move everything into this folder (except .git folder of course)
-   git commit
-   moved unzipped template into "empty" repo
-   git commit

## How to build

```shell
npm install
cd client
npm install
npm run build
cd ..
```

## How to test

```shell
# initially needs a mongo instance for testing
# will be wiped at each test run
# note that we map this to port 50000
# docker run -p 50000:27017 -d --rm --name mongo-test-container mongo
docker compose -f docker-compose.test.yml up

# run as often as you want
# will drop database every time
npm test

# finally remove mongo container
# docker -f stop mongo-test-container
docker compose -f docker-compose.test.yml down
```

## How to run

```shell
# again we need a mongo instance - we use a container again
# note that we map this time to default port 27017
docker compose -f docker-compose.prod.yml up

# fill database with demo data
npm run fill-demo-data

# start the service
npm start

docker compose -f docker-compose.prod.yml stop
# if no longer needed, remove mongo container
# --> all data is lost
docker compose -f docker-compose.prod.yml rm
```
