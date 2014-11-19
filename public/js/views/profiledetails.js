window.ProfileView = Backbone.View.extend({

    whoami:'PersonView:persondetails',

    initialize: function (opts) {
        this.options = opts || {};
        this.relatedController = dao.productViewFactory({
            product:this.model, 
            chselector:'#childs1',anselector:'#ancestor1',
            notasselector:'#notas1',brandingselector:'#brandingaccordion',
            asselector:'#assets1', contactsselector:'#contacts1', 
            usersselector:'#userslist',relselector:'#childs1', perfilselector:'#profile',
            personsselector: '#persons1',

            context:this.el
        });

        this.renderall();
    },

    renderall: function(){
        this.render();
        this.renderPersons();
        /*
        this.renderContacts();
        this.renderUsers();
        this.renderAssets();
        this.renderBranding();
        this.renderChilds();
        this.renderProfileImage();
        this.renderAncestors();
        this.renderNotas();
        */
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    renderContacts: function () {
        this.relatedController.contactsrender();
        return this;
    },

    renderUsers: function () {
        this.relatedController.usersrender();
        return this;
    },

    renderAssets: function () {
        this.relatedController.asrender();
        return this;
    },

    renderBranding: function () {
        this.relatedController.brandingrender();
        console.log('renderbrandig: spec.brands: [%s]', this.relatedController.getBrands().length);
        return this;
    },

    renderChilds: function () {
        this.relatedController.relrender();
        return this;
    },

    renderProfileImage: function () {
        this.relatedController.profilerender();
        return this;
    },

    renderAncestors: function () {
        this.relatedController.personanrender();
        return this;
    },

    renderNotas: function () {
        this.relatedController.notasrender();
        return this;
    },

    renderPersons: function () {
        this.relatedController.personsformuserrender();
        return this;
    },

    /**
     * Scope of events: Events declared in a view use the view’s `el` element to wire up the events. 
     * Since the `el` in this example is being generated by the view, as a `ul` tag, 
     * the click event is wired up to all of the <a> tags in each of the <li> tags.     
    */

    events: {
        "change .core"       : "change",
        "click .contactitem" : "editcontact",
        "click .contacto"    : "newcontact",
        "click .usuario"     : "newuser",
        "click .useritem"    : "edituser",
        "click .branding"    : "formbranding",
        "click .notas"       : "formnotas",
        "click .save"       : "beforeSave",
        "click .delete"     : "deleteNode",
        "click .clonar"     : "clone",
        "click .eventos"    : "eventos",
        "click .browse"     : "browse",

        "click .uploadbrnd"  : "brandingUploadFiles",
        "click .discardbrnd" : "discardbrnd",
        "click .addnewbrnd"  : "addnewbrnd",
        "click .cancelbrnd"  : "cancelbrnd",

        "dragover #filesdrop" : "dragoverHandler",
        "dragover #brnddrop"  : "dragoverHandler",
        "drop #filesdrop"     : "instanceDropHandler",
        "drop #brnddrop"      : "brandingDropHandler",

    },

    editcontact: function(){
        console.log('Edit Contact');
        this.formcontactos(dao.contactfacet.getFacet());        
    },

    newcontact: function(){
        this.formcontactos(dao.contactfacet.init());
    },

    edituser: function(){
        console.log('Edit User');
        this.formuser(dao.userfacet.getFacet());        
    },

    newuser: function(){
        this.formuser(dao.userfacet.init());
    },

    cancelbrnd: function () {
        console.log('[%s] cancelbrnd BEGINS',this.whoami);      
    },

    eventos: function () {
        utils.approuter.navigate('navegar/proyectos', true);
        return false;
    },

    browse: function () {
        utils.approuter.navigate('navegar/personas', true);
        return false;
    },

    formuser: function (user) {
        var self = this;
        var personmodel = self.model;
        console.log('form USER BEGINS1');

        var form = new Backbone.Form({
                model: user,
        });
        console.log('form USER BEGINS2');

        form.on('focus', function(form, editorContent) {
            console.log('FOCUS!');
            //form.fields.subcontenido.editor.setOptions(utils.tipocontactoOL[contact.get('tipocontacto')]);
        });


        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Dato de contacto',
            okText: 'guardar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();
            self.model.insertuser(dao.userfacet.getFacet());
            //self.beforeSave();
        });
        return false;
    }, 
    

    formcontactos: function (contact) {
        var self = this;
        var personmodel = self.model;
        // redefinición de la lista subcontenido, en función del dato actual del contact
        var schema = contact.schema;
        schema.subcontenido.options = utils.tipocontactoOL[contact.get('tipocontacto')];

        var form = new Backbone.Form({
                model: contact,
                schema: schema
        });
        //console.log(utils.tipocontactoOL[contact.get('tipocontacto')]);

        form.on('focus', function(form, editorContent) {
            console.log('FOCUS!');
            //form.fields.subcontenido.editor.setOptions(utils.tipocontactoOL[contact.get('tipocontacto')]);
        });

        form.on('tipocontacto:change', function(form, editorContent) {
            console.log('onchange:key');
            var contenido = editorContent.getValue(),
                newOptions = utils.tipocontactoOL[contenido];
            form.fields.subcontenido.editor.setOptions(newOptions);
        });

        form.on('subcontenido:change', function(form, editorContent) {
            var scontenido = editorContent.getValue();
            //console.log('onchange:SUB CONTENIDO key [%s]',scontenido);
        });

        form.on('contactdata:change', function(form, editorContent) {
            var contactdata = editorContent.getValue();
            //console.log('onchange:SUB CONTENIDO key [%s]',contactdata);
        });

        form.on('contactdata:blur', function(form, editorContent) {
            var contactdata = editorContent.getValue();
            var errors = form.commit();            
            console.log('onblur:SUB CONTENIDO key [%s]',contactdata);
            if(dao.contactfacet.getFacet().get('tipocontacto')==='direccion'){
                self.fetchAddress(contactdata, personmodel.get('displayName'));
            }
        });

        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Dato de contacto',
            okText: 'guardar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();            
            self.model.insertcontact(dao.contactfacet.getContent());
            self.beforeSave();
        });
        return false;
    }, 
    
    fetchAddress: function  (address, name) {
        var self = this,
            querydata = {};

        querydata.address = address;
        console.log('fetchAddress [%s]',address);
 
        $.ajax({
            type: "GET",
            url: "/geocode",
            dataType: "json",
            data: querydata,
            success: function(data){
                var location = data.results[0];
                console.log('fetchAddress [%s] [%s]',location.formatted_address,location.geometry.location.lat);

                var item = {};
                item.lugarid = '';
                item.nombre = name;
                item.displayAddress = address;
                item.direccion = location.formatted_address;
                item.longitud = location.geometry.location.lng;
                item.latitud = location.geometry.location.lat;
                //self.showMap(item);
                if(!utils.maprender.getMap()) utils.maprender.init('showmap');
                utils.maprender.addPlace(item);
            }
        });
    },

    formbranding: function () {
        var self = this,
            facet = dao.brandingfacet.init(this.model),
            form = new Backbone.Form({
                model: facet,
            }).render();

        console.log('[%s] form-branding BEGINS',self.whoami);
        dao.brandingfacet.setForm(form);
        
        form.on('change', function(form) {
            var errors = form.commit();
            console.log('form change!!:key editor');
        });

        form.on('blur', function(form) {
            var errors = form.commit();
            console.log('form blur!!:KEY editor');
        });
        $('.brandinghook').html(form.el); 
    },

    formnotas: function () {
        var self = this,
            personmodel = this.model,
            facet = dao.notasfacet.init(personmodel),
            form = new Backbone.Form({
                model: facet,
            });

        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Alta rápida de notas',
            okText: 'guardar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();
            personmodel.insertNota(dao.notasfacet.getContent(),function(notas){
                console.log('Formnotas:persondetails, CALLBACK OK [%s]', notas.length);
                self.beforeSave();
            });
        });
    }, 

    addnewbrnd: function () {
        var personmodel = this.model;
        console.log('[%s] add branding BEGINS',this.whoami);

        personmodel.insertBranding(dao.brandingfacet.getContent(),dao.brandingfacet.getAsset());
        this.beforeSave();
        return false;
    },


    dragoverHandler: function (event) {
        var e = event.originalEvent;
        e.stopPropagation();
        e.preventDefault();
        //console.log('[%s] dragoverHandler BEGINS',this.whoami);
    },

    brandingDropHandler: function (event) {
        var self = this;
        console.log('[%s] BRANDING dropHandler BEGINS',this.whoami);
        var progressbar = '#brndprogressbar';
        this.dropHandler(event, progressbar);
        var target = '.brnddropped';
        this.showFilesDropped(target);
        return false;
    },


    showFilesDropped: function(target){
        var self = this;
        var showFiles = _.template('<div><strong><%=name%></strong>: [<%=index%>]  [<%=type%>]  /  [<%=size%>]</div>');
       $(target).html('');
        _.each(this.uploadingfiles,function(element,index){
            if(index >= self.loadedfiles){
                console.log('show files [%s] [%s] [%s]',index,self.loadedfiles,index == self.loadedfiles);
                $(target).append(showFiles({index:index,name:element.name, type:element.type, size:element.size }));
            }
        });
    },
    
    dropHandler: function (event, progressbar) {
        console.log('[%s] dropHandler BEGINS',this.whoami);
        var e = event.originalEvent;
        e.stopPropagation();
        e.preventDefault();
 
        e.dataTransfer.dropEffect = 'copy';
        this.uploadingfiles = e.dataTransfer.files;
        this.loadedfiles = 0;

        $(progressbar).css({'width':'0%;'});
        console.log('[%s] dropHandler upload BEGINS files:[%s] array:[%s]',this.whoami, this.uploadingfiles.length,_.isObject(this.uploadingfiles));
        return false;
    },

    brandingUploadFiles: function (event) {
        var self = this;
        var progressbar = '#brndprogressbar';
        var loaded= '#brndloaded';
        var dropped= '.brnddropped';

        console.log('[%s] BRANDING uploadFiles BEGINS folder:',self.whoami);
 
        if(!self.uploadingfiles) return false;
        if(self.uploadingfiles.length <= self.loadedfiles) return false;
 
        dao.uploadFile(self.uploadingfiles[self.loadedfiles],progressbar,function(srvresponse, asset){
            var filelink = 'Archivo subido: <a href="'+srvresponse.urlpath+'" >'+srvresponse.name+'</a>'
            $(loaded).html(filelink);
            $(progressbar).css({'width':'100%;'});

            console.log('uploaded SUCCESS: [%S]',filelink);

            self.loadedfiles += 1;
            self.uploadedfile = srvresponse;
            dao.brandingfacet.setAsset(asset);

            self.showFilesDropped(dropped);
            asset.linkChildsToAncestor(asset, self.model,'es_asset_de',function(){
                console.log('ASSET linked to ancestor');
            });
            //
            utils.showAlert('Success', 'Asset uploaded!', 'alert-success');
            console.log('update form: [%s]',srvresponse.name);    
        });

        return false;
    },


    change: function (event) {
        utils.hideAlert();

        var target = event.target;
        var change = {};

        if(target.type==='checkbox'){
            this.model.get(target.name)[target.value]= target.checked;
        }else{
            change[target.name] = target.value;
            this.model.set(change);
        }
        if(target.name==='nickName' && !this.model.get('displayName')){
            this.model.set('displayName',target.value);
            this.$('#displayName').val(target.value);
        }

        //utils.showAlert('Success!', 'name:['+target.name+'] value:['+target.value+'] key:['+target.id+'] checked:['+target.checked+'] type:['+target.type+'] change:['+change[target.name]+']', 'alert-success');

        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
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

        this.saveNode();
        return false;
    },

    saveNode: function () {
        var self = this;
        self.model.buildTagList();

        self.model.save(null, {
            success: function (model) {
                //console.log('saveNode:persondetails success');
                app.navigate('personas/' + model.id, false);
                self.renderall();
                utils.showAlert('Exito!', 'El nodo se actualizó correctamente', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'Ocurrió un error al intentar actualizar este nodo', 'alert-error');
            }
        });
    },

    deleteNode: function () {
        this.model.destroy({
            success: function () {
                alert('El nodo se eliminó correctamente');
                window.history.back();
            }
        });
        return false;
    },

    clone: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        app.navigate('personas/add', false);
        this.model.unset('id',{ silent : true });
        this.model.unset('_id',{ silent : true });
        this.saveNode();
        return false;
    },

});