import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { DropdownButton, Dropdown, Button, Row, Col, Modal } from 'react-bootstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import Axios from 'axios';
import { apiUrl } from '../store/api.js';
import { newNote, openContribution, setCheckedNotes } from '../store/noteReducer.js'
import { connect } from 'react-redux'
import DialogHandler from '../components/dialogHandler/DialogHandler.js'
import NoteContent from '../components/NoteContent/NoteContent'
import ListOfNotes from './ListOfNotes/ListOfNotes'
import { fetchView, fetchCommunity, setCommunityId, setViewId, fetchViewCommunityData } from '../store/globalsReducer.js'
import { fetchAuthors } from '../store/userReducer.js';
import './View.css';

class View extends Component {

    myRegistrations = [];
    myCommunityId = '';
    show = false;
    myTempTo = [];
    noteContnetNew = [];
    open = false;

    //TOKEN
    token = sessionStorage.getItem('token');

    constructor(props) {
        super(props);
        // GET communityId AND welcomeId IN myState
        // this.myState= this.props.location.state;

        //COMMUNITY-ID
        // this.myCommunityId = this.myState.communityId;

        this.state = {
            showView: false,
            showCommunity: false,
            addView: '',
            showRiseAbove: false,
            showModel: false,
            query: "",
            filteredData: [],
            filter: 'title',
            hideScaffold: true,
        };

        this.getBuildOnHierarchy = this.getBuildOnHierarchy.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubmitView = this.handleSubmitView.bind(this);
        this.handleChangeView = this.handleChangeView.bind(this);
        this.onCloseDialog = this.onCloseDialog.bind(this);
        this.onConfirmDrawDialog = this.onConfirmDrawDialog.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.filterResults = this.filterResults.bind(this)
        this.getScaffoldSupports = this.getScaffoldSupports.bind(this)
    }

    getBuildOnHierarchy() {
        const hierarchy = {}
        for (let noteId in this.props.viewNotes) {
            hierarchy[noteId] = { children: {} }
        }
        this.props.buildsOn.forEach(note => {
            const parent = note.to
            const child = note.from
            if (!(parent in hierarchy))
                hierarchy[parent] = { children: {} }
            if (!(child in hierarchy))
                hierarchy[child] = { parent: parent, children: {} }
            else
                hierarchy[child]['parent'] = parent
            hierarchy[parent]['children'][child] = hierarchy[child]
        })
        const final_h = {}
        for (let [key, value] of Object.entries(hierarchy)) {
            if (!('parent' in value))
                final_h[key] = value
        }
        return final_h
    }

    getScaffoldSupports() {
        let supports = []
        this.props.scaffolds.forEach(scaffold => {
            supports = [...supports, ...scaffold.supports]
        })
        return supports
    }

