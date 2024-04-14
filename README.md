# Gateway Service
This service is responsible for routing requests to the appropriate service. It is the entry point for all requests.

## Endpoints
- `GET /gateway-health` - Returns status update for the application.

## Configuration
- `PORT` - Port on which the service will run. Default is `4000`.

## Running the service
- Run `npm install` to install all dependencies.
- Run `npm run dev` to start the service.
- The service will be available at `http://localhost:4000`.
```