
/**
 * @module resin.server.utils
 * @private
 */

(function() {
  var ProgressState, auth, connection, progress;

  progress = require('request-progress');

  connection = require('./connection');

  auth = require('./auth');

  ProgressState = require('./progress-state');


  /**
   * @ignore
   * @private
   */

  exports.checkIfOnline = function(callback) {
    return connection.isOnline(function(error, isOnline) {
      if (error != null) {
        return callback(error);
      }
      if (isOnline) {
        return callback();
      }
      return callback(new Error('You need internet connection to perform this task'));
    });
  };


  /**
   * @ignore
   * @private
   */

  exports.addAuthorizationHeader = function(headers, token) {
    if (headers == null) {
      headers = {};
    }
    if (token == null) {
      throw new Error('Missing token');
    }
    headers.Authorization = "Bearer " + token;
    return headers;
  };


  /**
   * @ignore
   * @private
   */

  exports.authenticate = function(options, callback) {
    if (options == null) {
      throw new Error('Missing options');
    }
    return auth.getToken(function(error, token) {
      if (error != null) {
        return callback(error);
      }
      if (token != null) {
        options.headers = exports.addAuthorizationHeader(options.headers, token);
      }
      return callback();
    });
  };


  /**
   * @ignore
   * @private
   */

  exports.pipeRequest = function(options, callback, onProgress) {
    return progress(connection.request(options)).on('progress', ProgressState.createFromNodeRequestProgress(onProgress)).on('error', callback).pipe(options.pipe).on('error', callback).on('close', callback);
  };


  /**
   * @ignore
   * @private
   */

  exports.sendRequest = function(options, callback) {
    return connection.request(options, function(error, response) {
      if (error != null) {
        return callback(error);
      }
      if (response.statusCode >= 400) {
        return callback(new Error(response.body));
      }
      try {
        response.body = JSON.parse(response.body);
      } catch (_error) {}
      return callback(null, response, response.body);
    });
  };

}).call(this);