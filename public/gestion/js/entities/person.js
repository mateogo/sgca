DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.Person = Backbone.Model.extend({
    urlRoot: "receipts",

    defaults: {
      firstName: "",
      lastName: "",
      phoneNumber: ""
    },

    validate: function(attrs, options) {
      var errors = {}
      if (! attrs.firstName) {
        errors.firstName = "can't be blank";
      }
      if (! attrs.lastName) {
        errors.lastName = "can't be blank";
      }
      else{
        if (attrs.lastName.length < 2) {
          errors.lastName = "is too short";
        }
      }
      if( ! _.isEmpty(errors)){
        return errors;
      }
    }
  });

  //Entities.configureStorage(Entities.Person);

  Entities.PersonCollection = Backbone.Collection.extend({
    url: "persons",
    model: Entities.Person,
    comparator: "firstName"
  });

  //Entities.configureStorage(Entities.PersonCollection);

  var initializePersons = function(){
    persons = new Entities.PersonCollection([
      { id: 1, firstName: "Alice", lastName: "Arten", phoneNumber: "555-0184" },
      { id: 2, firstName: "Bob", lastName: "Brigham", phoneNumber: "555-0163" },
      { id: 3, firstName: "Charlie", lastName: "Campbell", phoneNumber: "555-0129" }
    ]);
    persons.forEach(function(person){
      person.save();
    });
    return persons.models;
  };

  var API = {
    getPersonEntities: function(){
      var persons = new Entities.PersonCollection();
      var defer = $.Deferred();
      persons.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      $.when(promise).done(function(persons){
        if(persons.length === 0){
          // if we don't have any persons yet, create some for convenience
          var models = initializePersons();
          persons.reset(models);
        }
      });
      return promise;
    },

    getPersonEntity: function(personId){
      var person = new Entities.Person({id: personId});
      var defer = $.Deferred();
      setTimeout(function(){
        person.fetch({
          success: function(data){
            defer.resolve(data);
          },
          error: function(data){
            defer.resolve(undefined);
          }
        });
      }, 2000);
      return defer.promise();
    }
  };

  DocManager.reqres.setHandler("person:entities", function(){
    return API.getPersonEntities();
  });

  DocManager.reqres.setHandler("person:entity", function(id){
    return API.getPersonEntity(id);
  });
});
