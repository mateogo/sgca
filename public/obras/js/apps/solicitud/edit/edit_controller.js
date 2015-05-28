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
        Edit.session = {};
        Edit.session.editing = solicitud;

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

          view.on('solitictud:doSave',function(model){
            onSaveHandler(view);
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

    Edit.session.tofixCollection = collection;

    var listView = new WorkflowList.AlertTokenList({el:el,collection:collection});
    listView.render();
  }

  function onSaveHandler(view){
    if(Edit.session.tofixCollection && Edit.session.tofixCollection.length > 0){
      saveWidthMessage(view);
    }else{
      saveDefault(view);
    }
  }

  function saveDefault(view){
    var model = Edit.session.editing;
    view.saveStarted();
    DocManager.request('solicitud:save',model).done(function(){
      view.saveStopped();
      Message.success('La Solicitud '+model.get('cnumber') + '<br/>A sido guardada');
      DocManager.trigger('solicitud:list');
    }).fail(function(e){
      view.saveStopped();
      Message.error('No se pudo guardar');
    });
  }

  function saveWidthMessage(view){
    Common.popupSaveAndNoti(function(obj){
      var model = Edit.session.editing;
      model.set('extra',obj);
      saveDefault(view);
    });
  }


});
