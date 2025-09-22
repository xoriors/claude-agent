# weather_dev_buddy

Sample on how you can consume any REST API from an OpenAPI file and save data to MongoDB and generate Java code for this too, using Claude Cod,e without knowing the API structure or writing any code

# What you can do

- add MCP server for any REST API with OpenAPI specs
- we have a preset MCP server for mongodb
- discover what we can do with the API
- simple flow how consume the API without knowing the structure
- saving the data to mongodb
- a more complex example with a flow that requires several API calls
- generate code from the flows

## Start the container

```
docker run --name weather_dev_buddy -it xorio42/weather_dev_buddy:latest
```


## Add mcp server for weather API and mongodb

```
claude mcp add weather -- node /openai-to-mcp/dist/src/index.js --spec https://api.weather.gov/openapi.json --base-url https://api.weather.gov
```

### Test it

`
claude mcp list # make sure it shows Connected
`

## Play with it

```
claude
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

```
mongosh --quiet --eval "use('weather'); db.alerts.find().pretty()"
```

### More complex query, notice how it calls several endpoints to get all that's needed

```
discover what tools to call from weather tools to get temperature, cloud cover and wind speed for last 3 days, all measurements per day, in palo alto, show them as table and have them in mongodb tools in db weather collections historical
```

#### Check if data was inserted in mongodb

```
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

### View dagrams while generating the code. you could first review and change diagram as needed and then generate  the code based on those

### Check the code and run some tests

```
give me curl samples how to test it and does it really save the data in mongodb
```

## Cleanup

```
mongosh weather --eval "db.dropDatabase()" --quiet
rm -rf weather-api-client
```


