import React from 'react'
import './Home.css'
import io from "socket.io-client";
import Peer from "simple-peer";
import  { useState,useEffect,useRef } from 'react';

var decide
var peerconnection ,remoteStream
var p=[]//array of peer connection objects like when a listener tries to see the streamers video a new RTCpeerconnection objects is formed for that joined peer
//and those will be pushed into the array , 
function Home() {
  
  const [name, setName] = useState('');
  const [results, setResults] = useState([]);
  const[videoURL,setvideoURL]=useState('')
  const handleSearch = async () => {
    try {
     
      //querying the video content from the cid thats uploaded in the decentralised db- orbit db
      const response = await fetch(`http://localhost:8000/search/${name}`);
      const data = await response.json();
      
      if(data.success==true){
        
        console.log(data.result)
        //processess involved in the bufferobject of the video of the cid 

        await setvideoURL( URL.createObjectURL(new Blob([new Uint8Array(data.result)], { type: 'video/mp4' }))); // Adjust MIME type if needed
        //display of the the buffer object requested
document.getElementById("buffers").innerHTML=`<div>${JSON.stringify(data.result)}<div>`
        const dataURI = `data:video/mp4;base64,${data.result}`;

      
      console.log(videoURL)

        document.getElementById('reqideo').src=videoURL

      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }}
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
//search

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
//tracks the name that we assign to the video that we want to upload
  const handleNameChange = (event) => {
    setFileName(event.target.value);
  };

  const handleUpload = async () => {
    if (!file || !fileName) {
      alert('Please select a file and enter a name.');
      return;
    }
//creates a formdata object with fields as file and name
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);
console.log(file)
    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      // Handle success or display an error message to the user
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle the error
    }
  }



  //%%
  const [imps,setimps]=useState([])
  const [usrs,setusrs]=useState([])
const peersRef=useRef([])
const userStream = useRef();
    const [str,setstr]=useState()

var socketRef=useRef()  
     var user="";
     console.log(Array.isArray(imps),"!!!",typeof(imps))

var handlestream,nonstream,nams
 var localstream
 //inititalising socket connection to server
socketRef.current=io("http://localhost:8000")
handlestream= async()=>{
  
 
//storing users name
user=document.getElementById("name").value
  socketRef.current.emit("stream",{name:user})
  console.log("sdfsdf")
}
//to keep records of the tracks added to the peerconnection object so that it will be useful to remove stream from the peerconnection object
var tr=[]

//fired when listeners click the streamers name in the ui
var handlebro=async(data)=>{

peerconnection=new RTCPeerConnection({    urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],})
p.push(peerconnection)//pushes the peerconnection objects to a array and once the stream tracks are added and ice candidates are exchaned between peers  the stream keeps on forwarded to the listener
//in perspective to the listener am just doing.addtracks() because the streamer is not gonna see the peers video so no need of on track event listener
localstream = await navigator.mediaDevices.getUserMedia({video:true,audio:true}).then((localstream)=>{

  document.getElementById("video").srcObject=localstream
  localstream.getTracks().forEach(async (track)=>{
    //tracks array // to remove the stream addition in the objects user stops stream
  tr.push(  p[p.length-1].addTrack(track,localstream))
  })
}).then(()=>{

  createoffer(data)
})

}
//$$$
//answerreceive
socketRef.current.on("answer",(data)=>{
console.log(data)
addAnswer(data)
})
let addAnswer=async(answer)=>{
  console.log('Add answer triggerd')
  console.log('answer:', answer)

  p[p.length-1].setRemoteDescription(answer)
}
//handlenameclick
const handleNameClick = (toid,n) => {
 
  
  socketRef.current.emit('nameClickedbynonstreamer', {to:toid,fr:socketRef.current.id});

  console.log("%$#%",toid,n)
// handleClick()
};
//recieve ice
socketRef.current.on("ice",(data)=>{
  console.log(data,"is\cecoandidatae") 
  peerconnection.addIcecandidate(data)
})
//recieveoffer
socketRef.current.on("offer",(data)=>{
console.log(data.off,"offer")
createans(data.off,data.id)
})
var handlestopstream=()=>{
  document.getElementById('video').srcObject=null
  // stopped=true
  p.forEach((e,i)=>{
    //remove track event to remove the added tracks
    e.removeTrack(tr[i])
  })
socketRef.current.emit("streamstopped",{fr:socketRef.current.id})


}
//createans
const createans=async(data,id)=>{
  decide=false
// await createpeer(id,decide)
peerconnection.onicecandidate = async (event) => {
  //Event that fires off when a new answer ICE candidate is created
  //ice candidates are generated when sdp offer is generated 
  if(event.candidate){

      console.log('Adding answer candidate...:', event.candidate)
      //a input field for sdp answer object to verify the proper handshake bw peers
      document.getElementById('answer-sdp').value = JSON.stringify(peerconnection.localDescription)
      //transfering the answer object to the steramer using signaling
      socketRef.current.emit("answer",{to:id,ans:peerconnection.localDescription})
  }
};
await peerconnection.setRemoteDescription(data);

let answer = await peerconnection.createAnswer();
await peerconnection.setLocalDescription(answer); 

}
//createoffer
const createoffer=async(data)=>{
  decide=true
  // await createpeer(data)
  //since we stacked up the peer connection objects in an array we add event listeners for the recently added connection (RTC) object fro ice candidates
  p[p.length-1].onicecandidate = async (event) => {
    //Event that fires off when a new offer ICE candidate is created
    if(event.candidate){
      socketRef.current.emit("offer",{off:p[p.length-1].localDescription,to:data})
        document.getElementById('offer-sdp').value = JSON.stringify(p[p.length-1].localDescription)
    }
};
//and offer is created for the recently last pushed object
var offer = await p[p.length-1].createOffer();
await p[p.length-1].setLocalDescription(offer);
}
// 
socketRef.current.on("requestfromnonstreamer",async (data)=>{
  //when this event is fired from socket server this fuction is inititated with data consistin of th the to and from socket ids..
handlebro(data)
  // createoffer(data)
})




