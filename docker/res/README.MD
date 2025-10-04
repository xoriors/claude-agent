# Test PostreSQL connection

```zsh
psql -h localhost -p 5432 -U postgres
DATABASE_URI=postgresql://username:password@localhost:5432/dbname postgres-mcp --access-mode=unrestricted 
```

# Test mongodb connection

```zsh
mongosh
MDB_MCP_CONNECTION_STRING="mongodb://localhost:27017" -- npx -y mongodb-mcp-server@latest
```

# Add PostreSQL MCP

```zsh
claude mcp add postgres \
  --env DATABASE_URI=postgresql://username:password@localhost:5432/dbname -- postgres-mcp --access-mode=unrestricted
```

# Add mongodb MCP

```zsh
claude mcp add mongodb --env MDB_MCP_CONNECTION_STRING="mongodb://localhost:27017" -- npx -y mongodb-mcp-server@latest
```

## Test it

```zsh
claude mcp list # make sure it shows Connected
```

# Test openapi mcp servers

```zsh
awslabs.openapi-mcp-server --api-name petstore --api-url https://petstore3.swagger.io/api/v3 --spec-url https://petstore3.swagger.io/api/v3/openapi.json

awslabs.openapi-mcp-server --api-name weather --api-url https://api.weather.gov --spec-url https://api.weather.gov/openapi.json
```

# Add MCP servers to claude

```zsh
claude mcp add petstore -- awslabs.openapi-mcp-server --api-name petstore --api-url https://petstore3.swagger.io/api/v3 --spec-url https://petstore3.swagger.io/api/v3/openapi.json

claude mcp add weather -- awslabs.openapi-mcp-server --api-name weather --api-url https://api.weather.gov --spec-url https://api.weather.gov/openapi.json
```

# Use a local OpenAPI specification file

```zsh
awslabs.openapi-mcp-server --spec-path ./openapi.json
```

# Check if data was inserted in mongodb

```zsh
mongosh --quiet --eval "use('weather'); db.alerts.find().pretty()"
```

