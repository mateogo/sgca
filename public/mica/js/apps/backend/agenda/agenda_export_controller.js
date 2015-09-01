DocManager.module('BackendApp.AgendaMica',function(AgendaMica, DocManager, Backbone, Marionette, $, _){


  var sectores = [];

  var Controller = {
    startProcessExport: function(force){
      var sectores = _.pluck(tdata.sectorOL,'val');

      var currentStep = -1;
      var steps = [ {name:'clearExport',params:null,label:'Preparando exportación'},
                    {name:'buildCompradoresExcel',params:null,label:'Exportando Compradores'}
                  ];
      _.each(sectores,function(sector){
        if(sector != 'no_definido'){
          var label = 'Exportando Vendedores '+sector;
          steps.push({name:'buildVendedoresExcel',params:[sector],label:label});
        }
      });
      steps.push({name:'buildZip',params:null,label:'Preparando ZIP'});

      if(!force){
        steps.unshift({name:'getZipExporter',params:null,label:'Verificando ya exportado'});
      }

      Controller.stepsExport = steps;
      Controller.stepsCounts = steps.length;
      Controller.viewExport = new AgendaMica.ExportProcessView();
      Controller.popupExport = DocManager.openPopup(Controller.viewExport).width('300px').height('130px').center();

      Controller.viewExport.setLabel('Empezando proceso').setProgress(0);
      this._nextStepExport();
    },

    _nextStepExport: function(){
      if(Controller.stepsExport.length < 1){
        Controller.viewExport.setLabel('Exportación terminada').setProgress(100);
        return;
      }
      var step = Controller.stepsExport.shift();
      var progress = (1 - (Controller.stepsExport.length / Controller.stepsCounts)) * 100;
      var p = DocManager.request('micaagenda:export:step',step.name,step.params);
      Controller.viewExport.setLabel(step.label).setProgress(progress);
      p.done(function(result){
        if(step.name === 'getZipExporter'){
          if(result.file){
            Controller._receiveResponseFile(result);
            return;
          }
        }
        if(step.name === 'buildZip'){
          Controller._receiveResponseFile(result);
        }else{
          Controller._nextStepExport();
        }
      }).fail(function(){
        Controller.viewExport.setBody('<h4 class="text-danger">Se produjo una complicación</h4>');
      });
    },

    _receiveResponseFile: function(dataFile){
      var $div = $('<div style="padding:10px"></div>');
      $div.append($a);
      var $a = $('<a class="btn btn-success" target="_blank">Bajar agenda ZIP</a>');
      $a.attr('href',dataFile.file);
      $a.css('font-size','16px');
      var $btn = $('<button class="btn btn-link">regenerar</button>');
      $div.append($a).append($btn);
      Controller.viewExport.setBody($div);

      $btn.bind('click',function(){
        $btn.unbind('click');
        if(Controller.popupExport) Controller.popupExport.close();
        Controller.startProcessExport(true);
      });
    },

  };



  _.extend(AgendaMica.Controller,Controller);
});