nonstream=()=>{
  //same series of events as in listeners side but here no array of peerconnection objects are maintained
  socketRef.current.emit("nonstream",{name:user})
  //initializing the remote stream(streamers stream) to new Mediastream  object  so the when ever on track event is fired  we can add the tracks of that stream from the peer
remoteStream=new MediaStream( )
document.getElementById("videon").srcObject=remoteStream
peerconnection=new RTCPeerConnection(     {     urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
})
//fired when the tracks is recieved from the streamers end
peerconnection.ontrack=(event)=>{
 if( event.track.readyState==='ended'){
  console.log("ended")
  remoteStream=new MediaStream()
 }
  event.streams[0].getTracks().forEach((track) => {
    remoteStream.addTrack(track);})
}
}
  ////
 
socketRef.current.on("nameclicked",async(data)=>{
  const stream=  await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });


})
//handles the stop signal from the stremer // under progress 
socketRef.current.on("stopped",(data)=>{

  console.log("stoppedby",data.fr)
})
socketRef.current.on("joined", (data)=>{
  // to update the list of sttreamers in the ui when ever a new join as a streamer or a non streamer
  setimps(data.s)
  //setting the map and the array of the users that is recieved from the signaling server
  setusrs(data.u)
console.log(imps)
//consoling out the data of streamers list for cross checking purpose
console.log(data) 


 console.log(Array.isArray(data),"!!!",typeof(data))

})
if (Array.isArray(imps)) {

imps.forEach((e,i)=>{
  console.log(e,i)
})}

console.log(Array.isArray(imps),"!!!",typeof(imps))
      



    return (
       


        <>
        <div id="creds">

        <input id="name" ></input>
        <button onClick={handlestream} >streamer</button>
        <button onClick={nonstream} >nonstreamer</button>
        sdp-offer:
        <input id="offer-sdp" ></input>
sdp-answer:
        <input id="answer-sdp" ></input>
        </div>
<div id="files">

        <h2>File Upload</h2>
      <input type="file" onChange={handleFileChange} />
      <br />
      <input
        type="text"
        placeholder="Enter file name"
        value={fileName}
        onChange={handleNameChange}
        />
      <br />
      <br></br>
      <button onClick={handleUpload}>Upload</button>
        </div>

<div id="search">

      <label>
        Enter Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      check server, browser consoles to see the details of the requested video buffer
      <button onClick={handleSearch}>Search</button>
      <br></br>
</div>

      <div id="vds">

<video id="video" height={100} width={200} autoPlay></video>
<button onClick={handlestopstream}>stop</button>
<video id="videon" height={100} width={200} autoPlay></video>
<video id="reqideo" height={100} width={200} autoPlay  >
  <div id="buffers">

  </div>
<source src={`${videoURL}`} type='video/webm'></source>

</video>
      </div>

<div id="streamers">


{/* </div> */}
        <h2 >List of Names:</h2>
        <div>
        {imps.map((nameObj) => (
          <div key={nameObj.id} onClick={()=> handleNameClick(nameObj.id,nameObj.name)}>
            {nameObj.name}
          </div>
        ))}
      </div>
</div>
        </>
      );

}

export default Home






