var m=Object.defineProperty,l=Object.defineProperties;var p=Object.getOwnPropertyDescriptors;var n=Object.getOwnPropertySymbols;var f=Object.prototype.hasOwnProperty,g=Object.prototype.propertyIsEnumerable;var o=(t,i,e)=>i in t?m(t,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[i]=e,r=(t,i)=>{for(var e in i||(i={}))f.call(i,e)&&o(t,e,i[e]);if(n)for(var e of n(i))g.call(i,e)&&o(t,e,i[e]);return t},d=(t,i)=>l(t,p(i));import{y as s}from"./index.0b00fac2.js";import"./vendor.7a9baf1f.js";class h{setup(){let i=document.getElementById("jitsi-meeting-container");if(!i)throw new Error("Failed to initialize Jitsi. ParentNode was not found.");$("#jitsi-meeting-container").resizable({resizeWidth:!1}),this.api||(this.api=new JitsiMeetExternalAPI("meet.jit.si",{roomName:"MusiCoLab Demo",width:"100%",height:"100%",parentNode:i}),this.api.addListener("videoConferenceJoined",e=>{if(console.log(e),(e==null?void 0:e.displayName.length)>0){let a=s.awareness.getLocalState().user;a&&(s.awareness.setLocalStateField("user",d(r({},a),{name:e.displayName})),console.log({awarenessUser:s.awareness.getLocalState()}))}}))}destroy(){console.log("Destroying Jitsi"),this.api.dispose(),this.api=null}}var c=new h;export{c as default};
