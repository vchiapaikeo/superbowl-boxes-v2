# Superbowl Boxes / Squares

Change names in api/server.js and team names in client/src/App.js. Then, build, push and deploy!

## Local Dev

Install deps for both api and client.

```sh
cd api && npm ci
cd ..
cd client && npm ci
```

Run script -

```sh
./start-dev.sh
```

NOTE: You need to have yarn pre-installed.

## Build and Deploy

```sh
docker build -t my-registry:0.0.2 -f Dockerfile .
docker push my-registry:0.0.2
```

Deploy using your favorite Cloud provider (e.g., GCP Cloud Run on their free tier!)
