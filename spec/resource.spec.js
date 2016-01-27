'use strict';

(function () {
  describe('resource', function () {
    var transport, obj;
    beforeEach(inject(function (resource) {
      transport = jasmine.createSpyObj('transport', ['load']);
      obj = resource(transport, {
        id: 10, type: 'person',
        attributes: {name: 'joao doidao'},
        relationships: {
          bestFriend: {data: {id: 11, type: 'person'}},
          thumb: {data: null},
          friends: {data: [{id: 11, type: 'person'}, {id: 12, type: 'person'}]}
        },
        links: {
          'self': {href: 'http://api.example.com/people/123.json'},
          'friends': {href: 'http://api.example.com/people/123/friends.json'}
        }
      }, [
        {id: 11, type: 'person', attributes: {name: 'lorim'}}
      ]);
    }));

    it('maps the data id and type', function () {
      expect(obj.id).toEqual(10);
      expect(obj.type).toEqual('person');
    })

    describe('.attr', function () {
      it('maps the object attributes', function () {
        expect(obj.attr('name')).toEqual('joao doidao');
      });

      it('is undefined when the object does not have the attribute', function () {
        expect(obj.attr('age')).toBe(undefined);
      });
    });

    describe('.link', function () {
      it('is the referred link when it exists', inject(function ($rootScope) {
        var callback = jasmine.createSpy();
        obj.link('self').then(callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalledWith({href: 'http://api.example.com/people/123.json'});
      }));

      it('is undefined when the referred link does not exist', inject(function ($rootScope) {
        var callback = jasmine.createSpy();
        obj.link('enemies').then(null, callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalled();
      }));
    });

    describe('.relation', function () {
      it('loads the relation from the object', function () {
        var bestFriend = obj.relation('bestFriend');

        expect(bestFriend.id).toEqual(11)
      });

      it('is undefined when the relation is null', function () {
        var toy = obj.relation('thumb');

        expect(toy).toBe(undefined)
      });

      it('loads a collection relation from the object', function () {
        var friend = obj.relation('friends');

        expect(friend.length).toEqual(2)
        expect(friend[0].id).toEqual(11)
        expect(friend[1].id).toEqual(12)
      });

      it('adds the included data of the relations', function () {
        var bestFriend = obj.relation('bestFriend');

        expect(bestFriend.attr('name')).toEqual('lorim');
      });

      it('adds the included data of the collection relations', function () {
        var friends = obj.relation('friends');

        expect(friends[0].attr('name')).toEqual('lorim');
        expect(friends[1].attr('name')).toBe(undefined);
      });

      it('is undefined when the relation does not exist', function() {
        expect(obj.relation('enemies')).toBe(undefined);
      });
    });

    describe('.load', function () {
      it('fails if the link does not exist', inject(function ($q, $rootScope) {
        var callback = jasmine.createSpy();
        obj.load('enemies').then(null, callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalled();
      }));

      it('loads a resource using the given link rel', inject(function ($q, $rootScope) {
        transport.load.and.returnValue($q.when([]));

        obj.load('friends', 'options');
        $rootScope.$digest();

        expect(transport.load).toHaveBeenCalledWith('http://api.example.com/people/123/friends.json', 'options');
      }));

      it('loads a resource using the given link rel', inject(function ($q, $rootScope) {
        transport.load.and.returnValue($q.when(['resource 1', 'resource 2']));

        obj.load('friends').then(function (resources) {
          expect(resources).toEqual(['resource 1', 'resource 2']);
        });
        $rootScope.$digest();
      }));
    });
  });
})();
