

var utilsObras = {
    whoami:'utils!+obras',
    
    
    proceduresObrasList:[
       {val:'pintura',       label:'pintura'},
       {val:'grabado', label:'grabado'},
       {val:'dibujo',   label:'dibujo'},
       {val:'escultura',      label:'escultura'},
       {val:'arte textil',         label:'arte textil'},
       {val:'artes del fuego',         label:'artes del fuego'},
       {val:'collage',         label:'collage'},
       {val:'objetos',         label:'objetos'},
       {val:'instalaciones',         label:'instalaciones'},
       {val:'fotografías',         label:'fotografías'},
       {val:'arte electrónico',         label:'arte electrónico'},
       {val:'video arte',         label:'video arte'},
       {val:'otros',         label:'otros'}
   ],
   
   reasonsExportList: [
       {val:'exposicion',       label:'Exposición'},
       {val:'venta',       label:'venta'},
       {val:'otros',       label:'otros'}
   ],
   
   typeExportList: [
         {val:'definitiva',       label:'Definitiva'},
         {val:'temporaria',       label:'Temporaria'}
     ]
}


if(window.utils){
  _.extend(window.utils,utilsObras);
}