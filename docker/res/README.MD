# Add PostreSQL MCP
claude mcp add postgres \
  --env DATABASE_URI=postgresql://username:password@localhost:5432/dbname \
  postgres-mcp --access-mode=unrestricted

# Test it
claude mcp list # make sure it shows Connected

# Utils

# Test openapi mcp servers

awslabs.openapi-mcp-server --api-name petstore --api-url https://petstore3.swagger.io/api/v3 --spec-url https://petstore3.swagger.io/api/v3/openapi.json

awslabs.openapi-mcp-server --api-name weather --api-url https://api.weather.gov --spec-url https://api.weather.gov/openapi.json

# Add MCP servers to claude

claude mcp add petstore -- awslabs.openapi-mcp-server --api-name petstore --api-url https://petstore3.swagger.io/api/v3 --spec-url https://petstore3.swagger.io/api/v3/openapi.json

claude mcp add weather -- awslabs.openapi-mcp-server --api-name weather --api-url https://api.weather.gov --spec-url https://api.weather.gov/openapi.json

## Use a local OpenAPI specification file
awslabs.openapi-mcp-server --spec-path ./openapi.json

## Add mongodb MCP
claude mcp add mongodb --env MDB_MCP_CONNECTION_STRING="mongodb://localhost:27017/42" -- npx -y mongodb-mcp-server@latest

## Test it
claude mcp list # make sure it shows Connected

# Check if data was inserted in mongodb
mongosh --quiet --eval "use('weather'); db.alerts.find().pretty()"

