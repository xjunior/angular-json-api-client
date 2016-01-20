'use strict';

(function () {
  describe('repository', function () {
    var PeopleRepo;
    beforeEach(inject(function (transport, repository) {
      spyOn(transport, 'load');
      PeopleRepo = repository({
        search: {url: '/search.json', method: 'GET'},
        create: {url: '/people.json', method: 'POST', data: true},
      });
    }));

    it('creates the given repository methods', inject(function (transport) {
      PeopleRepo.search({q: 'joao'});

      expect(transport.load).toHaveBeenCalledWith({
        url: '/search.json',
        params: {q: 'joao'},
        method: 'GET'
      });
    }));

    it('creates data methods', inject(function (transport) {
      PeopleRepo.create({email: 'joao@joao.com'});

      expect(transport.load).toHaveBeenCalledWith({
        url: '/people.json',
        data: {email: 'joao@joao.com'},
        method: 'POST'
      });
    }));
  });
})();
