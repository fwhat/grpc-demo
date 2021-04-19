FROM golang:1.16.3-alpine3.13 as builder

ENV GOFLAGS " -mod=vendor"
WORKDIR /var

COPY . /var

RUN apk add bash gcc musl-dev openssl \
 && go build -ldflags "-s -w" -o main main.go \
 && go build -ldflags "-s -w" -o client examples/client/go/main.go

FROM alpine:3.13 as runtime

RUN apk add --no-cache tzdata ca-certificates \
 && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
 && apk del tzdata

COPY --from=builder /var/main /bin/main
COPY --from=builder /var/client /bin/client

RUN chmod +x /bin/main && rm -Rf /var/cache/apk/*

EXPOSE 9999

ENTRYPOINT ["/bin/main"]