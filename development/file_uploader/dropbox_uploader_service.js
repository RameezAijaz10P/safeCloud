/**
 * Created by Rameez Aijaz on 5/7/2016.
 */
(function(){
    'use strict';

    var node_dropbox = require('node-dropbox');
    angular.module('SafeCloud').service('dropBoxUploaderService',dropBoxUploaderService);
    dropBoxUploaderService.$inject=['$http'];
    function dropBoxUploaderService($http) {
        this.getDropBoxToken=getDropBoxToken;

        function getDropBoxToken(){

            var user_id=JSON.parse(localStorage.getItem('user'))&&JSON.parse(localStorage.getItem('user')).userid;
            var cloud_name='dropbox';
            return $http({
                method:'GET',
                url:'https://thawing-woodland-35235.herokuapp.com/accesstoken',
                params:{cloud_name:cloud_name,user_id:user_id}
            }).then(function(resp){
                var api = node_dropbox.api(resp.data.access_token);
                api.account(function(err, res, body) {
                    console.log(body);
                });
                localStorage.setItem('access_token', JSON.stringify({drop_box:resp.data}));
            });
        };
    }});
