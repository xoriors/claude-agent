# add openapi spec mpc server

## test openapi mcp servers

awslabs.openapi-mcp-server --api-name petstore --api-url https://petstore3.swagger.io/api/v3 --spec-url https://petstore3.swagger.io/api/v3/openapi.json

awslabs.openapi-mcp-server --api-name weather --api-url https://api.weather.gov --spec-url https://api.weather.gov/openapi.json

## add them to claude

claude mcp add petstore -- awslabs.openapi-mcp-server --api-name petstore --api-url https://petstore3.swagger.io/api/v3 --spec-url https://petstore3.swagger.io/api/v3/openapi.json

claude mcp add weather -- awslabs.openapi-mcp-server --api-name weather --api-url https://api.weather.gov --spec-url https://api.weather.gov/openapi.json

### test them
claude mcp list

## Use a local OpenAPI specification file
awslabs.openapi-mcp-server --spec-path ./openapi.json

# add mongodb MCP
claude mcp add mongodb --env MDB_MCP_CONNECTION_STRING="mongodb://localhost:27017/test_collection" -- npx -y mongodb-mcp-server@latest
# test it
claude mcp list # make sure it shows Connected

# check if data was inserted in mongodb
mongosh --quiet --eval "use('weather'); db.alerts.find().pretty()"
