package main

import (
	"context"
	"google.golang.org/grpc"
	api "grpc-demo/api/proto/v1"
	"log"
	"os"
)

const (
	address = "localhost:9999"
)

func main() {
	conn, err := grpc.Dial(address, grpc.WithInsecure())

	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}

	defer conn.Close()

	c := api.NewHelloWorldServiceClient(conn)

	name := "world"
	if len(os.Args) > 1 {
		name = os.Args[1]
	}

	r, err := c.SayHello(context.Background(), &api.HelloRequest{Name: name})

	if err != nil {
		log.Fatalf("call say hello fail: %v", err)
	}

	log.Println(r.Message)
}
