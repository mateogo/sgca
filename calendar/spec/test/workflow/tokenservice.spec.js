var root = '../../../';

var async = require('async');

var TokenService = require(root + 'workflow/tokenservice.js');


var service = new TokenService();

describe('services',function(){

  describe('TokenService',function(){

    it('Deberia reemplazar el parametro toMe y fromMe',function(){
        var query = {aField:'dummy',toMe:true,fromMe:true };

        service.replaceUserLogged(query);

        expect(query['to._id']).toBeTruthy();
        expect(query.toMe).toBeFalsy();

        expect(query['from._id']).toBeTruthy();
        expect(query.fromMe).toBeFalsy();

        console.log(query);
    });

    it('Deberia reemplazar el parametro toMe de un array',function(){
        var query = {aField:'dummy',$or: [{toMe:true},{fromMe:true}] };

        service.replaceUserLogged(query);

        expect(query.$or[0]['to._id']).toBeTruthy();
        expect(query.$or[0].toMe).toBeFalsy();

        expect(query.$or[1]['from._id']).toBeTruthy();
        expect(query.$or[1].fromMe).toBeFalsy();

        console.log(query);
    });
  });


});
