import express from 'express';
import {createServer} from 'http';
const app = express();
import cors from 'cors'

const server = createServer(app);
import {Server} from 'socket.io';
var smap=new Map()
//array objects that contains the socketid and name in correspondence
var smap1=[]
import multer from 'multer'
import * as IPFS from 'ipfs-core'
import { createOrbitDB } from '@orbitdb/core'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
//creating a instance of ipfs
const ipfs = await IPFS.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
const storage = multer.memoryStorage();
const orbitdb = await createOrbitDB({ ipfs })
const helia = await createHelia()

const fs = unixfs(helia)
//customizing the hlia node to access the filesystem
const upload = multer({ storage: storage });
//creating a orbit db instance
const db=await orbitdb.open("spiderp2p")
console.log(db.address)

const theirdb=await orbitdb.open(`${db.address}`)
app.use(express.json());
//cors middleware is configured to only allow requests from a specific origin, 
app.use(cors())

const io = new Server(server,{
    cors: {
      origin: "http://localhost:3000"
    }
  });

  //socket io instance 

  app.get('/search/:name', upload.single('file'), async (req, res) => {
var arr=[]
var name=req.params.name;
try{
  //iterating through the entries and and and getting the the videos cid corresponding to the name
  for await (let record of theirdb.iterator()) {
   if(record.value.n=name){
    //push the list of entries that matches the name
    arr.push(record.value.cid)
   }

  }
  if(arr.length!=0){
    console.log(arr[0])
    
    const chunks = [];
//for now only one of the entry is being accesed 
  for await (const chunk of fs.cat(arr[0])) {
    //retriving the chunks of bytes from the cid 
    chunks.push(chunk);
  }

  // Concatenate all chunks into a single buffer
  const completeBuffer = Buffer.concat(chunks);

  // Convert buffer to a base64-encoded data URI
  console.log(completeBuffer)
  const base64Data = completeBuffer.toString('base64');
// console.log(base64Data)
    res.json({success:true,result:completeBuffer})

  }
  else{

    res.json({success:true,result:"no content with that tag"})
  }
}
catch{
  console.log("error")
  res.status(500).json({ success: false, error: 'Error retriving file.' });
}


  })

  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const fileBuffer =  req.file.stream;
      
      const name = req.body.name || 'default'; // Get the name from the request or use a default name
  
      console.log(fileBuffer)
    
      const f=await fs.addByteStream(req.file.buffer)

    
  console.log((f))
  for await (const chunk of fs.cat(f)) {
    console.log(chunk)
  }
      const metadata = { n:name,cid:f.toString() };
  const hash=await theirdb.add(metadata)
  for await (let record of theirdb.iterator()) {
    console.log(record)
  }

      res.json({ success: true, result: metadata });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error uploading file.' });
    }
  });
//$$  
var users=new Map()
var userlist=[]
io.on('connection', (socket) => {

   console.log(socket.id,"sss")
userlist.push(socket.id)
//list events emit using sockets and signalling routes
socket.on("stream",(data)=>{
  
  smap.set(data.name,socket.id)
  users.set(data.name,socket.id)
  userlist.push({name:data.name,id:socket.id})

  smap1.push({name:data.name,id:socket.id})
  console.log(smap,data)
io.emit("joined",{s:smap1,u:userlist})
})  
socket.on("nonstream",(data)=>{
  console.log(smap,data)

  userlist.push({name:data.name,id:socket.id})
  io.to(socket.id).emit("joined",{s:smap1,u:userlist})

  
})  


socket.on("offer", payload => {
  io.to(payload.target).emit("offer", payload);
});

socket.on("answer", payload => {
  io.to(payload.target).emit("answer", payload);
});


socket.on("nameClickedbynonstreamer",(data)=>{
console.log(data)

socket.join(`to${data.to}`)
  io.to(data.to).emit("requestfromnonstreamer",data.fr)

})
socket.on("streamstopped",(data)=>{
  console.log("stpd")
  
  io.to(`to${data.fr}`).emit("stopped",{fr:data.to})
})
socket.on("ice",(data)=>{
  console.log(data)
  console.log("DWDW",data)
io.to(data.toy
  ).emit("ice",data.ice)

})
socket.on("offer",(data)=>{
  console.log(data)
  io.to(data.to).emit("offer",{off:data.off,id:socket.id})
})

socket.on("answer",(data)=>{
  io.to(data.to).emit("answer",data.ans)
})
},
// cors:true
)








server.listen( 8000, () => console.log('server is running on port 3000'));
