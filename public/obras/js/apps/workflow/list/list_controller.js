DocManager.module("WorkflowApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var Common = DocManager.module('WorkflowApp.Common');

  var Entities = DocManager.module('Entities');

  List.Controller = {
      list: function(queryCode){

        var view = new List.LayoutView();


        var tokenCollection = new Entities.TokenCollection();
        tokenCollection.fetchByQuery(queryCode);

        var grid = List.GridCreator(tokenCollection);


        view.on('show',function(){
            view.tableRegion.show(grid);
        });


        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        this.lastQueryCode = queryCode;
      }
  };


  DocManager.on('query:run',function(query){
      List.Controller.list(query.get('code'));
  });

  DocManager.on('query:runLastQuery',function(){
      if(List.Controller.lastQueryCode){
        List.Controller.list(List.Controller.lastQueryCode);
      }
  });

});
