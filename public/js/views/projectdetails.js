window.ProjectView = Backbone.View.extend({
    /**
     *  Constructor en main.js:
     *        new ProjectView({{model: project})
     *
     */

    whoami:'ProjectView',

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change"           : "change",
        "click .save"      : "beforeSave",
        "click .delete"       : "deleteProject",
        "click .addresources" : "addResources",
        "click .browseresources" : "browseResources",
        "click .addquotation" : "addQuotation",
        "click .browsequotations" : "browseQuotations",
        "dragover"  : "dragoverHandler",
        "drop #picture"     : "dropHandler"
    },

    change: function (event) {
        /**
         *  event:
         *   event.target.name: model property
         *   event.target.value: model value
         *   event.target.id model key
         *  
         *   this.model.set( {prop1:newValue1, prop2,newValue2 }  )
         */

        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        //utils.showAlert('Success!', 'name:['+target.name+'] value:['+target.value+'] key:['+target.id+']', 'alert-success');

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            // OjO: mantengo la variable eventdate en paralelo con eventdatestr
            //      eventdate es la representacion numerica de Date
            if(target.name=='eventdatestr'){
                this.model.set({ eventdate: utils.buildDateNum(target.value)})
            } else {
            }
           utils.removeValidationError(target.id);
        }
    },

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveProject();
        return false;
    },

    saveProject: function () {
        var self = this;
        //console.log('before save');
        this.model.save(null, {
            success: function (model) {
                self.render();
                app.navigate('proyectos/' + model.id, false);
                utils.showAlert('Success!', 'Project saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    },

    deleteProject: function () {
        this.model.destroy({
            success: function () {
                alert('Project deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    addResources: function () {
        //be achieved with a simple method call, a command, or an event.
        //alert('whoami ['+this.whoami+'] ['+utils.approuter.whoami+']/false');
        //event.preventDefault();
        //utils.approuter.navigate('recursos/add', true);
        //app.navigate('proyectos/' + model.id, false);

        //var resource = new Resource({project:{_id : this.model.id},denom:'jajajaja'} );
        //$('#content').html(new ResourceView({model: resource}).el);
        utils.resourcesQueryData().setProject(this.model.id,this.model.get('denom'));
        utils.approuter.navigate('recursos/add', true);
 
        //var resource = new Resource({project:{_id : this.model.id} } );
        //$('#content').html(new ResourceView({model: resource}).el);
        //utils.approuter.navigate('recursos/add', false);
        return false;

    },

    browseResources: function () {
        //var resource = new Resource({project:{_id : this.model.id},denom:'jajajaja'} );
        //$('#content').html(new ResourceView({model: resource}).el);
 
        utils.resourcesQueryData().setProject(this.model.id,this.model.get('denom'));
        //console.log("ready to navigate");
        utils.approuter.navigate('navegar/recursos', true);
        //console.log("navigate!");
        return false;
    },

    addQuotation: function () {
        utils.quotationsQueryData().setProject(this.model.id,this.model.get('denom'));
        utils.approuter.navigate('requisitorias/add', true);
        return false;
    },

    browseQuotations: function () {
        utils.quotationsQueryData().setProject(this.model.id,this.model.get('denom'));
        utils.approuter.navigate('navegar/requisitorias', true);
        return false;
    },


/**
$(function(){
    $('div').on('drop',function(e){
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        $(this).html('A file was dropped!').css({'font-size':'40px','color':'#aa0000'});
    }).on('dragover', function (e) {
      e.preventDefault();
    });
});
*/

    dragoverHandler: function (event) {
        var e = event.originalEvent;
        //event.stopPropagation();
        //event.preventDefault();
        e.stopPropagation();
        e.preventDefault();
        console.log('dragoverHandler:projectdetails');
    },

    dropHandler: function (event) {
        var prjmodel = this.model;
        var e = event.originalEvent;
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        $('#uplprogressbar').css({'width':'0%;'});
        console.log('dropHandler:projectdetails');

        //Read the image file from the local file system and display it in the img tag

        //this.pictureFile = e.dataTransfer.files[0];
        //var reader = new FileReader();
        //reader.onloadend = function () {
        //   $('#picture').attr('src', reader.result);
        //};
        //reader.readAsDataURL(this.pictureFile);

        this.uploadingfiles = e.dataTransfer.files;

        var folder = prjmodel.assetFolder();

        var formData = new FormData();

        formData.append('loadfiles', this.uploadingfiles[0]);
        formData.append('folder',folder);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/files');
        xhr.onload = function() {
            var srvresponse = JSON.parse(xhr.responseText);
            var filelink = '<a href="'+srvresponse.urlpath+'" >'+srvresponse.name.substr(0,20)+'</a>'
            //console.log(xhr.responseText);
            console.log('xhr.onload:projectdetails: '+filelink);
            $('#uplprogressbar').css({'width':'100%;'});
            $('#uploaded').html(filelink);
            prjmodel.updateAsset(srvresponse, function(what){
                utils.showAlert('Success', what, 'alert-error');
                //$('#uplprogressbar').css({'width':'0%;'});
                //$('#uplprogressbar').html('');
            });
        };
        xhr.upload.onprogress = function(event) {
            console.log('xhr.onprogres:projectetails: !!! ');
            if (event.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                $('#uplprogressbar').css({'width':complete+'%'});
            }
        };
        xhr.send(formData);
    },

});