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
        var self = this;
        var deferreds = [];
        self.templates = {};
        $.each(views, function(index, view) {
            if (window[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                console.log('WARINING: Marionette template. tpl/' + view + '.html' + " not FOUND!!");
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    self.templates[view] = _.template(data);
                }));

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

    fetchFilteredEntries: function (model, entry,query){
        console.log('fetchfilteredEntries/utils: begins [%s]', model.get(entry).length);
        var filtered = [];

        filtered = _.filter(model.get(entry),function(elem){
           var filter = _.reduce(query, function(memo, value, key){
                console.log('value: [%s]  key:[%s] elem.key:[%s]',value,key,elem[key]);
                if(value != elem[key]) return memo && false;
                return memo  && true;
            },true);
            return filter;
        });
        return filtered;
    },

    maprender: {
        init: function(selector, lon, lat){
            this.map = new OpenLayers.Map((selector||'showmap'));
            // Capa base que muestra el mapa de openstreetmap
            this.map.addLayer(new OpenLayers.Layer.OSM());
            // Capa markers
            this.map.setCenter(new OpenLayers.LonLat((lon||-58.39688441711421),(lat||-34.60834737727606))
              .transform(
                new OpenLayers.Projection("EPSG:4326"), // de WGS 1984
                new OpenLayers.Projection("EPSG:900913") // a Proyección Esférica Mercator
              ), 13 // Nivel de zum
            );

            this.markers = new OpenLayers.Layer.Markers( "Markers" );
            this.map.addLayer(this.markers);            
            //this.template = _.template("<div class='popup-content' style='font-size:.8em;width:150px;height:150px;'><h4><%= name %></h4> <%= direccion %></div>");
            this.template = _.template("<h4><%= name %></h4><%= direccion %>");
            this.size = new OpenLayers.Size(21,25);
            this.offset = new OpenLayers.Pixel(-(this.size.w/2), -this.size.h);

            //self.map.setCenter(lonlat, 16 );
        },
        
        addPlace: function (address) {
            var self = this;
            if(!self.map) self.initMap();
 
            console.log('maprender: [%s] [%s] [%s]',address.nombre,address.latitud,address.longitud);
            self.lonlat = new OpenLayers.LonLat(address.longitud,address.latitud).transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    new OpenLayers.Projection("EPSG:900913"));

            self.map.setCenter(self.lonlat, 15 );

            self.icon = new OpenLayers.Icon('lib/img/marker.png', self.size, self.offset);
            self.markers.addMarker(new OpenLayers.Marker(self.lonlat, self.icon));
        },

        addPopupPlace: function (address) {
            var self = this;
            this.addPlace(address);

            var htmltext = self.template({name:address.nombre, direccion:address.displayAddress})
            var popup = new  OpenLayers.Popup.FramedCloud(
                    address.nombre,
                    self.lonlat,
                    new OpenLayers.Size(121,125), 
                    htmltext,
                    self.icon,
                    true
            );
            popup.minSize = new OpenLayers.Size(10,100);
            self.map.addPopup(popup);
        },

        getMap: function(){
            return this.map;
        }
    },
    tipoDocumItemOptionList: [
        {val:'no_definido'    , label:'tipo de comprobante'},
        {val:'ptecnico'       , label:'P/Técnico'},
    ],
    paOptionList: [
        {val:'no_definido'  , label:'Nivel de ejecución'},
        {val:'enproceso'    , label:'en proceso'},
        {val:'completado'   , label:'completado'},
        {val:'suspendido'   , label:'suspendido'},
        {val:'archivo'      , label:'archivado'},
    ],

    documexecutionOptionList: [
        {val:'no_definido'  , label:'Nivel de ejecución'},
        {val:'enproceso'    , label:'en proceso'},
        {val:'completado'   , label:'completado'},
        {val:'suspendido'   , label:'suspendido'},
        {val:'archivo'      , label:'archivado'},
    ],

    estadoqcOptionList: [
        {val:'aprobado'    , label:'APROBADO'},
        {val:'rechazado'   , label:'RECHAZADO'},
        {val:'observado'   , label:'OBSERVADO'}
    ],

    tipoComprobaneOptionList: [
        {val:'no_definido'    , label:'tipo de comprobante'},
        {val:'nrecepcion'     , label:'N/Recepción'},
        {val:'nentrega'       , label:'N/Entrega'},
        {val:'ptecnico'       , label:'P/Técnico'},
    ],

    tipoBrandingOptionList: [
        {val:'no_definido'      , label:'tipo de archivo'},
        {val:'imagen_web'       , label:''},
    ],

    userStatusOptionList:[
        {val:'activo'        , label:'activo'},
        {val:'pendaprobacion', label:'pend aprobacion'},
        {val:'pendmail'      , label:'pend verif mail'},
        {val:'suspendido'    , label:'suspendido'},
        {val:'inactivo'      , label:'inactivo'},
        {val:'baja'          , label:'baja'},
    ],

    userRolesOptionList: [
        {val:'no_definido'    , label:'Roles'},
        {val:'administrador'  , label:'administrador'},
        {val:'productor'      , label:'productor'},
        {val:'tecnico'        , label:'tecnico'},
        {val:'catalogador'    , label:'catalogador'},
        {val:'visualizador'   , label:'visualizador'},
        {val:'adherente'      , label:'adherente'},
    ],

    tipoBrandingOptionList: [
        {val:'no_definido'      , label:'tipo de archivo'},
        {val:'imagen_web'       , label:'Imagen Web'},
    ],
    
    rolBrandingOptionList: [
        {val:'no_definido'      , label:'destino'},
        {val:'principal'        , label:'principal'},
        {val:'carousel'         , label:'carousel'},
        {val:'destacado'        , label:'destacado'},
        {val:'perfil'           , label:'perfil'},
    ],

    notasexecutionOptionList: [
        {val:'no_definido' , label:'Nivel de ejecución'},
        {val:'planificada' , label:'planificada'},
        {val:'preparada'   , label:'preparada'},
        {val:'publicada'   , label:'publicada'},
        {val:'archivo'     , label:'archivada'},
    ],
    
    notasOptionList: [
        {val:'nota'          , label:'nota'},
        {val:'visualizacion' , label:'visualización'},
        {val:'premio'        , label:'premio'},
        {val:'gacetilla'     , label:'gacetilla'},
        {val:'publicacion'   , label:'publicación'},
        {val:'informacion'   , label:'información'},
        {val:'portal'        , label:'portal'},
    ],

    contactoOL: [
        {val:'mail'        , label:'email'},
        {val:'telefono'    , label:'teléfono'},
        {val:'direccion'   , label:'dirección'},
        {val:'web'         , label:'web'},
        {val:'informacion' , label:'información'},
    ],

    tipocontactoOL:{
        mail: [
            {val:'principal'  , label:'principal'},
            {val:'trabajo'    , label:'trabajo'},
            {val:'personal'   , label:'personal'},
            {val:'otro'       , label:'otro'},
        ],
        telefono: [
            {val:'principal'   , label:'principal'},
            {val:'celular'     , label:'celular'},
            {val:'trabajo'     , label:'trabajo'},
            {val:'fax'         , label:'fax'},
            {val:'particular'  , label:'particular'},
            {val:'pager'       , label:'pager'},
            {val:'skype'       , label:'skype'},
            {val:'googlevoice' , label:'googlevoice'},
            {val:'otro'        , label:'otro'},
        ],
        direccion: [
            {val:'principal'  , label:'principal'},
            {val:'trabajo'    , label:'trabajo'},
            {val:'sede'       , label:'sede'},
            {val:'deposito'   , label:'depósito'},
            {val:'sala'       , label:'sala'},
            {val:'pagos'      , label:'pagos'},
            {val:'cobranza'   , label:'cobranza'},
            {val:'particular' , label:'particular'},
            {val:'locacion'   , label:'locación'},
            {val:'otro'       , label:'otro'},
        ],
        web: [
            {val:'principal'  , label:'principal'},
            {val:'trabajo'    , label:'trabajo'},
            {val:'perfil'     , label:'perfil'},
            {val:'blog'       , label:'blog'},
            {val:'personal'   , label:'personal'},
            {val:'otro'       , label:'otro'},
        ],
        informacion: [
            {val:'cumple'      , label:'cumpleaños'},
            {val:'aniversario' , label:'aniversario'},
            {val:'cierre'      , label:'cierre'},
            {val:'otro'        , label:'otro'},
        ],
    },

    rolinstanciasOptionList: [
        {val:'no_definido'      , label:'versión'},
        {val:'masteraire'        , label:'Master Aire'},
        {val:'mastertextless'    , label:'Master Text-less'},
        {val:'matpromocion'      , label:'Material de promoción'},
        {val:'grafica'           , label:'Gráfica'},
        {val:'planosdeseguridad' , label:'Planos de seguridad'},
        {val:'capituloprueba'    , label:'Capitulos de prueba'},
        {val:'trailer'           , label:'trailer'},
        {val:'audio_principal'   , label:'audio principal'},
        {val:'audio_ambiente'    , label:'audio ambiente'},
        {val:'audio_descripcion' , label:'audio descripcion'},
        {val:'branding'          , label:'branding'},
        {val:'script'            , label:'script'},
    ],
    versionOptionList: [
    ],

    resolucionOptionList: [
        {val:'no_definido' , label:'Resolución'},
        {val:'1920x1080'   , label:'1920x1080'},
        {val:'1440x1080'   , label:'1440x1080'},
        {val:'1280x720'    , label:'1280x720'},
        {val:'1280x720p'   , label:'1280x720p'},
        {val:'1024x576'    , label:'1024x576'},
        {val:'720x576'     , label:'720x576'},
        {val:'720x480'     , label:'720x480'},
        {val:'Otro'        , label:'Otro'},
    ],

    sopentregaOptionList: [
        {val:'no_definido' , label:'no_definido'},
        {val:'HD'          , label:'HD'},
        {val:'Blue-ray'    , label:'Blue-ray'},
        {val:'Tape'        , label:'Tape'},
        {val:'DVD'         , label:'DVD'},
        {val:'transfer'    , label:'Transfer'},
        {val:'Otro'        , label:'Otro'},
    ],

    aspectratioOptionList: [
        {val:'no_definido' , label:'Relación de aspecto'},
        {val:'16_9'        , label:'16:9'},
        {val:'4_3'         , label:'4:3'},
        {val:'2_1'         , label:'2:1'},
        {val:'240_1'       , label:'2.40:1'},
        {val:'Otro'        , label:'Otro'},
    ],

    audiocontentOptionList: [
        {val:'no_definido'    , label:'no_definido'},
        {val:'fullmix'        , label:'Full Mix'},
        {val:'musicayefectos' , label:'Musica y Efectos'},
        {val:'musica'         , label:'Música'},
        {val:'efectos'        , label:'Efectos'},
        {val:'dialogos'       , label:'Diálogos'},
        {val:'voiceover'      , label:'Voice Over'},
        {val:'mudo'           , label:'Mudo'},
        {val:'mixminus'       , label:'Mix Minus'},
    ],
    audiocanalOptionList: [
        {val:'no_definido'  , label:'no_definido'},
        {val:'mono'         , label:'Mono'},
        {val:'stereoder'    , label:'Stereo Der'},
        {val:'stereoizq'    , label:'Stereo Izq'},
    ],

    formatooriginalOptionList: [
        {val:'no_definido'  , label:'formato original'},
        {val:'QuickTime'    , label:'QuickTime'},
        {val:'MXFOP1A'      , label:'MXF op1A'},
        {val:'HDCAM'        , label:'HDCAM'},
        {val:'DigiBeta'     , label:'Digi Beta'},
        {val:'XDCAMBD'      , label:'XDCAM-BD'},
        {val:'ArchDigital'  , label:'Archivo digital'},
        {val:'MiniDV'       , label:'Mini DV'},
        {val:'HDV'          , label:'HDV'},
        {val:'Otro'         , label:'Otro'},
    ],
 
    codecOptionList: [
        {val:'no_definido'       , label:'no_definido'},
        {val:'AVC-Intra100422'   , label:'AVC-Intra 100 High 422'},
        {val:'AvidMPEG30'        , label:'Avid MPEG 30'},
        {val:'AppleProRes422HQ'  , label:'Apple ProRes 422 SQ'},
        {val:'AppleProRes422SQ'  , label:'Apple ProRes 422 HQ'},
        {val:'IMX30'             , label:'IMX30'},
        {val:'XDCAMHD50'         , label:'XDCAM HD 50'},
        {val:'DnxHD120'          , label:'Dnx HD 120'},
        {val:'DnxHD185'          , label:'Dnx HD 185'},
    ],

    framerateOptionList: [
        {val:'no_definido' , label:'Frame Rate'},
        {val:'24p'     , label:'24p'},
        {val:'25p'     , label:'25p'},
        {val:'30p'     , label:'30p'},
        {val:'50i'     , label:'50i'},
        {val:'60i'     , label:'60i'},
        {val:'23976p'  , label:'29.76p'},
        {val:'2997p'   , label:'29.97p'},
    ],

    tipovideoOptionList: [
        {val:'no_definido'      , label:'tipo de instancia'},
        {val:'high_res'         , label:'alta resolución'},
        {val:'low_res'          , label:'baja resolución'},
    ],

    tipoproductoOptionList:[
        {val:'no_definido',  label:'tipo de producto'},
        {val:'paudiovisual', label:'producto audiovisual'},
        {val:'micro',        label:'micro'},
        {val:'curaduria',    label:'curaduria'},
    ],

    tipoinstanciaOptionList:[
        {val:'no_definido',  label:'tipo de instancia'},
        {val:'video',        label:'video'},
        {val:'imagen',       label:'imagen'},
        {val:'audio',        label:'audio'},
        {val:'documento',    label:'documento'},
    ],

    nivelimportanciaOptionList:[
        {val:'bajo',    label:'bajo'},
        {val:'medio',   label:'medio'},
        {val:'alto',    label:'alto'},
        {val:'critico', label:'crítico'},
    ],

    estadoaltaOptionList:[
        {val:'activo',     label:'activo'},
        {val:'suspendido', label:'suspendido'},
        {val:'cerrado',    label:'cerrado'},
        {val:'baja',       label:'baja'},
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
            //console.log('element: %s',element);
        });
        //console.log('option [%s]',optionStr);
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


    userListTableHeader:[
        {id:0, tt:'th', flag:1, tclass:'col0', tmpl: 'template2', val:'select',            label:'#'},
        {id:1, tt:'th', flag:1, tclass:'col1', tmpl: 'template3', val:'mail',              label:'identificador'},
        {id:2, tt:'th', flag:1, tclass:'col2', tmpl: 'template1', val:'username',          label:'tipo'},
        {id:3, tt:'th', flag:1, tclass:'col3', tmpl: 'template1', val:'estado_alta',       label:'estado'},
    ], 

    personListTableHeader:[
        {id:0, tt:'th', flag:1, tclass:'col0', tmpl: 'template2', val:'select',            label:'#'},
        {id:1, tt:'th', flag:1, tclass:'col1', tmpl: 'template3', val:'nickName',          label:'identificador'},
        {id:2, tt:'th', flag:1, tclass:'col2', tmpl: 'template1', val:'tipopersona',       label:'tipo'},
        {id:3, tt:'th', flag:1, tclass:'col3', tmpl: 'template1', val:'name',              label:'denominación'},
        {id:4, tt:'th', flag:1, tclass:'col4', tmpl: 'template1', val:'tipojuridico',      label:'juridico'},
        {id:5, tt:'th', flag:1, tclass:'col5', tmpl: 'template1', val:'roles',             label:'roles'},
        {id:6, tt:'th', flag:1, tclass:'col6', tmpl: 'template1', val:'estado_alta',       label:'importancia'},
        {id:7, tt:'th', flag:1, tclass:'col7', tmpl: 'template4', val:'acciones',          label:'acciones'}
    ],

    productListTableHeader:[
        {id:0, tt:'th', flag:1, tclass:'col0', tmpl: 'template2', val:'select',            label:'#'},
        {id:1, tt:'th', flag:1, tclass:'col1', tmpl: 'template3', val:'productcode',       label:'código'},
        {id:2, tt:'th', flag:1, tclass:'col2', tmpl: 'template1', val:'tipoproducto',      label:'tipo'},
        {id:3, tt:'th', flag:1, tclass:'col3', tmpl: 'template1', val:'slug',              label:'denominación'},
        {id:4, tt:'th', flag:0, tclass:'col4', tmpl: 'template1', val:'project',           label:'proyecto'},
        {id:5, tt:'th', flag:1, tclass:'col5', tmpl: 'template1', val:'nivel_ejecucion',   label:'ejecución'},
        {id:6, tt:'th', flag:1, tclass:'col6', tmpl: 'template1', val:'nivel_importancia', label:'importancia'},
        {id:7, tt:'th', flag:1, tclass:'col7', tmpl: 'template4', val:'acciones',          label:'acciones'}
    ],

    documListTableHeader:[
        {id:0, tt:'th', flag:1, tclass:'col0', tmpl: 'template2', val:'select',        label:'#'},
        {id:1, tt:'th', flag:1, tclass:'col1', tmpl: 'template6', val:'cnumber',       label:'comprob'},
        {id:2, tt:'th', flag:1, tclass:'col2', tmpl: 'template1', val:'tipocomp',      label:'tipo'},
        {id:3, tt:'th', flag:1, tclass:'col3', tmpl: 'template1', val:'slug',          label:'asunto'},
        {id:4, tt:'th', flag:1, tclass:'col4', tmpl: 'template5', val:'acciones',      label:'acciones'}
    ],

    buildTableHeader: function(data){
        var template = _.template("<<%= tt %> name='<%= val %>' class='<%= tclass %>' ><%= label %></<%= tt %> >");
        var tabledata = '';
        _.each(data,function(element, index, list){
            if(element.flag){
                tabledata += template(element);
            }
        });
        //console.log('<thead><tr>'+tabledata+'</tr></thead>');
        return '<thead><tr>'+tabledata+'</tr></thead>';
    },

    buildTableRowTemplates:{
        template1 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><%= value %></td>"),
        template2 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><input name=tselect type=checkbox class=tselect ></td>"),
        template3 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tlink' title='editar item'><%= value %></button></td>"),
        template4 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tedit' title='no implementado aun'><i class='icon-edit'></i></button><button class='btn-link tzoom' title='ver personas relacionadas' ><i class='icon-zoom-in'></i></button></td>"),
        template5 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-edit' title='editar'><span class='glyphicon glyphicon-edit'></span></button><button class='btn-link js-zoom' title='entidades relacionadas' ><span class='glyphicon glyphicon-zoom-in'></span></button></td>"),
        template6 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-show' title='ver'><%= value %></button></td>"),
    },

    buildTableRow: function(data,model){
        var self = this;
        var tabledata = '';
        _.each(data,function(element, index, list){
            if(element.flag){
                element.value = (model.displayItem(element.val)||'#');
                tabledata += self.buildTableRowTemplates[element.tmpl](element);
            }
        });
        //console.log(tabledata);
        return tabledata;
    },

    buildRowRenderTemplate: function(lista, templates){
        var items =[];
        _.each(lista, function(data,index){
          if(data.flag){
            data.value = '<%= '+data.val+' %>';
            items.push(templates[data.tmpl](data));
          }          
        });
        return items.join();  
    },

    selectedUsers:{
        list:[],
        select: function  () {
            this.suser = this.first() || this.suser;
        },
        unselect: function() {
            this.suser = null;
        },
        getSelected: function() {
            return this.suser;
        },
        getSelectedLabel: function() {
            if(!this.getSelected()) return 'Sin selección';
            else return this.getSelected().get('nickName');
        },
        add: function  (user) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if(this.list[i]===user) return this.list;
            }
            this.list.push(user);
            return this.list;
        },
        getList: function() {
            return this.list;
        },
        remove: function (user) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if(this.list[i]===user) this.list.splice(i,1);
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

    selectedPersons:{
        list:[],
        select: function  () {
            this.sperson = this.first() || this.sperson;
        },
        unselect: function() {
            this.sperson = null;
        },
        getSelected: function() {
            return this.sperson;
        },
        getSelectedLabel: function() {
            if(!this.getSelected()) return 'Sin selección';
            else return this.getSelected().get('nickName');
        },
        add: function  (person) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if(this.list[i]===person) return this.list;
            }
            this.list.push(person);
            return this.list;
        },
        getList: function() {
            return this.list;
        },
        remove: function (person) {
            for (var i = this.list.length - 1; i >= 0; i--) {
                if(this.list[i]===person) this.list.splice(i,1);
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
            ispropioText: {'1':'BACUA','0':'Ax'},
            fillOpacity:{no_definido:1,planificado:.4,produccion:1,posproduccion:.7,demorado:.4,reprogramado:.4,suspendido:.1,cumplido:.1},
        },
        resourcelist:[]
    },
    inspect: function  (target, deep, whoami) {
        var deep = deep+=1 || 1;
        var self = this;
        console.log('[%s]:inspect CALLED: [%s]: [%s]',deep, whoami, target);
        _.each(target, function(value, key){
            console.log('[%s]:inspect: [%s] [%s]: [%s]',deep, whoami, key,value);
            if( (_.isObject(value) && !_.isFunction(value)) && deep<4 ){
                self.inspect(value, deep);
            }
        });
    },
    
    rendertree: function(settings){
        var root = utils.d3treegraph;

        var diameter = 960;
        var tree = d3.layout.tree()
            .size([360, diameter / 2 - 120])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

        var diagonal = d3.svg.diagonal.radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        var svg = d3.select(settings.selector).append("svg")
            .attr("width", diameter)
            .attr("height", diameter - 150)
            .append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


        //d3.json('flare.json', function(error, root) {
          var nodes = tree.nodes(root),
              links = tree.links(nodes);

          var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

          var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

          node.append("circle")
              .attr("r", 4.5);

          node.append("text")
              .attr("dy", ".31em")
              .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
              .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
              .text(function(d) { return d.name; });
        //});

        d3.select(self.frameElement).style("height", diameter - 150 + "px");
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