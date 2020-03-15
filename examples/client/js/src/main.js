const { HelloRequest } = require('./api/v1/hello_pb');
const { HelloWorldServiceClient } = require('./api/v1/hello_grpc_web_pb');

var client = new HelloWorldServiceClient('https://localhost:8199',
    null, null);

// simple unary call
var request = new HelloRequest();
request.setName('World');

client.sayHello(request, {}, (err, response) => {
    document.getElementById("response").innerHTML = response.getMessage();
});