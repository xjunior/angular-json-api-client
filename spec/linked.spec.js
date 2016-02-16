'use strict';

(function () {
  describe('linked', function () {
    var transport, links, linked;
    beforeEach(inject(function (_linked_) {
      transport = jasmine.createSpyObj('transport', ['load']);
      links = {
        'next': {href: 'http://api.example.com/linked.json?page=3'},
        'last': {href: 'http://api.example.com/linked.json?page=10'},
        'self': {href: 'http://api.example.com/linked.json'},
        'string-link': 'http://api.example.com/linked/string.json'
      };
      linked = _linked_(links, transport);
    }));

    describe('.link', function () {
      it('is the referred link when it exists', inject(function ($rootScope) {
        var callback = jasmine.createSpy();
        linked.link('self').then(callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalledWith({href: 'http://api.example.com/linked.json'});
      }));

      it('is undefined when the referred link does not exist', inject(function ($rootScope) {
        var callback = jasmine.createSpy();
        linked.link('enemies').then(null, callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalled();
      }));
    });

    describe('.load', function () {
      it('fails if the link does not exist', inject(function ($q, $rootScope) {
        var callback = jasmine.createSpy();
        linked.load('enemies').then(null, callback);
        $rootScope.$digest();

        expect(callback).toHaveBeenCalled();
      }));

      it('loads a resource using the given link rel', inject(function ($q, $rootScope) {
        transport.load.and.returnValue($q.when([]));

        linked.load('next', 'options');
        $rootScope.$digest();

        expect(transport.load).toHaveBeenCalledWith('http://api.example.com/linked.json?page=3', 'options');
      }));

      it('loads a string link given its rel', inject(function ($q, $rootScope) {
        transport.load.and.returnValue($q.when('resource'));

        linked.load('string-link');
        $rootScope.$digest();

        expect(transport.load).toHaveBeenCalledWith('http://api.example.com/linked/string.json', undefined);
      }));
    });
  });
})();
