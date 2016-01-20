'use strict';

(function () {
  describe('repository', function () {
    var PeopleRepo;
    beforeEach(inject(function (transport, repository) {
      spyOn(transport, 'load');
      PeopleRepo = repository({
        search: {path: '/search.json'}
      });
    }));

    it('creates the given repository methods', inject(function (transport) {
      PeopleRepo.search({q: 'joao'});

      expect(transport.load).toHaveBeenCalledWith('/search.json', {q: 'joao'}, {path: '/search.json'});
    }));
  });
})();
