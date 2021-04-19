/**
 * @fileoverview gRPC-Web generated client stub for api
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.api = require('./hello_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.api.HelloWorldServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'binary';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.api.HelloWorldServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'binary';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.api.HelloRequest,
 *   !proto.api.HelloResponse>}
 */
const methodDescriptor_HelloWorldService_SayHello = new grpc.web.MethodDescriptor(
  '/api.HelloWorldService/SayHello',
  grpc.web.MethodType.UNARY,
  proto.api.HelloRequest,
  proto.api.HelloResponse,
  /**
   * @param {!proto.api.HelloRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.api.HelloResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.api.HelloRequest,
 *   !proto.api.HelloResponse>}
 */
const methodInfo_HelloWorldService_SayHello = new grpc.web.AbstractClientBase.MethodInfo(
  proto.api.HelloResponse,
  /**
   * @param {!proto.api.HelloRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.api.HelloResponse.deserializeBinary
);


/**
 * @param {!proto.api.HelloRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.api.HelloResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.api.HelloResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.api.HelloWorldServiceClient.prototype.sayHello =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/api.HelloWorldService/SayHello',
      request,
      metadata || {},
      methodDescriptor_HelloWorldService_SayHello,
      callback);
};


/**
 * @param {!proto.api.HelloRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.api.HelloResponse>}
 *     Promise that resolves to the response
 */
proto.api.HelloWorldServicePromiseClient.prototype.sayHello =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/api.HelloWorldService/SayHello',
      request,
      metadata || {},
      methodDescriptor_HelloWorldService_SayHello);
};


module.exports = proto.api;

