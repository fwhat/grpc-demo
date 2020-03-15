package api

//go:generate protoc -I. --go_out=plugins=grpc:. ./hello.proto

func init() {}
