package hello

import (
	"context"
	api "grpc-demo/api/proto/v1"
)

func (hello Service) SayHello(_ context.Context, params *api.HelloRequest) (res *api.HelloResponse, err error) {
	res = &api.HelloResponse{
		Message: "server response: hello " + params.Name,
	}

	return res, nil
}
