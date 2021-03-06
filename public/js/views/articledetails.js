window.ArticleView = Backbone.View.extend({

    whoami:'ArticleView:articledetails',

    initialize: function () {
        this.settings ={
            chselector:'#chapters1',
            anselector:'#ancestor1',
            notasselector:'#notas1',
            asselector:'#assets1', 
            context:this.el
        };

        this.renderall();
    },

    renderall: function(){
        this.relatedController = dao.productViewFactory({product:this.model, brandingselector:'#brandingaccordion',asselector:'#assets1', context:this.el});

        this.render();
        this.renderAssets();
        this.renderNotas();
        this.renderBranding();

    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    renderChilds: function () {
        this.relatedController.chrender();
        return this;
    },

    renderAssets: function () {
        var self = this,
            selector = self.settings.asselector;

        self.model.loadassets(function(assets){
            console.log('ASSETS renderview:callback: [%s] length:[%s]', selector, assets.length);

            $(selector).html("");
            assets.each(function (asset) {
                var view = new AssetAccordionView({model:asset});
                $(selector).append(view.render().el);
            });
        });
        return this;
    },

    renderBranding: function () {
        this.relatedController.brandingrender();
        console.log('renderbrandig: spec.brands: [%s]', this.relatedController.getBrands().length);
        return this;
    },

    renderAncestors: function () {
        this.relatedController.anrender();
        return this;
    },

    renderNotas: function () {
        var self = this,
            selector = self.settings.notasselector;

        self.model.loadnotas(function(notas){
            console.log('NOTAS renderview:callback: [%s] length:[%s]', selector, notas.length);
            var view = new NotasView({model:notas});
            $(selector, self.el).html(view.render().el);
        });
        return this;
    },

    /**
     * Scope of events: Events declared in a view use the view’s `el` element to wire up the events. 
     * Since the `el` in this example is being generated by the view, as a `ul` tag, 
     * the click event is wired up to all of the <a> tags in each of the <li> tags.     
    */
    events: {
        "change .core"       : "change",
        "click .branding"    : "formbranding",
        "click .notas"       : "formnotas",
        "click .save"       : "beforeSave",
        "click .delete"     : "deleteNode",
        "click .clonar"     : "clone",
        "click .eventos"    : "eventos",
        "click .browse"     : "browse",
        "click .vista"      : "vista",

        "click .uploadbrnd"  : "brandingUploadFiles",
        "click .discardbrnd" : "discardbrnd",
        "click .addnewbrnd"  : "addnewbrnd",
        "click .cancelbrnd"  : "cancelinstance",

        "dragover #filesdrop" : "dragoverHandler",
        "dragover #brnddrop"  : "dragoverHandler",
        "drop #filesdrop"     : "instanceDropHandler",
        "drop #brnddrop"      : "brandingDropHandler",
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
            console.log('form blur!!:key editor');
        });
        $('.brandinghook').html(form.el); 
    },

    discardbrnd: function () {
        this.discard('.brnddropped')
        return false;
    },
    discard: function (target) {
        this.loadedfiles += 1;
        this.showFilesDropped(target);
    },

    addnewbrnd: function () {
        var articlemodel = this.model;
        console.log('[%s] add branding BEGINS',this.whoami);

        articlemodel.insertBranding(dao.brandingfacet.getContent(),dao.brandingfacet.getAsset());
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
           utils.removeValidationError(target.id);
        }
    },

    beforeSave: function () {
        //console.log('beforeSave:articledetails BEGIN');
        var self = this;
        var check = this.model.validateAll();
        //console.log('beforeSave:articledetails validateAll ok');

        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }

        //console.log('beforeSave:articledetails SAVING NOW');
        this.saveNode();
        return false;
    },

    saveNode: function () {
        console.log('saveNode:articledetails begins');
        var self = this;
        // builds taglist array
        this.model.buildTagList();
        this.model.set({feum:new Date().getTime()});
        //
        this.model.save(null, {
            success: function (model) {
                //console.log('saveNode:articledetails success');
                app.navigate('articulos/' + model.id, false);
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
        app.navigate('articulos/add', false);
        this.model.unset('id',{ silent : true });
        this.model.unset('_id',{ silent : true });
        this.saveNode();
        return false;
    },

    vista: function () {
        //window.open('/articleo.html#req/'+this.model.id);
        //utils.approuter.navigate(, true);
        return false;
    },

    eventos: function () {
        utils.approuter.navigate('navegar/proyectos', true);
        return false;
    },

    browse: function () {
        utils.approuter.navigate('navegar/articulos', true);
        return false;
    },


    formnotas: function () {
        var self = this,
            articlemodel = this.model,
            facet = dao.notasfacet.init(articlemodel),
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
            articlemodel.insertNota(dao.notasfacet.getContent(), function(notas){
                console.log('Formnotas:productdetails, CALLBACK OK [%s]', notas.length);
                self.beforeSave();
            });
        });
    },

});



window.ArticleViewLayout = Backbone.View.extend({
    whoami:'ArticleViewLayout',

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    },

    events: {
    },
});

