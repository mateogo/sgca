

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
       {val:'objeto',         label:'objeto'},
       {val:'instalacion',         label:'instalacion'},
       {val:'fotografía',         label:'fotografía'},
       {val:'arte electrónico',         label:'arte electrónico'},
       {val:'video arte',         label:'video arte'},
       {val:'otro',         label:'otro'}
   ],
   
   reasonsExportList: [
       {val:'exposicion',       label:'Exposición'},
       {val:'venta',       label:'Venta'},
       {val:'otros',       label:'Otros'}
   ],
   
   typeExportList: [
         {val:'definitiva',       label:'Definitiva'},
         {val:'temporaria',       label:'Temporaria'}
     ],
     
   countMonthOutList: [
        {val:3,       label:'3 meses'},
        {val:6,       label:'6 meses'},
        {val:12,       label:'12 meses'}
   ] 
}


if(window.utils){
  _.extend(window.utils,utilsObras);
}