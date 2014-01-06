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

    displayDate: function (d) {
        var di = ('000'+d.getDate());
        var me = ('000'+(d.getMonth()+1));
        di = di.substr(di.length-2,2);
        me = me.substr(me.length-2,2);
        return di+'/'+me+'/'+d.getFullYear();
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
        {val:'nrecepcion'     , label:'N/Recepción'},
        {val:'nentrega'       , label:'N/Entrega'},
        {val:'pemision'       , label:'P/Emisión'},
    ],

    paOptionList: [
        {val:'no_definido'  , label:'Nivel de ejecución'},
        {val:'enproceso'    , label:'en proceso'},
        {val:'completado'   , label:'completado'},
        {val:'suspendido'   , label:'suspendido'},
        {val:'archivo'      , label:'archivado'}
    ],

    documexecutionOptionList: [
        {val:'no_definido'  , label:'Nivel de ejecución'},
        {val:'enproceso'    , label:'en proceso'},
        {val:'completado'   , label:'completado'},
        {val:'suspendido'   , label:'suspendido'},
        {val:'archivo'      , label:'archivado'}
    ],

    casosqcOptionList: [
        {val:'AAnodefinido',   label:'Seleccione tipo de hallazgo'},
        {val:'Aartefactos',    label:'A: Artefactos producidos por compresión / branding'},
        {val:'Adropanalogico', label:'A: Drop de video analógico'},
        {val:'Adropdigital',   label:'A: Drop de video digital'},
        {val:'Agraficaaccion', label:'A: Gráfica fuera del margen de seguridad de acción'},
        {val:'Agraficatexto',  label:'A: Gráfica fuera del margen de seguridad de texto'},
        {val:'Amoirealiasing', label:'A: Moire / Aliasing'},
        {val:'Anegrobloque',   label:'A: Negro entre bloques'},
        {val:'Apconvframes',   label:'A: Problemas de conversión (repite frames)'},
        {val:'Apconvgeneral',  label:'A: Problemas de conversión general'},
        {val:'Apedicionvideo', label:'A: Problemas de edición de video'},
        {val:'Apescaneo',      label:'A: Problemas de Escaneo'},
        {val:'Apfocoplano',    label:'A: Problemas de foco en plano'},
        {val:'Apposicionimg',  label:'A: Problemas de posición de imagen'},
        {val:'Approcesam',     label:'A: Problemas de procesamiento generales'},
        {val:'Apresolimagen',  label:'A: Problemas de resolución de imagen'},
        {val:'Avalexcedido',   label:'A: Valores de video/chroma/hue exceden margen legal'},
        {val:'Avarabruptacol', label:'A: Variación abrupta de corrección de color'},
        {val:'Bdsinccanales',  label:'B: Descincronización entre canales de audio'},
        {val:'Bdropanalogico', label:'B: Drop de audio analógico'},
        {val:'Bdropdigital',   label:'B: Drop de audio digital'},
        {val:'Bpedicionau',    label:'B: Problema de edición de audio'},
        {val:'Bpasigcanlau',   label:'B: Problemas en asiganción de canales de audio'},
        {val:'Bpmzclaruido',   label:'B: Problemas en mezcla (piso de ruido)'},
        {val:'Bpmzcladial',    label:'B: Problemas en mezcla / diálogos bajs (-200dB FS)'},
        {val:'Bpnivrelmzcla',  label:'B: Problemas en niveles relativos de mezcla'},
        {val:'Clipsync',       label:'C: Descincronización de diálogo (lip-sync)'},
        {val:'Dplacasinst',    label:'D: Placas institucionales no correspondientes'},
        {val:'Dplanoseg',      label:'D: Plano de seguridad faltante (TCA:xx:xx:xx//xx:xx:xx)'},
        {val:'Dplanosegerror', label:'D: Plano de seguridad no corresponde a capítulo'},
        {val:'Dportografia',   label:'D: Problemas en paquete gráfico (error ortográfico)'},
        {val:'Dptipografia',   label:'D: Problemas en paquete grafico (tipografía ilegible)'},
        {val:'Dsaltotc',       label:'D: Salto en Timecode continuo'},
    ],

    mediofisicoOptionList: [
        {val:'no_definido', label:'Medio fisico'},
        {val:'sopfisico'  , label:'Soporte fisico'},
        {val:'transfer'   , label:'Transferencia'},
    ],

    coberturaOptionList: [
        {val:'no_definido'  , label:'Región'},
        {val:'tda'          , label:'tda'},
        {val:'AMBA'         , label:'AMBA'},
        {val:'mesopotamia'  , label:'mesopotamia'},
        {val:'noroeste'     , label:'noroeste'},
        {val:'cuyo'         , label:'cuyo'},
        {val:'patagonia'    , label:'patagonia'},
        {val:'centro'       , label:'centro'},
    ],

    tipoemisOptionList: [
        {val:'no_definido', label:'Tipo de emisión'},
        {val:'tda'        , label:'TDA'},
        {val:'cable'      , label:'cable'},
        {val:'satelite'   , label:'satélite'},
        {val:'ott'        , label:'ott'},
     ],

    fuenteOptionList: [
        {val:'no_definido', label:'Fuente de información'},
        {val:'senial'     , label:'señal'},
        {val:'propia'     , label:'propia'},
        {val:'externo'    , label:'externo'},
     ],

    tipomovOptionList: [
        {val:'no_definido', label:'Tipo de movimiento'},
        {val:'recepcion'  , label:'RECEPCIÓN'},
        {val:'entrega'    , label:'ENTREGA'},
    ],

    estadoqcOptionList: [
        {val:'no_definido', label:'Estado del parte técnico'},
        {val:'enevaluacion', label:'EN EVALUACIÓN'},
        {val:'aprobado'    , label:'APROBADO'},
        {val:'aprobconobs' , label:'APROB C/OBSERVACIONES'},
        {val:'rechazado'   , label:'RECHAZADO'},
    ],

    tipoComprobanteOptionList: [
        {val:'no_definido'    , label:'tipo de comprobante'},
        {val:'ptecnico'       , label:'P/Técnico'},
        {val:'nrecepcion'     , label:'N/Recepción'},
        {val:'nentrega'       , label:'N/Entrega'},
        {val:'pemision'       , label:'P/Emisión'},
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
        {val:'no_definido'    , label:'Contenido'},
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
        {val:'no_definido'  , label:'Canal'},
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
        {val:'catalogo',     label:'catálogo'},
    ],

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

    tipoinstanciaOptionList:[
        {val:'no_definido',  label:'Ingrese opción'},
        {val:'video',        label:'video'},
        {val:'imagen',       label:'imagen'},
        {val:'audio',        label:'audio'},
        {val:'documento',    label:'documento'},
    ],
    rolinstanciasGroup: {
        no_definido:[
            {val:'no_definido'       , label:'Ingrese opción'},
        ],
        video: [
            {val:'masteraire'        , label:'Master Aire'},
            {val:'mastertextless'    , label:'Master Text-less'},
            {val:'matpromocion'      , label:'Material de promoción'},
            {val:'planosdeseguridad' , label:'Planos de seguridad'},
            {val:'capituloprueba'    , label:'Capitulos de prueba'},
            {val:'trailer'           , label:'trailer'},
            {val:'branding'          , label:'branding'},
        ],
        imagen: [
            {val:'grafica'           , label:'Gráfica'},
            {val:'matpromocion'      , label:'Material de promoción'},
        ],
        audio:[
            {val:'audio_principal'   , label:'audio principal'},
            {val:'audio_ambiente'    , label:'audio ambiente'},
            {val:'audio_descripcion' , label:'audio descripcion'},
        ],
        documento:[
            {val:'script'            , label:'script'},
        ]
    },

    nivelimportanciaOptionList:[
        {val:'bajo',    label:'bajo'},
        {val:'medio',   label:'medio'},
        {val:'alto',    label:'alto'},
        {val:'critico', label:'crítico'},
    ],

    estadoaltaOptionList:[
        {val:'activo',     label:'activo'},
        {val:'distribucion', label:'activo p/distribución'},
        {val:'suspendido', label:'suspendido'},
        {val:'cerrado',    label:'cerrado'},
        {val:'baja',       label:'baja'},
    ],

    videotecaOptionList:[
        {val:'fomInca2010',    label:'Fomento Inca 2010'},
        {val:'fomInca2011',    label:'Fomento Inca 2011'},
        {val:'cesInca',        label:'Fomento Inca Termin'},
        {val:'cesEncuentro', label:'Fomento Encuentro Termin'},
        {val:'coprodEncuentro', label:'Fomento Encuentro Coprod'},
        {val:'fomCIN',       label:'Fomento CIN'},
        {val:'polos',        label:'Polos audiov tecnológicos'},
        {val:'acuaf',        label:'Acua Federal'},
        {val:'acuam',        label:'Acua Mayor'},
        {val:'cda',          label:'CDA'},
        {val:'icultural',    label:'Igualdad Cultural'},
        {val:'cesiones',     label:'Cesiones recibidas'}, 
        {val:'adquisiciones',label:'Adquisiciones'},
        {val:'ppropia',      label:'Producción propia'},
        {val:'coproduccion', label:'Coproducción'},
        {val:'pademanda',    label:'Producción por demanda'},
        {val:'nocedida',     label:'No cedida'},
        {val:'vinstitucional',label:'Video Institucional'},
        {val:'promo',        label:'Mat Promociones'},
        {val:'branding',     label:'Mat Branding'},
        {val:'catalogo',     label:'Catálogo BACUA'},
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

    //pageneros:['animacion', 'biografia', 'curso', 'ficcion', 'docuficcion', 'documental', 'entretenimiento', 'entrevistas', 'telenovela', 'reality', 'recital', 'periodistico', 'noticiero',],
    generoOptionList:[
        {val:'animacion',    label:'Animación'},
        {val:'biografia',    label:'Biografía'},
        {val:'crossmedia',   label:'Crossmedia'},
        {val:'curso',        label:'Curso'},
        {val:'debate',       label:'Debate'},
        {val:'deportivo',    label:'Deportivo'},
        {val:'didactico',    label:'Didáctico'},
        {val:'docuficcion',  label:'Docuficción'},
        {val:'documental',   label:'Documental'},
        {val:'educativo',    label:'Educativo'},
        {val:'entretenimiento', label:'Entretenimiento'},
        {val:'entrevista',   label:'Entrevista'},
        {val:'experimental', label:'Experimental'},
        {val:'ficcion',      label:'Ficción'},
        {val:'infantil',     label:'Infantil'},
        {val:'informativo',  label:'Informativo'},
        {val:'musical',      label:'Musical'},
        {val:'noticiero',    label:'Noticiero'},
        {val:'periodistico', label:'Periodístico'},
        {val:'reality',      label:'Reality'},
        {val:'telenovela',   label:'Telenovela'},
        {val:'videoclip',    label:'Videoclip'},
        {val:'videoregistro',label:'Videoregistro'},
        {val:'crudos',       label:'Crudos'},
    ],

    //patematicas: ['artecultura','cienciaTecnologia','cienciasSociales','deporte','educacionTrabajo','historia','infancia','juventud','sociedad','ficcion'],
    tematicasOptionList:[
        {val:'nodefinido',   label:'Temáticas'},
        {val:'artecultura',  label:'Arte y cultura'},
        {val:'gastronomia',  label:'Gastronomía'},
        {val:'ecologia',     label:'Ecología'},
        {val:'educacion',    label:'Educación'},
        {val:'deporte',      label:'Deporte'},
        {val:'historia',     label:'Historia'},
        {val:'humor',        label:'Humor'},
        {val:'viajes',       label:'Viajes'},
        {val:'infancia',     label:'Infancia'},
        {val:'sociedad',     label:'Sociedad'},
        {val:'cienciaTecnologia', label:'Ciencia y Tecnología'},
        {val:'cienciasSociales',  label:'Ciencias Sociales'},
    ],
/* 
   pasubtematica: {
        artecultura: ['musica', 'plastica', 'fotografia', 'arteDigital', 'video', 'teatro', 'animacion', 'otros' ],
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
*/
    subtematicasOptionList:{        
        artecultura:[
            {val:'nodefinido',     label:'No definido'},
            {val:'literatura',     label:'Literatura'},
            {val:'musica',         label:'Música'},
            {val:'plastica',       label:'Plástica'},
            {val:'arquitectura',   label:'Arquitectura'},
            {val:'disenio',        label:'Diseño'},
            {val:'danza',          label:'Danza'},
            {val:'areadigital',    label:'Área digital'},
            {val:'fotografia',     label:'Fotografía'},
            {val:'cinematografia', label:'Cinematografía'},
            {val:'video',          label:'Video'},
            {val:'teatro',         label:'Teatro'},
            {val:'animacion',      label:'Animación'},
            {val:'historieta',     label:'Historieta'},
            {val:'artesvisuales',  label:'Artesvisuales'},
            {val:'ocio',           label:'Ocio'},
            {val:'religion',       label:'Religión'},
            {val:'museos',         label:'Museos'},
            {val:'artesescenicas', label:'Artes escénicas'},
        ],
        gastronomia:[
            {val:'nodefinido',     label:'No definido'},
            {val:'cocina',  label:'Cocina'},
            {val:'recetas', label:'Recetas'},
        ],
        ecologia:[
            {val:'nodefinido',     label:'No definido'},
            {val:'medioambiente',        label:'Medio ambiente'},
            {val:'polucion',             label:'Polución'},
            {val:'recursosnaturales',    label:'Recursos naturales'},
            {val:'energiasalternativas', label:'Energías alternativas'},
        ],
        educacion:[
            {val:'nodefinido',     label:'No definido'},
            {val:'edudistancia',   label:'Educ a distancia'},
            {val:'edurural',       label:'Educ rural'},
            {val:'edusexual',      label:'Educ sexual'},
            {val:'edutecnica',     label:'Educ técnica'},
            {val:'eduvial',        label:'Educ vial'},
            {val:'seguridadsalud', label:'Seguridad y salud'},
            {val:'primauxilios',   label:'Primeros auxilios'},
            {val:'aprendizaje',    label:'Aprendizaje'},
            {val:'oficios',        label:'Oficios'},
            {val:'escuelas',       label:'Escuelas'},
            {val:'debateeducativo',label:'Debate Educativo'},
            {val:'politicaeducativa',label:'Política Educativa'},
            {val:'ensenyformacion',label:'Enseñanza y Formación'},
            {val:'idiomas',        label:'Idiomas'},
        ],
        deporte:[
            {val:'nodefinido',     label:'No definido'},
            {val:'historiadep',    label:'Historia del deporte'},
            {val:'actualdep',      label:'Actualidad deportiva'},
            {val:'depamateur',     label:'Deporte amateur'},
            {val:'depprofesional', label:'Deporte profesional'},
        ],
        historia:[
            {val:'nodefinido',     label:'No definido'},
            {val:'biografias', label:'Biografías'},
            {val:'huniversal', label:'Historia universal'},
            {val:'hlatinoamericana', label:'Historia latinoamericana'},
            {val:'hargentina', label:'Historia argentina'},
            {val:'hpolitica',  label:'Historia política'},
            {val:'heconomica', label:'Historia económica'},
        ],
        humor:[
            {val:'nodefinido',     label:'No definido'},
            {val:'humoristico', label:'Humorístico'},
        ],
        viajes:[
            {val:'nodefinido',     label:'No definido'},
            {val:'turismo', label:'Turismo'},
        ],
        infancia:[
            {val:'nodefinido',     label:'No definido'},
            {val:'pedagogia',  label:'Pedagogía'},
            {val:'recreacion', label:'Recreación'},
            {val:'curricula',  label:'Currícula'},
        ],
        sociedad:[
            {val:'nodefinido',     label:'No definido'},
            {val:'derhumanos', label:'Derechos humanos'},
            {val:'familia',    label:'Familia'},
            {val:'respsocial', label:'Responsabilidad Social'},
            {val:'salud',      label:'Salud'},
            {val:'inclusion',  label:'Inclusión'},
            {val:'genero',     label:'Género'},
            {val:'etnicas',    label:'Cuestiones Étnicas'},
            {val:'relinternacionales', label:'Rel Internacionales'},
            {val:'bienestar',  label:'Acción Social - Bienestar'},
            {val:'gobierno',   label:'Gobierno'},
            {val:'vcotidiana', label:'Vida Cotidiana'},
        ],
        cienciaTecnologia:[
            {val:'nodefinido',     label:'No definido'},
            {val:'astronomia',    label:'Astronomía'},
            {val:'fisica',        label:'Física'},
            {val:'matematicas',   label:'Matemática'},
            {val:'estadistica',   label:'Estadística'},
            {val:'quimica',       label:'Química'},
            {val:'tecnologia',    label:'Tecnología'},
            {val:'tic',           label:'Tecnol Inform y Comunicación'},
            {val:'innovacion',    label:'Innovación'},
            {val:'nuevastecnol',  label:'Nuevas tecnologías'},
            {val:'ciencia',       label:'Ciencia'},
            {val:'cientierra',    label:'Cs de la tierra'},
            {val:'ciennaturales', label:'Cs Naturales'},
            {val:'cienmedicas',   label:'Cs Médicas'},
            {val:'cienambientales', label:'Cs Ambientales'},
            {val:'meteorologia',  label:'Meteorología'},
            {val:'catastrofes',   label:'Catástrofes'},
            {val:'biologia',      label:'Biología'},
            {val:'geologia',      label:'Geología'},
            {val:'ingenieria',    label:'Ingeniería'},
            {val:'industria',     label:'Industria'},
            {val:'agricultura',   label:'Agricultura'},
        ],
        cienciasSociales:[
            {val:'nodefinido',     label:'No definido'},
            {val:'derecho',      label:'Derecho'},
            {val:'antropologia', label:'Antropología'},
            {val:'cieninformacion', label:'Cs de la Información'},
            {val:'filosofia',    label:'Filosofía'},
            {val:'comunicacion', label:'Comunicación'},
            {val:'medios',       label:'Medios'},
            {val:'sociologia',   label:'Sociología'},
            {val:'economia',     label:'Economía'},
            {val:'psicologia',   label:'Psicología'},
            {val:'geografia',    label:'Geografía'},
            {val:'oceanografia', label:'Oceanografía'},
            {val:'politica',     label:'Política'},
            {val:'arqueologia',  label:'Arqueología'},
        ],
    },

    //paformatos:['serie', 'serie-programas', 'unitario', 'videoclip', 'promo', 'miniserie', 'micro', 'micro-recital', 'cortometraje', 'largometraje', 'backstage','trailer',  'noticiero', 'periodistico', 'especial', ],
    formatoOptionList:[
        {val:'serie',         label:'Serie'},
        {val:'unitario',      label:'Unitario'},
        {val:'cortometraje',  label:'Cortometraje'},
        {val:'largometraje',  label:'Largometraje'},
        {val:'micro',         label:'Micro'},
        {val:'backstage',     label:'Backstage'},
        {val:'promo',         label:'Promo'},
        {val:'recital',       label:'Recital'},
        {val:'videoclip',     label:'Videoclip'},
        {val:'videoregistro', label:'Videoregistro'},
    ],
    //etarios:['infantil', 'jovenes','adolescentes', 'adulto', 'mayores',],
    etarioOptionList:[
        {val:'infantil',     label:'Infantil'},
        {val:'jovenes',      label:'Jóvenes'},
        {val:'adolescentes', label:'Adolescentes'},
        {val:'adulto',       label:'Adultos'},
        {val:'mayores',      label:'Tercera edad'},
        {val:'general',      label:'Público en general'},
        {val:'soloadultos',  label:'Sólo adultos'},
    ],

    dayweek:[ 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],

    hourOptionList:[
        {val:'horario', label:'Horario emisión'},
        {val:'noem', label:'No se emite'},
        {val:'04:00', label:'04:00'},
        {val:'04:30', label:'04:30'},
        {val:'05:00', label:'05:00'},
        {val:'05:30', label:'05:30'},
        {val:'06:00', label:'06:00'},
        {val:'06:30', label:'06:30'},
        {val:'07:00', label:'07:00'},
        {val:'07:30', label:'07:30'},
        {val:'08:00', label:'08:00'},
        {val:'08:30', label:'08:30'},
        {val:'09:00', label:'09:00'},
        {val:'09:30', label:'09:30'},
        {val:'10:00', label:'10:00'},
        {val:'10:30', label:'10:30'},
        {val:'11:00', label:'11:00'},
        {val:'11:30', label:'11:30'},
        {val:'12:00', label:'12:00'},
        {val:'12:30', label:'12:30'},
        {val:'13:00', label:'13:00'},
        {val:'13:30', label:'13:30'},
        {val:'14:00', label:'14:00'},
        {val:'14:30', label:'14:30'},
        {val:'15:00', label:'15:00'},
        {val:'15:30', label:'15:30'},
        {val:'16:00', label:'16:00'},
        {val:'16:30', label:'16:30'},
        {val:'17:00', label:'17:00'},
        {val:'17:30', label:'17:30'},
        {val:'18:00', label:'18:00'},
        {val:'18:30', label:'18:30'},
        {val:'19:00', label:'19:00'},
        {val:'19:30', label:'19:30'},
        {val:'20:00', label:'20:00'},
        {val:'20:30', label:'20:30'},
        {val:'21:00', label:'21:00'},
        {val:'21:30', label:'21:30'},
        {val:'22:00', label:'22:00'},
        {val:'22:30', label:'22:30'},
        {val:'23:00', label:'23:00'},
        {val:'23:30', label:'23:30'},
        {val:'00:00', label:'00:00'},
        {val:'00:30', label:'00:30'},
        {val:'01:00', label:'01:00'},
        {val:'01:30', label:'01:30'},
        {val:'02:00', label:'02:00'},
        {val:'02:30', label:'02:30'},
        {val:'03:00', label:'03:00'},
        {val:'03:30', label:'03:30'},
    ],

    validateInstance: function(pr){
        // true if tipoproducto es una INSTANCIA 
        var isInstance = false;
        isInstance = _.find(this.tipoinstanciaOptionList, function(data){
            return data.val === pr.get('tipoproducto');
        })
        return isInstance;
    },

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
        {id:2, tt:'th', flag:1, tclass:'col2', tmpl: 'template1', val:'fecomp',        label:'fecha'},
        {id:3, tt:'th', flag:0, tclass:'col2', tmpl: 'template1', val:'fechagestion',  label:'fecha'},
        {id:4, tt:'th', flag:1, tclass:'col3', tmpl: 'template1', val:'tipocomp',      label:'tipo'},
        {id:5, tt:'th', flag:1, tclass:'col4', tmpl: 'template1', val:'persona',       label:'persona'},
        {id:6, tt:'th', flag:0, tclass:'col5', tmpl: 'template1', val:'product',       label:'producto'},
        {id:7, tt:'th', flag:0, tclass:'col6', tmpl: 'template1', val:'tcomputo',      label:'tiempo'},
        {id:8, tt:'th', flag:1, tclass:'col7', tmpl: 'template1', val:'slug',          label:'asunto'},
        {id:9, tt:'th', flag:1, tclass:'col8', tmpl: 'template5', val:'acciones',      label:'acciones'}
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
        template4 : _.template("<td name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tedit' title='no implementado aun'><i class='icon-edit'></i></button><button class='btn-link tzoom' title='ver entidades relacionadas' ><i class='icon-zoom-in'></i></button></td>"),
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
            tprText: {no_definido:' ', paudiovisual:'PA', micro:'Micro', promo:'Promo', imagen:'Img', curaduria:'Cur', catalogo: 'Cat'},
            eventFillColor: {no_definido:'lime',bajo:'green',medio:'blue',alto:'magenta',critico:'red'},
            fillOpacity:{no_definido:.1,planificado:.3,gestion:.6,recibido:.8,ingestado:.9,controlado:.9,aprobado:1,observado:1,archivado:1}
        },
        project: { eventText: {no_definido:' ',concurso: 'Conc',convenio: 'Cnv', cesiones: 'Ces', 
                    producciones: 'Pro', adhesiones:'Adh',produccion:'Pro',cesion:'Ces', infantil:'Inf', 
                    musica:'Mus', teatro:'Tea', musical:'Tmu',
                    circo:'Cir',cine:'Cin',festival:'Fes',fpopular:'FPo', danza:'Dza',congreso:'Con'
            },
            eventFillColor: {no_definido:'lime',bajo:'green',medio:'blue',alto:'magenta',critico:'red'},
            ispropioText: {'1':'BACUA','0':'Ax'},
            fillOpacity:{no_definido:1,planificado:.4,produccion:1,posproduccion:.7,demorado:.4,reprogramado:.4,suspendido:.1,cumplido:.1},
        },
        resourcelist:[]
    },

    inspect: function  (target, deep, whoami,maxdeep) {
        //console.log('inspect usage: inspect(target, initial_deep, whoami, maxdeep');
        //console.log('    suggested: inspect(oo, 0, myname,3');
        var deep = deep+=1 || 1;
        var stop = maxdeep|| 3;
        var self = this;
        console.log('[%s]:inspect CALLED: key to inspect:[%s]: object:[%s]',deep, whoami, target);
        _.each(target, function(value, key){
            console.log('[%s]:inspecting each: [%s]: [%s] ',deep, key,value);
            if( (_.isObject(value) && !_.isFunction(value)) && deep<stop ){
                //if(key==='fields'||key==='contenido'||key==='subtematica'||key==='editor'||key==='nestedForm'||key==='rolinstancia'||key==='tipoproducto'){
                //if(key==='fields'||key==='contenido'||key==='subtematica'||key==='editor'||key==='nestedForm'||key==='rolinstancia'||key==='tipoproducto'||key==='tematica'){
                if(true){
                    self.inspect(value, deep,key, maxdeep);
                }
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

    parseTC: function(str){
        var frames = 25;
        var tc = ["00","00","00","00"];
        var offset = 0;
        if(!str) return tc;

        var tokens = str.split(":");
        if(tokens.length===1){
            if(str.length===2) str="00"+str+"0000";
            if(str.length===4) str="00"+str+"00";
            if(str.length===6) str="00"+str;
            if(str.length!==8) return tc;
            for(var i=0; i<8; i=i+2) tc[i/2] = str.substr(i,2);
            return tc.join(":");
        }else{
            if(tokens.length>4) return tc;
            if(tokens.length<4) offset=1;
            for(var j=0;j<tokens.length;j+=1) tc[j+offset]=("00"+tokens[j]).substr(-2);
        }
        return tc.join(':');
    },

    validateTC: function(t){
        var error = false;
        var divisor = [99, 60, 60, 25];
        var tc = t.split(":");
        for (var i = 0 ; i< tc.length;i+=1 ){
            if(isNaN(tc[i])) return error;
            var n= parseInt(tc[i],10);
            if(isNaN(n)) return error;
            if(n % 1) return error;
            if((n / divisor[i])>=1) return error;
            if(n<0) return error;
        }
        return true;
    },

/*
    parseTC: function(str){
          var frames = 25;
          var tc = [0,0,0,0];
          if(!str) return "00:00:00:00";
          //var tokens = str.split(/(?:(\:))/gm);
          var tokens = str.split(":");
          if(tokens.length===1){
            tc[1]=parseInt(tokens[0],10);

          }
          if(tokens.length===2){
            tc[1]=parseInt(tokens[0],10);
            tc[2]=parseInt(tokens[1],10);

          }
          if(tokens.length===3){
            tc[1]=parseInt(tokens[0],10);
            tc[2]=parseInt(tokens[1],10);
            tc[3]=parseInt(tokens[2],10);
          }
          if(tokens.length===4){
            tc[0]=parseInt(tokens[0],10);
            tc[1]=parseInt(tokens[1],10);
            tc[2]=parseInt(tokens[2],10);
            tc[3]=parseInt(tokens[3],10);
          }
          if((tc[3]/frames)>1){
            tc[2] += Math.floor(tc[3]/frames);
            tc[3] = tc[3] % frames;
          }
           
          return this.normalizeTC(tc).join(':');
    },

    normalizeTC : function(tc){
          var divisor = 60;
      for (var i = tc.length-2; i>0;i-=1 ){
        if((tc[i]/divisor)>1){
          tc[i-1] += Math.floor(tc[i]/divisor);
          tc[i] = tc[i] % divisor;
        }
        
      }
      return tc;
    },

*/

    buildDateNum: function(str){
        return this.parseDateStr(str).getTime();
    },

    buildDate: function(str){
        return this.parseDateStr(str);
    },

    dateToStr: function(date) {
        var da = date.getDate();
        var mo = date.getMonth()+1;
        var ye = date.getFullYear();
        return da+"/"+mo+"/"+ye;
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