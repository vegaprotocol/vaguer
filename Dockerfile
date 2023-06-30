## Build with node 18
FROM node:18-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit
COPY . .

## Run in distroless
FROM astefanutti/scratch-node:18.10.0
COPY --from=build /app /app
WORKDIR /app
ENTRYPOINT ["node", "src/bin.js"]
