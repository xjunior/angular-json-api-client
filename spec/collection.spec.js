'use strict';

(function () {
  describe('collection', function () {
    var transport, people;
    beforeEach(inject(function (collection) {
      transport = jasmine.createSpyObj('transport', ['load']);
      people = collection({
        data: [
          {
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
          }
        ],
        links: {
          'next': {href: 'http://api.example.com/people.json?page=3'},
          'last': {href: 'http://api.example.com/people.json?page=10'},
          'self': {href: 'http://api.example.com/people.json'}
        }
      }, transport);
    }));

    it('maps the collection data to resources', function () {
      expect(people[0].attr('name')).toEqual('joao doidao');
    })

    describe('.next', function () {
      it('loads the next rel', inject(function ($q, $rootScope) {
        transport.load.and.returnValue($q.when('next page'));
        people.next().then(function (nextPage) {
          expect(nextPage).toEqual('next page');
        })
        $rootScope.$digest();

        expect(transport.load).toHaveBeenCalledWith('http://api.example.com/people.json?page=3', undefined);
      }))
    });

    describe('.last', function () {
      it('loads the last rel', inject(function ($q, $rootScope) {
        transport.load.and.returnValue($q.when('last page'));
        people.last().then(function (nextPage) {
          expect(nextPage).toEqual('last page');
        })
        $rootScope.$digest();

        expect(transport.load).toHaveBeenCalledWith('http://api.example.com/people.json?page=10', undefined);
      }))
    });

    describe('.link', function () {
      it('is the referred link when it exists', inject(function ($rootScope) {
        var callback = jasmine.createSpy();
        people.link('self').then(callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalledWith({href: 'http://api.example.com/people.json'});
      }));

      it('is undefined when the referred link does not exist', inject(function ($rootScope) {
        var callback = jasmine.createSpy();
        people.link('enemies').then(null, callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalled();
      }));
    });

    describe('.load', function () {
      it('fails if the link does not exist', inject(function ($q, $rootScope) {
        var callback = jasmine.createSpy();
        people.load('enemies').then(null, callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalled();
      }));

      it('loads a resource using the given link rel', inject(function ($q, $rootScope) {
        transport.load.and.returnValue($q.when([]));

        people.load('next', 'options');
        $rootScope.$digest();

        expect(transport.load).toHaveBeenCalledWith('http://api.example.com/people.json?page=3', 'options');
      }));
    });
  });
})();
