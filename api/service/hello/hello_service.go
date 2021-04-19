package hello

import api "grpc-demo/api/proto/v1/hello"

type Service struct{
	api.UnimplementedHelloWorldServiceServer
}
