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
            var key = view.split('/').pop();
            if (window[key]) {
                //$.get restorna un 'deferred'
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    window[key].prototype.template = _.template(data);
                }));
            } else {
                //console.log('WARINING: Marionette template. tpl/' + view + '.html' + " not FOUND!!");
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    self.templates[key] = _.template(data);
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
        console.log('f[%s] [%s]','#' + field,message)
        var controlGroup = $('#' + field).parent();
        controlGroup.addClass('has-error');
        $('.help-block', controlGroup).html(message);
    },

    removeValidationError: function (field) {
        var controlGroup = $('#' + field).parent();
        controlGroup.removeClass('has-error');
        $('.help-block', controlGroup).html('');
    },

    showAlert: function(title, text, klass) {
        var $alert = $('.alert').first();
        $alert.first().removeClass("alert-error alert-warning alert-success alert-info");
        $alert.first().addClass(klass);
        $alert.html('<strong>' + title + '</strong> ' + text);
        $alert.show();
    },

    hideAlert: function() {
        $('.alert').first().hide();
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
    retrieveNodesFromAreas: function(areas){
        var nodes = [],
            node;
        _.each(areas, function(area){
            var node = utils.fetchNode(utils.actionAreasOptionList, area);
            if(_.indexOf(nodes, node) === -1) nodes.push(node);
        });
        return nodes;
    },


    getUrgenciaButtonType: function(cumplido, prioridad, estado){
        if(cumplido) return 'disabled';
        if(estado==='noaplica'|| estado === 'ok' || estado === 'failed') return 'disabled';

        return this.urgenciaButtonType[prioridad];
    },

    fetchListKey:function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        return node;
    },
    fetchLabel:function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.label: key;
    },
    fetchClass:function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.classattr: "";
    },

    fetchNode:function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.nodo : "";
    },

    fetchPresuprog:function(key){
        var list = utils.actionAreasOptionList;
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.presuprog : "";
    },

    fetchPresuinciso:function(key){
        var list = utils.tipoBudgetMovimList;
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.presuinciso : "";
    },

    fetchAdminRequestTemplate:function(key){
        var list = utils.tipoBudgetMovimList;
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.template : "";
    },

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
        });
        return optionStr;
    },

    buildMultiSelectOptions: function(varname, data, actualvalue){
        var template = _.template("<option value='<%= val %>' <%= selected %> ><%= label %></option>");
        var optionStr = '';
        _.each(data,function(element, index, list){
            if(actualvalue.indexOf(element.val) !== -1 ){
                element.selected = 'selected';
                optionStr += template(element);
            }
        });
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


    buildTableHeader: function(data){
        var template1 = _.template("<<%= tt %> data-name='<%= val %>' class='<%= tclass %> js-sortcolumn' ><button name='<%= val %>' type='button' class='btn btn-link btn-xs'><%= label %> <span class='glyphicon glyphicon-sort-by-attributes'></span></button></<%= tt %> >");
        var template2 = _.template("<<%= tt %> data-name='<%= val %>' class='<%= tclass %>' ><%= label %></<%= tt %> >");
        var tabledata = '';
        _.each(data,function(element, index, list){
            if(element.flag){
                if(element.tclass === 'order' || element.tclass === 'actions') tabledata += template2(element);
                else tabledata += template1(element);
            }
        });
        //console.log('<thead><tr>'+tabledata+'</tr></thead>');
        return '<thead><tr>'+tabledata+'</tr></thead>';
    },

    buildTableRowTemplates:{
        template1 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><%= value %></td>"),
        template2 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><input name=tselect type=checkbox class=tselect ></td>"),
        template3 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tlink' title='editar item'><%= value %></button></td>"),
        template4 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tedit' title='no implementado aun'><span class='glyphicon glyphicon-edit'></span></button><button class='btn-link tzoom' title='ver entidades relacionadas' ><span class='glyphicon glyphicon-zoom-in'></span></button></button></td>"),
        template6 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-show' title='explorar   '><%= value %></button></td>"),
        template7 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><span class='pull-right'><%= value %></span></td>"),
        //template7 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-show' title='editar item'><%= value %></button></td>"),
        template5 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-edit'  title='editar'><span class='glyphicon glyphicon-edit'></span></button><button class='btn-link js-zoom' title='entidades relacionadas' ><span class='glyphicon glyphicon-zoom-in'></span></button></td>"),
        template8 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-edit'  title='editar'><span class='glyphicon glyphicon-edit'></span></button><button class='btn-link js-budget'  title='presupuesto y tramitaciones'><span class='glyphicon glyphicon-list-alt'></span></button> <button class='btn-link js-participants'  title='editar participantes'><span class='glyphicon glyphicon-user'></span></button><button class='btn-link js-locations'  title='editar locaciones'><span class='glyphicon glyphicon-screenshot'></span></button><button class='btn-link js-newartactivity' title='Agregar actividad artística'><i class='glyphicon glyphicon-plus-sign'></i></button><button class='btn-link js-showartactivity' title='Ver actividades artísticas'><i class='glyphicon glyphicon-star'></i></button></td>"),
        template9 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-trash' title='observar'><span class='glyphicon glyphicon-ok'></span></button></td>"),
        template10 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' > <button class='btn-link js-edit' title='editar'><span class='glyphicon glyphicon-edit'></span></button> <button class='btn-link js-trash' title='eliminar'><span class='glyphicon glyphicon-remove'></span></button></td>"),
        templatea : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link js-edit'  title='editar  '><%= value %></button></td>"),
        //template3 : _.template("<td data-name='<%= val %>' class='<%= tclass %>' ><button class='btn-link tlink'   title='editar item'><%= value %></button></td>"),
    },

    buildTableRow: function(data,model){
        var self = this;
        var tabledata = '';
        _.each(data,function(element, index, list){
            //console.log('******* 2 *********');
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
            //console.log('******* 3 *********');
          if(data.flag){
            data.value = '<%= '+data.val+' %>';
            if(data.tmpl === 'template7'){
                data.value = '<%= accounting.formatNumber('+data.val+') %>';
            }
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
        //add sol
        sol: {
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

        request: { eventText: {no_definido:' ',solicitud:'SOLICITUDES TÉCNICO ARTÍSTICAS',concurso: 'Conc',convenio: 'Cnv', cesiones: 'Ces', 
                    producciones: 'Pro', adhesiones:'Adh',produccion:'Pro',cesion:'Ces', infantil:'Inf', 
                    musica:'Mus', teatro:'Tea', musical:'Tmu',
                    circo:'Cir',cine:'Cin',festival:'Fes',fpopular:'FPo', danza:'Dza',congreso:'Con'
            },
            eventFillColor: {no_definido:'lime',bajo:'green',medio:'blue',alto:'magenta',critico:'red'},
            ispropioText: {'1':'MCN','0':'Ax'},
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
        if(!str) return tc.join(":");

        var tokens = str.split(":");
        if(tokens.length===1){
            if(str.length===2) str="00"+str+"0000";
            if(str.length===4) str="00"+str+"00";
            if(str.length===6) str="00"+str;
            if(str.length!==8) return tc.join(":");
            for(var i=0; i<8; i=i+2) tc[i/2] = str.substr(i,2);
            return utils.validateTC(tc);
        }else{
            if(tokens.length>4) return tc.join(":");
            if(tokens.length<4) offset=1;
            for(var j=0;j<tokens.length;j+=1) tc[j+offset]=("00"+tokens[j]).substr(-2);
            return utils.validateTC(tc);
        }
        return tc.join(':');
    },

    validateTC: function(tc){
        var error = "00:00:00:00";
        var divisor = [99, 60, 60, 25];
        //var tc = t.split(":");
        for (var i = 0 ; i< tc.length;i+=1 ){
            if(isNaN(tc[i])) return error;
            var n= parseInt(tc[i],10);
            if(isNaN(n)) return error;
            if(n % 1) return error;
            if((n / divisor[i])>=1) return error;
            if(n<0) return error;
        }
        return tc.join(":");
    },
    tc2Minutes: function(tc){
        var min = 0,
            tokens = tc.split(":");
        if(tokens.length===1){
            min =  this.valint(tc);
        } else if(tokens.length === 2){
            min = this.valint(tokens[0]) + ((this.valint(tokens[1]) > 30) ? 1 : 0);
        } else if(tokens.length === 3){
            min = this.valint(tokens[0]) + ((this.valint(tokens[1]) > 30) ? 1 : 0);
        } else if(tokens.length === 4){
            min = this.valint(tokens[0]) * 60 + this.valint(tokens[1]) + ((this.valint(tokens[2]) > 30) ? 1 : 0);
        }
        return min;
    },
    min2TC: function(min){
        var tokens = [0,0,0,0],
            val = this.valint(min);

        tokens[1] = val % 60;
        tokens[0] = Math.floor(val / 60);
        return tokens.join(":");
    },

    addTC: function(memo, val){
        var acum = this.tc2Minutes(memo) + this.tc2Minutes(val);
        return this.min2TC(acum);
    },

    valint: function (s){
        var n = 0;
        if(parseInt(s,10) !== NaN) n = parseInt(s,10);
        return n;
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
    es_cutoff : {
        "á" : "a",
        "Á" : "A",
        "é" : "e",
        "É" : "E",
        "í" : "i",
        "Í" : "I",
        "ó" : "o",
        "Ó" : "O",
        "ú" : "u",
        "Ú" : "U",
        "ñ" : "n"
    },

    fstr : function(strinput){
        var self = this,
            str = strinput;
        str = str.split(' ').join('_');
        str = str.replace(/[áÁéÉíÍóÓúÚñ]/g,function(c) { return self.es_cutoff[c]; });
        return str;
    },

    buildDateNum: function(str){
        console.log('buildDateNUM BEGIN [%s]',str)
        return this.parseDateStr(str).getTime();
    },

    buildDate: function(str){
        console.log('buildDate BEGIN [%s]',str)
        return this.parseDateStr(str);
    },

    dateToStr: function(date) {
        return ('00' + date.getDate()).substr(-2) + "/" + ('00' + (date.getMonth()+1)).substr(-2) + "/" + date.getFullYear();
    },  
		
	dateTimeToStr: function(date) {
        var da = date.getDate();
        var mo = date.getMonth()+1;
        var ye = date.getFullYear();
        var hh = date.getHours();
        var mm = date.getMinutes();
        var ss = date.getSeconds();
        return da+"/"+mo+"/"+ye+":"+hh+":"+mm+":"+ss;
    },

    addOffsetDay: function(numdate, offset){
        var fe = {};
        var date = new Date(numdate);
        var da = date.getDate()+offset;

        var ndate = new Date(date.getFullYear(), date.getMonth(), da, 0,0,0);
        fe.date = utils.dateToStr(ndate);
        fe.tc = ndate.getTime();
        
        return fe;
    },

    parseDateStr: function(str) {
    console.log('parseDate BEGIN [%s]',str)

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
    },
    
    mergeDateTime: function(date,time){
      if(date && time && date instanceof Date && time instanceof Date){
        return new Date(date.toString().replace(/(\d\d:){2}\d{2}/,/(\d\d:){2}\d{2}/.exec(time.toString())[0]));
      }
      return null;
    },
    
    parseQueryString: function( queryString ) {
      var params = {}, queries, temp, i, l;
      queries = queryString.split("&");
      for ( i = 0, l = queries.length; i < l; i++ ) {
          temp = queries[i].split('=');
          params[temp[0]] = temp[1];
      }
      return params;
  }
};

(function(){
  String.prototype.replaceLatinChar = function(){
   return output = this.replace(/á|é|í|ó|ú|ñ|ä|ë|ï|ö|ü/ig,function (str,offset,s) {
          var str =str=="á"?"a":str=="é"?"e":str=="í"?"i":str=="ó"?"o":str=="ú"?"u":str=="ñ"?"n":str;
         str =str=="Á"?"A":str=="É"?"E":str=="Í"?"I":str=="Ó"?"O":str=="Ú"?"U":str=="Ñ"?"N":str;
         str =str=="Á"?"A":str=="É"?"E":str=="Í"?"I":str=="Ó"?"O":str=="Ú"?"U":str=="Ñ"?"N":str;
         str =str=="ä"?"a":str=="ë"?"e":str=="ï"?"i":str=="ö"?"o":str=="ü"?"u":str;
         str =str=="Ä"?"A":str=="Ë"?"E":str=="Ï"?"I":str=="Ö"?"O":str=="Ü"?"U":str;
          return (str);
     });
  };
})();
