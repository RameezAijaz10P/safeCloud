/**
 * Created by Rameez Aijaz on 5/3/2016.
 */
(function(){
    'use strict';
    var fs = require('fs');
    var node_dropbox = require('node-dropbox');
    angular.module('SafeCloud').service('fileUploaderService',fileUploaderService);
    fileUploaderService.$inject=['$http','$q'];
    function fileUploaderService($http,$q) {
        var api='';

        this.getFileInArray = getFileInArray;
        this.writeFile = writeFile;
        this.getFileContent=getFileContent;
        this.shuffleText=shuffleText;
        this.uploadToServer=uploadToServer;
        this.getDropBoxToken=getDropBoxToken;
        this.downloadFileFromDropBox=downloadFileFromDropBox;

        function getDropBoxToken(){

            var user_id=JSON.parse(localStorage.getItem('user'))&&JSON.parse(localStorage.getItem('user')).userid;
            var cloud_name='dropbox';
            return $http({
                method:'GET',
                url:'https://thawing-woodland-35235.herokuapp.com/accesstoken',
                params:{cloud_name:cloud_name,user_id:user_id}
            }).then(function(resp){
                resp.data.access_token=resp.data.access_token||"Lsb8yVNzYBAAAAAAAAAAEId3j_5WOvFMKR9_9bvm8G85cD7bqjkc_3fG9t_WtQbO";
                api = node_dropbox.api(resp.data.access_token);
                api.account(function(err, res, body) {
                    console.log(body);
                });
                localStorage.setItem('access_token', JSON.stringify({drop_box:resp.data}));
            });
        }

        function uploadToServer(file){
            var deferred = $q.defer();
            file.content=file.content.replace('\r','&tab&');
            file.content=file.content.replace('\n', '&newline&');
            api.createFile(file.name,file.content, function(error, response, body){
                if(error)
                {
                    deferred.reject(error);
                }
                deferred.resolve(response);

            });
            return deferred.promise;
        }


        function shuffleText(array){
            var temp=array;

            for(var i=0;i<Math.floor(array.length/2);i++)
            {
                var first_line=temp[i];
                temp[i]=temp[(temp.length-1)-i];
                temp[(temp.length-1)-i]=first_line;
            }
            return temp;

        }

        function getFileInArray(path) {
            var array = fs.readFileSync(path).toString().split(" ");
            return array
        }
        function getFileContent(path) {
            var text = fs.readFileSync(path).toString();
            return text
        }

        function downloadFileFromDropBox(chunk) {

            var deferred = $q.defer();
                api.getFile('/'+chunk, function(error, response, body){
                    if(error)
                    {
                        deferred.reject(error);
                    }
                    deferred.resolve({chunk_name:chunk,response:response});

                });


            return deferred.promise;
        }


        function writeFile(dir,path, content) {

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            fs.writeFile(path, content, function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });

        }
    }


})();