/**
 * Created by Rameez Aijaz on 5/3/2016.
 */
(function(){
    'use strict';
    angular.module("SafeCloud", ['mgcrea.ngStrap',"ui.router"]);

    angular.module("SafeCloud").config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('file_uploader', {
                url: "/file_uploader",
                templateUrl: "file_uploader/file_uploader.html"
            })
            .state('chunk_viewer', {
                url: "/chunk_viewer",
                templateUrl: "file_uploader/file_viewer.html"

            }).state('file_creator', {
                url: "/file_creator",
                templateUrl: "file_uploader/file_creator.html"

            });
        $urlRouterProvider.otherwise(function($injector, $location) {


            var $state = $injector.get("$state");
            $state.go("file_uploader");
        });


    });


})();