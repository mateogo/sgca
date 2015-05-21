
var groups = {
    SOLICITANTES: 'solicitantes',
    FALICITADORES: 'facilitadores',
    REVISORES: 'revisores',
    AUTORIZADORES: 'autorizadores',

    getAll: function(){
      return [this.SOLICITANTES,this.FALICITADORES,this.REVISORES,this.AUTORIZADORES];
    }
};



module.exports = groups;
