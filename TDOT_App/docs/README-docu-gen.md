# Document Generation

## via Docker compose

```shell
docker compose up
```

## via Docker run

```shell
docker run --rm -it --entrypoint=/data/pandoc/genDocu.sh -v '.:/data' ghcr.io/ingokofler/pandoc4all
```
