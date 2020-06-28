import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { DropdownButton, Dropdown, Button, Row, Col, Modal } from 'react-bootstrap';
import { Form, FormGroup, Label, Input} from 'reactstrap';
import Axios from 'axios';
import {apiUrl} from '../store/api.js';
import * as api from '../store/api.js';
import {newNote, openContribution} from '../store/noteReducer.js'
import { connect } from 'react-redux'
import DialogHandler from '../components/dialogHandler/DialogHandler.js'
import NoteContent from '../components/NoteContent/NoteContent'
import { fetchAuthor, fetchView, fetchCommunity, setCommunityId, setViewId} from '../store/globalsReducer.js'
import { fetchAuthors } from '../store/userReducer.js';
import Author from '../components/Author/Author';
import './View.css';
const _ = require('lodash');

class View extends Component {

    myRegistrations= [];
    myViews = []; 
    myCommunityId = '';
    show= false; 
    from = [];
    to = []; 
    myTempTo = [];
    hierarchyNote =[];
    noteData1 = [];
    noteContnetNew =[];

    //TOKEN
    token = sessionStorage.getItem('token');


    constructor(props) {
        super(props);
        // GET communityId AND welcomeId IN myState
        // this.myState= this.props.location.state;
        
        //COMMUNITY-ID
        // this.myCommunityId = this.myState.communityId;

        this.state={
            communitites: [],
            myCommunities: [],
            views: [],
            communityId: sessionStorage.getItem('communityId'),
            viewId: sessionStorage.getItem('viewId'),
            viewLinks : [],
            showView: false,
            showCommunity: false,
            showContribution: false,
            showNote: false,
            hNotes: [],
            addView: '',
            showRiseAbove : false,
            showModel : false,
            showNoteContent: false,
            noteContnetList : [],
            query:"",
            filteredData: [],
            filter:'title',
            authors: [],
            scaffolds : [],
            scaffoldsTitle : [],
            noteData: [],

        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleSubmitView = this.handleSubmitView.bind(this);
        this.handleChangeView = this.handleChangeView.bind(this);
        
        this.onCloseDialog = this.onCloseDialog.bind(this);
        
        this.onConfirmDrawDialog = this.onConfirmDrawDialog.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);
        
        this.showContent = this.showContent.bind(this);
    }


