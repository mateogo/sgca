DocManager.module('BackendApp.ToolsMica',function(ToolsMica, DocManager, Backbone, Marionette, $, _){
  var backendApp = DocManager.module('BackendApp');
  var backendCommons = DocManager.module('BackendApp.Common.Views');
  var backendEntities = DocManager.module('Entities');

  var session = {};

  ToolsMica.Controller = {
    tools: function(){
        var view = new ToolsMica.ToolsView();

        DocManager.mainRegion.show(view);
        session = {};
    }

  };


  ToolsMica.Handler = {};

  //FALTA CNUMBER
  ToolsMica.Handler.checkCNumber = function($section){
    stateRunLoding($section);
    var p = DocManager.request('micaagenda:tools:run','checkCNumber');
    p.done(function(result){
      var $span;
      if(result.length > 0){

        $span = makeFail('Cantidad de casos '+result.length + ' ');
        var $btnFix = $('<button class="btn btn-danger btn-sm js-run" name="fixCNumber">Arreglar</span>');
        $span.append($btnFix);
      }else{
        $span = makeSuccess('Todos los registros con su cnumber');
      }
      $section.find('.result').html($span);
      stateRunReset($section);
    });
  };

  ToolsMica.Handler.fixCNumber = function($section){
    stateRunLoding($section);
    var $btnFix = $section.find('[name=fixCNumber]');
    $btnFix.html('arreglando...').prop('disabled',true);
    var p = DocManager.request('micaagenda:tools:run','fixCNumber');
    p.done(function(){
      $btnFix.html('Listo').prop('disabled',true);
      ToolsMica.Handler.checkCNumber(view,$section);
      stateRunReset($section);
    }).fail(function(e){
      $btnFix.html('Error').prop('disabled',false);
      console.error(e);
      stateRunReset($section);
    });
  };

  // REPETIDOS

  ToolsMica.Handler.searchRepeatNumReunion = function($section){
    stateRunLoding($section);
    var p = DocManager.request('micaagenda:tools:run','searchRepeatNumReunion');
    p.done(function(result){
      var $span;
      if(result.length > 0){
        session.repetidos = result;
        $span = makeFail('Cantidad de casos '+result.length + ' ');
        var $btnFix = $('<button class="btn btn-danger btn-sm js-run" name="showRepetead">ver</span>');
        $span.append($btnFix);
      }else{
        $span = makeSuccess('No se encontraron reuniones repetidas');
      }
      $section.find('.result').html($span);
      stateRunReset($section);
    });
  };

  ToolsMica.Handler.showRepetead = function($section){
    var v = new ToolsMica.RepetidosView({collection:new Backbone.Collection(session.repetidos)});
    DocManager.openPopup(v).setTitle('Reuniones Repetidas');
  };

  // MAXIMO 36
  ToolsMica.Handler.quotaExceeded = function($section){
    stateRunLoding($section);
    var p = DocManager.request('micaagenda:tools:run','quotaExceeded');
    p.done(function(result){
      var $span;
      if(result.length > 0){
        session.excedidos = result;
        $span = makeFail('Cantidad de casos '+result.length + ' ');
        var $btnFix = $('<button class="btn btn-danger btn-sm js-run" name="showExceeded">ver</span>');
        $span.append($btnFix);
      }else{
        $span = makeSuccess('Todo bien, no hay cuotas excedidas');
      }
      $section.find('.result').html($span);
      stateRunReset($section);
    }).fail(function(e){
      Message.error('No se pudo realizar');
      stateRunReset($section);
    });
  };
  ToolsMica.Handler.showExceeded = function($section){
    var v = new ToolsMica.RepetidosView({collection:new Backbone.Collection(session.excedidos)});
    DocManager.openPopup(v).setTitle('Máximo 36 reuniones');
  };

  //CROSSPROFILE

  ToolsMica.Handler.crossProfile = function($section){
    stateRunLoding($section);
    var p = DocManager.request('micaagenda:tools:run','crossProfile');
    p.done(function(result){
      var $span;
      if(result.length > 0){
        session.cruzados = result;
        $span = makeFail('Cantidad de casos '+result.length + ' ');
        var $btnFix = $('<button class="btn btn-danger btn-sm js-run" name="showCrossed">ver</span>');
        $span.append($btnFix);
      }else{
        $span = makeSuccess('No se encontraron perfiles cruzados');
      }
      $section.find('.result').html($span);
      stateRunReset($section);
    }).fail(function(e){
      Message.error('No se pudo realizar');
      stateRunReset($section);
    });
  };
  ToolsMica.Handler.showCrossed = function($section){
    var v = new ToolsMica.CrossView({collection:new Backbone.Collection(session.cruzados)});
    DocManager.openPopup(v).setTitle('Roles Cruzados');
  };





  // UTILITARIOS

  var makeFail = function(text){
    var $span = $('<span class="text-danger"></span>');
    $span.html('<i class="glyphicon glyphicon-fire"></i> ' + text);
    return $span;
  };

  var makeSuccess = function(text){
    var $span = $('<span class="text-success"></span>');
    $span.html('<i class="glyphicon glyphicon-ok"></i> ' + text);
    return $span;
  };

  var stateRunLoding = function($section){
    $section.find('.js-run').first().html('procesando...').prop('disabled',true);
  };

  var stateRunReset = function($section,txt){
    $section.find('.js-run').first().html('Verificar').prop('disabled',false);
  };


});
