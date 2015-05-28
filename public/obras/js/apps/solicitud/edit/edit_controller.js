DocManager.module("SolicitudApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  var Common = DocManager.module('ObrasApp.Common');

  var Entities = DocManager.module('Entities');

  var WorkflowList = DocManager.module('WorkflowApp.List');

  Edit.Controller = {
      wizard: function(){

        dao.gestionUser.getUser(DocManager, function (user){

          var solicitud = new Entities.Solicitud();
          if(user){
            solicitud.set('email',user.get('mail'));
          }

          var view = new Edit.SolicitudWizardView({model:solicitud});

          var layout = Common.Controller.showMain(view);
          DocManager.mainRegion.show(layout);
          $('body').scrollTop(0);

          view.on('solicitud:saved',function(model){
            Edit.Controller.saveSuccess(model);
            view.unbind('solicitud:saved');
          });

        });
      },

      edit: function(solicitud){

        DocManager.request('solicitud:load',solicitud).done(function(solicitud){
          var view = new Edit.SolicitudEditorView({model:solicitud});

          var layout = Common.Controller.showMain(view);
          DocManager.mainRegion.show(layout);
          $('body').scrollTop(0);

          view.on('solicitud:saved',function(model){
            DocManager.trigger('solicitud:list');
            view.unbind('solicitud:saved');
            view.unbind('solicitud:editCanceled');
          });

          view.on('solicitud:editCanceled',function(model){
            DocManager.confirm('¿Está seguro que desea cancelar la edición?').done(function(){
              DocManager.trigger('solicitud:list');
              view.unbind('solicitud:saved');
              view.unbind('solicitud:editCanceled');
            });
          });

          initToFixList(view,solicitud);

        }).fail(function(){
          Message.error('No se encontro la solicitud');
        });
      },

      saveSuccess: function(model){
        var view = new Edit.SolicitudGraciasView({model:model});

        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        $('body').scrollTop(0);
      }
  };


  function initToFixList(view,model){
    console.log('inicializando to fix');
    var el = view.getRegionToFix();

    var collection =  DocManager.request('token:query','toFix',{objId:model.id});

    var listView = new WorkflowList.AlertTokenList({el:el,collection:collection});
    listView.render();

  }


});
