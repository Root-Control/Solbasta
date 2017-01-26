(function () {
  'use strict';

  describe('Marcas Route Tests', function () {
    // Initialize global variables
    var $scope,
      MarcasService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MarcasService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MarcasService = _MarcasService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('marcas');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/marcas');
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
          liststate = $state.get('marcas.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have template', function () {
          expect(liststate.templateUrl).toBe('modules/marcas/client/views/list-marcas.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          MarcasController,
          mockMarca;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('marcas.view');
          $templateCache.put('modules/marcas/client/views/view-marca.client.view.html', '');

          // create mock marca
          mockMarca = new MarcasService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Marca about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          MarcasController = $controller('MarcasController as vm', {
            $scope: $scope,
            marcaResolve: mockMarca
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:marcaId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.marcaResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            marcaId: 1
          })).toEqual('/marcas/1');
        }));

        it('should attach an marca to the controller scope', function () {
          expect($scope.vm.marca._id).toBe(mockMarca._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/marcas/client/views/view-marca.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          MarcasController,
          mockMarca;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('marcas.create');
          $templateCache.put('modules/marcas/client/views/form-marca.client.view.html', '');

          // create mock marca
          mockMarca = new MarcasService();

          // Initialize Controller
          MarcasController = $controller('MarcasController as vm', {
            $scope: $scope,
            marcaResolve: mockMarca
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.marcaResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/marcas/create');
        }));

        it('should attach an marca to the controller scope', function () {
          expect($scope.vm.marca._id).toBe(mockMarca._id);
          expect($scope.vm.marca._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/marcas/client/views/form-marca.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          MarcasController,
          mockMarca;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('marcas.edit');
          $templateCache.put('modules/marcas/client/views/form-marca.client.view.html', '');

          // create mock marca
          mockMarca = new MarcasService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Marca about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          MarcasController = $controller('MarcasController as vm', {
            $scope: $scope,
            marcaResolve: mockMarca
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:marcaId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.marcaResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            marcaId: 1
          })).toEqual('/marcas/1/edit');
        }));

        it('should attach an marca to the controller scope', function () {
          expect($scope.vm.marca._id).toBe(mockMarca._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/marcas/client/views/form-marca.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope) {
          $state.go('marcas.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('marcas/');
          $rootScope.$digest();

          expect($location.path()).toBe('/marcas');
          expect($state.current.templateUrl).toBe('modules/marcas/client/views/list-marcas.client.view.html');
        }));
      });

    });
  });
}());
