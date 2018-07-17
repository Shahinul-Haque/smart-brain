import React, { Component } from 'react';
import './App.css';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigations from './components/Navigations/Navigations';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Register from './components/Register/Register';
import Signin from './components/Signin/Signin';
import Rank from './components/Rank/Rank';
import Logo from './components/Logo/Logo';
import Particles from 'react-particles-js';
import 'tachyons';



const initialState = {

        input: '',
        imageUrl: '',
        box: {},
        route:'signout',
        isSignedIn: false,
        user: {

          id:'' ,
          name: '',
          email:'',
          entries:0,
          joined: ''

        }
}


const particlesOptions = {
  particles: {
    number: {
      value:80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}


class App extends Component {

    constructor(){
      super();
      this.state = initialState;
  }

  loadUser =(user) => {
      this.setState({  user: {
      id:user.id,
      name: user.name,
      email:user.email,
      entries:user.entries,
      joined: user.joined

   
    }})
  }

 

 calculateFaceLocation= (data) => {
   const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
   const image = document.getElementById('inputimage');
   const width = Number(image.width);
   const height = Number(image.height);
   return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
          
   }
     
 }

 displayFaceBox = (box) =>{
  this.setState({box: box});
 }

 onInputChange =(event) => {
   this.setState({input:event.target.value});
  
 }
 onButtonSubmit = () => {
  this.setState({imageUrl:this.state.input});
      
            fetch('http://localhost:3000/imageUrl', {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      input: this.state.user.input
                    })
                  })
              .then(response => response.json())
              .then(response => {
                if (response) {
                  fetch('http://localhost:3000/image', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      id: this.state.user.id
                    })
                  })
                  .then(response => response.json())
                  .then(count => {
                    this.setState(Object.assign(this.state.user, { entries: count}))
            })
             }
            this.displayFaceBox(this.calculateFaceLocation(response)) 

            })
            .catch(err => console.log(err));
    
 }
 onRouteChange = (route) => {
  if(route === 'signout'){
    this.setState(initialState)
  }else if(route === 'home'){
    this.setState({isSignedIn: true})
  }
  this.setState({route : route})
 }

  render() {

    const {isSignedIn,route,imageUrl,box} = this.state;
    return (

         <div className="App">
         <Particles className='particles'
          params={particlesOptions}
         />
         <Navigations isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
         { route === 'home'
            
            ? <div> 
               <Logo />
               <Rank name={this.state.user.name} entries={this.state.user.entries} />
               <ImageLinkForm 
                onInputChange ={this.onInputChange}
                onButtonSubmit ={this.onButtonSubmit}
                />
                <FaceRecognition 
                box ={box}
                imageUrl={imageUrl}/>

            </div>
         : (
              route === 'signin'
             ? <Signin   loadUser={ this.loadUser}  onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
         
    }
         
     </div>

    );
  }
}

export default App;
