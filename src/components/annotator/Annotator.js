import React from 'react';
import * as annotPlugins from './annotator.service'
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
        this.dlg = null
    }

    componentDidMount() {
        const annotatedElem = $(this.contentRef.current)
        annotatedElem.annotator()

        annotPlugins.setKFPlugin(annotatedElem, {
            annotationCreated: this.annotationCreated,
            annotationUpdated: this.annotationUpdated,
            annotationDeleted: this.annotationDeleted,
            displayEditor: this.displayEditor,
            displayViewer: this.displayViewer,
            annotatorInitialized: this.annotatorInitialized
        })
        this.dlg = $(`#contrib-dialog-${this.props.containerId}`)
    }
    annotationCreated(annotation){
        console.log("AnnotationCreated")
    }
    annotationUpdated(annotation) {
        console.log("Annotation Updated")
    }
    annotationDeleted(annotation) {
        console.log("Annotation deleted")
    }
    annotatorInitialized(annotator){
        this.annotator = annotator
        console.log(annotator.adder)
        var $element = $('div.annotator-adder');
        $element.attr('title', 'Annotation');
        $element.addClass('tooltip1');
        $element.append('<span class="tooltiptext">Annotation</span>');
    }
    displayEditor(editor, annotation){
        console.log("display editor")
        /* this.fixPopupLocation(editor.element) */
    }
    fixPopupLocation(popup){
        const dlgOffset = this.dlg.offset()
        const ppOffset = popup.offset()
        popup.offset({top: ppOffset.top - dlgOffset.top, left: ppOffset.left - dlgOffset.left})
    }
    displayViewer(viewer, annotation){
        this.fixPopupLocation(viewer.element)
    }
    onMouseUp(evt){
        /* var $element = $('div.annotator-adder');
         * console.log($element.css('display')) */
    }

    render() {
        return (
            <div ref={this.contentRef} onMouseUp={this.onMouseUp}>
                <div dangerouslySetInnerHTML={{__html: this.props.content}}>
                </div>
            </div>
        )
    }

}

export default Annotator
