#!/bin/bash
NAME='backbone-forms-bootstrap.js'
SOURCE='./public/gestion/lib'
TARGET='./public/lib'
echo $1
for i in 'css/backbone-forms-bootstrap.css' 'css/bootstrap.min.css' 'css/bootstrap-theme.min.css' 'css/offcanvas.css' 'lib/backbone-forms.min.js' 'lib/list.min.js' 'lib/backbone.bootstrap-modal.js' 'lib/backbone-forms-bootstrap.js'
do
	echo $i
	ls -l public/$i public/gestion/$i
	#ls -l $SOURCE/$i*
	#ls -l $TARGET/$i*
	#cp -p $SOURCE/$i* $TARGET/. 
done

#for i in './public/lib' './public/gestion/lib' './public/media/lib' './public/studio/lib'
#for i in './public/lib' './public/gestion/lib' './public/media/lib' './public/studio/lib'
#'backbone.babysitter' 'backbone.bootstrap-modal.min' 'backbone.bootstrap-modal' 'backbone.syphon' 'bootstrap.min' 'jquery-ui.min' 'jquery.min' 'less.min.js'
#'backbone.babysitter' 'backbone.bootstrap-modal.min' 'backbone.syphon' 'bootstrap.min' 'jquery-ui.min' 'jquery.min' 'less'

