(function () {
  'use strict';

  describe('Paquetes Route Tests', function () {
    // Initialize global variables
    var $scope,
      PaquetesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _PaquetesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      PaquetesService = _PaquetesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('paquetes');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/paquetes');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('paquetes.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have template', function () {
          expect(liststate.templateUrl).toBe('modules/paquetes/client/views/list-paquetes.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          PaquetesController,
          mockPaquete;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('paquetes.view');
          $templateCache.put('modules/paquetes/client/views/view-paquete.client.view.html', '');

          // create mock paquete
          mockPaquete = new PaquetesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Paquete about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          PaquetesController = $controller('PaquetesController as vm', {
            $scope: $scope,
            paqueteResolve: mockPaquete
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:paqueteId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.paqueteResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            paqueteId: 1
          })).toEqual('/paquetes/1');
        }));

        it('should attach an paquete to the controller scope', function () {
          expect($scope.vm.paquete._id).toBe(mockPaquete._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/paquetes/client/views/view-paquete.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          PaquetesController,
          mockPaquete;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('paquetes.create');
          $templateCache.put('modules/paquetes/client/views/form-paquete.client.view.html', '');

          // create mock paquete
          mockPaquete = new PaquetesService();

          // Initialize Controller
          PaquetesController = $controller('PaquetesController as vm', {
            $scope: $scope,
            paqueteResolve: mockPaquete
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.paqueteResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/paquetes/create');
        }));

        it('should attach an paquete to the controller scope', function () {
          expect($scope.vm.paquete._id).toBe(mockPaquete._id);
          expect($scope.vm.paquete._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/paquetes/client/views/form-paquete.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          PaquetesController,
          mockPaquete;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('paquetes.edit');
          $templateCache.put('modules/paquetes/client/views/form-paquete.client.view.html', '');

          // create mock paquete
          mockPaquete = new PaquetesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Paquete about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          PaquetesController = $controller('PaquetesController as vm', {
            $scope: $scope,
            paqueteResolve: mockPaquete
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:paqueteId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.paqueteResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            paqueteId: 1
          })).toEqual('/paquetes/1/edit');
        }));

        it('should attach an paquete to the controller scope', function () {
          expect($scope.vm.paquete._id).toBe(mockPaquete._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/paquetes/client/views/form-paquete.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope) {
          $state.go('paquetes.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('paquetes/');
          $rootScope.$digest();

          expect($location.path()).toBe('/paquetes');
          expect($state.current.templateUrl).toBe('modules/paquetes/client/views/list-paquetes.client.view.html');
        }));
      });

    });
  });
}());
