var es_cutoff = {
    "á" : "a",
    "Á" : "A",
    "é" : "e",
    "É" : "E",
    "í" : "i",
    "Í" : "I",
    "ó" : "o",
    "Ó" : "O",
    "ú" : "u",
    "Ú" : "U",
    "ñ" : "n"
};

exports.safeFileName = function(name){
	var str = name;
	str = str.split(' ').join('_');
	str = str.replace(/[áÁéÉíÍóÓúÚñ]/g,function(c) { return es_cutoff[c]; });
	return str;
};
