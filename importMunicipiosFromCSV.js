 /*!
  * UTILS: Imports Persons from CSV to persons colecctions.
 */
var csv = require("ya-csv");

var express = require('express');
var path = require('path');
var http = require('http');
var fs = require('fs');
var _ = require('underscore');

var personas = []

var coreApp  = __dirname + '/core';

var env = process.env.NODE_APP_MODE || 'development'
var config = require(coreApp + '/config/config')[env];

var mongodb = require(coreApp + '/config/dbconnect');
mongodb.connect(config);
var rootPath = config.root;
var utils = require(rootPath + '/core/util/utils');

var person = require(rootPath + '/calendar/controllers/persons');

var initBeforeCreatePerson = function(data){
      var fealta = new Date(),
          feultmod = fealta;

      data.fealta = fealta.getTime();
      data.feultmod = feultmod;
};


console.log('Process INIT')

function processFile(db){
  setTimeout(function(){
    console.log("Execution for processFile[%s] ", db); 

//===== TODO SE EJECUTA DENTRO DE UN SET-TIMEOUT PARA DAR TIEMPO A LA INICIALIZACIÓN =====
var reader = csv.createCsvStreamReader(process.openStdin(), {
  columnsFromHeader : true,
  separator:';',
  quote: '',
});


reader.addListener("data", function(row) {

//console.log('begins process listener [%s]', row);

//GType: dept/loc/prov

// "IdLoc" ;"IdLocation" ;"Nombre"                         ;"Provincia"  ;"IdProv" ;"Departamento" ;"IdDep"  ;"Localidad"              ;"IdLocalidad";"GType"  ;"GLat"             ;"GLng"             ;"GZoom";"Streets"  ;"Bbox" ;"CoordinatesL1"          ;"CoordinatesL2"  ;"IdAglo" ;"Cod_Aglomerado" ;"Aglomerado"             ;"Municipio"              ;"Poblacion";"Capital"
// "2402"  ;"38098040"   ;"Tumbaya"                        ;"Jujuy"      ;"38"     ;"Tumbaya"      ;"098"    ;"Tumbaya"                ;"040"        ;"loc"    ;"-23.86468826480"  ;"-65.47217767770"  ;       ;"0"        ;       ;                         ;                 ;"0"      ;"3022"           ;"Tumbaya"                ;"Tumbaya"                ;"321"      ;"0"
// "3007"  ;"62070070"   ;"Pilquiniyeu del Limay"          ;"Río Negro"  ;"62"     ;"Pilcaniyeu"   ;"070"    ;"Pilquiniyeu del Limay"  ;"070"        ;"loc"    ;"-40.54705559070"  ;"-70.05318074410"  ;       ;"0"        ;       ;                         ;                 ;"0"      ;"6326"           ;"Pilquiniyeu del Limay"  ;"Pilquiniyeu del Limay"  ;"61"       ;"0"  
// "2"     ;"02"         ;"Ciudad Autónoma de Buenos Aires";"CABA"       ;"02"     ;               ;"000"    ;                         ;             ;"prov"   ;"-34.6120"         ;"-58.4620"         ;"12"   ;"1"        ;       ;"[[-58.343046...33334]]" ;                 ;         ;                 ;                         ;                         ;           ;"0"
// "455"   ;"70014"      ;"Villa del Salvador"             ;"San Juan"   ;"70"     ;"Angaco"       ;"014"    ;                         ;             ;"dept"   ;"-31.4480"         ;"-68.409";"9";"0"  ;       ;
// "584"   ;"06042040"   ;"Udaquiola"                      ;"Buenos res" ;"06"     ;"Ayacucho"     ;"042"    ;"Udaquiola"              ;"040"        ;"loc"    ;"-36.56606801670"  ;"-58.53335666890"  ;       ;"0"        ;       ;                         ;                 ;"0"      ;"2163"           ;"Udaquiola"              ;"Ayacucho"               ;"66"       ;"0"

  if (row["IdLoc"] && row["GType"] === 'loc' ) { // skip empty lines
   
    var newPerson = {
      "tipopersona":  "municipio",
      "name":  row["Nombre"]+' - '+row["Departamento"]+' - '+row["Provincia"],
      "displayName":  row["Nombre"],
      "nickName":     row["Nombre"],
      "tipojuridico":{
        'pfisica': false,
        'pjuridica': false,
        'pideal': false,
        'porganismo': true
      },
      "roles":{
        'adherente': false,
        'proveedor': false,
        'empleado':  false
      },
      "description":  'importado de SINCA',
      "contactinfo":[{
        "tipocontacto":   "direccion",
        "subcontenido":   "trabajo",
        "contactdata":    row["Aglomerado"]+', '+row["Localidad"]+', '+row["Provincia"],
        "departamento":  row["Departamento"],
        "localidad":  row["Localidad"],
        "provincia":  row["Provincia"],
        "glat":  row["GLat"],
        "glng":  row["GLng"],
      }],
      "sinca":{
        "idloc":        row["IdLoc"],
        "idlocation":   row["IdLocation"],
        "loadtime":     'import-2015-01-14-01'
      },
      "estado_alta": "activo",
      "notas":  [],
      "branding":  [],
    };
    //console.log('READY TO INSERT [%s]:[%s] [%s]', newPerson.nickName,newPerson.name, newPerson.contactinfo[0].contactdata);

    initBeforeCreatePerson(newPerson);
    person.importNewPerson(newPerson, function(result){
      console.log('CB [%s]:[%s] [%s]', result.model.nickName,result.model.name, result.model.contactinfo[0].contactdata);
    });

    //personas.push(person);
  }
});



// print our data to the console at the end
reader.addListener("end", function(row) {
  console.log('END PROCESS OK')
  //console.log(JSON.stringify(personas));

});


 
  }, 1500);
}


processFile('PERSONS to go...');





