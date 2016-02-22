'use strict';

(function () {
  describe('repository', function () {
    var AccountRepo;
    beforeEach(inject(function (transport, repository) {
      spyOn(transport, 'load');
      AccountRepo = repository({
        search: {url: '/search.json', method: 'GET'},
        searchAdmin: {url: '/search.json', method: 'GET', params: {role: 'Admin'}},
        delete: {url: '/account/{{id}}.json', method: 'DELETE', data: true},
        update: {url: '/account.json', method: 'PATCH', data: {role: 'User'}},
        create: {url: '/accounts.json', method: 'POST', data: true}
      });
    }));

    it('accepts string interpolation based on the method params', inject(function (transport) {
      AccountRepo.delete({id: 10})

      expect(transport.load).toHaveBeenCalledWith('/account/10.json', {
        data: {id: 10},
        method: 'DELETE'
      });
    }));

    it('extends the params preserving defaults', inject(function (transport) {
      AccountRepo.update({email: 'joao@palhares.com'});

      expect(transport.load).toHaveBeenCalledWith('/account.json', {
        data: {email: 'joao@palhares.com', role: 'User'},
        method: 'PATCH'
      });
    }));

    it('sends only defaults when no parameter is specified', inject(function (transport) {
      AccountRepo.searchAdmin();

      expect(transport.load).toHaveBeenCalledWith('/search.json', {
        params: {role: 'Admin'},
        method: 'GET'
      });
    }));

    it('extends the params preserving on query string methods', inject(function (transport) {
      AccountRepo.searchAdmin({q: 'joao'});

      expect(transport.load).toHaveBeenCalledWith('/search.json', {
        params: {q: 'joao', role: 'Admin'},
        method: 'GET'
      });
    }));

    it('allow overrides on params defaults', inject(function (transport) {
      AccountRepo.update({role: 'Admin'});

      expect(transport.load).toHaveBeenCalledWith('/account.json', {
        data: {role: 'Admin'},
        method: 'PATCH'
      });
    }));

    it('creates the given repository methods', inject(function (transport) {
      AccountRepo.search({q: 'joao'});

      expect(transport.load).toHaveBeenCalledWith('/search.json', {
        params: {q: 'joao'},
        method: 'GET'
      });
    }));

    it('creates data methods', inject(function (transport) {
      AccountRepo.create({email: 'joao@joao.com'});

      expect(transport.load).toHaveBeenCalledWith('/accounts.json', {
        data: {email: 'joao@joao.com'},
        method: 'POST'
      });
    }));
  });
})();
