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
                alert('tpl/' + view + '.html' + " not FOUND!!");
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

    productsCol:{
        get: function (){
            if (!this.productsCollectionRef) {
                this.productsCollectionRef = new ProductCollection();
            }
            return this.productsCollectionRef;
        },
        set: function(col){
            this.productsCollectionRef = col;
        }
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
        {val:'curaduria',    label:'curaduria'},
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


    productListTableHeader:[
        {tt:'th', flag:1, tclass:'col0', tmpl: 'template2', val:'select',            label:'#'},
        {tt:'th', flag:1, tclass:'col1', tmpl: 'template3', val:'productcode',       label:'código'},
        {tt:'th', flag:1, tclass:'col2', tmpl: 'template1', val:'tipoproducto',      label:'tipo'},
        {tt:'th', flag:1, tclass:'col3', tmpl: 'template1', val:'slug',              label:'denominación'},
        {tt:'th', flag:0, tclass:'col4', tmpl: 'template1', val:'project',           label:'proyecto'},
        {tt:'th', flag:1, tclass:'col5', tmpl: 'template1', val:'nivel_ejecucion',   label:'ejecución'},
        {tt:'th', flag:1, tclass:'col6', tmpl: 'template1', val:'nivel_importancia', label:'importancia'},
        {tt:'th', flag:1, tclass:'col7', tmpl: 'template4', val:'acciones',          label:'acciones'}
    ],

    buildTableHeader: function(data){
        var template = _.template("<<%= tt %> name='<%= val %>' class='<%= tclass %>' ><%= label %></<%= tt %> >");
        var tabledata = '';
        _.each(data,function(element, index, list){
            if(element.flag){
                tabledata += template(element);
            }
        });
        console.log('<thead><tr>'+tabledata+'</tr></thead>');
        return '<thead><tr>'+tabledata+'</tr></thead>';
    },

    buildTableRowTemplates:{
        template1 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><%= value %></td>"),
        template2 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><input name=tselect type=checkbox class=tselect ></td>"),
        template3 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tlink' title='editar item'><%= value %></button></td>"),
        template4 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tedit' title='no implementado aun'><i class='icon-edit'></i></button><button class='btn-link tzoom' title='ver productos relacionados' ><i class='icon-zoom-in'></i></button></td>"),
    },

    buildTableRow: function(data,model){
        var self = this;
        var tabledata = '';
        _.each(data,function(element, index, list){
            if(element.flag){
                element.value = (model.get(element.val)||'#');
                tabledata += self.buildTableRowTemplates[element.tmpl](element);
            }
        });
        console.log(tabledata);
        return tabledata;
    },

    selectedProducts:{
        list:[],
        select: function  () {
            this.sproduct = this.first() || this.sproduct;
        },
        unselect: function() {
            this.sproduct = null;
        },
        getSelected: function() {
            return this.sproduct;
        },
        getSelectedLabel: function() {
            if(!this.getSelected()) return 'Sin selección';
            else return this.getSelected().get('productcode');
        },
        add: function  (product) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if(this.list[i]===product) return this.list;
            }
            this.list.push(product);
            return this.list;
        },
        getList: function() {
            return this.list;
        },
        remove: function (product) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if(this.list[i]===product) this.list.splice(i,1);
            }
            return this.list;
        },
        reset: function() {
            this.list = [];
        },
        first: function  () {
            if(this.list.length) return this.list[0];
            else return null;
        }
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
            tprText: {no_definido:' ', paudiovisual:'PA', micro:'Micro', promo:'Promo', imagen:'Img', curaduria:'Cur'},
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