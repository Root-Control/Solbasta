(function () {
  'use strict';

  describe('Compartidos Route Tests', function () {
    // Initialize global variables
    var $scope,
      CompartidosService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CompartidosService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CompartidosService = _CompartidosService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('compartidos');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/compartidos');
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
          liststate = $state.get('compartidos.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have template', function () {
          expect(liststate.templateUrl).toBe('modules/compartidos/client/views/list-compartidos.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          CompartidosController,
          mockCompartido;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('compartidos.view');
          $templateCache.put('modules/compartidos/client/views/view-compartido.client.view.html', '');

          // create mock compartido
          mockCompartido = new CompartidosService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Compartido about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          CompartidosController = $controller('CompartidosController as vm', {
            $scope: $scope,
            compartidoResolve: mockCompartido
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:compartidoId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.compartidoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            compartidoId: 1
          })).toEqual('/compartidos/1');
        }));

        it('should attach an compartido to the controller scope', function () {
          expect($scope.vm.compartido._id).toBe(mockCompartido._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/compartidos/client/views/view-compartido.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CompartidosController,
          mockCompartido;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('compartidos.create');
          $templateCache.put('modules/compartidos/client/views/form-compartido.client.view.html', '');

          // create mock compartido
          mockCompartido = new CompartidosService();

          // Initialize Controller
          CompartidosController = $controller('CompartidosController as vm', {
            $scope: $scope,
            compartidoResolve: mockCompartido
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.compartidoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/compartidos/create');
        }));

        it('should attach an compartido to the controller scope', function () {
          expect($scope.vm.compartido._id).toBe(mockCompartido._id);
          expect($scope.vm.compartido._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/compartidos/client/views/form-compartido.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CompartidosController,
          mockCompartido;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('compartidos.edit');
          $templateCache.put('modules/compartidos/client/views/form-compartido.client.view.html', '');

          // create mock compartido
          mockCompartido = new CompartidosService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Compartido about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          CompartidosController = $controller('CompartidosController as vm', {
            $scope: $scope,
            compartidoResolve: mockCompartido
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:compartidoId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.compartidoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            compartidoId: 1
          })).toEqual('/compartidos/1/edit');
        }));

        it('should attach an compartido to the controller scope', function () {
          expect($scope.vm.compartido._id).toBe(mockCompartido._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/compartidos/client/views/form-compartido.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope) {
          $state.go('compartidos.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('compartidos/');
          $rootScope.$digest();

          expect($location.path()).toBe('/compartidos');
          expect($state.current.templateUrl).toBe('modules/compartidos/client/views/list-compartidos.client.view.html');
        }));
      });

    });
  });
}());
