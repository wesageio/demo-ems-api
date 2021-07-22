# Table of Contents
1. [Overview](#overview)
2. [Module version](#moduleversion)
2. [Setup](#setup)
4. [Development](#development)

# Overview

Admin API microservice for interacting with UI and posting back edited emails.

# Module version

Need to have the following toolchain:
- nvm: >= 0.34.0
- node: >= v12.19.0
- npm: >= 6.14.8
- yarn: >= 1.22.10

Install project dependencies:
```shell
npm install
```
# Setup

Need to have following ENV variables in .env file (e.g):
- MONGO_HOSTNAME=localhost
- MONGO_PORT=27017
- MONGO_DB=admin-api
- HADOOP_HOSTNAME=localhost
- HADOOP_USER=username
- HADOOP_PATH=webhdfs/v1/user/folderName/

Need to pull hadoop from docker hub. 
```shell
docker pull sequenceiq/hadoop-docker
```
After pull run docker image with network host and in background mode
```shell
docker run -d --network host sequenceiq/hadoop-docker
```
Need to create directory and give permissions (for future implement in docker-compose)
```shell
docker exec -it <<container_id>> sh
```
```shell
cd /usr/local/hadoop-2.7.0/
```
```shell
./bin/hdfs dfs -mkdir -p /user/<<folderName>>
```
```shell
./bin/hdfs dfs -chown <<owner>>:<<ownerGroup>> /user/<<folderName>>
```

# Development

Start the project in development mode:
```shell
npm run start:dev
```
