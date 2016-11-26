/**
 * Created by Rameez Aijaz on 5/3/2016.
 */
(function(){
    'use strict';
    angular.module('SafeCloud').controller('fileUploaderController',fileUploaderController);
    fileUploaderController.$inject=['$scope','fileUploaderService','$state','$q'];
    var gui = require('nw.gui');
    function fileUploaderController($scope,fileUploaderService,$state,$q){
        fileUploaderService.getDropBoxToken();
        var fileUploadController=this;
        fileUploadController.uploadFile = uploadFile;
        fileUploadController.createFile = createFile;
        fileUploadController.showDownloadedFile = showDownloadedFile;
        fileUploadController.uploadChunk=uploadChunk;
        fileUploadController.downloadFile=downloadFile;
        fileUploadController.text_shuffling=false;
        fileUploadController.chunk_dir='';
        fileUploadController.chunks =[];
        fileUploadController.all_chunks={};
        fileUploadController.file_downloaded=false;
        fileUploadController.original_file={name:'',no_of_chunks:fileUploadController.no_of_chunks,uploadedTo:'',content:'',chunks:[],text_shuffling:false,extension:'',directory:''};
        fileUploadController.no_of_chunks=1;
        fileUploadController.loginToDropBox=loginToDropBox;
        // Get the current window
        var win = gui.Window.get();


        function loginToDropBox(){
            var new_win = gui.Window.open('https://thawing-woodland-35235.herokuapp.com/authenticate/dropbox?user_id='+JSON.parse(localStorage.getItem('user')).userid);
        }

        function uploadChunk(chunk,index){
            var chunk={name:chunk.name,content:chunk.content,uploadedTo:'dropbox'};
            fileUploaderService.uploadToServer(chunk).then(function(resp){
                console.log(resp);
                fileUploadController.original_file.chunks[index].uploadedTo='dropbox';
                dash.saveChunk(fileUploadController.original_file.name,chunk,index);
                alert('chunk has been uploaded successfully');
            });
        }
        function showDownloadedFile(file){
            file.content='';
            var keys=Object.keys(fileUploadController.all_chunks);

            var ext=keys[0].split('.')[keys[0].split('.').length-1];
            var name=keys[0].split('.')[keys[0].split('.').length-2];
            var content='';

                for (var i = 0; i < keys.length; i++) {
                    name = name.substring(0, name.lastIndexOf('_')) + '_' + i + '.' + ext;

                    content += fileUploadController.all_chunks[name].body;


                }
            file.content += file.text_shuffling?fileUploaderService.shuffleText(content.split(' ')):content;

        }
        function downloadFile(file,i){

            file.content='';
            fileUploadController.file_downloaded=true;
            for(var i=0; i<file.chunks.length;i++)
            {
                fileUploaderService.downloadFileFromDropBox(file.chunks[i].name).then(function(resp){
                    console.log(resp);
                    fileUploadController.all_chunks[resp.chunk_name]={name:resp.chunk_name,body:resp.response.body};



                });
            }



        }

        //
        //function createFile(){
        //    fileUploadController.all_files=dash.getAllFilesfor(JSON.parse(localStorage.getItem('user')).userid);
        //    console.log(fileUploadController.all_files);
        //
        //    $state.go('file_creator');
        //}

        function createFile(file){
            var file_text_array=[];
            fileUploadController.original_file.content="";
            for (var i=0;i<file.chunks.length;i++)
            {
                var chunk_name=fileUploadController.original_file.directory+'\\'+fileUploadController.original_file.chunks[i].name;
                file_text_array=
                    file_text_array.concat(fileUploaderService.getFileInArray(chunk_name));

            }
            if(fileUploadController.original_file.text_shuffling)
            {
                file_text_array=fileUploaderService.shuffleText(file_text_array);
            }

            for(var i=0; i<file_text_array.length;i++)
            {
                fileUploadController.original_file.content+=file_text_array[i]+' ';

            }
            fileUploaderService.writeFile(fileUploadController.original_file.directory,fileUploadController.original_file.directory+'\\'+fileUploadController.original_file.name,
                fileUploadController.original_file.content);

            $state.go('file_creator');
        }






        function uploadFile(){
            fileUploadController.all_chunks={};
            fileUploadController.original_file.chunks=[];
            if(!$('#fileInput').get(0).files[0])
            {
                alert('Please attach a file to upload');
                return;
            }
            var path=$('#fileInput').get(0).files[0].path;

            var no_of_chunks=!isNaN(parseInt(fileUploadController.no_of_chunks)) && isFinite(fileUploadController.no_of_chunks)?parseInt(fileUploadController.no_of_chunks):1;
            var file_content_array=fileUploaderService.getFileInArray(path);
            if(fileUploadController.text_shuffling)
            {
                fileUploadController.original_file.text_shuffling=true;
                file_content_array=fileUploaderService.shuffleText(file_content_array);
            }
            var chunk_size=Math.floor(file_content_array.length/no_of_chunks);
            fileUploadController.original_file.name=path.split('\\')[path.split('\\').length-1];
            fileUploadController.original_file.extension=path.split('\\')[path.split('\\').length-1].split('.')[1];
            fileUploadController.original_file.directory="..\\files\\"+path.split('\\')[path.split('\\').length-1].split('.')[0];
            var file_directory="..\\files\\"+path.split('\\')[path.split('\\').length-1].split('.')[0];
            fileUploadController.chunk_dir=file_directory;
            for(var i=0;i<no_of_chunks;i++)
            {
                var chunk_file_name=file_directory.replace('..\\files\\','')+'_'+'chunk_'+i+'.'+fileUploadController.original_file.extension;
                var no_of_lines=i==no_of_chunks-1?file_content_array.length:((i+1)*chunk_size);
                var chunk_text='';
                for(var j=i*chunk_size; j<no_of_lines;j++)
                {
                    chunk_text+=file_content_array[j]+' ';
                }
                fileUploaderService.writeFile(file_directory,file_directory+'\\'+chunk_file_name,chunk_text);
                fileUploadController.original_file.chunks.push({name:chunk_file_name, src:file_directory+'\\'+chunk_file_name,content:chunk_text});

            }
            dash.saveFile({text_shuffling:fileUploadController.original_file.text_shuffling,userid:JSON.parse(localStorage.getItem('user')).userid, name:fileUploadController.original_file.name,chunks:[]});
            $state.go('chunk_viewer');

        }



    }
})();