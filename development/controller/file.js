/**
 * Created by Rameez Aijaz on 5/7/2016.
 */
window.dash = window.dash || {};
var db = require('diskdb');

db = db.connect('collections', ['users','files']);

dash.saveFile = function(file) {
    var temp=db.files.find({
            userid: file.userid
    });
    if(temp)
    {
        for(var i=0;i<temp.length;i++){
            if(temp[i].name==file.name)
            {
                return true;
            }
        }
    }
    var savedFile = db.files.save({
        userid: file.userid,
        name: file.name,
        chunks:file.chunks,
        no_of_chunks:file.no_of_chunks
    });
};
dash.getAllFilesfor =function(user_id){
    return db.files.find({userid:user_id});
};
dash.saveChunk = function(file_name,chunk,i) {

    var saved_file=db.files.findOne({
            name: file_name
        });
    var query = {
        name : file_name
    };

    var dataToBeUpdate = {
        chunks : saved_file.chunks||[]
    };
    dataToBeUpdate.chunks[i]={name:'',uploadedTo:''};
    dataToBeUpdate.chunks[i].name=chunk.name;
    dataToBeUpdate.chunks[i].uploadedTo=chunk.uploadedTo;

    var options = {
        multi: false,
        upsert: false
    };

    var updated = db.files.update(query, dataToBeUpdate, options);
    return updated;

};


