'use strict';

(function () {
  angular.module('json-api-client', [])
    .factory('linked', ['$q', function ($q) {
      return function (links, transport) {
        return {
          link: function (rel) {
            var link = links[rel];
            if (link) {
              return $q.when(link);
            }
            return $q.reject(rel + ' does not exist');
          },
          load: function (rel, options) {
            return this.link(rel).then(function (link) {
              var url = link.href || link;
              return transport.load(url, options);
            });
          }
        };
      };
    }])

    .factory('resource', ['linked', function (linked) {
      var resource = function (data, included, transport) {
        return _.extend(linked(data.links, transport), data, {
          attr: function (name) {
            return data.attributes && data.attributes[name];
          },
          relation: function (name) {
            var relation = data.relationships[name];
            if (_.isNull(relation) || _.isUndefined(relation)) {
              return;
            }
            if (_.isArray(relation.data)) {
              return resource.map(relation.data, included, transport)
            }

            return _.first(resource.map([relation.data], included, transport));
          }
        });
      };

      resource.map = function (records, included, transport) {
        return _.map(_.compact(records), function (record) {
          var data = _.findWhere(included, record);
          return resource(angular.merge(record, data), included, transport);
        });
      };

      return resource;
    }])

    .factory('collection', ['resource', 'linked', function (resource, linked) {
      return function (collection, transport) {
        var resources = resource.map(collection.data, collection.included, transport);

        return _.extend(resources, linked(collection.links, transport), {
          next: function () {
            return this.load('next');
          },
          last: function () {
            return this.load('last');
          }
        });
      };
    }])

    .service('transport', ['$http', 'resource', 'collection', function ($http, resource, collection) {
      var transport = {
        load: function (url, options) {
          return $http(_.extend({}, {url: url}, options)).then(mapPayload);
        }
      };

      var mapPayload = function (payload) {
        var json = payload.data;
        if (_.isArray(json.data)) {
          return collection(json, transport);
        } else {
          return resource(json.data, json.included, transport);
        }
      };

      return transport;
    }])

    .factory('repository', ['transport', function (transport) {
      var createMethod = function (config) {
        config.method = config.method || 'GET';
        var urlTemplate = _.template(config.url, {
          interpolate: /\{\{(.+?)\}\}/g
        });
        delete config.url;
        var sanitize = function (object) {
          return angular.fromJson(angular.toJson(object));
        };
        var options = function (params) {
          var opts = angular.copy(config);
          var paramsOptions;
          if (opts.method.toUpperCase() === 'GET') {
            if (opts.params === false) {
              delete opts.params;
            } else if (params) {
              paramsOptions = {params: sanitize(params)};
            }
          } else {
            if (opts.data === false) {
              delete opts.data;
            } else if (params) {
              paramsOptions = {data: sanitize(params)};
            }
          }
          return angular.merge({}, opts, paramsOptions);
        };

        var method = function (params) {
          return transport.load(method.url(params), options(params));
        };

        method.url = function (params) {
          var urlParams = angular.merge({}, params, params && params.attributes);
          return urlTemplate(urlParams);
        };

        return method;
      };

      var createMethods = function (repository, setup) {
        _.forEach(setup, function (config, method) {
          repository[method] = createMethod(config);
        });
      };

      return function (methods) {
        var repository = {};
        createMethods(repository, methods);
        return repository;
      };
    }]);
})();
