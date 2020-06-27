/*global Annotator*/
/*global $*/
import tinymce from 'tinymce/tinymce';

// Default icons are required for TinyMCE 5.3 or above
import 'tinymce/icons/default';

// A theme is also required
import 'tinymce/themes/silver';
// Any plugins you want to use has to be imported
import 'tinymce/plugins/media';
import 'tinymce/plugins/image';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/code';

export const setKFPlugin = (elem, annotatorHandler, uname) => {
    Annotator.Plugin.KFPlugin = function( /*element*/ ) {
        return {
            pluginInit: function() {
                this.annotator
                    .subscribe('annotationCreated', function(annotation) {
                        if (annotatorHandler) {
                            annotatorHandler.annotationCreated(annotation);
                        }
                    })
                    .subscribe('annotationUpdated', function(annotation) {
                        if (annotatorHandler) {
                            annotatorHandler.annotationUpdated(annotation);
                        }
                    })
                    .subscribe('annotationDeleted', function(annotation) {
                        if (annotatorHandler) {
                            annotatorHandler.annotationDeleted(annotation);
                        }
                    })
                    .subscribe('annotationEditorShown', function(editor, annotation){
                        if (annotatorHandler) {
                            annotatorHandler.displayEditor(editor, annotation);
                        }
                    })
                    .subscribe('annotationViewerShown', function(viewer, annotations) {
                        if (annotatorHandler) {
                            annotatorHandler.displayViewer(viewer, annotations);
                        }
                    })
                    .subscribe('annotationEditorHidden', function(editor, annotation){
                        if (annotatorHandler) {
                            annotatorHandler.editorHidden(editor, annotation);
                        }
                    })

                ;

                if (annotatorHandler) {
                    annotatorHandler.annotatorInitialized(this.annotator);
                }
            }
        };
    };


    //----------------------------Rich Text Annotator Plugin: START -----------------------------
    /*
      Rich Text Annotator Plugin v1.0 (https://github.com/danielcebrian/richText-annotator)
      Copyright (C) 2014 Daniel Cebrián Robles
      License: https://github.com/danielcebrian/richText-annotator/blob/master/License.rst
      This program is free software; you can redistribute it and/or
      modify it under the terms of the GNU General Public License
      as published by the Free Software Foundation; either version 2
      of the License, or (at your option) any later version.
      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU General Public License for more details.
      You should have received a copy of the GNU General Public License
      along with this program; if not, write to the Free Software
      Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
    */
    // Generated by CoffeeScript 1.6.3
    /* jshint ignore:start */
    var _ref,
        // __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


    Annotator.Plugin.RichText = (function(_super) {
        __extends(RichText, _super);


        // FILE - GLOBALS -----
        var editorId ="";

        //----------------------
        //Default tinymce configuration
        RichText.prototype.options = {
            tinymce:{
                selector: "li.annotator-item textarea",
                // content_css: '/manual_assets/kfmce.css',
                height:"150px",
                statusbar: false,
                plugins: "media image insertdatetime link code",
                menubar: false,
                toolbar_items_size: 'small',
                extended_valid_elements : "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | code ",
            }
        };

        function RichText(element,options) {
            _ref = RichText.__super__.constructor.apply(this, arguments);
            return _ref;
        }


        RichText.prototype.pluginInit = function() {
            var annotator = this.annotator,
                editor = this.annotator.editor;
            //Check that annotator is working
            if (!Annotator.supported()) {
                return;
            }

            //Editor Setup
            annotator.editor.addField({
                type: 'input',
                load: this.updateEditor,
            });

            //Viewer setup
            annotator.viewer.addField({
                load: this.updateViewer,
            });


            annotator.subscribe("annotationEditorShown", function(){
                // $(annotator.editor.element).find('.mce-tinymce')[0].style.display='block';
                // $(annotator.editor.element).find('.mce-container').css('z-index',3000000000);
                // annotator.editor.checkOrientation();
            });
            annotator.subscribe("annotationEditorHidden", function(){
                // $(annotator.editor.element).find('.mce-tinymce')[0].style.display='none';
                // $(annotator.editor.element).find("#annoSide").remove();
            });

            //set listener for tinymce;
            this.options.tinymce.setup = function(ed) {
                ed.on('change', function(e) {
                    //set the modification in the textarea of annotator
                    $(editor.element).find('textarea')[0].value = tinymce.activeEditor.getContent();
                });
                ed.on('Init', function(ed){
                    $('.mce-container').css('z-index','3090000000000000000');

                });
                // ed.addSidebar('mysidebar', {
                //     tooltip: 'View Sacffold',
                //     icon: 'settings',
                //     onrender: function (api) {
                //         //console.log('Render panel', api.element())

                //     },
                //     onshow: function (api) {

                //         var str = "\"\'components/kfutils/scaffold/scaffold.html\'\"";
                //         api.element().innerHTML = "<div id='annoSide'><div ng-include="+str+"></div></div>";
                //         var scope = angular.element(document.getElementById("scaffoldContainer")).scope();
                //         scope.$apply(function () {
                //             scope.annotatorScaffoldInit(editorId);
                //         });
                //     },
                //     onhide: function (api) {
                //         api.element().innerHTML = "";
                //         var scope = angular.element(document.getElementById("scaffoldContainer")).scope();
                //         scope.$apply(function () {
                //             scope.annotatorScaffoldClose();
                //         });
                //         //console.log('Hide panel', api.element());
                //     }
                // });

            };
            tinymce.init(this.options.tinymce);
        };

        RichText.prototype.updateEditor = function(field, annotation) {
            var text = typeof annotation.text!=='undefined'?annotation.text:'';
            var count = tinymce.editors.length;
            editorId = tinymce.editors[count-2].id;
            tinymce.get(editorId).setContent(text);
            //tinymce.activeEditor.setContent(text);
            $(field).remove(); //this is the auto create field by annotator and it is not necessary
        };

        RichText.prototype.updateViewer = function(field, annotation) {
            var textDiv = $(field.parentNode).find('div:first-of-type')[0];
            textDiv.innerHTML =annotation.text;
            $(textDiv).addClass('richText-annotation');
            $(field).remove(); //this is the auto create field by annotator and it is not necessary
        };

        return RichText;

    })(Annotator.Plugin);

            /* jshint ignore:end */


            //----------------------------Rich Text Annotator Plugin: END -----------------------------

    elem.annotator('addPlugin', 'KFPlugin');
    elem.annotator('addPlugin', 'Tags');
    elem.annotator('addPlugin', 'RichText');

    if (uname) {
        elem.annotator('addPlugin', 'Permissions', {
            user: uname,
            permissions: {
                read: [uname],
                update: [uname],
                delete: [uname],
                admin: [uname]
            },
            showEditPermissionsCheckbox: false
        });
    }
}
