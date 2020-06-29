import React, { Component } from 'react';
import { Button, Row, Col,} from 'react-bootstrap';
import {Form, FormGroup, Input, Alert} from 'reactstrap';

import Axios from 'axios';

import './NoteContent.css';
import {apiUrl} from '../../store/api.js';

class NoteContent extends Component{
    noteList = [];
    constructor(props) {
        super(props);
        this.state={
        token : sessionStorage.getItem('token'),
        myViews : [],
        viewId : sessionStorage.getItem('viewId'),
        viewTitle : sessionStorage.getItem("viewTitle")? sessionStorage.getItem("viewTitle") :'welcome',
        addView : sessionStorage.getItem("viewTitle")? sessionStorage.getItem("viewTitle") :'welcome',
        communityId : sessionStorage.getItem('communityId'),
        visible : false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
        
    }

    componentDidMount(){

        //SET HEADER WITH TOKEN BEARER
        var config = {
          headers: { Authorization: `Bearer ${this.state.token}` }
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
                    // alert(error);
                });
      }

      handleChange(e) {
        e.persist();
        let target = e.target;
        let id = target.value;
        
        this.setState({
            addView : id,
        });
             
    }
  
      handleSubmit(e) {
        e.preventDefault();
        console.log("State Handle Submit", this.state.addView);

        let url = `${apiUrl}/links`;
        let config = {
            headers: { Authorization: `Bearer ${this.state.token}` }
          };
        this.props.noteContnetList.forEach(note => {
            let noteId = note._id;
            let query = {
                "from": this.state.addView,
                "to" : noteId,
                "type": "contains"
            };
            Axios.post(url, query, config).then(
                res => {
                    // console.log("AZIOX POST DONE");
                    this.setState({visible:true},()=>{
                        window.setTimeout(()=>{
                          this.setState({visible:false})
                        },1000)
                    });
                    
                }
            );    
        });
        
        
        
       // POST LINKS ALERT THEY'RE ADDED TO VIEW TITLE
      
      }

    render(){
        
        return(
            <>
                <Form className="mrg-1-top">
                <Row>
                    <Col md="8">
                    <FormGroup>
                    {/* <Label>Select Community</Label> */}
                        <Input type="select" name="viewId" value={this.state.addView} onChange={this.handleChange}>{
                            this.state.myViews.map((obj, i) => {
                                return <option key={i} value={obj._id}> {obj.title} </option>
                            })
                        }</Input>
                    </FormGroup>
                    </Col>

                    <Col md="4">
                        <Button onClick={this.handleSubmit} >Add to View</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                    <Alert color="info" isOpen={this.state.visible} >
                    Notes added to View!
                    </Alert>
                    </Col>
                </Row>
                </Form>                
            {this.props.noteContnetList.map(
                (obj,i)=>{

                    if(this.props.query && obj.data.English){
                        let innerHTML = obj.data.English;
                        let index = innerHTML.indexOf(this.props.query);
                        if (index >= 0) { 
                            obj.data.English = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+this.props.query.length) + "</span>" + innerHTML.substring(index + this.props.query.length);
                        }
                    }else if(this.props.query && obj.data.body){
                        let innerHTML = obj.data.body;
                        let index = innerHTML.indexOf(this.props.query);
                        if (index >= 0) { 
                            obj.data.body = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+this.props.query.length) + "</span>" + innerHTML.substring(index + this.props.query.length);
                        }   
                    }              

                    return<>
                        <Row className="min-height-2 mrg-05 border rounded mrg-1-bot pd-1" key={i}>
                            <Col>
                                <Row>
                                    <Col md="11" className="pd-1 primary-800 font-weight-bold">{obj.title }</Col>
                                    <Col md="1"><Button variant="secondary" onClick={()=>this.props.closeNote(obj._id)}>X</Button></Col>
                                </Row>
                                <Row>
                                    <Col md="10">
                                        <span className="pd-1" dangerouslySetInnerHTML={{ __html: obj.data.English ? (obj.data.English):(obj.data.body)}} />
                                    </Col>
                                    <Col md="2">
                                        <Button size='sm' onClick={() => this.props.buildOn(obj._id)}>BuildOn</Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                    </>
                }
            )}
            </>
        )
    }

}
export default NoteContent;