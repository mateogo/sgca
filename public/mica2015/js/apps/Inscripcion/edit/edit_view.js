DocManager.module("InscripcionApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Layout = Marionette.LayoutView.extend({
    className: 'row',

    getTemplate: function(){
      return utils.templates.DocumEditLayoutView;
    },
    
    regions: {
      itemEditRegion: '#itemedit-region',
      headerInfoRegion: '#sidebar1-region',
      itemsInfoRegion: '#sidebar2-region',
      linksRegion:   '#panel-region',
      mainRegion:    '#main-region'
    }
  });
// nueva inscripcion
  Edit.createInstance = function(view){
        console.log('NEW Inscripcion');
        var self = view,
           // facet = new DocManager.Entities.DocumCoreFacet(),
            facet = new DocManager.Entities.Inscripcion(),
            form = new Backbone.Form({
                model: facet
            });

            console.log('Continua...');
            var errors = form.commit();
            facet.createNewDocument(function(err, model){
				console.log('Sigue!!!!!!!')
              DocManager.trigger("register:edit",model);
            });

  };
});