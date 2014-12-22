 /*!
  * UTILS: Imports Actions from CSV to actions and budgets colecctions.
 */
var csv = require("ya-csv");

var organizaciones = [];

var express = require('express');
var path = require('path');
var http = require('http');
var fs = require('fs');
var _ = require('underscore');

var acciones = []
var accion;

var coreApp  = __dirname + '/core';

var env = process.env.NODE_APP_MODE || 'development'
var config = require(coreApp + '/config/config')[env];

var mongodb = require(coreApp + '/config/dbconnect');
mongodb.connect(config);
var rootPath = config.root;
var utils = require(rootPath + '/core/util/utils');

     // action (acciones) routes
var budget = require(rootPath + '/calendar/controllers/budgets');
var action = require(rootPath + '/calendar/controllers/actions');

var initBeforeCreateAction = function(data){
      var fealta = new Date(),
          fecomp = utils.dateToStr(fealta),
          feultmod = fealta;

      data.fealta = fealta.getTime();
      data.fecomp = fecomp;
      data.feultmod = feultmod;
      data.nodo = fetchNode(actionAreasOptionList, data.area);
      data.nivel_importancia = 'media';
};

var actionAreasOptionList = [
        {val: 'CASAS'       ,nodo:'UM'      , label:'CASAS'},
        {val: 'CCNK'        ,nodo:'UM'      , label:'Centro Cultural Nestor Kirchner'},
        {val: 'CCV21'       ,nodo:'SPSC'    , label:'Centro Cultural Villa 21'},
        {val: 'CCV31'       ,nodo:'SPSC'    , label:'Centro Cultural Villa 31'},
        {val: 'DGA'         ,nodo:'SCCG'    , label:'DG de Administración (DGA)'},
        {val: 'DJG'         ,nodo:'SCCG'    , label:'DG de Jurídicos (DGJ)'},
        {val: 'DGTS'        ,nodo:'SCCG'    , label:'DG de Tecnología y Sistemas (DGTS)'},
        {val: 'DNAF'        ,nodo:'SPSC'    , label:'DN de Acción Federal'},
        {val: 'DNA'         ,nodo:'SGC'     , label:'DN de Artes'},
        {val: 'DPD'         ,nodo:'UM'      , label:'DI de Prensa'},
        {val: 'DNIC'        ,nodo:'SPSC'    , label:'DN de Industrias Culturales'},
        {val: 'DNPOP'       ,nodo:'SPSC'    , label:'DN de Participación y Organización Popular'},
        {val: 'DNPM'        ,nodo:'SGC'     , label:'DN de Patrimonio y Museos'},
        {val: 'DNPAL'       ,nodo:'SCEPN'   , label:'DN de Pensamiento Argentino y Latinoamericano'},
        {val: 'DNPA'        ,nodo:'UM'      , label:'DN de Planificación y Articulación'},
        {val: 'DNPCCI'      ,nodo:'SGC'     , label:'DN de Políticas Culturales y Cooperación Internacional'},
        {val: 'DNPDCDC'     ,nodo:'SPSC'    , label:'DN de Promoción de los Derechos Culturales y Diversidad Cultural'},
        {val: 'MUSEOS'      ,nodo:'SGC'     , label:'MUSEOS'},
        {val: 'ORGANISMOS'  ,nodo:'UM'      , label:'ORGANISMOS'},
        {val: 'PNIC'        ,nodo:'UM'      , label:'PN Igualdad Cultural'},
        {val: 'SCCG'        ,nodo:'UM'      , label:'SCCG'},
        {val: 'SCEPN'       ,nodo:'UM'      , label:'SCEPN'},
        {val: 'SGC'         ,nodo:'UM'      , label:'SGC'},
        {val: 'SPSC'        ,nodo:'UM'      , label:'SPSC'},
        {val: 'SSPDCPP'     ,nodo:'SPSC'    , label:'SSPDCPP'},
        {val: 'UM'          ,nodo:'UM'      , label:'UM'},
    ];


var fetchNode = function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.nodo : "";
};






function processFile(db){
  setTimeout(function(){
    console.log("Execution for processFile[%s] [%s]", db, arguments.length); 

var reader = csv.createCsvStreamReader(process.openStdin(), {
  columnsFromHeader : true,
  separator:'	',
  quote: '',
});


reader.addListener("data", function(row) {

  //console.log('begins process listener [%s]', row);
  
  if (row["taccion"]) { // skip empty lines
   
    var accion = {
      "tregistro":   'accion',
      "taccion":     row["taccion"],
      "slug":        row["slug"],
      "feaccion":    row["feaccion"],
      "nivel_ejecucion" : row["nivel_ejecucion"],
      "estado_alta": row["estado_alta"],
      "contraparte": row["contraparte"],
      "description": row["description"],
      "requirente":  row["Requirente"],
      "objetivo":    row["objetivo"],
      "planprod":    row["planprod"],
      "lineaaccion": row["lineaaccion"],
      "area":        row["area"],
      "loadtime": 'import-2014-12-18-01'
    };

    initBeforeCreateAction(accion);
    action.importNewAction(accion, function(result){

      console.dir(result);
      
      var dbaction = result.model;

      if(dbaction){
        var presupuesto = {
            owner_id: dbaction['_id'].toString(),
            owner_type: 'action',
            program_cnumber: dbaction.cnumber,
            tipomov: 'presupuesto',
            slug: dbaction.slug,
            nodo: dbaction.nodo,
            area: dbaction.area,
            parent_cnumber: dbaction.cnumber,
            parent_slug: dbaction.slug,

            fecha_prev: '01/01/2015',
            anio_fiscal: '2015',
            trim_fiscal: '1',

            tramita: 'MCN',
            origenpresu: 'MCN',
            presuprog: '',
            presuinciso: '',

            tgasto: 'global',
            cantidad: '1',
            punit: '1',
            importe: row["Monto"],
            ume: "global",
            coldh: '0',
            analitica: '',

            nivel_ejecucion: "enevaluacion",
            estado_alta: dbaction.estado_alta,
            nivel_importancia: dbaction.nivel_importancia,
            descriptores: '',
            useralta: '',
            fealta: dbaction.fealta,
            feultmod: dbaction.feultmod,
            loadtime: 'import-2014-12-18-01',
        };

        budget.importNewBudget(presupuesto, function(result){
	        //console.log('1.2. BUDGET Alta concretada de PRESUPUESTO:[%s][%s][%s]', arguments.length, result, result.model);
          var dbbudget = result.model;
          if(dbbudget){
	            console.log('1.2. BUDGET Alta concretada de PRESUPUESTO:[%s]', dbbudget.cnumber);
          }
        });
      }
    });

    acciones.push(accion);
  }
});



// print our data to the console at the end
reader.addListener("end", function(row) {
  //console.log(JSON.stringify(acciones));

});


 
  }, 1500);
}


processFile('ALGO');





