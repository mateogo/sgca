$(function () {
    //MAX 140
    $('#bio').keypress(function(e) {
      var tval = $('textarea').val(),
          tlength = tval.length,
          set = 140,
          remain = parseInt(set - tlength);
      $('#limit-chars').text(remain);
      if (remain <= 0 && e.which !== 0 && e.charCode !== 0) {
          $('#bio').val((tval).substring(0, tlength - 1))
      }
    });

    /*DATEPICKER*/
    $('.calendar-container').datepicker({
      format: 'dd/mm/yyyy',
      autoclose:true
    });

    // UPLOAD CLASS DEFINITION
    // ======================
    /*'use strict';
    //var dropZone = document.getElementById('drop-zone');
    var uploadForm = document.getElementById('js-upload-form');

    var startUpload = function(files) {
        console.log(files)
    }
    uploadForm.addEventListener('submit', function(e) {
        var uploadFiles = document.getElementById('js-upload-files').files;
        e.preventDefault()

        startUpload(uploadFiles)
    })*/

    /*dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';

        startUpload(e.dataTransfer.files)
    }

    dropZone.ondragover = function() {
        this.className = 'upload-drop-zone drop';
        return false;
    }

    dropZone.ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }*/
});