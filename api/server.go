package api

import (
	"google.golang.org/grpc"
	api "grpc-demo/api/proto/v1"
	"grpc-demo/api/service/hello"
	"log"
	"net"
	"strconv"
)

func RungGRPCServer(grpcPort int16) {
	// 启动一个grpc server

	grpcServer := grpc.NewServer()
	// 绑定服务实现 RegisterHelloWorldServiceServer

	api.RegisterHelloWorldServiceServer(grpcServer, &hello.Service{})

	// 监听端口
	listen, e := net.Listen("tcp", ":"+strconv.Itoa(int(grpcPort)))

	if e != nil {
		log.Fatal(e)
	}

	// 绑定监听端口
	log.Printf("serve gRPC server: 127.0.0.1:%d", grpcPort)
	if err := grpcServer.Serve(listen); err != nil {
		log.Printf("failed to serve: %v", err)
		return
	}
}
