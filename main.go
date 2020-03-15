package main

import "grpc-demo/api"

func main() {
	c := make(chan bool, 1)

	go api.RungGRPCServer(9999)

	<-c
}
