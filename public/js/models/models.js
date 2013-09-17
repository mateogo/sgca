window.Product = Backbone.Model.extend({
    // ******************* PROJECT ***************
    urlRoot: "/productos",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique una descripción"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    insertCapitulos: function(data){
        console.log('insertCapitulos:models.js begins numcap: [%s]',data.cantcapitulos);
        var self = this;
        var builder = {};
        var slug_template = _.template('Cap: <%= numcap %> - '+self.get('slug'));
        var denom_template = _.template('Cap: <%= numcap %> - '+self.get('denom'));

        builder._id = null;
        builder.tipoproducto = data.tipoproducto || self.tipoproducto;
        builder.descriptores = data.descriptores;
        builder.nivel_importancia = self.get('nivel_importancia');
        builder.nivel_ejecucion = self.get('nivel_ejecucion');
        builder.estado_alta = self.get('estado_alta');
        builder.patechfacet = self.get('patechfacet');
        if(builder.patechfacet){
            builder.patechfacet.cantcapitulos = 0;
            builder.patechfacet.durnominal = data.durnominal;
        };
        for (var icap =1; icap <= data.cantcapitulos; icap +=1){
            var capitulo = new Product(builder);
            capitulo.buildTagList();
            capitulo.set({slug:  slug_template({numcap:icap})});
            capitulo.set({denom: denom_template({numcap:icap})});
            var parentref = {
                product: self.id,
                capnum: icap
            };
            capitulo.set({es_capitulo_de: parentref});
            //
            console.log('insertCapitulos:ready to insert: [%s] [%s]',icap,capitulo.get('slug'));

            capitulo.save(null, {
                success: function (model) {
                    //console.log('saveNode:productdetails success');
                    console.log('insertCapitulos:SUCCESS: [%s] [%s] ',icap,capitulo.get('slug'));
                },
                error: function () {
                    console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s] [%s]',icap,capitulo.get('slug'));
                }
            });
            console.log('ITERATION [%s]',icap);
        }
    },

    getTagList: function(){
        //project:{_id : this.model.id} }
        return this.get('taglist');
    },

    buildTagList: function(){
        var descriptores = this.get('descriptores');
        if(descriptores){
            var list = _.filter(_.map(descriptores.split(';'),function(str){return $.trim(str)}),function(str){return str});
            //list = _.map(list,function(str){return {tag: str}; });
            this.set({ taglist : list });
        }else{
            this.set({ taglist : [] });
        }
    },

    defaults: {
        _id: null,
        project:{},
        tipoproducto:"",
        productcode:"",
 
        slug: "",
        denom: "",

        descriptores: "",
        taglist:[],
        description: "",

        nivel_importancia: "medio",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        patechfacet:{},

        resources: []

    }

});
//        patechfacet:{
//            durnominal:null,
//            fecreacion:null,
//            cantcapitulos:null,
//            productora:null,
//        },


window.ProductCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Product,

    url: "/navegar/productos"

});

window.BrowseProductsQuery = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                if(keys[k]=='taglist'){
                    //query[keys[k]] = {$elemMatch: {tag: data}};
                    query[keys[k]] = data;
                }else{
                    query[keys[k]] = data;
                }
            }
        }
        return query;
    },
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        productcode:'',
        nivel_ejecucion:'',
        tipoproducto: '',
        nivel_importancia: '',
        taglist: '',
 
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
    }
});

window.PaCapitulosFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'pacapitulosfacet',

    retrieveData: function(){
        var qobj = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                qobj[keys[k]] = data;
            }
        }
        return qobj;
    },

    schema: {
        cantcapitulos:  {type: 'Number', title: 'Cantidad de capítulos'},
        tipoproducto:  {type: 'Select',options: utils.tipoproductoOptionList },
        durnominal:    {type: 'Text', title: 'Duración nominal', editorAttrs:{placeholder : 'duracion mm:ss'}},
        descriptores:  {type: 'Text', title: 'Descriptores', editorAttrs:{placeholder : 'descriptores separados por ;'}},
   },

    defaults: {
        cantcapitulos:'0',
        tipoproducto:'paudiovisual',
        durnominal:'',
        descriptores:'',
    }
});


window.PaClasificationFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'paclasificationfacet',

    retrieveData: function(){
        var qobj = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                qobj[keys[k]] = data;
            }
        }
        return qobj;
    },

    schema: {
        contenido:    {type: 'Select',options: utils.pacontenidos },
        subcontenido: {type: 'Select',options: utils.pasubcontenido.arteCultura},
        genero:       {type: 'Select',options: utils.pageneros},
        formato:      {type: 'Select',options: utils.paformatos},
        videoteca:    {type: 'Select',options: utils.videotecas},
        etario:       {type: 'Select',options: utils.etarios},  
   },

    defaults: {
        contenido:'',
        subcontenido:'',
        genero:'',
        formato:'',
        videoteca:'',
        etario:'',
    }
});

