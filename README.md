# Running the application
1.in the folders backend  and frontend run command- npm i to install the packages 
2.first run the go to the path of backend folder and run npm start to start server,you can see a folder of orbit db created that is the first instance of orbitdb with a particular address
3.now in the path of frontend folder run the command npm start to open the local host:3000 so that u can see the rendered Home page 
---
## specifications
1.u can see  two buttons at the top 'streamer,non streamer' so if u want to just view the stream enter name click no u will get updated with the list of streamers in the ui and u can click on a name to view his or her stream
**2.if u select yes your entered name gets displayed in the streamers list but your wont be displayed as soon as u select yes because since this is in the development phase and every stream will have the  same stuff being played from the single cam in ur laptop so to verify that when user clicks the desired name he gets the stream of clicked user only , so when u click a name the browser tab corresponding to that stream will only will turn on its media devices, in this way we can cross check the signaling is properly mapped**
3. the another section in the application is the upload and retrival of video files so u can type the name in the upload field to specify name of file and select the file and **click upload then the file is converted to buffer and its converted as cid and stored in the created instance of orbitDB database and each entry you add in the database you will have  specific hash for it.**
4.to search and view the content enter the name of the corresponding video and then u will the request in the console and in the ui .**for now the video cant be viewed only the buffer is being retrived from the response am looking forward for a way to actually transform that into a playable video and its under process**
---
### underdevelopment
**1.stopping stream and displaying the updated users in the ui discarding the left streamer.**
  **-approaches in work**
	    *-when the user joins a stream adding him to a room in socket of name`to${streamersid}` so that message can be broadcasted this subset ofpeople and necessary operations like updating the media stream in remote and stuffs can be done*
**2.display of the actual video content from the buffer array**
    **-approaches in work**
		  *-retriving the chunks of the cid using async iterator and adding it in a array and cancatinating the array and make this into a blob object and setting it as a srcObject of the video player*
---
#### detailed description.

**-when a user click as a streamer signaling is done from the server side list of current strmers is displayed along with his name , if its non streamer only the exixting list is displayed**
**-on clicking a streamers name u sing signal to the clicked user as the socket id of the user is a key in that div and its accesable on handlenameclicked function execution**
**-this emits a signal to streamer that *request from non streamer* now from the streamer side offer is created and formal exchange of offer and answers are made**
**-whenever a non streamer clicks the streamers name a new peerconnection objects gets pusshed onto the client side of streamer and each element handles its respective peer *now my approach to stop stream is that search this array and splice(i,1) to remove the media tracks thats going to that peer***
**-for storage part IPFS is used in js implementation (helia node) and i upload the file buffer as byte streams and get the cid and pair it with the given name and store as a entry in orbitdb instance created , now for querying you can iterate in this database asynchrounously to the desired videos cid from the name**
**- with response u can use fs.cat(cid) to get the chinks of bytes and concatenating it**
**-ONE COMMON THOUGHT IS THAT WE CAN SIMPLY USE A GATEWAY URL http://ipfs.ipfs.io/{cid} to play the video its actually playing but the problem it gets downloaded in ur system when u navigate through this gateway.And this is the reason why is used fs.cat(cid) to retrive content fs is nothe helia node configured to access to the filesystem(unixfs)**



  