    componentDidMount(){
        /* this.props.setCommunityId(sessionStorage.getItem('communityId'))
         * this.props.setViewId(sessionStorage.getItem('viewId')) */
        this.props.fetchAuthor(this.props.communityId)
        this.props.fetchView(this.props.viewId)
        this.props.fetchCommunity(this.props.communityId)
        this.props.fetchAuthors(this.props.communityId)

        this.setState(this.props.location.state);
        // console.log("state",this.state);
        

        //GET LIST OF ALL COMMUNITIES
        Axios.get(`${apiUrl}/communities`)
        .then(
            result=>{
                this.setState({
                    communitites: result.data
                 })
            }).catch(
                error=>{
                    console.log("GET Communities Failed");
                    alert("GET Communities Failed");
                }
            );
            
            //SET HEADER WITH TOKEN BEARER
            var config = {
                headers: { Authorization: `Bearer ${this.token}` }
            };

            //GET USER'S VIEWS
            var viewUrl= `${apiUrl}/communities/${this.state.communityId}/views`;
            Axios.get(viewUrl, config)
            .then(
                result=>{
                    this.setState({
                        myViews: result.data
                     })
                    
                }).catch(
                    error=>{
                        alert(error);
                    });  
                    

            //GET USER'S REGISTERED COMMUNITIES
            Axios.get(`${apiUrl}/users/myRegistrations`, config)
            .then(
                result=>{
                    this.setState({
                        myCommunities: result.data
                     })
                }).catch(
                    error=>{
                        alert(error);
                    }
                );


            let viewNotesUrl= `${apiUrl}/links/from/${sessionStorage.getItem('viewId')}`;
            let links;
            let noteData=[];
            // GET NOTES ID IN VIEW
            Axios.get(viewNotesUrl, config)
            .then(
                result=>{
                    // links = result.data;
                    links = result.data.filter(obj=>(obj._to.type === "Note" && obj._to.title !== "" && obj._to.status === "active")).map(
                        filteredObj=>{
                            
                            let noteUrl=`${apiUrl}/objects/${filteredObj.to}`;
                            // GET NOTEDATA
                            Axios.get(noteUrl, config)
                            .then(
                                result=>{
                                    noteData.push(result.data);
                                }).catch(
                                    error=>{
                                        console.log("Failed to get data for: ",filteredObj.to);                                        
                                });
                            return filteredObj;
                    });

                    const sortedLinks = _.sortBy(links, function(obj) { 
                        return obj._to.modified;
                    }).reverse();

                    this.setState({
                        viewLinks: sortedLinks, 
                        noteData : noteData,
                    });
                    // console.log("state link and data", this.state.viewLinks, this.state.noteData);
                    this.noteData1 = noteData;
        
                }).catch(
            error=>{
                console.log("Failed to get Links for viewId", sessionStorage.getItem('viewId'));
            });

            
            //GET SEARCH - HIRARCHICAL NOTES
            var searchUrl = `${apiUrl}/links/${this.state.communityId}/search`;
            let query = {"query": {"type": "buildson"}};
            let buildOnResult = [];
            Axios.post(searchUrl, query, config)
            .then(
                result=>{
                    buildOnResult = result.data.reverse();
                    let filteredBuildOn = buildOnResult.filter(function (obj){
                        if ((obj._to.type === "Note" && obj._to.status === "active") 
                            && (obj._from.type === "Note" && obj._from.status === "active")) {
                                return obj;
                        }
                        else {
                            return null;
                        }
                    });

                    filteredBuildOn.map(obj=>{
                        this.from.push(obj.from);
                        this.to.push(obj.to);
                        this.hierarchyNote.push(obj);
                        return null;
                    });

                    try {
                        for(var l in this.to){
                            if(this.from.includes(this.to[l])){
                                var index= this.from.indexOf(this.to[l]);
                                var temporaryTo = [];
                                if(this.hierarchyNote[index]){
                                    temporaryTo.push(this.hierarchyNote[index]);
                                }
                                temporaryTo.push(this.hierarchyNote[l]);
                                this.hierarchyNote[l] = temporaryTo;
                                delete this.hierarchyNote[index];                                
                            }
                        }
                        
                    } catch (error) {
                        console.log("Error in Hnotes", error);
                        
                    }finally{
                        this.setState({
                            hNotes : this.hierarchyNote
                        })
                        // console.log("HNOTES", this.state.hNotes);
                        
                    }                      
                }).catch(
                    error=>{
                        console.log("Error occured for BuildsOn", error);                        
                })

            
            //GET AUTHORS
            var authorUrl = `${apiUrl}/communities/${this.state.communityId}/authors`;
            Axios.get(authorUrl, config)
            .then(
                result=>{
                    this.setState({
                        authors : result.data,
                    });

                    // console.log("this.state.authors",this.state.authors);


                }).catch(
                    error=>{
                        alert(error);
                    });

            //GET SCAFFOLDS
            let scaffoldIds =[];
            let scaffolds = [];
            api.getCommunity(this.state.communityId).then(
                res=>{
                    scaffoldIds = res.data.scaffolds
                    // console.log("res", scaffoldIds);
                    
                    scaffoldIds.forEach(id => {
                        // CALL COMMNITY LINK / VIEW LINK  ID THEN SEARCH IN CONTENT  
                        let url = `${apiUrl}/links/from/` + id ;
                        
                        Axios.get(url, config)
                        .then(
                            result=>{
                                scaffolds.push(result.data);
                        });
                    });

                    this.setState({
                        scaffolds : scaffolds,
                    });                                    
                });
            }