window.PaRealizationFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'parealizacionfacet',

    retrieveData: function(){
        var qobj = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                qobj[keys[k]] = data;
            }
        }
        return qobj;
    },

    schema: {
        realizadores: {type: 'TextArea',editorAttrs:{placeholder : 'realizadores'},editorClass:'input-large' },
        productores: {type: 'TextArea',editorAttrs:{placeholder : 'productores'} },
        actores: {type: 'TextArea',editorAttrs:{placeholder : 'actores'} },
        directores: {type: 'TextArea',editorAttrs:{placeholder : 'directores'} },
        camarografos: {type: 'TextArea',editorAttrs:{placeholder : 'camarografos'} },
        guionistas: {type: 'TextArea',editorAttrs:{placeholder : 'guionistas'} },
        musicos: {type: 'TextArea',editorAttrs:{placeholder : 'musicos'} },
    },

    defaults: {
        realizadores:'',
        productores:'',
        actores:'',
        directores:'',
        camarografos:'',
        guionistas:'',
        musicos:'',
    }
});

window.PaTechFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'patechfacet',

    retrieveData: function(){
        var qobj = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                qobj[keys[k]] = data;
            }
        }
        return qobj;
    },

    schema: {
        durnominal: {type: 'Text', title: 'Duración nominal', editorAttrs:{placeholder : 'duracion mm:ss'}},
        cantcapitulos: {type: 'Number', title: 'Cantidad de capítulos'},
        fecreacion: {type: 'Text', title: 'Fecha de creación'},
        productora: {type: 'Text', title: 'Casa productora',editorAttrs:{placeholder:'casa productora'}},
        lugares: {type: 'Text',editorAttrs:{placeholder : 'lugares'} },
        locaciones: {type: 'Text',editorAttrs:{placeholder : 'locaciones'} },
        //productora: {type: 'Select',options:[{val:'perro',label: 'El perro en la luna'},{val:'occidente',label:'Occidente'}], title: 'casa Productora'},
    },
    

    defaults: {
        durnominal:'',
        productora:'',
        fecreacion:'',
        cantcapitulos:0,
        lugares:'',
        locaciones:'',
    }
});
/*
        title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
        name:       'Text',
        email:      { validators: ['required', 'email'] },
        birthday:   'Date',
        password:   'Password',
        address:    { type: 'NestedModel', model: Address },
        notes:      { type: 'List', itemType: 'Text' }
*/

// quotation Quotation
window.Quotation = Backbone.Model.extend({
    // ******************* PROJECT ***************
    urlRoot: "/requisitorias",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique una descripción"};
        };
 
        this.validators.fesolstr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };

        this.validators.fenecstr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    getResourceList: function(){
        //project:{_id : this.model.id} }
        return this.get('resources');
    },

    setResourceList: function(rlist){
        this.set({resources:rlist});
    },

    defaults: {
        _id: null,
        project:{},
 
        slug: "",

        nro: '',
        fesol: "",
        fenec: "",
        fesolstr: "",
        fenecstr: "",

        solname: "",
        soldata: "",

        provname: "",
        provdata: "",

        gencond: "",
        partcond: "",

        rubro: "",
        nivel_importancia: "medio",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",

        resources: []
    }

});

window.QuotationCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Quotation,

    url: "/navegar/requisitorias"

});

window.BrowseQuotationsQuery = Backbone.Model.extend({
    // ******************* BROWSE RESOURCE RESOURCE ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});



window.Project = Backbone.Model.extend({
    // ******************* PROJECT ***************
    urlRoot: "/proyectos",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique la denominación identificatoria del evento"};
        };

        this.validators.denom = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique denominación oficial del evento"};
        };

        this.validators.responsable = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un responsable"};
        };

        this.validators.organismo = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un organismo"};
        };
 
        this.validators.eventdatestr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },
 

    updateAsset: function(data, cb){
        // create new asset-entry
        var as = {};
        as.versions = [];
        as.name = data.name;
        as.versions.push(data.fileversion);

        as.urlpath = data.urlpath;
        as.slug = as.name;
        as.denom = as.name;
        as.related = {project:this.id};

        console.log('prjmodel:creating new asset');
        var asset = new Asset(as);
        asset.save(null, {
            success: function (model) {
                cb('prjmodel: Success asset updated!');
            },
            error: function () {
                cb('An error occurred while trying to delete this item');
           }
        });
        console.log('asset created');
    },

    assetFolder: function(){
        return '/prj/' + (this.id || 'calendar');
    },

    defaults: {
        _id: null,
        denom: "",
        slug: "",
        genero: "",
        isPropio: 1,
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        nivel_importancia: "",
        responsable: "",
        organismo: "",
        city: "CABA",
        eventdatestr: "",
        eventdate: new Date().getTime(),
        description: "",
        picture: null,
    }
});


