#!/bin/bash

PROJ_ROOT="$(dirname "$(dirname "$(readlink "$0")")")"

protoc \
  -I ${PROJ_ROOT}/src/api/v1 \
  --js_out=import_style=commonjs:${PROJ_ROOT}/src/api/v1 \
  --grpc-web_out=import_style=commonjs,mode=grpcweb:${PROJ_ROOT}/src/api/v1 \
  ${PROJ_ROOT}/src/api/v1/hello.proto