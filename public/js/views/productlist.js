window.ProductListView = Backbone.View.extend({


    whoami:'ProductListView',

    paginatorPath: '#navegar/productos/pag/',

    initialize: function () {
        this.render();
    },

    events: {
    },

    render: function () {
        var products = this.model.models;
        var len = products.length;
        var startPos = (this.options.page - 1) * 12;
        var endPos = Math.min(startPos + 12, len);


        $(this.el).html('<ul class="thumbnails"></ul>');

        for (var i = startPos; i < endPos; i++) {
            $('.thumbnails', this.el).append(new ProductListItemView({model: products[i]}).render().el);
        }

        $(this.el).append(new Paginator({model: this.model, paginatorPath: this.paginatorPath, page: this.options.page}).render().el);

        return this;
    }
});

window.ProductListItemView = Backbone.View.extend({

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