    handleChange = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;
        // console.log(name,value);        

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
        
        var addViewUrl = `${apiUrl}/contributions/${this.state.communityId}`;
        
        var query= {"authors":[sessionStorage.getItem("userId")],
            "communityId":this.state.communityId, 
            "permission":"public",
            "status":"active",
            "title": this.state.addView,
            "type": "View"}
        Axios.post(addViewUrl,query,config)
            .then(
                result=>{
                    // console.log("Successful",result);
                    
                }
            ).catch(
                error=>{
                    console.log(error);
                    
                }
            );
    }

    logout(){
        sessionStorage.removeItem('token');
    }

    newContribution(){
        // console.log("New Contribution onclick works");
        this.setState({
            showContribution: true,
            showCommunity: false,
            showView: false,
            showRiseAbove: false,
        })
    }

    newNote(){
        // console.log("New Note onclick works");
        this.setState({
            showNote: true,
            showView: false,
            showRiseAbove : false,
        })
    }

    newView(){
        // console.log("New View onclick works"); 
        this.setState({
            showView: true,
            showRiseAbove : false,
            showNote : false,
            showModel: true, 
        })
    }

    newRiseAbove(){
        // console.log("New RiseAbove onclick works");
        this.setState({
            showView: false,
            showNote : false,
            showRiseAbove : true,
            showModel: true,
        }) 
    }
    
    //HANDLE MODEL
    handleShow(value){
        this.setState({
            showModel: value,
        });
        
    }

    handleShowNoteContent(value){
        this.setState({
            showView: false,
            showNote : false,
            showRiseAbove : false,
        });
        
    }

    showContent(event, id){
        let isChecked = event.target.checked;
        this.setState({
            showNoteContent : true,
        });
        
        if (isChecked) {
            var myArray = this.noteData1;
            myArray.map((object)=>{
                if(object._id && object._id===id){
                    this.noteContnetNew.push(object);
                    this.setState({
                        noteContnetList : this.noteContnetNew,
                    })
                    // console.log("STATE DATA", this.state.noteContnetList);
                    
                }
                return null;
            });
            
        } else {
            this.noteContnetNew.filter(obj => obj._id.includes(id)).map(filteredObj => {
                this.noteContnetNew.pop(filteredObj)
                return null;
            });
            this.setState({
                noteContnetList : this.noteContnetNew,
            })
        }
               
    }

    //CLOSE NOTE
    closeNote = (id) => {
        if (this.state.noteContnetList){
            let noteArray = [...this.state.noteContnetList];
        
            if(noteArray){             
                noteArray.filter(obj => obj._id.includes(id)).map(filteredObj => {
                    noteArray.pop(filteredObj);
                    this.setState({
                        noteContnetList : [...noteArray],
                    });
                    // this.refs[id]
                    // console.log("Check refs",this.refs[id]);
                    return null;
                    
                });
            }
        }       
        
    }


    filterNotes = (query) => {
        // console.log("filterNotes", query);
        let filteredResults=[];
        filteredResults = this.noteData1.filter(function (obj) {
            if (obj.data && obj.data.English){                      
                return obj.data.English.includes(query);
            }
            return null;
        });
        this.setState({
            filteredData : filteredResults,
        });
        
    }


    changeView(viewObj){
        // console.log("viewId",viewObj.obj._id);
        this.setState({
            viewId: viewObj.obj._id,
        })
        sessionStorage.setItem("viewId", viewObj.obj._id);
        sessionStorage.setItem("viewTitle", viewObj.obj.title);
        this.handleShow(false);
        window.location.reload();
        
    }

    onConfirmDrawDialog(drawing){
        this.props.addDrawing(drawing);
        this.props.closeDrawDialog();
    }

    onCloseDialog(dlg){
        this.props.removeNote(dlg.noteId);
        this.props.closeDialog(dlg.id);
    }

    handleInputChange = (event) => {
        this.setState({
            query : event.target.value,
        });

        let filteredResults=[];
        if(this.state.query || this.state.filter){
            switch (this.state.filter) {
                case "title":
                    this.state.viewLinks.filter(obj => obj._to.title.includes(this.state.query)).map(filteredObj => {
                        filteredResults.push(filteredObj);
                        return null;
                    })
                    break;
                
                case "content":
                    filteredResults = this.noteData1.filter(function (obj) {
                        if (obj.data && obj.data.English){                      
                            return obj.data.English.includes(event.target.value);
                        }
                        else if(obj.data && obj.data.body){
                            return obj.data.body.includes(event.target.value);
                        }
                        else {
                            return null;
                        }
                    });
                    
                    break;
                
                case "author":
                    // console.log("Author", this.state.query);
                    // console.log("State authors", this.state.authors);
                    var authorId =[];

                    this.state.authors.map(obj=>{
                        if(obj.firstName.toLowerCase().includes(this.state.query.toLowerCase()) || obj.lastName.toLowerCase().includes(this.state.query.toLowerCase())){
                            // console.log("Matched", obj._id);
                            authorId.push(obj._id);   
                        }
                        return null;
                    });
                    
                    authorId.forEach(element => {
                        filteredResults = this.noteData1.filter(obj => obj.authors.includes(element)).map(filteredObj=>{
                            return filteredObj; 
                        });
                    });
                    

                    break;
                case "scaffold":
                    //GET SCAFFOLD TITLES
                    let scaffoldTitle = [];
                    this.state.scaffolds.map(
                        element => {
                            element.map(
                                obj =>{
                                    scaffoldTitle.push(obj._to.title);
                                    return null;
                                });
                                return null;
                        }
                    );

                    this.setState({
                        scaffoldsTitle : scaffoldTitle,
                    });
                    
                    
                    
                    break;
            
                default:
                    break;
            }
        }
        
        this.setState({
            filteredData : filteredResults,
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
        this.props.newNote(this.props.view, this.props.communityId, this.props.author._id) ;       
    }

    openNote = (contribId) => {
        this.props.openContribution(contribId)
    }

    render() {

        return (
            <>
                <DialogHandler/>

                    <div className="row min-width">
                        {/* LEFT NAVBAR */}
                        <Col md="1" sm="12" className="pd-6-top">
                            
                            <Row className="mrg-025">
                                <Col md="12"sm="2" xs="2">
                                    <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-plus-circle"></i>}>
                                        
                                        <Dropdown.Item onClick={()=>this.props.newNote(this.props.view, this.props.communityId, this.props.author._id)}>
                                                New Note
                                        </Dropdown.Item>

                                        <Dropdown.Item onClick={()=>this.newView()}>
                                                new View
                                        </Dropdown.Item>
                                        
                                        <Dropdown.Item onClick={()=>this.newRiseAbove()}>
                                                New RiseAbove
                                        </Dropdown.Item>
                                    </DropdownButton>
                                </Col>
                            
                            
                            {/* <Toolbar></Toolbar>*/}
                            <Col md="12"sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fa fa-pencil"></i>}>
                    
                                </DropdownButton>
                            </Col>
                            <Col md="12"sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-file"></i>}>
                    
                                </DropdownButton>
                            </Col>
                            <Col md="12"sm="2" xs="2">
                                <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-hammer"></i>}>
                    
                                </DropdownButton>
                            </Col>
                            
                            <Col md="12"sm="2" xs="2">
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
                        {this.state.query === ""? 
                        (<>
                            {this.state.hNotes.map((obj, i) => {
                            return <Row key={i} className="mrg-05-top">
                                <Col className="mr-auto primary-bg-200 rounded mrg-1-bot">
                                    {obj._to && obj._to.title && obj._to.created ?(<>
                                        <Row className="pd-05">
                                            <Col md="10" className="primary-800 font-weight-bold">{obj._to.title}</Col>
                                            <Col md="2">
                                            <Form className="mrg-1-min pd-2-right">
                                                <FormGroup>
                                                    <Input type="checkbox" ref= {obj.to} onChange={e => this.showContent(e, obj.to)}/>
                                                </FormGroup>
                                            </Form>
                                            </Col>
                                        </Row>
                                    <Row className="primary-600 sz-075 pd-05">
                                        <Col><Author authorId ={obj._to.authors}/>&nbsp; {obj._to.created}</Col>
                                        <Col md="2">
                                            <Button onClick={()=>this.buildOn(obj.to)}>BuildOn</Button>
                                        </Col>
                                    </Row>
                                        </>)
                                        :
                                        (<>
                                            {obj[0]? 
                                            (<>
                                                <Row className="">
                                                <Col>
                                                    <Row>
                                                    {obj[0]._to && obj[0]._to.title && obj[0]._to.created ?
                                                    (<>
                                                        <Col>
                                                            <Row className="pd-05">
                                                                <Col md="10" className="primary-800 font-weight-bold"> {obj[0]._to.title}</Col>
                                                                <Col md="2">
                                                                    <Form className="mrg-1-min pd-2-right">
                                                                        <FormGroup>
                                                                            <Input type="checkbox" ref= {obj[0].to} onChange={e => this.showContent(e, obj[0].to)}/>
                                                                        </FormGroup>
                                                                    </Form>
                                                                </Col>
                                                                </Row>
                                                            <Row className="primary-600 sz-075 pd-05">
                                                                <Col><Author authorId ={obj[0]._to.authors}/>&nbsp; {obj[0]._to.created}</Col>
                                                                <Col md="2">
                                                                    <Button onClick={()=>this.buildOn(obj[0].to)}>BuildOn</Button>
                                                                </Col>
                                                                </Row>
                                                        </Col>
                                                    </>)
                                                    :
                                                    null}
                                                    </Row>
                                                
                                                {obj.map((subObj,j)=>{
                                                    return <Row key={j}>
                                                        <Col md="1">
                                                        </Col>
                                                        <Col>
                                                            {obj[0] && obj[0]._to && obj[0]._to.title && subObj && subObj._from && subObj._from.created ?(<>
                                                            <Row className="pd-05 border-left border-primary">
                                                                <Col className="primary-800 font-weight-bold">{subObj._from.title}</Col>
                                                                <Col md="2">
                                                                    <Form className="mrg-1-min">
                                                                        <FormGroup>
                                                                            <Input className="pd-left" type="checkbox" ref= {subObj.from} onChange={e => this.showContent(e, subObj.from)}/>
                                                                        </FormGroup>
                                                                    </Form>
                                                                </Col>
                                                                </Row>
                                                            <Row className="primary-600 sz-075 pd-05 border-left border-primary">
                                                                <Col><Author authorId ={subObj._from.authors}/>&nbsp; {subObj._from.created}
                                                                </Col>
                                                                <Col md="2">
                                                                    <Button onClick={()=>this.buildOn(subObj.from)}>BuildOn</Button>
                                                                </Col>
                                                            </Row></>):(<></>)}
                                                        </Col>
                                                    </Row>
                                                            
                                                })}
                                                </Col>
                                                </Row>
                                            </>)
                                            :
                                            (<></>) }
                                        </>)}                                    
                                    
                                    { obj._from && obj._from.title && obj._to.created ? 
                                        (<>
                                            <Row>
                                            <Col md="1"></Col>
                                            <Col>
                                                <Row className="pd-05 border-left border-primary"> 
                                                <Col className="primary-800 font-weight-bold">{obj._from.title}</Col>
                                                <Col md="2">
                                                <Form className="mrg-1-min">
                                                    <FormGroup>
                                                        <Input className="pd-left" type="checkbox" ref= {obj.from} onChange={e => this.showContent(e, obj.from)}/>
                                                    </FormGroup>
                                                </Form>
                                                </Col>
                                                </Row>
                                                <Row className="primary-600 sz-075 pd-05 border-left border-primary">
                                                    <Col><Author authorId ={obj._from.authors}/>&nbsp; {obj._from.created}</Col>
                                                    <Col md="2">
                                                        <Button onClick={()=>this.buildOn(obj.from)}>BuildOn</Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            </Row>
                                        </>)
                                        :(<>
                                        </>)}                                     
                                    
                                </Col>
                            </Row>
                            }
                            
                            )}                            
                        {this.state.viewLinks.map((obj, i) => {
                            return <>
                            {obj && obj._to.title?    
                                (<>
                                <Row key={i} value={obj.to} className="mrg-05-top">
                                    <Col className="primary-bg-200 rounded mrg-1-bot">
                                    <Row className="pd-05">
                                        <Col className="primary-800 font-weight-bold"> {obj._to.title}</Col>
                                        <Col md="2">
                                            <Form className="mrg-1-min pd-2-right">
                                                <FormGroup>
                                                    <Input type="checkbox" ref= {obj.to} onChange={e => this.showContent(e, obj.to)}/>
                                                </FormGroup>
                                            </Form>
                                        </Col>
                                        </Row>
                                    <Row className="primary-600 sz-075 pd-05">
                                        <Col><Author authorId ={obj._to.authors}/>&nbsp; {obj._to.created}
                                        </Col>
                                        <Col md="3">
                                            <Button size='sm' onClick={()=>this.buildOn(obj.to)}>BuildOn</Button>
                                            <Button size='sm' className='ml-1' onClick={() => this.openNote(obj.to)}><i className="fa fa-pencil"></i></Button>
                                        </Col>
                                    </Row>
                                    </Col>
                                </Row>
                                </>)
                                :(<></>)
                            }
                            
                            </>
                            })}
                        </>)
                        :(<>

                        <Row>
                            {this.state.scaffoldsTitle &&  this.state.filter === "scaffold"? (
                                <Col>
                                    {this.state.scaffoldsTitle.map((obj, i) => {
                                        return <Row key={i} className="scaffold-title">
                                            <Link onClick={()=>this.filterNotes(obj)} className="white">{obj}</Link>
                                        </Row>})}                                    
                                </Col>
                            ):null
                            }
                        </Row>

                        {this.state.filteredData.map((obj, i) => {
                            return <>
                            {obj._to && obj._to.title?    
                                (<>
                                <Row key={i} value={obj.to} className="mrg-05-top">
                                    <Col className="primary-bg-200 rounded mrg-1-bot">
                                    <Row className="pd-05">
                                        <Col className="primary-800 font-weight-bold"> {obj._to.title}</Col>
                                        <Col md="2">
                                            <Form className="mrg-1-min pd-2-right">
                                                <FormGroup>
                                                    <Input type="checkbox" ref= {obj.to} onChange={e => this.showContent(e, obj.to)}/>
                                                </FormGroup>
                                            </Form>
                                            </Col>
                                        </Row>
                                    <Row className="primary-600 sz-075 pd-05">
                                        <Col><Author authorId ={obj._to.authors}/>&nbsp; {obj._to.created}
                                        </Col>
                                        <Col md="2">
                                            <Button onClick={()=>this.buildOn(obj.to)}>BuildOn</Button>
                                        </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                </>)
                                :(<>
                                    {obj._id ? (<>
                                        <Row key={i} value={obj._id} className="mrg-05-top">
                                        <Col className="primary-bg-200 rounded mrg-1-bot">
                                        <Row className="pd-05">
                                            <Col className="primary-800 font-weight-bold"> {obj.title}</Col>
                                            <Col md="2">
                                            <Form className="mrg-1-min pd-2-right">
                                                <FormGroup>
                                                    <Input type="checkbox" ref= {obj._id} onChange={e => this.showContent(e, obj._id)}/>
                                                </FormGroup>
                                            </Form>
                                            </Col>
                                            </Row>
                                        <Row className="primary-600 sz-075 pd-05">
                                            <Col><Author authorId ={obj.authors}/>&nbsp; {obj.created}</Col>
                                            <Col md="2">
                                                <Button onClick={()=>this.buildOn(obj._id)}>BuildOn</Button>
                                            </Col>
                                        </Row>
                                        </Col>
                                </Row>   
                                    </>)
                                :(<></>)}
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
                                <NoteContent noteContnetList = {this.state.noteContnetList} closeNote = {this.closeNote} query = {this.state.query} filter={this.state.filter}/>
                            </Col>
                        </>)
                        :null
                        }
                        
                    </div>
                        
                
            
            
            {/* MODEL */}
            <Modal show={this.state.showModel} onHide={()=>this.handleShow(false)}>
                    {this.state.showContribution ?(
                    <>
                        <Modal.Header closeButton>
                        <Modal.Title>Contributions</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{'max-height': 'calc(100vh - 300px)', 'overflow-y': 'auto'}}>
                            {this.state.hNotes.map((obj, i) => {
                                return <Row key={i} value={obj.to} className="mrg-05-top">
                                    <Col className="mr-auto">
                                        <Row className="indigo"> {obj._to.title}</Row>
                                        <Row> {obj.to}</Row>
                                        <Row className="pd-2-left blue"> {obj._from.title}</Row>
                                        <Row className="pd-2-left"> {obj.from}</Row>
                                        <hr/>
                                    </Col>
                                </Row>
                            })}                            

                            {this.state.viewLinks.map((obj, i) => {
                            return <Row key={i} value={obj.to} className="mrg-05-top">
                                <Col>
                                    <Row className="indigo"> {obj._to.title}</Row>
                                    <Row> {obj.to}</Row>
                                    <hr/>
                                </Col>
                            </Row>
                            })}
                        </Modal.Body>
                    </>) : null }

                    {this.state.showView ?(
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
                                        <Label htmlFor="addView" style={{fontSize:"1rem"}}>Add View</Label>
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
                        <Modal.Body style={{'max-height': 'calc(100vh - 210px)', 'overflow-y': 'auto'}}>
                            {this.state.myViews.map((obj, i) => {
                            return <Row key={i} value={obj.title} className="mrg-05-top">
                                <Col><Link onClick={()=>this.changeView({obj})}> {obj.title} </Link></Col>
                            </Row>
                            })}
                        </Modal.Body>
                    </>) : null }

                    {this.state.showRiseAbove ?(
                    <>
                        <Modal.Header closeButton>
                        <Modal.Title>
                            <Row>
                            <Col>New RiseAbove</Col>
                            </Row>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{'max-height': 'calc(100vh - 210px)', 'overflow-y': 'auto'}}>
                            <Form onSubmit={this.handleSubmit}>
                                <Label htmlFor="riseAboveTitle" style={{fontSize:"1rem"}}>RiseAbove Title</Label>
                                <Input type="text" id="riseAboveTitle" placeholder="Enter RiseAbove Title" name="riseAboveTitle" value={this.state.riseAboveTitle} onChange={this.handleChange} />
                                
                                <Button className="mrg-1-top" onClick={this.handleSubmit}>Submit</Button>
                            </Form>
                        </Modal.Body>
                    </>) : null }

                    {this.state.showNote ?(
                    <>
                        <Modal.Header closeButton>
                        <Modal.Title>
                            <Row>
                            <Col>New Note</Col>
                            </Row>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{'max-height': 'calc(100vh - 210px)', 'overflow-y': 'auto'}}>
                            New Note
                        </Modal.Body>
                    </>) : null }


                    <Modal.Footer>
                    <Button variant="secondary" onClick={()=>this.handleShow(false)}>
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
        author: state.globals.author
    }
}

const mapDispatchToProps = {
    fetchAuthor,
    fetchView,
    fetchCommunity,
    fetchAuthors,
    setCommunityId,
    setViewId,
    newNote,
    openContribution
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