    componentDidMount() {
        if (this.props.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
        }
        const viewId = this.props.match.params.viewId //Get viewId from url param
        this.props.setViewId(viewId)
        this.setState(this.props.location.state);
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewId && this.props.viewId !== prevProps.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
        }
    }

    handleChange = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        // console.log('The form was submitted with:');
        // console.log(this.state.communitySelect);
        // console.log('ADD view:',this.state.addView);
    }

    handleChangeView = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;

        this.setState({
            [name]: value
        });
    }

    handleSubmitView(e) {
        e.preventDefault();
        var config = {
            headers: { Authorization: `Bearer ${this.token}` }
        };

        var addViewUrl = `${apiUrl}/contributions/${this.props.communityId}`;

        var query = {
            "authors": [sessionStorage.getItem("userId")],
            "communityId": this.props.communityId,
            "permission": "public",
            "status": "active",
            "title": this.state.addView,
            "type": "View"
        }
        Axios.post(addViewUrl, query, config)
            .then(
                result => {
                    // console.log("Successful",result);

                }
            ).catch(
                error => {
                    console.log(error);

                }
            );
    }

    newView() {
        // console.log("New View onclick works");
        this.setState({
            showView: true,
            showRiseAbove: false,
            showModel: true,
        })
    }

    newRiseAbove() {
        // console.log("New RiseAbove onclick works");
        this.setState({
            showView: false,
            showRiseAbove: true,
            showModel: true,
        })
    }

    //HANDLE MODEL
    handleShow(value) {
        this.setState({
            showModel: value,
        });

    }

    handleShowNoteContent(value) {
        this.setState({
            showView: false,
            showNote: false,
            showRiseAbove: false,
        });

    }

    filterNotes = (query) => {
        console.log("filterNotes", query);
        this.setState({
            filteredData: this.filterResults(query)
        });
    }


    changeView(viewObj) {
        // console.log("viewId",viewObj.obj._id);
        this.setState({
            viewId: viewObj.obj._id,
        })
        sessionStorage.setItem("viewId", viewObj.obj._id);
        sessionStorage.setItem("viewTitle", viewObj.obj.title);
        this.handleShow(false);
        window.location.reload();

    }

    onConfirmDrawDialog(drawing) {
        this.props.addDrawing(drawing);
        this.props.closeDrawDialog();
    }

    onCloseDialog(dlg) {
        this.props.removeNote(dlg.noteId);
        this.props.closeDialog(dlg.id);
    }

    filterResults(q) {
        const query = q || this.state.query
        let filteredResults = [];
        const notes = Object.values(this.props.viewNotes)
        if (query || this.state.filter) {
            switch (this.state.filter) {
                case "title":
                    filteredResults = notes.filter(note => note.title.toLowerCase().includes(query.toLowerCase()));
                    break;

                case "content":
                    filteredResults = notes.filter(function (obj) {
                        if (obj.data && obj.data.English) {
                            return obj.data.English.includes(query);
                        }
                        else if (obj.data && obj.data.body) {
                            return obj.data.body.includes(query);
                        }
                        return false
                    });

                    break;

                case "author":
                    const authors = [];
                    Object.values(this.props.authors).forEach(obj => {
                        const authName = `${obj.firstName} ${obj.lastName}`.toLowerCase()
                        if (authName.includes(query.toLowerCase())) {
                            authors.push(obj._id);
                        }
                    });
                    filteredResults = notes.filter(note => note.authors.some(author => authors.includes(author)))

                    break;
                case "scaffold":
                    const noteIds = this.props.supports.filter(support => support.from === query).map(support => support.to)
                    filteredResults = notes.filter(note => noteIds.includes(note._id))
                    break;

                default:
                    break;
            }
        }
        return filteredResults
    }
    handleInputChange = (event) => {
        const query = event.target.value
        this.setState({
            query: query,
            filteredData: this.filterResults(query)
        });
    };


    handleFilter = (e) => {
        let value = e.target.value;
        this.setState({
            filter: value,
            query: ''
        });
    }

    buildOn = (buildOn) => {
        this.props.newNote(this.props.view, this.props.communityId, this.props.author._id, buildOn);
    }

    setOpen = (value) => {
        this.open = value;
    }

    goToCommunityManager = () => {
        this.props.history.push("/community-manager");
    }

    render() {
        const showScffold = !this.hideScaffold && this.state.filter === "scaffold";
        const hierarchy = this.getBuildOnHierarchy()
        /* const filteredResults = this.filterResults() */
        let scaffolds;
        if (showScffold) {
            const supports = this.getScaffoldSupports()
            scaffolds = <Row>
                <Col>
                    {supports.map((obj, i) => {
                        return <Row key={i}>
                            <Button variant='link' onClick={() => this.filterNotes(obj.to)} className="scaffold-text">{obj._to.title}</Button>
                        </Row>
                    })}
                </Col>
            </Row>
        }

        return (
            <>
                <DialogHandler />

                <div className="row min-width">
                    {/* LEFT NAVBAR */}
                    <Col md="1" sm="12" className="pd-6-top">

                        <Row className="mrg-025">
                            <Col md="12" sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-plus-circle"></i>}>

                                    <Dropdown.Item onClick={() => this.props.newNote(this.props.view, this.props.communityId, this.props.author._id)}>
                                        New Note
                                        </Dropdown.Item>

                                    <Dropdown.Item onClick={() => this.newView()}>
                                        new View
                                        </Dropdown.Item>
                                </DropdownButton>
                            </Col>
                            <Col md="12" sm="2" xs="2">
                                <Button onClick={this.goToCommunityManager} className="circle-button" variant="outline-info"><i className="fa fa-arrow-left"></i></Button>
                            </Col>


                            {/* <Toolbar></Toolbar>*/}
                            {/* <Col md="12" sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fa fa-pencil"></i>}>

                                </DropdownButton>
                                </Col>
                                <Col md="12" sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-file"></i>}>

                                </DropdownButton>
                                </Col>
                                <Col md="12" sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-hammer"></i>}>

                                </DropdownButton>
                                </Col>

                                <Col md="12" sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-edit"></i>}>

                                </DropdownButton>
                                </Col> */}

                        </Row>
                    </Col>


                    {/* NOTES */}

                    <Col md="5" sm="12" className="mrg-6-top pd-2-right v-scroll">
                        <Form className="mrg-1-bot">
                            <Row>
                                <Col md="8">
                                    <FormGroup>
                                        <Input
                                            value={this.state.query}
                                            placeholder="Search Your Note"
                                            onChange={this.handleInputChange}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md="4">
                                    <FormGroup>
                                        <Input type="select" name="filter" id="filter" onChange={this.handleFilter}>
                                            <option key="title" value="title">Search By Title</option>
                                            <option key="scaffold" value="scaffold">Search By Scaffold</option>
                                            <option key="content" value="content">Search By Content</option>
                                            <option key="author" value="author">Search By Author</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Form>
                        {scaffolds}
                        {this.state.query === "" && !showScffold ?
                            (<ListOfNotes notes={this.props.viewNotes} hierarchy={hierarchy} />)
                            :
                            (<ListOfNotes notes={this.props.viewNotes} noteLinks={this.state.filteredData} />)
                        }
                    </Col>

                    {/* NOTE CONTENT */}
                    {this.props.checkedNotes.length ?
                        (<>
                            <Col md="5" sm="12" className="mrg-6-top v-scroll">
                                <NoteContent query={this.state.query} buildOn={this.buildOn} />
                            </Col>
                        </>)
                        : null
                    }

                </div>




                {/* MODEL */}
                <Modal show={this.state.showModel} onHide={() => this.handleShow(false)}>

                    {this.state.showView ? (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    <Row>
                                        <Col>Views</Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Row>
                                                <Form onSubmit={this.handleSubmitView} className="form">
                                                    <Col>
                                                        <FormGroup>
                                                            <Label htmlFor="addView" style={{ fontSize: "1rem" }}>Add View</Label>
                                                            <Input type="text" id="addView" placeholder="Enter View Name" name="addView" value={this.state.addView} onChange={this.handleChangeView} />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col>
                                                        <Button varient="secondary" onClick={this.handleSubmitView}>Add</Button>
                                                    </Col>
                                                </Form>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ 'max-height': 'calc(100vh - 210px)', 'overflow-y': 'auto' }}>
                                {this.props.myViews.map((obj, i) => {
                                    return <Row key={i} value={obj.title} className="mrg-05-top">
                                        <Col><Link onClick={() => this.changeView({ obj })}> {obj.title} </Link></Col>
                                    </Row>
                                })}
                            </Modal.Body>
                        </>) : null}

                    {this.state.showRiseAbove ? (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    <Row>
                                        <Col>New RiseAbove</Col>
                                    </Row>
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ 'max-height': 'calc(100vh - 210px)', 'overflow-y': 'auto' }}>
                                <Form onSubmit={this.handleSubmit}>
                                    <Label htmlFor="riseAboveTitle" style={{ fontSize: "1rem" }}>RiseAbove Title</Label>
                                    <Input type="text" id="riseAboveTitle" placeholder="Enter RiseAbove Title" name="riseAboveTitle" value={this.state.riseAboveTitle} onChange={this.handleChange} />

                                    <Button className="mrg-1-top" onClick={this.handleSubmit}>Submit</Button>
                                </Form>
                            </Modal.Body>
                        </>) : null}

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.handleShow(false)}>
                            Close
                    </Button>
                    </Modal.Footer>
                </Modal>



            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        communityId: state.globals.communityId,
        viewId: state.globals.viewId,
        view: state.globals.view,
        author: state.globals.author,
        noteContent: state.globals.noteContent,
        communities: state.globals.communities,
        myViews: state.globals.views,
        authors: state.users,
        scaffolds: state.scaffolds.items,
        viewNotes: state.notes.viewNotes,
        checkedNotes: state.notes.checkedNotes,
        viewLinks: state.notes.viewLinks,
        buildsOn: state.notes.buildsOn,
        supports: state.notes.supports
    }
}

const mapDispatchToProps = {
    fetchView,
    fetchCommunity,
    fetchAuthors,
    setCommunityId,
    setViewId,
    setCheckedNotes,
    newNote,
    openContribution,
    fetchViewCommunityData
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
