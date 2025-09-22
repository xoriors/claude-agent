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

