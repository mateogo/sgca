DocManager.module("HeaderApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  List.Controller = {
    listHeader: function(){

      var sidebarLinks = DocManager.request("sidebar:nav:entities");
      var headers = DocManager.request("header:entities");

      // console.log('listHeader BEGINS  [%s]', sidebarLinks.length);
      // console.log('Sidebars[0] [%s]  [%s]', sidebarLinks.at(0).get('name'),sidebarLinks.at(0).get('url'));

      DocManager.request('userlogged:load', function (user){
        user = (user || new User());

        var micaProfile = DocManager.request('userlogged:getMicaProfile');

        //elimina opciones que son solo para perfiles de comprador y vendedor;
        var rejectedItems;
        if(!micaProfile.isCompradorLight()){
            rejectedItems = sidebarLinks.reject(function(item){
              return (!item.has('role') || item.get('role') !== 'comprador');
            });
            sidebarLinks.remove(rejectedItems);
        }

        if(!micaProfile.isVendedor()){
            rejectedItems = sidebarLinks.reject(function(item){
              return (!item.has('role') || item.get('role') !== 'vendedor');
            });
            sidebarLinks.remove(rejectedItems);
        }


        var bucketSidebars = new List.BucketHeaders({collection: sidebarLinks, model: user});
        bucketSidebars.on("childview:navigate", function(childView, model){
          console.log('childview:navigate');
          var trigger = model.get("navigationTrigger");
          DocManager.trigger(trigger);
        });


        var headers = new List.Headers({collection: headers, model: user});
        headers.on("brand:clicked", function(){
          console.log('brand:clicked')
          DocManager.trigger("documents:list");
        });

        headers.on("childview:navigate", function(childView, model){
          console.log('childview:navigate')
          var trigger = model.get("navigationTrigger");
          DocManager.trigger(trigger);
        });

        DocManager.headerRegion.show(headers);
        DocManager.bucketSidebarRegion.show(bucketSidebars);


      });

    },
//Trabajar lo que es el header
    setActiveHeader: function(headerUrl){
			console.log('Set Active Header headerUrl [%s]',headerUrl);
//      var headers = DocManager.request("header:entities");
//      var headerToSelect = headers.find(function(header){ return header.get("url") === headerUrl; });
//      headerToSelect.select();
//      headers.trigger("reset");
    }
  };
});
