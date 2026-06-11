#!/bin/bash
mkdir -p bin
cd bin

if [ ! -f "minio" ]; then
  curl -L -o minio https://dl.min.io/server/minio/release/darwin-arm64/minio
  chmod +x minio
fi

if [ ! -d "nacos" ]; then
  curl -L -o nacos.tar.gz https://github.com/alibaba/nacos/releases/download/2.3.2/nacos-server-2.3.2.tar.gz
  tar -zxvf nacos.tar.gz
  rm nacos.tar.gz
fi

brew install rabbitmq
brew services start rabbitmq
