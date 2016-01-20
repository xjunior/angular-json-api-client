'use strict';

(function () {
  angular.module('json-api-client', [])
    .factory('resource', ['$q', function ($q) {
      var resource = function (transport, data, included) {
        var mapIncluded = function (records) {
          return _.map(records, function (record) {
            var data = _.findWhere(included, record);
            return resource(transport, angular.merge(record, data), included);
          });
        };

        return _.extend({}, data, {
          attr: function (name) {
            return data.attributes && data.attributes[name];
          },
          relation: function (name) {
            var relation = data.relationships[name];
            if (_.isNull(relation) || _.isUndefined(relation)) {
              return;
            }
            if (_.isArray(relation.data)) {
              return mapIncluded(relation.data);
            }

            return _.first(mapIncluded([relation.data]));
          },
          link: function (rel) {
            var link = data.links[rel];
            if (link) {
              return $q.when(link);
            }
            return $q.reject(data);
          },
          load: function (rel, params, options) {
            return this.link(rel).then(function (link) {
              return transport.load(link.href, params, options);
            });
          }
        });
      };

      return resource;
    }])

    .service('transport', ['$http', 'resource', function ($http, resource) {
      var transport = {
        load: function (path, params, config) {
          var options = _.extend({}, {
            method: 'GET', url: path, data: params,
            params: params
          }, config);

          return $http(options).then(mapPayload)
        }
      };

      var mapPayload = function (payload) {
        var json = payload.data;
        if (_.isArray(json.data)) {
          return mapCollectionPayload(json);
        } else {
          return mapSinglePayload(json);
        }
      };

      var mapSinglePayload = function (json) {
        var data = json.data;
        var included = json.included;
        return resource(transport, data, included);
      };

      var mapCollectionPayload = function (json) {
        return _.map(json.data, function (object) {
          return mapSinglePayload({data: object});
        });
      };

      return transport;
    }])

    .factory('repository', ['transport', function (transport) {
      var createMethod = function (config) {
        return function (params) {
          return transport.load(config.path, params, config);
        };
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
