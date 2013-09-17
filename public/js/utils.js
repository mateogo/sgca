window.utils = {

    whoami:'utils!',

    // Asynchronously load templates located in separate .html files
    loadTemplate: function(views, callback) {
        // $.get loads data from the server
        //    returns an jqXHR object
        // $.when is executed when deferreds ends loading data
        //jQuery.get( url [, data ] [, success(data, textStatus, jqXHR) ] [, dataType ] );
        //
        //_.template compiles a template using underscore
        //
        var deferreds = [];
        $.each(views, function(index, view) {
            if (window[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                alert('tpl/' + view + '.html' + " not found!!");
            }
        });
        //$.when: Provides a way to execute callback functions based on one or more objects, 
        //usually Deferred objects that represent asynchronous events.
        // esta forma de invocacion de apply es par acuando se trata de un array de 'defereds'.
        // el metodo apply espera en su segundo parametro un array.
        $.when.apply(null, deferreds).done(callback);
    },

    displayValidationErrors: function (messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key]);
            }
        }
        this.showAlert('Warning!', 'Fix validation errors and try again', 'alert-warning');
    },

    addValidationError: function (field, message) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.addClass('error');
        $('.help-inline', controlGroup).html(message);
    },

    removeValidationError: function (field) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.removeClass('error');
        $('.help-inline', controlGroup).html('');
    },

    showAlert: function(title, text, klass) {
        $('.alert').removeClass("alert-error alert-warning alert-success alert-info");
        $('.alert').addClass(klass);
        $('.alert').html('<strong>' + title + '</strong> ' + text);
        $('.alert').show();
    },

    hideAlert: function() {
        $('.alert').hide();
    },

    buildDateNum: function(str){
        return this.parseDateStr(str).getTime();
    },

    quotationsQueryData:function (){
        if (!this.queryQuotationData) {
            this.queryQuotationData = new BrowseQuotationsQuery();
        }
        return this.queryQuotationData;
    },

    productsQueryData:function (){
        if (!this.queryProductData) {
            this.queryProductData = new BrowseProductsQuery();
        }
        return this.queryProductData;
    },

    pacapitulosfacet: {
        init: function(product){
            var builder = {};
            builder.durnominal = product.get('patechfacet') && product.get('patechfacet').durnominal;
            builder.tipoproducto = product.get('tipoproducto');
            builder.descriptores = product.get('descriptores');
            builder.cantcapitulos = 0;
            this.data = new PaCapitulosFacet(builder);
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },

    patechfacet: {
        init: function(product){
            this.data = new PaTechFacet(product.get('patechfacet'));
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },
    parealizfacet: {
        init: function(product){
            this.data = new PaRealizationFacet(product.get('realization'));
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },
    paclasificationfacet: {
        init: function(product){
            this.data = new PaClasificationFacet(product.get('clasification'));
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },

    tipoproductoOptionList:[
        {val:'no_definido',  label:'tipo de producto'},
        {val:'paudiovisual', label:'producto audiovisual'},
        {val:'micro',        label:'micro'},
        {val:'promo',        label:'promo'},
        {val:'imagen',       label:'imagen'},
    ],

    nivelimportanciaOptionList:[
        {val:'bajo',    label:'bajo'},
        {val:'medio',   label:'medio'},
        {val:'alto',    label:'alto'},
        {val:'critico', label:'crítico'},
    ],

    paexecutionOptionList:[
        {val:'no_definido', label:'-nivel de ejecución-'},
        {val:'planificado', label:'planificado'},
        {val:'gestion',     label:'en gestión'},
        {val:'recibido',    label:'recibido'},
        {val:'ingestado',   label:'ingestado'},
        {val:'controlado',  label:'controlado'},
        {val:'observado',   label:'observado'},
        {val:'rechazado',   label:'rechazado'},
        {val:'archivado',   label:'archivado'}
    ],

    buildSelectOptions: function(varname, data, actualvalue){
        var template = _.template("<option value='<%= val %>' <%= selected %> ><%= label %></option>");
        var optionStr = '';
        _.each(data,function(element, index, list){
            element.selected = (actualvalue == element.val ? 'selected' : '');
            optionStr += template(element);
            console.log('element: %s',element);
        });
        console.log('option [%s]',optionStr);
        return optionStr;
    },
    buildDatalistOptions: function(varname, data){
        var template = _.template("<option value='<%= val %>' label='<%= label %>' >");
        var optionStr = '';
        _.each(data,function(element, index, list){
            optionStr += template(element);
        });
        return optionStr;
    },

    pacontenidos: ['artecultura','cienciaTecnologia','cienciasSociales','deporte','educacionTrabajo','historia','infancia','juventud','sociedad','ficcion'],
    pageneros:['animacion', 'biografia', 'curso', 'ficcion', 'docuficcion', 'documental', 'entretenimiento', 'entrevistas', 'telenovela', 'reality', 'recital', 'periodistico', 'noticiero','inespecifico'],
    paformatos:['serie', 'micros', 'cortometraje', 'largometraje', 'trailer', 'promo', 'programa', 'noticiero', 'micro', 'unitarios', 'recital', 'periodistico', 'especial', 'inespecifico'],
    videotecas:['concurso', 'produccionPropia', 'adquisicion', 'coproduccion', 'cesion', 'banco','inespecifico'],
    etarios:['infantil', 'jovenes','adolescentes', 'adulto', 'mayores','inespecifico'],

    pasubcontenido: {
        arteCultura: ['musica', 'plastica', 'fotografia', 'arteDigital', 'video', 'teatro', 'animacion', 'otros' ],
        cienciaTecnologia: ['astronomia', 'fisica', 'matematica', 'quimica','otros'],
        cienciasSociales: ['antropologia', 'historia', 'sociologia', 'economia', 'politica', 'otros'],
        deporte: ['historiaDeporte', 'actualidadDeporte', 'deporteAmateur', 'deporteProfesional','otros'],
        educacionTrabajo:['educSexual', 'primerosAuxilios', 'educRural', 'oficios', 'debateEducativo','otros' ],
        historia: ['universal', 'argentinaSXX', 'argentinaSXiX', 'biografia','otros'],
        infancia: ['pedagogia', 'recreacion', 'curricula','otros'],
        juventud: ['pedagogia', 'recreacion', 'curricula','otros'],
        sociedad: ['gastronomia', 'ddhh', 'familia', 'respSocial', 'salud','otros' ],
        ficcion: ['novela', 'thriller', 'drama', 'comedia', 'accion','otros' ],
    },

    resourcesQueryData:function (){
        if (!this.queryResourceData) {
            this.queryResourceData = new BrowseResourcesQuery();
        }
        return this.queryResourceData;
    },

    projectsQueryData:function (){
        if (!this.queryProjectData) {
            this.queryProjectData = new BrowseProjectsQuery();
        }
        return this.queryProjectData;
    },

    editor:{
        render: function(nicpanel, target, text){
            this.get().setPanel(nicpanel);
            this.get().addInstance(target);
            this.get().instanceById(target).setContent((text||'ingrese el pedido de cotización'));
        },
        get: function(){
            if(!this.editorInstance){
                this.editorInstance = new nicEditor();
            }
            return (this.editorInstance);
        },
        getContent: function(target){
            //alert('alo'); //instanceById(target)
            //var ed = ;
            return this.get().instanceById(target).getContent();
        }
    },
    
    viewData:{
        emp:{
            depart:'CePia - Centro de producción e investigación audiovisual',
            division:'Secretaría de Cultura de la Nación',
            address:'Vera 745 - CABA'
        },
        currentProject:'proyecto',
        resource: {
            rubroText: {no_definido:' ', talentos:'Art', tecnica:'Tec', infraestructura:'Inf', seguridad:'Seg',hospitality:'Hos',transmision:'Tx',prensa:'Pre'},
            eventFillColor: {no_definido:'lime',bajo:'green',medio:'blue',alto:'magenta',critico:'red'},
            fillOpacity:{no_definido:.1,planificado:.4,rfi:.6,tdr:.8,compras:.9,adjudicado:.9,a_entregar:1,entregado:1,cumplido:1}
        },
        product: {
            tprText: {no_definido:' ', paudiovisual:'PA', micro:'Micro', promo:'Promo', imagen:'Img'},
            eventFillColor: {no_definido:'lime',bajo:'green',medio:'blue',alto:'magenta',critico:'red'},
            fillOpacity:{no_definido:.1,planificado:.3,gestion:.6,recibido:.8,ingestado:.9,controlado:.9,aprobado:1,observado:1,archivado:1}
        },
        project: {
            eventText: {no_definido:' ',concurso: 'Conc',adhesion:'Adh',produccion:'Pro',cesion:'Ces', musica:'Mus', teatro:'Tea', musical:'Tmu', invantil:'Inf',circo:'Cir',cine:'Cin',festival:'Fes',fpopular:'FPo',danza:'Dza',congreso:'Con'},
            eventFillColor: {no_definido:'lime',bajo:'green',medio:'blue',alto:'magenta',critico:'red'},
            ispropioText: {'1':'IC','0':'Ax'},
            fillOpacity:{no_definido:1,planificado:.4,produccion:1,posproduccion:.7,demorado:.4,reprogramado:.4,suspendido:.1,cumplido:.1},
        },
        resourcelist:[]
    },
    parseDateStr: function(str) {
        var mx = str.match(/(\d+)/g);
        var ty = new Date();
        if(mx.length === 0) return ty;
        if(mx.length === 1){
            if(mx[0]<0 || mx[0]>31) return null;
            else return new Date(ty.getFullYear(),ty.getMonth(),mx[0]);
        }
        if(mx.length === 2){
            if(mx[0]<0 || mx[0]>31) return null;
            if(mx[1]<0 || mx[1]>12) return null;
            else return new Date(ty.getFullYear(),mx[1]-1,mx[0]);
        }
        if(mx.length === 3){
            if(mx[0]<0 || mx[0]>31) return null;
            if(mx[1]<0 || mx[1]>12) return null;
            if(mx[2]<1000 || mx[2]>2020) return null;
            else return new Date(mx[2],mx[1]-1,mx[0]);
        }
        if(mx.length === 4){
            if(mx[0]<0 || mx[0]>31) return null;
            if(mx[1]<0 || mx[1]>12) return null;
            if(mx[2]<1000 || mx[2]>2020) return null;
            if(mx[3]<0 || mx[3]>24) return null;
            else return new Date(mx[2],mx[1]-1,mx[0],mx[3],0);
        }
        if(mx.length === 5){
            if(mx[0]<0 || mx[0]>31) return null;
            if(mx[1]<0 || mx[1]>12) return null;
            if(mx[2]<1000 || mx[2]>2020) return null;
            if(mx[3]<0 || mx[3]>24) return null;
            if(mx[4]<0 || mx[4]>60) return null;
            else return new Date(mx[2],mx[1]-1,mx[0],mx[3],mx[4]);
        }
    }
};