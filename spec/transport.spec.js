'use strict';

(function () {
  describe('transport', function () {
    var object1, object2;
    var $httpBackend;
    beforeEach(inject(function (_$httpBackend_) {
      object2 = {id: 20, type: 'person', attributes: {name: 'yoko'}};
      object1 = {
        id: 10, type: 'person',
        attributes: {name: 'joao'},
        relationships: {
          bestFriend: {data: {id: 20, type: 'person'}}
        }
      };
      $httpBackend = _$httpBackend_;
    }));

    describe('load', function () {
      it('loads the resource from the given url', inject(function (transport) {
        $httpBackend.expectGET('http://host/resource.json').respond(200, {data: object1});

        transport.load('http://host/resource.json').then(function (obj) {
          expect(obj.id).toEqual(10);
        });
        $httpBackend.flush();
      }));

      it('loads a collection of resources from the given url', inject(function (transport) {
        $httpBackend.expectGET('http://host/resource.json').respond(200, {data: [object1, object2]});

        transport.load('http://host/resource.json').then(function (objects) {
          expect(objects[0].id).toEqual(10);
          expect(objects[1].id).toEqual(20);
        });
        $httpBackend.flush();
      }));

      it('adds the included resources', inject(function (transport) {
        $httpBackend.expectGET('/best.json').respond(200, {
          data: object1,
          included: [
            object2
          ]
        });

        transport.load('/best.json').then(function (person) {
          expect(person.relation('bestFriend').attr('name')).toEqual('yoko');
        });
        $httpBackend.flush();
      }));

      it('maps collection results', inject(function (transport) {
        $httpBackend.expectGET('/search.json?q=joao').respond(200, {
          data: [object1, object2]
        });

        transport.load('/search.json', {q: 'joao'}).then(function (people) {
          expect(people[0].id).toEqual(10);
          expect(people[0].type).toEqual('person');
          expect(people[0].attr('name')).toEqual('joao');

          expect(people[1].id).toEqual(20);
          expect(people[1].type).toEqual('person');
          expect(people[1].attr('name')).toEqual('yoko');
        });
        $httpBackend.flush();
      }));

      it('maps object results', inject(function (transport) {
        $httpBackend.expectGET('/search.json?q=joao').respond(200, {
          data: [object1, object2]
        });

        transport.load('/search.json', {q: 'joao'}).then(function (people) {
          expect(people[0].id).toEqual(10);
          expect(people[0].type).toEqual('person');
          expect(people[0].attr('name')).toEqual('joao');

          expect(people[1].id).toEqual(20);
          expect(people[1].type).toEqual('person');
          expect(people[1].attr('name')).toEqual('yoko');
        });
        $httpBackend.flush();
      }));
    });
  });
})();
