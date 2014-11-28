window.RequestListLayoutView = Backbone.View.extend({

    whoami:'RequestListLayoutView',

    tagName: 'section',
    className: 'page-view',

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change":"change",
    },

    change: function (event) {
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        //alert("nos vamos?");
        //utils.approuter.navigate('navegar/recursos', true);
        utils.approuter.browseRequests();
    },
});