window.ProjectCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Project,

    url: "/navegar/proyectos"

});


window.BrowseProjectsQuery = Backbone.Model.extend({
    // ******************* BROWSE PROJECT QUERY ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },

    defaults: {
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});


window.BrowseResourcesQuery = Backbone.Model.extend({
    // ******************* BROWSE RESOURCE RESOURCE ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});


window.Resource = Backbone.Model.extend({
    // ******************* RESOURCE ***************
    urlRoot: "/recursos",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique la denominación identificatoria del evento"};
        };

        this.validators.denom = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique denominación oficial del evento"};
        };

        this.validators.responsable = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un responsable"};
        };

    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    updateAsset: function(data, cb){
        // create new asset-entry
        var as = {};
        as.versions = [];
        as.name = data.name;
        as.versions.push(data.fileversion);

        as.urlpath = data.urlpath;
        as.slug = as.name;
        as.denom = as.name;
        console.log('resmodel:creating new asset: '+this.get('project')['_id']);
        as.related = { project: this.get('project')['_id'], resource: this.id};

        var asset = new Asset(as);
        asset.save(null, {
            success: function (model) {
                cb('resmodel: Success asset updated!');
            },
            error: function () {
                cb('An error occurred while trying to delete this item');
           }
        });
        console.log('asset created');
    },

    assetFolder: function(){
        return '/res/' + (this.id || 'calendar');
    },




    defaults: {
        _id: null,
        denom: "",
        slug: "",
        rubro: "tecnica",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        nivel_importancia: "medio",
        responsable: "",
        contraparte: "",
        description: "",
        fenecesidad: "",
        quote: "",
        project:{},
        picture: null,
        freq:1,
        qty:1,
        ume:'UN'
    }
});

window.ResourceCollection = Backbone.Collection.extend({
    // ******************* RESOURCE COLLECTION ***************
    // otros metodos: initialize, url, model, comparator
    // models:  use get, at or underscore methods

    model: Resource,
    initialize: function (model, options) {
        if(options) this.options = options;
    },
    url: "/navegar/recursos"

});

window.Asset = Backbone.Model.extend({
    // ******************* RESOURCE ***************
    urlRoot: "/activos",

    idAttribute: "_id",

    project:null,

   initialize: function () {
        this.validators = {};

      
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },








    getProjectName: function(){
        // todo: instanciar un project 
        // if(!this.project){
        //      var prjid = this.get("related").project;
        //      if(!prjid) return "no definido";
        //      this.project = new Project ({_id:prjid});
        //}
        // return project.getDenom();
        // todo: agregar el metodo getDenom en project
        // pedirle al project su nombre
    },

    defaults: {
        _id: null,
        name: "",
        slug: "",
        denom: "",
        urlpath:"",
        versions:[],
        related:{}
    }
});

window.AssetCollection = Backbone.Collection.extend({
    // ******************* RESOURCE COLLECTION ***************
    // otros metodos: initialize, url, model, comparator
    // models:  use get, at or underscore methods

    model: Asset,
    initialize: function (model, options) {
       if(options) this.options = options;
    },

    url: "/recuperar/activos"

});

/*
eq: {
    "domain":null,
    "_events":{},
    "_maxListeners":10,
    "size":36456,
    "path":"/tmp/d6f6b14dfd5194515c6108864a8ae564",
    "name":"danzas-circulares.jpg",
    "type":"image/jpeg",
    "hash":false,
    "lastModifiedDate":"2013-05-24T17:25:39.393Z","
    _writeStream":{ "_writableState":{
                        "highWaterMark":16384,
                        "objectMode":false,
                        "needDrain":true,
                        "ending":true,
                        "ended":true,
                        "finished":true,
                        "decodeStrings":true,
                        "length":0,
                        "writing":false,
                        "sync":false,
                        "bufferProcessing":false,
                        "writecb":null,
                        "writelen":0,
                        "buffer":[]
                    },
                    "writable":true,
                    "domain":null,
                    "_events":{},
                    "_maxListeners":10,
                    "path":"/tmp/d6f6b14dfd5194515c6108864a8ae564",
                    "fd":null,
                    "flags":"w",
                    "mode":438,
                    "bytesWritten":36456,
                    "closed":true
                },
    "length":36456,
    "filename":"danzas-circulares.jpg",
    "mime":"image/jpeg"
}
*/
