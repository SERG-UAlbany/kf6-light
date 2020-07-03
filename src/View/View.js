import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { DropdownButton, Dropdown, Button, Row, Col, Modal } from 'react-bootstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import Axios from 'axios';
import { apiUrl } from '../store/api.js';
import * as api from '../store/api.js';
import { newNote, openContribution, setCheckedNotes } from '../store/noteReducer.js'
import { connect } from 'react-redux'
import DialogHandler from '../components/dialogHandler/DialogHandler.js'
import NoteContent from '../components/NoteContent/NoteContent'
import ListOfNotes from './ListOfNotes/ListOfNotes'
import { fetchView, fetchCommunity, setCommunityId, setViewId, fetchViewCommunityData } from '../store/globalsReducer.js'
import { fetchAuthors } from '../store/userReducer.js';
import Author from '../components/Author/Author';
import './View.css';
const _ = require('lodash');

class View extends Component {

    myRegistrations = [];
    myCommunityId = '';
    show = false;
    from = [];
    to = [];
    myTempTo = [];
    hierarchyNote = [];
    noteData1 = [];
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
            viewLinks: [],
            showView: false,
            showCommunity: false,
            showContribution: false,
            showNote: false,
            hNotes: [],
            addView: '',
            showRiseAbove: false,
            showModel: false,
            showNoteContent: false,
            noteContnetList: [],
            query: "",
            filteredData: [],
            filter: 'title',
            scaffoldsTitle: [],
            noteData: [],
            hideScaffold: true,
            bo: [],
        };

        this.getBuildOnHierarchy = this.getBuildOnHierarchy.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleSubmitView = this.handleSubmitView.bind(this);
        this.handleChangeView = this.handleChangeView.bind(this);

        this.onCloseDialog = this.onCloseDialog.bind(this);

        this.onConfirmDrawDialog = this.onConfirmDrawDialog.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);

        this.showContent = this.showContent.bind(this)

        this.fetchSearchBuildsOn = this.fetchSearchBuildsOn.bind(this)
        this.fetchNotes = this.fetchNotes.bind(this)
        this.fetchScaffolds = this.fetchScaffolds.bind(this)
    }

    async fetchNotes() {
        let links;
        let noteData = [];
        let note_promises;
        // GET NOTES ID IN VIEW
        await api.getLinks(this.props.viewId, 'from')
            .then(result => {
                links = result.filter(obj => (obj._to.type === "Note" && obj._to.title !== "" && obj._to.status === "active"))
                note_promises = links.map(filteredObj => {
                    return api.getObject(filteredObj.to)// GET NOTEDATA
                        .then(result => noteData.push(result))
                        .catch(error => console.log("Failed to get data for: ", filteredObj.to));
                });
                const sortedLinks = _.sortBy(links, (obj) => obj._to.modified).reverse();
                this.setState({
                    viewLinks: sortedLinks,
                });
            }).catch(error => console.log("Failed to get Links for viewId", sessionStorage.getItem('viewId')))

        await Promise.all(note_promises) //Wait to fetch all notes
        let notes = {}
        this.setState({
            noteData: noteData,
        });
        this.noteData1 = noteData;
    }

    getBuildOnHierarchy() {
        const hierarchy = {}
        for (let noteId in this.props.viewNotes) {
            hierarchy[noteId] = { children: {} }
        }
        this.state.bo.forEach(note => {
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
    fetchSearchBuildsOn() {
        console.log("Fetch buildson")
        this.from = [];
        this.to = [];
        this.hierarchyNote = [];

        //GET SEARCH - HIRARCHICAL NOTES
        let buildOnResult = [];
        api.linksSearch(this.props.communityId, { "type": "buildson" })
            .then(
                result => {
                    buildOnResult = result.reverse();
                    let filteredBuildOn = buildOnResult.filter((obj) =>
                        (obj._to.type === "Note" && obj._to.status === "active" && obj._from.type === "Note" && obj._from.status === "active")
                    )

                    this.setState({ bo: filteredBuildOn })
                    filteredBuildOn.forEach(obj => {
                        this.from.push(obj.from);
                        this.to.push(obj.to);
                        this.hierarchyNote.push(obj);
                    });
                    try {
                        for (var l in this.to) {
                            if (this.from.includes(this.to[l])) {
                                var index = this.from.indexOf(this.to[l]);
                                var temporaryTo = [];
                                if (this.hierarchyNote[index]) {
                                    temporaryTo.push(this.hierarchyNote[index]);
                                }
                                temporaryTo.push(this.hierarchyNote[l]);
                                this.hierarchyNote[l] = temporaryTo;
                                delete this.hierarchyNote[index];
                            }
                        }
                    } catch (error) {
                        console.log("Error in Hnotes", error);
                    } finally {
                        this.setState({ hNotes: this.hierarchyNote })
                    }
                }).catch(error => console.log("Error occured for BuildsOn", error))

    }

    fetchScaffolds() {
        //GET SCAFFOLDS
        let scaffoldIds = [];
        api.getCommunity(this.props.communityId).then(
            res => {
                scaffoldIds = res.data.scaffolds
                let scaffoldTitle = [];
                // console.log("res", scaffoldIds);

                scaffoldIds.forEach(id => {
                    console.log("ids scaffold", id);

                    let url = `${apiUrl}/links/from/` + id;
                    let config = {
                        headers: { Authorization: `Bearer ${this.props.token}` }
                    };
                    Axios.get(url, config)
                        .then(
                            result => {
                                let scaffoldList = result.data;
                                scaffoldList.map(element => {
                                    scaffoldTitle.push(element._to.title)
                                })
                            });
                });
                this.setState({
                    scaffoldsTitle: scaffoldTitle,
                });


            });
    }

    componentDidMount() {
        if (this.props.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
            this.fetchNotes()
        }
        if (this.props.communityId) {
            this.fetchSearchBuildsOn()
            this.fetchScaffolds()
        }
        const viewId = this.props.match.params.viewId //Get viewId from url param
        this.props.setViewId(viewId)
        this.setState(this.props.location.state);
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewId && this.props.viewId !== prevProps.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
            this.fetchNotes()
        }

        if (this.props.communityId && this.props.communityId !== prevProps.communityId) {
            this.fetchSearchBuildsOn()
            this.fetchScaffolds()
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

    logout() {
        sessionStorage.removeItem('token');
    }

    newContribution() {
        // console.log("New Contribution onclick works");
        this.setState({
            showContribution: true,
            showCommunity: false,
            showView: false,
            showRiseAbove: false,
        })
    }

    newNote() {
        // console.log("New Note onclick works");
        this.setState({
            showNote: true,
            showView: false,
            showRiseAbove: false,
        })
    }

    newView() {
        // console.log("New View onclick works"); 
        this.setState({
            showView: true,
            showRiseAbove: false,
            showNote: false,
            showModel: true,
        })
    }

    newRiseAbove() {
        // console.log("New RiseAbove onclick works");
        this.setState({
            showView: false,
            showNote: false,
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

    showContent(event, id) {
        let isChecked = event.target.checked;
        this.setState({
            showNoteContent: true,
        });

        if (isChecked) {
            let checkedNote = [];
            let noteData = [...this.state.noteData];
            noteData.map((object) => {
                if (object._id && object._id === id) {
                    checkedNote.push(object);
                    let concatArray = [...this.props.checkedNotes].concat(checkedNote);
                    console.log("My Concated Array", concatArray);

                    this.props.setCheckedNotes(concatArray);
                    // this.setState({
                    //     noteContnetList: this.noteContnetNew,
                    // })
                    // console.log("Should push and goto checkedNotes", this.props.noteContent);

                    // console.log("Should push and goto AFTER ", this.props.noteContent);
                    // console.log("STATE DATA", this.state.noteContnetList);

                }
                return null;
            });

        } else {
            this.closeNote(id);
        }

    }

    //CLOSE NOTE
    closeNote = (id) => {
        let checkedNotes = [...this.props.checkedNotes];
        // checkedNotes.filter(obj => obj._id.includes(id)).map(filteredObj => {
        //     checkedNotes.pop(filteredObj)
        //     return null;
        // });

        const filteredArray = checkedNotes.filter(function (obj) {
            return !obj._id.includes(id)
        })

        this.props.setCheckedNotes(filteredArray)

        //TODO UNCHECK THE BOXES IN LEFT

    }


    filterNotes = (query) => {
        console.log("filterNotes", query);
        let filteredResults = [];
        filteredResults = this.noteData1.filter(function (obj) {
            if (obj.data && obj.data.English) {
                console.log("IF obj.data.English", obj.data.English);

                return obj.data.English.includes(query);
            }
        });
        this.setState({
            filteredData: filteredResults,
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

    handleInputChange = (event) => {
        const query = event.target.value
        this.setState({
            query: query,
        });
        let filteredResults = [];
        if (query || this.state.filter) {
            switch (this.state.filter) {
                case "title":
                    this.state.viewLinks.filter(obj => obj._to.title.includes(query)).map(filteredObj => {
                        filteredResults.push(filteredObj);
                        return null;
                    })
                    break;

                case "content":
                    filteredResults = this.noteData1.filter(function (obj) {
                        if (obj.data && obj.data.English) {
                            return obj.data.English.includes(event.target.value);
                        }
                        else if (obj.data && obj.data.body) {
                            return obj.data.body.includes(event.target.value);
                        }
                        else {
                            return null;
                        }
                    });

                    break;

                case "author":
                    let filteredNotes = [];
                    let authors = [];

                    // authors = Object.values(this.props.authors).filter(function (obj) {
                    //     let fullName = obj.firstName.toLowerCase() + " " + obj.lastName.toLowerCase();
                    //     if (fullName.includes(query.toLowerCase())) {
                    //         return obj._id;
                    //     }
                    // });
                    // authors.forEach(element => {
                    //     filteredNotes = this.state.viewLinks.filter(obj => obj.authors && obj.authors.includes(element)).map(filteredObj => {
                    //         return filteredObj;
                    //     });
                    //     filteredResults.concat(filteredNotes);
                    //     console.log("Authors filtered", filteredResults);
                    // });
                        // let authors = [];

                        Object.values(this.props.authors).forEach(obj => {
                            let fullName = obj.firstName.toLowerCase() + " " + obj.lastName.toLowerCase();
                            if (fullName.includes(query.toLowerCase())) {
                                console.log("Matched", obj._id);
                                authors.push(obj._id);
                            }
                        });

                        authors.forEach(element => {
                            filteredResults = this.noteData1.filter(obj => obj.authors.includes(element)).map(filteredObj => {
                                return filteredObj;
                            });
                        });


                        break;
                case "scaffold":
                    this.setState({
                        hideScaffold: false,
                    })

                    break;

                default:
                    break;
            }
        }

        this.setState({
            filteredData: filteredResults,
        })
    };


    handleFilter = (e) => {
        let value = e.target.value;
        this.setState({
            filter: value,
        });
    }

    buildOn = (buildOn) => {
        sessionStorage.setItem("buildOn", buildOn);
        this.props.newNote(this.props.view, this.props.communityId, this.props.author._id);
    }

    openNote = (contribId) => {
        this.props.openContribution(contribId)
    }

    setOpen = (value) => {
        this.open = value;
    }

    render() {
        const showScffold = !this.hideScaffold && this.state.filter === "scaffold";
        const hierarchy = this.getBuildOnHierarchy()
        let scaffolds;
        if (showScffold) {
            scaffolds = <Row>
                <Col>
                    {this.state.scaffoldsTitle.map((obj, i) => {
                        return <Row key={i} className="scaffold-title">
                            <Link onClick={() => this.filterNotes(obj)} className="scaffold-text">{obj}</Link>
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

                                    <Dropdown.Item onClick={() => this.newRiseAbove()}>
                                        New RiseAbove
                                        </Dropdown.Item>
                                </DropdownButton>
                            </Col>


                            {/* <Toolbar></Toolbar>*/}
                            <Col md="12" sm="2" xs="2">
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
                            </Col>

                        </Row>
                    </Col>


                    {/* NOTES */}

                    <Col md="5" sm="12" className="mrg-6-top pd-2-right v-scroll">
                        <Form className="mrg-1-bot">
                            <Row>
                                <Col md="8">
                                    <FormGroup>
                                        <Input
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
                            (
                                <ListOfNotes noteLinks={this.state.viewLinks} notes={this.props.viewNotes} hierarchy={hierarchy}
                                    hNotes={this.state.hNotes} showContent={this.showContent} openNote={this.openNote} />)
                            :
                            (<>
                                {this.state.filteredData.map((obj, i) => {
                                    return <>
                                        {obj._to && obj._to.title ?
                                            (<>
                                                <div className="shadow p-3 mb-5 rounded">
                                                    <Row key={i} value={obj.to} className="mrg-05-top">
                                                        <Col className=" rounded mrg-1-bot">
                                                            <Row className="pd-05">
                                                                <Col className="primary-800 font-weight-bold"> {obj._to.title}</Col>
                                                                <Col md="2">
                                                                    <Form className="mrg-1-min pd-2-right">
                                                                        <FormGroup>
                                                                            <Input type="checkbox" ref={obj.to} onChange={e => this.showContent(e, obj.to)} />
                                                                        </FormGroup>
                                                                    </Form>
                                                                </Col>
                                                            </Row>
                                                            <Row className="primary-600 sz-075 pd-05">
                                                                <Col><Author authorId={obj._to.authors} />&nbsp; {obj._to.created}
                                                                </Col>
                                                                <Col md="2">
                                                                    {/* <Button onClick={() => this.buildOn(obj.to)}>BuildOn</Button> */}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </>)
                                            : (<>
                                                {obj._id ? (<>
                                                    <div className="shadow p-3 mb-5 rounded">
                                                        <Row key={i} value={obj._id} className="mrg-05-top">
                                                            <Col className="rounded mrg-1-bot">
                                                                <Row className="pd-05">
                                                                    <Col className="primary-800 font-weight-bold"> {obj.title}</Col>
                                                                    <Col md="2">
                                                                        <Form className="mrg-1-min pd-2-right">
                                                                            <FormGroup>
                                                                                <Input type="checkbox" ref={obj._id} onChange={e => this.showContent(e, obj._id)} />
                                                                            </FormGroup>
                                                                        </Form>
                                                                    </Col>
                                                                </Row>
                                                                <Row className="primary-600 sz-075 pd-05">
                                                                    <Col><Author authorId={obj.authors} />&nbsp; {obj.created}</Col>
                                                                    <Col md="2">
                                                                        {/* <Button onClick={() => this.buildOn(obj._id)}>BuildOn</Button> */}
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </>)
                                                    : (<></>)}
                                            </>)
                                        }

                                    </>
                                })}

                            </>)}
                    </Col>

                    {/* NOTE CONTENT */}
                    {this.state.showNoteContent ?
                        (<>
                            <Col md="5" sm="12" className="mrg-6-top v-scroll">
                                <NoteContent noteContnetList={this.state.noteContnetList} closeNote={this.closeNote} query={this.state.query} filter={this.state.filter} buildOn={this.buildOn} />
                            </Col>
                        </>)
                        : null
                    }

                </div>




                {/* MODEL */}
                <Modal show={this.state.showModel} onHide={() => this.handleShow(false)}>
                    {this.state.showContribution ? (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>Contributions</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ 'max-height': 'calc(100vh - 300px)', 'overflow-y': 'auto' }}>
                                {this.state.hNotes.map((obj, i) => {
                                    return <Row key={i} value={obj.to} className="mrg-05-top">
                                        <Col className="mr-auto">
                                            <Row className="indigo"> {obj._to.title}</Row>
                                            <Row> {obj.to}</Row>
                                            <Row className="pd-2-left blue"> {obj._from.title}</Row>
                                            <Row className="pd-2-left"> {obj.from}</Row>
                                            <hr />
                                        </Col>
                                    </Row>
                                })}

                                {this.state.viewLinks.map((obj, i) => {
                                    return <Row key={i} value={obj.to} className="mrg-05-top">
                                        <Col>
                                            <Row className="indigo"> {obj._to.title}</Row>
                                            <Row> {obj.to}</Row>
                                            <hr />
                                        </Col>
                                    </Row>
                                })}
                            </Modal.Body>
                        </>) : null}

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

                    {this.state.showNote ? (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    <Row>
                                        <Col>New Note</Col>
                                    </Row>
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ 'max-height': 'calc(100vh - 210px)', 'overflow-y': 'auto' }}>
                                New Note
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
        checkedNotes: state.notes.checkedNotes
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
