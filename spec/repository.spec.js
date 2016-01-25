'use strict';

(function () {
  describe('repository', function () {
    var AccountRepo;
    beforeEach(inject(function (transport, repository) {
      spyOn(transport, 'load');
      AccountRepo = repository({
        search: {url: '/search.json', method: 'GET'},
        searchAdmin: {url: '/search.json', method: 'GET', params: {role: 'Admin'}},
        update: {url: '/account.json', method: 'PATCH', data: {role: 'User'}},
        create: {url: '/accounts.json', method: 'POST', data: true}
      });
    }));

    it('extends the params preserving defaults', inject(function (transport) {
      AccountRepo.update({email: 'joao@palhares.com'});

      expect(transport.load).toHaveBeenCalledWith('/account.json', {
        url: '/account.json',
        data: {email: 'joao@palhares.com', role: 'User'},
        method: 'PATCH'
      });
    }));

    it('extends the params preserving on query string methods', inject(function (transport) {
      AccountRepo.searchAdmin({q: 'joao'});

      expect(transport.load).toHaveBeenCalledWith('/search.json', {
        url: '/search.json',
        params: {q: 'joao', role: 'Admin'},
        method: 'GET'
      });
    }));

    it('allow overrides on params defaults', inject(function (transport) {
      AccountRepo.update({role: 'Admin'});

      expect(transport.load).toHaveBeenCalledWith('/account.json', {
        url: '/account.json',
        data: {role: 'Admin'},
        method: 'PATCH'
      });
    }));

    it('creates the given repository methods', inject(function (transport) {
      AccountRepo.search({q: 'joao'});

      expect(transport.load).toHaveBeenCalledWith('/search.json', {
        url: '/search.json',
        params: {q: 'joao'},
        method: 'GET'
      });
    }));

    it('creates data methods', inject(function (transport) {
      AccountRepo.create({email: 'joao@joao.com'});

      expect(transport.load).toHaveBeenCalledWith('/accounts.json', {
        url: '/accounts.json',
        data: {email: 'joao@joao.com'},
        method: 'POST'
      });
    }));
  });
})();
