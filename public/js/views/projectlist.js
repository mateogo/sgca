window.ProjectListView = Backbone.View.extend({

    whoami:'ProjectListView',

    paginatorPath: '#navegar/proyectos/pag/',

    initialize: function () {
        this.render();
    },

    render: function () {
        var projects = this.model.models;
        var len = projects.length;
        var startPos = (this.options.page - 1) * 12;
        var endPos = Math.min(startPos + 12, len);


        $(this.el).html('<ul class="thumbnails"></ul>');

        for (var i = startPos; i < endPos; i++) {
            $('.thumbnails', this.el).append(new ProjectListItemView({model: projects[i]}).render().el);
        }

        $(this.el).append(new Paginator({model: this.model, paginatorPath: this.paginatorPath, page: this.options.page}).render().el);

        return this;
    }
});

window.ProjectListItemView = Backbone.View.extend({

    tagName: "li",
    
    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});