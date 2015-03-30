

global.requireModel = function(str){
  return require('./'+str+'.js').getModel();
};