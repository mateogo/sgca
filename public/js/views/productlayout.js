window.ProductListLayoutView = Backbone.View.extend({

    whoami:'ProductListLayoutView',

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change .nav-list" : "change",
        "click  .selreset" : "resetselection",
        "click  .prjview"  : "prjview",
    },

    prjview: function(){
        utils.approuter.navigate('ver/proyecto/'+utils.productsQueryData().getProjectId(), true);
        return false;
    },

    resetselection: function (event) {
        //utils.buildDatalistOptions('nivel_ejecucion',utils.paexecutionOptionList,'planificado');
        utils.productsQueryData().setProject('','proyecto no seleccionado');
        utils.approuter.browseProducts();
    },

    change: function (event) {
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        //alert("nos vamos?");
        //utils.approuter.navigate('navegar/requisitorias', true);
        utils.approuter.browseProducts();
    },

});