var types = {
    ASIGNAR_FORMA: 'asignar_forma',
    FORMALIZANDO: 'formalizando',
    FORMALIZADO: 'formalizado',
    PEDIDO_CORRECCION: 'pedido_correccion',
    CAMBIO: 'cambio',
    ASIGNAR_REVISOR: 'asignar_revisor',
    REVISANDO: 'revisando',
    REVISADO: 'revisado',
    ASIGNAR_AUTORIZADOR: 'asignar_autorizador',
    AUTORIZANDO: 'autorizando',
    AUTORIZADO: 'autorizado',
    CANCELADO: 'cancelado',


    getInProgress: function(){
      return [this.FORMALIZADO,this.FORMALIZANDO,
              this.ASIGNAR_REVISOR,this.REVISANDO, this.REVISADO,
              this.ASIGNAR_AUTORIZADOR];
    }
};



module.exports = types;
