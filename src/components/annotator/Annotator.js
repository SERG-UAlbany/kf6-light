import React from 'react';
import * as annotPlugins from './annotator.service'
import './annotator.css'
/*global $*/
class Annotator extends React.Component {

    constructor(props) {
        super(props)
        this.contentRef = React.createRef();
        this.annotatorInitialized = this.annotatorInitialized.bind(this)
        this.annotator = null

        this.displayEditor = this.displayEditor.bind(this)
        this.displayViewer = this.displayViewer.bind(this)
        this.fixPopupLocation = this.fixPopupLocation.bind(this)
        this.editorHidden = this.editorHidden.bind(this)
        this.dlg = null
    }

    componentDidMount() {
        const annotatedElem = $(this.contentRef.current)
        annotatedElem.annotator()

        annotPlugins.setKFPlugin(annotatedElem, {
            annotationCreated: this.props.onCreate,
            annotationUpdated: this.props.onUpdate,
            annotationDeleted: this.props.onDelete,
            displayEditor: this.displayEditor,
            displayViewer: this.displayViewer,
            annotatorInitialized: this.annotatorInitialized,
            editorHidden: this.editorHidden
        }, this.props.author.userName)
        this.dlg = $(`#contrib-dialog-${this.props.containerId}`)
    }
    editorHidden(editor, annotation){
        $(editor.element.find(".annotator-controls")).off()
    }
    annotatorInitialized(annotator){
        this.annotator = annotator
        var $element = $('div.annotator-adder');
        $element.attr('title', 'Annotation');
        $element.addClass('tooltip1');
        $element.append('<span class="tooltiptext">Annotation</span>');
        document.annotator = this.annotator
        const adder = annotator.adder.get(0)
        this.observer = new MutationObserver(function(mutationsList){
            for(let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    //mutation.oldValue.startsWith("display: none") && 
                    if( adder.style.display !== 'none'){
                        this.fixPopupLocation(annotator.adder)
                        this.observer.takeRecords()
                        return
                    }
                }
            }
        }.bind(this));
        //TODO disconnect? when?
        this.observer.observe(adder, { attributes: true, attributeOldValue: true });
    }

    displayEditor(editor, annotation){
        /* $(editor.element.find(".annotator-controls")).off()*/

    }
    fixPopupLocation(popup){
        const dlgOffset = this.dlg.offset()
        const ppOffset = popup.offset()
        popup.offset({top: ppOffset.top - dlgOffset.top, left: ppOffset.left - dlgOffset.left})
    }
    displayViewer(viewer, annotation){
        this.fixPopupLocation(viewer.element)
    }

    render() {
        return (
            <div ref={this.contentRef}>
                <div dangerouslySetInnerHTML={{__html: this.props.content}}>
                </div>
            </div>
        )
    }

}

export default Annotator
