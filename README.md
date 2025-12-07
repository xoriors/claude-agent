# claude-agent

Sample on how you can consume any REST API from an OpenAPI file, save data to MongoDB and generate Java code for this too, using Claude Code, without knowing the API structure or writing any code.

> [!WARNING]  
> This is just experimental at this point; it is still under development. Please do not use it with sensitive data for now; please wait for a
stable release.  
> It's mostly ideal for experimental and learning projects.**

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-xorio42%2Fclaude-agent?logo=docker)](https://hub.docker.com/r/xorio42/claude-agent)

## What you can do

- Add MCP server for any REST API with OpenAPI specs
- We have already configured MCP servers for `petstore` and `weather` API
- Discover what we can do with the API
- Simple flow on how to consume the API without knowing the structure
- Saving the data in mongodb
- A more complex example with a flow that requires several API calls
- Generate code for the above flows

## Use docker compose

Get [docker-compose.yml](docker/docker-compose.yml) and save it in a folder where you'll run the next commands.

## Start the container (only one time)

```zsh
docker compose up -d
```

## Connect to existing container (next times) 

```zsh
docker compose attach claude-agent
```

## Execute commands in container

See [more](docker/res/README.MD)

## Play with it

```zsh
claude
```

Handle login.

### Select the model you want

```
/model
```

### Discover what we can do with the API

```
short summary of what weather tools offer
```

### Simple query

```
get top 3 active weather alerts for today in US Florida, show them and also save them using mongodb tools in db named weather and collection named alerts
```

#### Check if data was inserted in mongodb

```zsh
mongosh --quiet --eval "use('weather'); db.alerts.find().pretty()"
```

### More complex query, notice how it calls several endpoints to get all that's needed

```
discover what tools to call from weather tools to get temperature, cloud cover and wind speed for last 3 days, all measurements per day, in palo alto, show them as table and have them in mongodb tools in db weather collections historical
```

#### Check if data was inserted in mongodb

```zsh
mongosh --quiet --eval "use('weather'); db.historical.find().pretty()"
```

### View tools

```
/mpc
```

### Now generate code

```
generate a new project in weather-api-client folder for the 2 flows from above, alerts and historic data
first generate detailed asciiart diagrams for all the implementation (add this to README.md) and then the actual code
respsect these:
- git initiated
- springboot
- java21
- okhttp code for RST API calls to weather tools
- jackson json
- clean code, KISS and SOLID
- persistence layer on mongodb
- generate extensive unit and integration tests for all flows
- test and run and the app
then commit tme with relevant commit message
```

### View diagrams while generating the code. You could first review and change the diagrams as needed, and then generate  the code based on those

### Check the code and run some tests

```
give me curl samples how to test it and does it really save the data in mongodb
```

## Cleanup

```zsh
mongosh weather --eval "db.dropDatabase()" --quiet
rm -rf weather-api-client
```

## Stop the container

```zsh
docker compose down
```

## Remove the container (WARN: DATA WILL BE LOST)

```zsh
docker compose down
```

# Build Docker

The Dockerfile is based on [claude-code/.devcontainer](https://github.com/anthropics/claude-code/tree/main/.devcontainer)

```zsh
cd docker
docker buildx build --sbom=true --provenance=true -t xorio42/claude-agent .
```

# Sample

![WhatsApp Image 2025-09-21 at 20 06 31](https://github.com/user-attachments/assets/ba5ff25d-0e89-4450-a5f2-f81ccde15ce2)
![WhatsApp Image 2025-09-21 at 20 06 31](https://github.com/user-attachments/assets/f60892af-9fd1-4e14-921f-a453b72c5744)
![WhatsApp Image 2025-09-21 at 20 06 31 (1)](https://github.com/user-attachments/assets/5f2d3c27-8303-435e-8da7-eeb5072cb5da)
![WhatsApp Image 2025-09-21 at 20 06 31 (2)](https://github.com/user-attachments/assets/067f80dc-af01-4875-bab5-87c121b197ac)
![WhatsApp Image 2025-09-21 at 20 06 31 (3)](https://github.com/user-attachments/assets/aeda64d6-b9c5-4b58-a518-756a67863d14)
![WhatsApp Image 2025-09-21 at 20 06 31 (4)](https://github.com/user-attachments/assets/edca3efa-b119-4fca-aac5-cfd117442f76)
![WhatsApp Image 2025-09-21 at 20 10 50](https://github.com/user-attachments/assets/d47b1b24-fd19-429f-9e39-198500406469)
![WhatsApp Image 2025-09-21 at 20 15 24](https://github.com/user-attachments/assets/410c93dc-9f73-408b-8404-30e831d1420f)
![WhatsApp Image 2025-09-21 at 20 15 25](https://github.com/user-attachments/assets/0a571f6f-32fe-4793-8301-c1f49e5309f3)
![WhatsApp Image 2025-09-21 at 20 16 39](https://github.com/user-attachments/assets/8ca8d238-42a0-463d-b344-56d1500041f1)
![WhatsApp Image 2025-09-21 at 20 18 05](https://github.com/user-attachments/assets/94776cfb-969d-4dbb-8f8f-1308ee38c8f2)

