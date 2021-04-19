## 版本

```
go: 
golang 1.16.3
protoc --version 3.15.8
google.golang.org/grpc 1.37.0
protoc-gen-go v1.26.0

js:
grpc-web 1.2.1
google-protobuf 3.15.8
```

## Golang-gRPC 服务搭建

本文记录Golang-gRPC、grpc-web + nginx 搭建过程，以及中途遇到的一些问题 [项目代码](https://github.com/Dowte/grpc-demo)

### 一、理解什么是gRPC

* * *


gRPC的描述网上已经很多了[gRPC](http://www.findme.wang/blog/detail/id/680.html), 大致涉及两个知识

##### (1)、RPC [Remote Procedure Call](https://www.jianshu.com/p/7d6853140e13)
![3702846817-5cc80fda042a5_articlex.jpeg](https://segmentfault.com/img/bVbEybS)

RPC的核心是目的是: 本地调用远程（**跨内存可访问的**）方法。

 1. **RPC框架**: 开箱即用的实现了RPC调用的框架，其中开源框架如 阿里Dubbo、Google gRPC、Facebook Thrift
 2. **远程通信协议**: REST(HTTP JSON), SOAP(HTTP XML), gRPC(HTTP2 protobuf)
 3. **序列化/反序列化**: 文本（XML、JSON）与二进制（Java原生的、Hessian、protobuf、Thrift、Avro、Kryo、MessagePack

##### (2) [protobuf](https://www.jianshu.com/p/b723053a86a6) 

*   足够简单
*   序列化后体积很小:消息大小只需要XML的1/10 ~ 1/3
*   解析速度快:解析速度比XML快20 ~ 100倍
*   多语言支持
*   更好的兼容性,Protobuf设计的一个原则就是要能够很好的支持向下或向上兼容

### 二、 搭建hello world 

* * *


#### 实现步骤

1. 通过protobuf来定义接口和数据类型
2. 生成接口代码
3. 编写gRPC server端代码
4. 编写gRPC client端代码  
目录结构如下(推荐使用[gihub上的一个 golang 项目标准框架](https://github.com/golang-standards/project-layout) 搭建自己的项目)

![image.png](https://segmentfault.com/img/bVbEyFU)

##### 1. 定义接口和数据类型

```
syntax = "proto3";

package api;

// 这里可以写服务注释
service HelloWorldService {
    // 这里可以写方法注释
    rpc SayHello (HelloRequest) returns (HelloResponse) {}
}

// 这里可以写请求结构注释
message HelloRequest {
    // 这里可以写参数注释
    string name = 1;
}

// 这里可以写响应结构注释
message HelloResponse {
    // 这里可以写参数注释
    string message = 1;
}
```

##### 2. 生成接口代码

+ 下载 protobuf 生成工具 [protoc](https://github.com/protocolbuffers/protobuf/releases), 将其中的可执行文件放在PATH中方便使用 `mv protoc-3.11.4-osx-x86_64/bin/protoc /usr/local/bin`

![7FDCC505-94F5-47B2-8AAC-DC0FCD9A864D.png](https://segmentfault.com/img/bVbEyhB)

+ 下载生成go语言接口代码的插件 [protoc-gen-go](https://grpc.io/docs/languages/go/quickstart/) 
```
go get google.golang.org/protobuf/cmd/protoc-gen-go
go get google.golang.org/grpc/cmd/protoc-gen-go-grpc
```

+ 编写api/proto/v1/init.go, 作为生成脚本(也可以直接在命令行执行)
```
package api

// go:generate protoc -I. --go_out=../ --go-grpc_out=../ ./hello.proto

func init() {}

```
+ 执行后将得到文件 hello/hello.pb.go hello/hello_grpc.pb.go 里面是hello服务相关描述和接口申明

##### 3. 编写gRPC server端代码

+ api/service/hello/hello_service.go

```
package hello

type Service struct {
    api.UnimplementedHelloWorldServiceServer // 当前版本需要继承对应的Unimplemented* 结构体
}
```
+ api/service/hello/say_hello.go

```
package hello

import (
	"context"
	api "grpc-demo/api/proto/v1/hello"
)

func (hello Service) SayHello (_ context.Context, params *api.HelloRequest) (res *api.HelloResponse, err error)  {
	res = &api.HelloResponse{
		Message: "server response: hello " + params.Name,
	}

	return res, nil
}

```
+ api/server.go

```
package api

import (
	"google.golang.org/grpc"
	api "grpc-demo/api/proto/v1/hello"
	"grpc-demo/api/service/hello"
	"log"
	"net"
	"strconv"
)

func RungGRPCServer (grpcPort int16)  {
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

```

+ main.go
```
package main

import "grpc-demo/api"

func main ()  {
	c := make(chan bool, 1)

	go api.RungGRPCServer(9999)

	<-c
}

```
+ 启动程序

![image.png](https://segmentfault.com/img/bVbEyox)

##### 4. 编写gRPC client端代码

+ examples/client/go/mian.go
```
package main

import (
	"context"
	"google.golang.org/grpc"
	api "grpc-demo/api/proto/v1/hello"
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

```

![image.png](https://segmentfault.com/img/bVbEyFH)

现在，一个简单的gRPC程序就完成了

### 三、配合 [grpc-web](https://github.com/grpc/grpc-web)

* * *

grpc-web 是针对web端的grpcClient 的项目，解决目前浏览器不能直接支持grpc协议的方案，需配合代理服务一起使用, grpc-web 搭建分为以下几步

1. 生成grpc-web client代码
2. 配置代理服务

参考文章 [grpc-web](http://blog.itpub.net/31559359/viewspace-2637227/) [grpc-web-nginx](https://qiita.com/Morix1500/items/065da20d98ab5e559ea6#nginxの構築)

##### 1. 生成grpc-web client代码

+ 1 和go语言一样也是要下载一个插件，下载生成js语言接口代码的插件[protoc-gen-grpc-web](https://github.com/grpc/grpc-web/releases)

```
# 将下载后的内容移动到bin路径中方便使用
mv ~/Downloads/protoc-gen-grpc-web-<version>-darwin-x86_64 /usr/local/bin/protoc-gen-grpc-web
# 增加可执行权限
chmod +x /usr/local/bin/protoc-gen-grpc-web
```
+ 2 建立examples/client/js目录，并将申明文件proto移动到js项目中，结构如下

![image.png](https://segmentfault.com/img/bVbEyU1)

+ 3 编写生成js脚本examples/client/ts/protogen.sh方便执行(也可以直接执行其中命令)
```
#!/bin/bash

PROJ_ROOT="$(dirname "$(dirname "$(readlink "$0")")")"

protoc \
  -I ${PROJ_ROOT}/src/api/v1 \
  --js_out=import_style=commonjs:${PROJ_ROOT}/src/api/v1 \
  --grpc-web_out=import_style=typescript,mode=grpcweb:${PROJ_ROOT}/src/api/v1 \
  ${PROJ_ROOT}/src/api/v1/hello.proto
```
+ 执行后将会有2个文件生成，如下图

![image.png](https://segmentfault.com/img/bVbEyYV)

+ 初始化前端项目, 配置package.json
```
{
  "name": "js",
  "version": "1.0.0",
  "dependencies": {},
  "main": "main.js",
  "devDependencies": {
    "google-protobuf": "^3.15.8",
    "grpc-web": "^1.2.1",
    "webpack": "^4.16.5",
    "webpack-cli": "^3.1.0"
  }
}
```
+ examples/client/js/src/main.js
```
const { HelloRequest } = require('./api/v1/hello_pb');
const { HelloWorldServiceClient } = require('./api/v1/hello_grpc_web_pb');

// 注意这个端口是代理服务器的端口，不是grpc的端口
var client = new HelloWorldServiceClient('http://localhost:8199',
    null, null);

// simple unary call
var request = new HelloRequest();
request.setName('World');

client.sayHello(request, {}, (err, response) => {
    document.getElementById("response").innerHTML = response.getMessage();
});
```
+ examples/client/js/index.html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>gRPC-Web Demode</title>
    <script src="./dist/main.js"></script>
</head>
<body>
<p id="response">error get message</p>
</body>
</html>
```

+ 构建前端项目
```
yarn install
npx webpack src/main.js
```
+ 在运行之前还需要配置代理服务器

##### 2. 配置代理服务

1. 代理服务选型 envoy 或 nginx，envoy配置官方示例中有 [查看配置](https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples/echo/envoy.yaml), [其他示例官方也有提供](https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples), 本文使用nginx配置(本地搭建)。

2. localhost 支持ssl

```
git clone https://github.com/FiloSottile/mkcert && cd mkcert
go build -ldflags "-X main.Version=$(git describe --tags)"
./mkcert -install
./mkcert localhost 127.0.0.1
mv localhost+1* /etc/ssl/
```

2. grpc.proxy.conf
```
server {
  listen 8199 ssl http2;
  server_name _;

  ssl_certificate /etc/ssl/localhost+1.pem;
  ssl_certificate_key /etc/ssl/localhost+1-key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;

  access_log /tmp/grpc.log;
  error_log /tmp/grpc.log debug;

  location ~ \.(html|js)$ {
    root /var/www/html;
  }
  location / {
    # 重点！！需要将Content-Type更改为 application/grpc
    # grpc-web过来的是application/grpc-web+proto || application/grpc-web+text (取决于生成js代码时grpc-web_out 的mode选项，本文用grpcweb 则为application/grpc-web+proto)
    grpc_set_header Content-Type application/grpc;
    grpc_pass server:9999;
    # 因浏览器有跨域限制，这里直接在nginx支持跨域
    if ($request_method = 'OPTIONS') {
      add_header 'Access-Control-Allow-Origin' '*';
      add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
      add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Transfer-Encoding,Custom-Header-1,X-Accept-Content-Transfer-Encoding,X-Accept-Response-Streaming,X-User-Agent,X-Grpc-Web';
      add_header 'Access-Control-Max-Age' 1728000;
      add_header 'Content-Type' 'text/plain charset=UTF-8';
      add_header 'Content-Length' 0;
      return 204;
    }

    if ($request_method = 'POST') {
      add_header 'Access-Control-Allow-Origin' '*';
      add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
      add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Transfer-Encoding,Custom-Header-1,X-Accept-Content-Transfer-Encoding,X-Accept-Response-Streaming,X-User-Agent,X-Grpc-Web';
      add_header 'Access-Control-Expose-Headers' 'Content-Transfer-Encoding, grpc-message,grpc-status';
    }
  }
}
```

##### 3. 运行前端项目

+ 在浏览器打开 index.html 文件即可，看到以下内容则表示运行正常

![image.png](https://segmentfault.com/img/bVbEy0K)

### 遇到的问题


##### 1. [grpc 的响应头中grpc-message] grpc: received message larger than max (1094795585 vs. 4194304) (可以通过nginx日志，或者curl -vvv 模式看到)

![image.png](https://segmentfault.com/img/bVbEy31)

使用mode=grpcwebtext 时，显示的消息大小问题（不过即便调大估计也不行, 这个值1094795585 已经约是1094M了，显然从grpc接收到的值不对，猜测是nginx这边需要进行什么配置或者扩展，对grpc-web-text 类型数据进行转换）
**方案**: 使用mode=grpcweb

##### 2. [nginx] upstream rejected request with error 2 while reading response header from upstream 

~~google了下也没人说原因是什么，不过增加下面的请求头后解决问题~~

**方案:** grpc_set_header Content-Type application/grpc;

##### 3. grpc-web 目前在服务端error的时候会有两次触发回调函数。[issue](https://github.com/grpc/grpc-web/pull/695) 目前已合并至master, 当前版本已修复