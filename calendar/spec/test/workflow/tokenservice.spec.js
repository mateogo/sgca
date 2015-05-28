var root = '../../../';

var async = require('async');

var TokenService = require(root + 'workflow/tokenservice.js');
var UserModel = require(root + 'models/user.js').getModel();


var service = new TokenService();

var user1 = new UserModel({_id:'5554a006f4217b720e50fabe',name: 'Usuario 1',mail:'user1@users.com'});
var user2 = new UserModel({_id:'55671df5db177ca80979ea9c',name: 'Usuario 2',mail:'user2@users.com'});

describe('services',function(){

  describe('TokenService',function(){

    it('Deberia reemplazar el parametro toMe y fromMe',function(){
        var query = {aField:'dummy',toMe:true,fromMe:true };
        service.setUser(user1);

        var replacedQuery = service.replaceUserLogged(query);

        expect(replacedQuery['to._id'].toString()).toBe(user1.id.toString());
        expect(replacedQuery.toMe).toBeFalsy();

        expect(replacedQuery['from._id'].toString()).toBe(user1.id.toString());
        expect(replacedQuery.fromMe).toBeFalsy();
    });

    it('Deberia reemplazar el parametro toMe de un array',function(){
        var query = {aField:'dummy',$or: [{toMe:true},{fromMe:true}] };

        query = service.replaceUserLogged(query);

        expect(query.$or[0]['to._id']).toBeTruthy();
        expect(query.$or[0].toMe).toBeFalsy();

        expect(query.$or[1]['from._id']).toBeTruthy();
        expect(query.$or[1].fromMe).toBeFalsy();
    });


    it('Deberia cambiar de usuario',function(){
      var query = {aField:'dummy',toMe:true,fromMe:true };
      var replaced;

      service.setUser(user1);
      replaced = service.replaceUserLogged(query);
      expect(replaced['to._id'].toString()).toBe(user1.id.toString());

      service.setUser(user2);
      replaced = service.replaceUserLogged(query);
      expect(replaced['to._id'].toString()).toBe(user2.id.toString());



    });
  });


});
