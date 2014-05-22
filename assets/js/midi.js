function MidiFile(e){function t(e){var t=e.read(4);var n=e.readInt32();return{id:t,length:n,data:e.read(n)}}function r(e){var t={};t.deltaTime=e.readVarInt();var r=e.readInt8();if((r&240)==240){if(r==255){t.type="meta";var i=e.readInt8();var s=e.readVarInt();switch(i){case 0:t.subtype="sequenceNumber";if(s!=2)throw"Expected length for sequenceNumber event is 2, got "+s;t.number=e.readInt16();return t;case 1:t.subtype="text";t.text=e.read(s);return t;case 2:t.subtype="copyrightNotice";t.text=e.read(s);return t;case 3:t.subtype="trackName";t.text=e.read(s);return t;case 4:t.subtype="instrumentName";t.text=e.read(s);return t;case 5:t.subtype="lyrics";t.text=e.read(s);return t;case 6:t.subtype="marker";t.text=e.read(s);return t;case 7:t.subtype="cuePoint";t.text=e.read(s);return t;case 32:t.subtype="midiChannelPrefix";if(s!=1)throw"Expected length for midiChannelPrefix event is 1, got "+s;t.channel=e.readInt8();return t;case 47:t.subtype="endOfTrack";if(s!=0)throw"Expected length for endOfTrack event is 0, got "+s;return t;case 81:t.subtype="setTempo";if(s!=3)throw"Expected length for setTempo event is 3, got "+s;t.microsecondsPerBeat=(e.readInt8()<<16)+(e.readInt8()<<8)+e.readInt8();return t;case 84:t.subtype="smpteOffset";if(s!=5)throw"Expected length for smpteOffset event is 5, got "+s;var o=e.readInt8();t.frameRate={0:24,32:25,64:29,96:30}[o&96];t.hour=o&31;t.min=e.readInt8();t.sec=e.readInt8();t.frame=e.readInt8();t.subframe=e.readInt8();return t;case 88:t.subtype="timeSignature";if(s!=4)throw"Expected length for timeSignature event is 4, got "+s;t.numerator=e.readInt8();t.denominator=Math.pow(2,e.readInt8());t.metronome=e.readInt8();t.thirtyseconds=e.readInt8();return t;case 89:t.subtype="keySignature";if(s!=2)throw"Expected length for keySignature event is 2, got "+s;t.key=e.readInt8(true);t.scale=e.readInt8();return t;case 127:t.subtype="sequencerSpecific";t.data=e.read(s);return t;default:t.subtype="unknown";t.data=e.read(s);return t}t.data=e.read(s);return t}else if(r==240){t.type="sysEx";var s=e.readVarInt();t.data=e.read(s);return t}else if(r==247){t.type="dividedSysEx";var s=e.readVarInt();t.data=e.read(s);return t}else{throw"Unrecognised MIDI event type byte: "+r}}else{var u;if((r&128)==0){u=r;r=n}else{u=e.readInt8();n=r}var a=r>>4;t.channel=r&15;t.type="channel";switch(a){case 8:t.subtype="noteOff";t.noteNumber=u;t.velocity=e.readInt8();return t;case 9:t.noteNumber=u;t.velocity=e.readInt8();if(t.velocity==0){t.subtype="noteOff"}else{t.subtype="noteOn"}return t;case 10:t.subtype="noteAftertouch";t.noteNumber=u;t.amount=e.readInt8();return t;case 11:t.subtype="controller";t.controllerType=u;t.value=e.readInt8();return t;case 12:t.subtype="programChange";t.programNumber=u;return t;case 13:t.subtype="channelAftertouch";t.amount=u;return t;case 14:t.subtype="pitchBend";t.value=u+(e.readInt8()<<7);return t;default:throw"Unrecognised MIDI event type: "+a}}}var n;stream=Stream(e);var i=t(stream);if(i.id!="MThd"||i.length!=6){throw"Bad .mid file - header not found"}var s=Stream(i.data);var o=s.readInt16();var u=s.readInt16();var a=s.readInt16();if(a&32768){throw"Expressing time division in SMTPE frames is not supported yet"}else{ticksPerBeat=a}var f={formatType:o,trackCount:u,ticksPerBeat:ticksPerBeat};var l=[];for(var c=0;c<f.trackCount;c++){l[c]=[];var h=t(stream);if(h.id!="MTrk"){throw"Unexpected chunk - expected MTrk, got "+h.id}var p=Stream(h.data);while(!p.eof()){var d=r(p);l[c].push(d)}}return{header:f,tracks:l}}function Replayer(e,t,n){function f(){var t=null;var n=null;var i=null;for(var s=0;s<r.length;s++){if(r[s].ticksToNextEvent!=null&&(t==null||r[s].ticksToNextEvent<t)){t=r[s].ticksToNextEvent;n=s;i=r[s].nextEventIndex}}if(n!=null){var o=e.tracks[n][i];if(e.tracks[n][i+1]){r[n].ticksToNextEvent+=e.tracks[n][i+1].deltaTime}else{r[n].ticksToNextEvent=null}r[n].nextEventIndex+=1;for(var s=0;s<r.length;s++){if(r[s].ticksToNextEvent!=null){r[s].ticksToNextEvent-=t}}return{ticksToEvent:t,event:o,track:n}}else{return null}}function h(){function e(){if(l.event.type=="meta"&&l.event.subtype=="setTempo"){i=6e7/l.event.microsecondsPerBeat}if(l.ticksToEvent>0){var e=l.ticksToEvent/s;var n=e/(i/60)}var r=n*1e3*t||0;c.push([l,r]);l=f()}if(l=f()){while(l)e(true)}}var r=[];var i=120;var s=e.header.ticksPerBeat;for(var o=0;o<e.tracks.length;o++){r[o]={nextEventIndex:0,ticksToNextEvent:e.tracks[o].length?e.tracks[o][0].deltaTime:null}}var u;var a=0;var l;var c=[];h();return{getData:function(){return clone(c)}}}function Stream(e){function n(n){var r=e.substr(t,n);t+=n;return r}function r(){var n=(e.charCodeAt(t)<<24)+(e.charCodeAt(t+1)<<16)+(e.charCodeAt(t+2)<<8)+e.charCodeAt(t+3);t+=4;return n}function i(){var n=(e.charCodeAt(t)<<8)+e.charCodeAt(t+1);t+=2;return n}function s(n){var r=e.charCodeAt(t);if(n&&r>127)r-=256;t+=1;return r}function o(){return t>=e.length}function u(){var e=0;while(true){var t=s();if(t&128){e+=t&127;e<<=7}else{return e+t}}}var t=0;return{eof:o,read:n,readInt32:r,readInt16:i,readInt8:s,readVarInt:u}}if(typeof DOMLoader==="undefined")var DOMLoader={};if(typeof XMLHttpRequest==="undefined"){var XMLHttpRequest;(function(){var e=[function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var t=0;t<e.length;t++){try{e[t]()}catch(n){continue}break}XMLHttpRequest=e[t]})()}if(typeof (new XMLHttpRequest).responseText==="undefined"){var IEBinaryToArray_ByteStr_Script="<!-- IEBinaryToArray_ByteStr -->\r\n"+"<script type='text/vbscript'>\r\n"+"Function IEBinaryToArray_ByteStr(Binary)\r\n"+"   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+"End Function\r\n"+"Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+"   Dim lastIndex\r\n"+"   lastIndex = LenB(Binary)\r\n"+"   if lastIndex mod 2 Then\r\n"+"       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+"   Else\r\n"+"       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+"   End If\r\n"+"End Function\r\n"+"</script>\r\n";document.write(IEBinaryToArray_ByteStr_Script);DOMLoader.sendRequest=function(e){function t(e){var t={};for(var n=0;n<256;n++){for(var r=0;r<256;r++){t[String.fromCharCode(n+r*256)]=String.fromCharCode(n)+String.fromCharCode(r)}}var i=IEBinaryToArray_ByteStr(e);var s=IEBinaryToArray_ByteStr_Last(e);return i.replace(/[\s\S]/g,function(e){return t[e]})+s}var n=XMLHttpRequest();n.open("GET",e.url,true);if(e.responseType)n.responseType=e.responseType;if(e.onerror)n.onerror=e.onerror;if(e.onprogress)n.onprogress=e.onprogress;n.onreadystatechange=function(r){if(n.readyState===4){if(n.status===200){n.responseText=t(n.responseBody)}else{n=false}if(e.onload)e.onload(n)}};n.setRequestHeader("Accept-Charset","x-user-defined");n.send(null);return n}}else{DOMLoader.sendRequest=function(e){var t=new XMLHttpRequest;t.open(e.data?"POST":"GET",e.url,true);if(t.overrideMimeType)t.overrideMimeType("text/plain; charset=x-user-defined");if(e.data)t.setRequestHeader("Content-type","application/x-www-form-urlencoded");if(e.responseType)t.responseType=e.responseType;if(e.onerror)t.onerror=e.onerror;if(e.onprogress)t.onprogress=e.onprogress;t.onreadystatechange=function(n){if(t.readyState===4){if(t.status!==200&&t.status!=304){if(e.onerror)e.onerror(n,false);return}if(e.onload){e.onload(t)}}};t.send(e.data);return t}}if(typeof widgets==="undefined")var widgets={};(function(){"use strict";var e=Math.PI;var t=!document.createElement("canvas").getContext;var n=400;var r={id:"loader",bars:12,radius:0,lineWidth:20,lineHeight:70,timeout:0,display:true};widgets.Loader=function(o){if(t)return;var u=this;if(typeof o==="string")o={message:o};if(typeof o==="boolean")o={display:false};if(typeof o==="undefined")o={};o.container=o.container||document.body;if(!o.container)return;for(var a in r){if(typeof o[a]==="undefined"){o[a]=r[a]}}var f=document.getElementById(o.id);if(!f){var l=document.createElement("div");var c=document.createElement("span");c.className="message";l.appendChild(c);l.className=r.id;l.style.cssText=i("opacity",n);this.span=c;this.div=l;var f=document.createElement("canvas");document.body.appendChild(f);f.id=o.id;f.style.cssText="opacity: 1; position: absolute; z-index: 10000;";l.appendChild(f);o.container.appendChild(l)}else{this.span=f.parentNode.getElementsByTagName("span")[0]}var h=o.delay;var p=o.bars;var d=o.radius;var v=o.lineHeight+20;var m=v*2+o.radius*2;var g=s(o.container);var y=g.width-m;var b=g.height-m;var w=window.devicePixelRatio||1;f.width=m*w;f.height=m*w;var E=0;var S=f.getContext("2d");S.globalCompositeOperation="lighter";S.shadowOffsetX=1;S.shadowOffsetY=1;S.shadowBlur=1;S.shadowColor="rgba(0, 0, 0, 0.5)";this.messages={};this.message=function(e,t){if(!this.interval)return this.start(t,e);return this.add({message:e,onstart:t})};this.update=function(e,t,n){if(!e)for(var e in this.messages);if(!e)return this.message(t);var r=this.messages[e];r.message=t;if(typeof n==="number")r.span.innerHTML=n+"%";if(t.substr(-3)==="..."){r._message=t.substr(0,t.length-3);r.messageAnimate=[".&nbsp;&nbsp;","..&nbsp;","..."].reverse()}else{r._message=t;r.messageAnimate=false}r.element.innerHTML=t};this.add=function(e){if(typeof e==="string")e={message:e};var t=o.background?o.background:"rgba(0,0,0,0.65)";this.span.style.cssText="background: "+t+";";this.div.style.cssText=i("opacity",n);if(this.stopPropagation){this.div.style.cssText+="background: rgba(0,0,0,0.25);"}else{this.div.style.cssText+="pointer-events: none;"}f.parentNode.style.opacity=1;f.parentNode.style.display="block";if(o.background)this.div.style.background=o.backgrond;var r=(new Date).getTime();var s=Math.abs(r*Math.random()>>0);var u=e.message;var a=document.createElement("div");a.style.cssText=i("opacity",500);var l=document.createElement("span");l.style.cssText="float: right; width: 50px;";var c=document.createElement("span");c.innerHTML=u;a.appendChild(c);a.appendChild(l);var h=this.messages[s]={seed:s,container:a,element:c,span:l,message:u,timeout:(e.timeout||o.timeout)*1e3,timestamp:r,getProgress:e.getProgress};this.span.appendChild(a);this.span.style.display="block";this.update(h.seed,u);if(e.onstart){window.setTimeout(e.onstart,50)}this.center();if(!this.interval){if(!e.delay)N();window.clearInterval(this.interval);this.interval=window.setInterval(N,30)}return s};this.remove=function(e){E+=.07;var t=(new Date).getTime();if(typeof e==="object")e=e.join(":");if(e)e=":"+e+":";for(var n in this.messages){var r=this.messages[n];if(!e||e.indexOf(":"+r.seed+":")!==-1){delete this.messages[r.seed];r.container.style.color="#99ff88";T(r);if(r.getProgress)r.span.innerHTML="100%"}}};this.start=function(e,t){if(!(t||o.message))return;return this.add({message:t||o.message,onstart:e})};this.stop=function(){this.remove();window.clearInterval(this.interval);delete this.interval;if(o.oncomplete)o.oncomplete();if(f&&f.style){l.style.cssText+="pointer-events: none;";window.setTimeout(function(){u.div.style.opacity=0},1);window.setTimeout(function(){if(u.interval)return;u.stopPropagation=false;f.parentNode.style.display="none";S.clearRect(0,0,m,m)},n*1e3)}};this.center=function(){var e=s(o.container);var t=e.width-m;var n=e.height-m;f.style.left=t/2+"px";f.style.top=n/2+"px";f.style.width=m+"px";f.style.height=m+"px";u.span.style.top=n/2+m-10+"px"};var x=document.createElement("style");x.innerHTML=".loader { color: #fff; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 100000; opacity: 0; display: none; }.loader span.message { font-family: monospace; font-size: 14px; margin: auto; opacity: 1; display: none; border-radius: 10px; padding: 0px; width: 300px; text-align: center; position: absolute; z-index: 10000; left: 0; right: 0; }.loader span.message div { border-bottom: 1px solid #222; padding: 5px 10px; clear: both; text-align: left; opacity: 1; }.loader span.message div:last-child { border-bottom: none; }";document.head.appendChild(x);var T=function(e){window.setTimeout(function(){e.container.style.opacity=0},1);window.setTimeout(function(){e.container.parentNode.removeChild(e.container)},250)};var N=function(){var t=(new Date).getTime();for(var n in u.messages){var r=u.messages[n];var i=E/.07>>0;if(i%5===0&&r.getProgress){if(r.timeout&&r.timestamp&&t-r.timestamp>r.timeout){u.remove(r.seed);continue}var s=r.getProgress();if(s>=100){u.remove(r.seed);continue}r.span.innerHTML=(s>>0)+"%"}if(i%10===0){if(r.messageAnimate){var a=r.messageAnimate.length;var f=i/10%a;var l=r._message+r.messageAnimate[f];r.element.innerHTML=l}}}if(!n){u.stop()}S.save();S.clearRect(0,0,m*w,m*w);S.scale(w,w);S.translate(m/2,m/2);var c=360-360/p;for(var h=0;h<p;h++){var v=h/p*2*e+E;S.save();S.translate(d*Math.sin(-v),d*Math.cos(-v));S.rotate(v);var g=-o.lineWidth/2;var y=0;var b=o.lineWidth;var x=o.lineHeight;var T=b/2;S.beginPath();S.moveTo(g+T,y);S.lineTo(g+b-T,y);S.quadraticCurveTo(g+b,y,g+b,y+T);S.lineTo(g+b,y+x-T);S.quadraticCurveTo(g+b,y+x,g+b-T,y+x);S.lineTo(g+T,y+x);S.quadraticCurveTo(g,y+x,g,y+x-T);S.lineTo(g,y+T);S.quadraticCurveTo(g,y,g+T,y);var N=h/(p-1)*c;S.fillStyle="hsla("+N+", 100%, 50%, 0.85)";S.fill();S.restore()}S.restore();E+=.07};if(o.display===false)return this;this.start();return this};var i=function(e,t){return"		-webkit-transition-property: "+e+";		-webkit-transition-duration: "+t+"ms;		-moz-transition-property: "+e+";		-moz-transition-duration: "+t+"ms;		-o-transition-property: "+e+";		-o-transition-duration: "+t+"ms;		-ms-transition-property: "+e+";		-ms-transition-duration: "+t+"ms;"};var s=function(e){if(window.innerWidth&&window.innerHeight){var t=window.innerWidth;var n=window.innerHeight}else if(document.compatMode==="CSS1Compat"&&document.documentElement&&document.documentElement.offsetWidth){var t=document.documentElement.offsetWidth;var n=document.documentElement.offsetHeight}else if(document.body&&document.body.offsetWidth){var t=document.body.offsetWidth;var n=document.body.offsetHeight}if(e){var t=e.offsetWidth}return{width:t,height:n}}})();if(typeof MIDI==="undefined")var MIDI={};if(typeof MIDI.Soundfont==="undefined")MIDI.Soundfont={};(function(){"use strict";var e=false;MIDI.loadPlugin=function(r){if(typeof r==="function")r={callback:r};var i=r.instruments||r.instrument||"acoustic_grand_piano";if(typeof i!=="object")i=[i];for(var s=0;s<i.length;s++){var o=i[s];if(typeof o==="number"){i[s]=MIDI.GeneralMIDI.byId[o]}}MIDI.soundfontUrl=r.soundfontUrl||MIDI.soundfontUrl||"./soundfont/";MIDI.audioDetect(function(s){var o="";if(n[r.api]){o=r.api}else if(n[window.location.hash.substr(1)]){o=window.location.hash.substr(1)}else if(e&&navigator.requestMIDIAccess){o="webmidi"}else if(window.webkitAudioContext||window.AudioContext){o="webaudio"}else if(window.Audio){o="audiotag"}else{o="flash"}if(!t[o])return;if(r.targetFormat){var u=r.targetFormat}else{var u=s["audio/ogg"]?"ogg":"mp3"}MIDI.lang=o;MIDI.supports=s;t[o](u,i,r)})};var t={};t.webmidi=function(e,t,n){if(MIDI.loader)MIDI.loader.message("Web MIDI API...");MIDI.WebMIDI.connect(n)};t.flash=function(e,t,n){if(MIDI.loader)MIDI.loader.message("Flash API...");DOMLoader.script.add({src:n.soundManagerUrl||"./inc/SoundManager2/script/soundmanager2.js",verify:"SoundManager",callback:function(){MIDI.Flash.connect(t,n)}})};t.audiotag=function(e,t,n){if(MIDI.loader)MIDI.loader.message("HTML5 Audio API...");var o=s({items:t,getNext:function(t){DOMLoader.sendRequest({url:MIDI.soundfontUrl+t+"-"+e+".js",onprogress:i,onload:function(e){r(e.responseText);if(MIDI.loader)MIDI.loader.update(null,"Downloading",100);o.getNext()}})},onComplete:function(){MIDI.AudioTag.connect(n)}})};t.webaudio=function(e,t,n){if(MIDI.loader)MIDI.loader.message("Web Audio API...");var o=s({items:t,getNext:function(t){DOMLoader.sendRequest({url:MIDI.soundfontUrl+t+"-"+e+".js",onprogress:i,onload:function(e){r(e.responseText);if(MIDI.loader)MIDI.loader.update(null,"Downloading...",100);o.getNext()}})},onComplete:function(){MIDI.WebAudio.connect(n)}})};var n={webmidi:true,webaudio:true,audiotag:true,flash:true};var r=function(e){var t=document.createElement("script");t.language="javascript";t.type="text/javascript";t.text=e;document.body.appendChild(t)};var i=function(e){if(!this.totalSize){if(this.getResponseHeader("Content-Length-Raw")){this.totalSize=parseInt(this.getResponseHeader("Content-Length-Raw"))}else{this.totalSize=e.total}}var t=this.totalSize?Math.round(e.loaded/this.totalSize*100):"";if(MIDI.loader)MIDI.loader.update(null,"Downloading...",t)};var s=function(e){var t={};t.queue=[];for(var n in e.items){if(e.items.hasOwnProperty(n)){t.queue.push(e.items[n])}}t.getNext=function(){if(!t.queue.length)return e.onComplete();e.getNext(t.queue.shift())};setTimeout(t.getNext,1);return t}})();if(typeof MIDI==="undefined")var MIDI={};if(typeof MIDI.Player==="undefined")MIDI.Player={};(function(){"use strict";var e=MIDI.Player;e.callback=undefined;e.currentTime=0;e.endTime=0;e.restart=0;e.playing=false;e.timeWarp=1;e.start=e.resume=function(){if(e.currentTime<-1)e.currentTime=-1;f(e.currentTime)};e.pause=function(){var t=e.restart;l();e.restart=t};e.stop=function(){l();e.restart=0;e.currentTime=0};e.addListener=function(e){s=e};e.removeListener=function(){s=undefined};e.clearAnimation=function(){if(e.interval){window.clearInterval(e.interval)}};e.setAnimation=function(t){var n=typeof t==="function"?t:t.callback;var r=t.interval||30;var s=0;var o=0;var u=0;e.clearAnimation();e.interval=window.setInterval(function(){if(e.endTime===0)return;if(e.playing){s=u===e.currentTime?o-(new Date).getTime():0;if(e.currentTime===0){s=0}else{s=e.currentTime-s}if(u!==e.currentTime){o=(new Date).getTime();u=e.currentTime}}else{s=e.currentTime}var t=e.endTime;var r=s/t;var a=s/1e3;var f=a/60;var l=a-f*60;var c=f*60+l;var h=t/1e3;if(h-c<-1)return;n({now:c,end:h,events:i})},r)};e.loadMidiFile=function(){e.replayer=new Replayer(MidiFile(e.currentData),e.timeWarp);e.data=e.replayer.getData();e.endTime=a()};e.loadFile=function(t,n){e.stop();if(t.indexOf("base64,")!==-1){var r=window.atob(t.split(",")[1]);e.currentData=r;e.loadMidiFile();if(n)n(r);return}var i=new XMLHttpRequest;i.open("GET",t);i.overrideMimeType("text/plain; charset=x-user-defined");i.onreadystatechange=function(){if(this.readyState===4&&this.status===200){var t=this.responseText||"";var r=[];var i=t.length;var s=String.fromCharCode;for(var o=0;o<i;o++){r[o]=s(t.charCodeAt(o)&255)}var u=r.join("");e.currentData=u;e.loadMidiFile();if(n)n(u)}};i.send()};var t=[];var n;var r=0;var i={};var s=undefined;var o=function(t,r,o,u,a,l){var c=window.setTimeout(function(){var u={channel:t,note:r,now:o,end:e.endTime,message:a,velocity:l};if(a===128){delete i[r]}else{i[r]=u}if(s){s(u)}e.currentTime=o;if(e.currentTime===n&&n<e.endTime){f(n,true)}},o-u);return c};var u=function(){if(MIDI.lang==="WebAudioAPI"){return MIDI.Player.ctx}else if(!e.ctx){e.ctx={currentTime:0}}return e.ctx};var a=function(){var t=e.data;var n=t.length;var r=.5;for(var i=0;i<n;i++){r+=t[i][1]}return r};var f=function(i,s){if(!e.replayer)return;if(!s){if(typeof i==="undefined")i=e.restart;if(e.playing)l();e.playing=true;e.data=e.replayer.getData();e.endTime=a()}var f;var c=0;var h=0;var p=e.data;var d=u();var v=p.length;n=.5;r=d.currentTime;for(var m=0;m<v&&h<100;m++){n+=p[m][1];if(n<i){c=n;continue}i=n-c;var g=p[m][0].event;if(g.type!=="channel")continue;var y=g.channel;switch(g.subtype){case"noteOn":if(MIDI.channels[y].mute)break;f=g.noteNumber-(e.MIDIOffset||0);t.push({event:g,source:MIDI.noteOn(y,g.noteNumber,g.velocity,i/1e3+d.currentTime),interval:o(y,f,n,c,144,g.velocity)});h++;break;case"noteOff":if(MIDI.channels[y].mute)break;f=g.noteNumber-(e.MIDIOffset||0);t.push({event:g,source:MIDI.noteOff(y,g.noteNumber,i/1e3+d.currentTime),interval:o(y,f,n,c,128)});break;default:break}}};var l=function(){var n=u();e.playing=false;e.restart+=(n.currentTime-r)*1e3;while(t.length){var o=t.pop();window.clearInterval(o.interval);if(!o.source)continue;if(typeof o.source==="number"){window.clearTimeout(o.source)}else{o.source.disconnect(0)}}for(var a in i){var o=i[a];if(i[a].message===144&&s){s({channel:o.channel,note:o.note,now:o.now,end:o.end,message:128,velocity:o.velocity})}}i={}}})();if(typeof MIDI==="undefined")var MIDI={};(function(){"use strict";var e=function(e){MIDI.api=e.api;MIDI.setVolume=e.setVolume;MIDI.programChange=e.programChange;MIDI.noteOn=e.noteOn;MIDI.noteOff=e.noteOff;MIDI.chordOn=e.chordOn;MIDI.chordOff=e.chordOff;MIDI.stopAllNotes=e.stopAllNotes;MIDI.getInput=e.getInput;MIDI.getOutputs=e.getOutputs};(function(){var t=null;var n=null;var r=[];var i=MIDI.WebMIDI={api:"webmidi"};i.setVolume=function(e,t){n.send([176+e,7,t])};i.programChange=function(e,t){n.send([192+e,t])};i.noteOn=function(e,t,r,i){n.send([144+e,t,r],i*1e3)};i.noteOff=function(e,t,r){n.send([128+e,t,0],r*1e3)};i.chordOn=function(e,t,r,i){for(var s=0;s<t.length;s++){var o=t[s];n.send([144+e,o,r],i*1e3)}};i.chordOff=function(e,t,r){for(var i=0;i<t.length;i++){var s=t[i];n.send([128+e,s,0],r*1e3)}};i.stopAllNotes=function(){for(var e=0;e<16;e++){n.send([176+e,123,0])}};i.getInput=function(){return t.getInputs()};i.getOutputs=function(){return t.getOutputs()};i.connect=function(r){e(i);navigator.requestMIDIAccess().then(function(e){t=e;n=t.outputs()[0];if(r.callback)r.callback()},function(e){if(window.AudioContext||window.webkitAudioContext){r.api="webaudio"}else if(window.Audio){r.api="audiotag"}else{r.api="flash"}MIDI.loadPlugin(r)})}})();if(window.AudioContext||window.webkitAudioContext)(function(){var t=window.AudioContext||window.webkitAudioContext;var n=MIDI.WebAudio={api:"webaudio"};var r;var i={};var s=127;var o={};var u=function(e,t,n,i,s){var u=MIDI.GeneralMIDI.byName[e];var a=u.number;var f=t[n];if(!MIDI.Soundfont[e][f]){return s(e)}var l=MIDI.Soundfont[e][f].split(",")[1];var c=Base64Binary.decodeArrayBuffer(l);r.decodeAudioData(c,function(r){var l=f;while(l.length<3)l+="&nbsp;";if(typeof MIDI.loader!=="undefined"){MIDI.loader.update(null,u.instrument+"<br>Processing: "+(n/87*100>>0)+"%<br>"+l)}r.id=f;i[n]=r;if(i.length===t.length){while(i.length){r=i.pop();if(!r)continue;var c=MIDI.keyToNote[r.id];o[a+""+c]=r}s(e)}})};n.setVolume=function(e,t){s=t};n.programChange=function(e,t){MIDI.channels[e].instrument=t};n.noteOn=function(e,t,n,u){if(!MIDI.channels[e])return;var a=MIDI.channels[e].instrument;if(!o[a+""+t])return;if(u<r.currentTime)u+=r.currentTime;var f=r.createBufferSource();i[e+""+t]=f;f.buffer=o[a+""+t];f.connect(r.destination);if(r.createGain){f.gainNode=r.createGain()}else{f.gainNode=r.createGainNode()}var l=n/127*(s/127)*2-1;f.gainNode.connect(r.destination);f.gainNode.gain.value=Math.max(-1,l);f.connect(f.gainNode);if(f.noteOn){f.noteOn(u||0)}else{f.start(u||0)}return f};n.noteOff=function(e,t,n){n=n||0;if(n<r.currentTime)n+=r.currentTime;var s=i[e+""+t];if(!s)return;if(s.gainNode){var o=s.gainNode.gain;o.linearRampToValueAtTime(o.value,n);o.linearRampToValueAtTime(-1,n+.2)}if(s.noteOff){s.noteOff(n+.3)}else{s.stop(n+.3)}delete i[e+""+t]};n.chordOn=function(e,t,r,i){var s={},o;for(var u=0,a=t.length;u<a;u++){s[o=t[u]]=n.noteOn(e,o,r,i)}return s};n.chordOff=function(e,t,r){var i={},s;for(var o=0,u=t.length;o<u;o++){i[s=t[o]]=n.noteOff(e,s,r)}return i};n.stopAllNotes=function(){for(var e in i){var t=0;if(t<r.currentTime)t+=r.currentTime;i[e].gain.linearRampToValueAtTime(1,t);i[e].gain.linearRampToValueAtTime(0,t+.2);i[e].noteOff(t+.3);delete i[e]}};n.connect=function(i){e(n);MIDI.Player.ctx=r=new t;var s=[];var o=MIDI.keyToNote;for(var a in o)s.push(a);var f=[];var l={};var c=function(e){delete l[e];for(var t in l)break;if(!t)i.callback()};for(var h in MIDI.Soundfont){l[h]=true;for(var p=0;p<s.length;p++){u(h,s,p,f,c)}}}})();if(window.Audio)(function(){var t=MIDI.AudioTag={api:"audiotag"};var n={};var r=127;var i=-1;var s=[];var o=[];var u={};for(var a=0;a<12;a++){s[a]=new Audio}var f=function(e,t){if(!MIDI.channels[e])return;var n=MIDI.channels[e].instrument;var a=MIDI.GeneralMIDI.byId[n].id;var t=u[t];if(!t)return;var f=a+""+t.id;var l=(i+1)%s.length;var c=s[l];o[l]=f;c.src=MIDI.Soundfont[a][t.id];c.volume=r/127;c.play();i=l};var l=function(e,t){if(!MIDI.channels[e])return;var n=MIDI.channels[e].instrument;var r=MIDI.GeneralMIDI.byId[n].id;var t=u[t];if(!t)return;var a=r+""+t.id;for(var f=0;f<s.length;f++){var l=(f+i+1)%s.length;var c=o[l];if(c&&c==a){s[l].pause();o[l]=null;return}}};t.programChange=function(e,t){MIDI.channels[e].instrument=t};t.setVolume=function(e,t){r=t};t.noteOn=function(e,t,r,i){var s=n[t];if(!u[s])return;if(i){return window.setTimeout(function(){f(e,s)},i*1e3)}else{f(e,s)}};t.noteOff=function(e,t,r){var i=n[t];if(!u[i])return;if(r){return setTimeout(function(){l(e,i)},r*1e3)}else{l(e,i)}};t.chordOn=function(e,t,r,i){for(var s=0;s<t.length;s++){var o=t[s];var a=n[o];if(!u[a])continue;if(i){return window.setTimeout(function(){f(e,a)},i*1e3)}else{f(e,a)}}};t.chordOff=function(e,t,r){for(var i=0;i<t.length;i++){var s=t[i];var o=n[s];if(!u[o])continue;if(r){return window.setTimeout(function(){l(e,o)},r*1e3)}else{l(e,o)}}};t.stopAllNotes=function(){for(var e=0,t=s.length;e<t;e++){s[e].pause()}};t.connect=function(r){for(var i in MIDI.keyToNote){n[MIDI.keyToNote[i]]=i;u[i]={id:i}}e(t);if(r.callback)r.callback()}})();(function(){var t=MIDI.Flash={api:"flash"};var n={};var r={};t.programChange=function(e,t){MIDI.channels[e].instrument=t};t.setVolume=function(e,t){};t.noteOn=function(e,t,i,s){if(!MIDI.channels[e])return;var o=MIDI.channels[e].instrument;var u=MIDI.GeneralMIDI.byId[o].number;t=u+""+n[t];if(!r[t])return;if(s){return window.setTimeout(function(){r[t].play({volume:i*2})},s*1e3)}else{r[t].play({volume:i*2})}};t.noteOff=function(e,t,n){};t.chordOn=function(e,t,i,s){if(!MIDI.channels[e])return;var o=MIDI.channels[e].instrument;var u=MIDI.GeneralMIDI.byId[o].number;for(var a in t){var f=t[a];var l=u+""+n[f];if(r[l]){r[l].play({volume:i*2})}}};t.chordOff=function(e,t,n){};t.stopAllNotes=function(){};t.connect=function(i,s){soundManager.flashVersion=9;soundManager.useHTML5Audio=true;soundManager.url=s.soundManagerSwfUrl||"../inc/SoundManager2/swf/";soundManager.useHighPerformance=true;soundManager.wmode="transparent";soundManager.flashPollingInterval=1;soundManager.debugMode=false;soundManager.onload=function(){var o=function(e,t,n){var i=MIDI.GeneralMIDI.byName[e];var s=i.number;r[s+""+t]=soundManager.createSound({id:t,url:MIDI.soundfontUrl+e+"-mp3/"+t+".mp3",multiShot:true,autoLoad:true,onload:n})};var u=[];var a=88;var f=i.length*a;for(var l=0;l<i.length;l++){var c=i[l];var h=function(){u.push(this.sID);if(typeof MIDI.loader==="undefined")return;MIDI.loader.update(null,"Processing: "+this.sID)};for(var p=0;p<a;p++){var d=n[p+21];o(c,d,h)}}e(t);var v=window.setInterval(function(){if(u.length<f)return;window.clearInterval(v);if(s.callback)s.callback()},25)};soundManager.onerror=function(){};for(var o in MIDI.keyToNote){n[MIDI.keyToNote[o]]=o}}})();MIDI.GeneralMIDI=function(e){var t=function(e){return e.replace(/[^a-z0-9 ]/gi,"").replace(/[ ]/g,"_").toLowerCase()};var n={byName:{},byId:{},byCategory:{}};for(var r in e){var i=e[r];for(var s=0,o=i.length;s<o;s++){var u=i[s];if(!u)continue;var a=parseInt(u.substr(0,u.indexOf(" ")),10);u=u.replace(a+" ","");n.byId[--a]=n.byName[t(u)]=n.byCategory[t(r)]={id:t(u),instrument:u,number:a,category:r}}}return n}({Piano:["1 Acoustic Grand Piano","2 Bright Acoustic Piano","3 Electric Grand Piano","4 Honky-tonk Piano","5 Electric Piano 1","6 Electric Piano 2","7 Harpsichord","8 Clavinet"],"Chromatic Percussion":["9 Celesta","10 Glockenspiel","11 Music Box","12 Vibraphone","13 Marimba","14 Xylophone","15 Tubular Bells","16 Dulcimer"],Organ:["17 Drawbar Organ","18 Percussive Organ","19 Rock Organ","20 Church Organ","21 Reed Organ","22 Accordion","23 Harmonica","24 Tango Accordion"],Guitar:["25 Acoustic Guitar (nylon)","26 Acoustic Guitar (steel)","27 Electric Guitar (jazz)","28 Electric Guitar (clean)","29 Electric Guitar (muted)","30 Overdriven Guitar","31 Distortion Guitar","32 Guitar Harmonics"],Bass:["33 Acoustic Bass","34 Electric Bass (finger)","35 Electric Bass (pick)","36 Fretless Bass","37 Slap Bass 1","38 Slap Bass 2","39 Synth Bass 1","40 Synth Bass 2"],Strings:["41 Violin","42 Viola","43 Cello","44 Contrabass","45 Tremolo Strings","46 Pizzicato Strings","47 Orchestral Harp","48 Timpani"],Ensemble:["49 String Ensemble 1","50 String Ensemble 2","51 Synth Strings 1","52 Synth Strings 2","53 Choir Aahs","54 Voice Oohs","55 Synth Choir","56 Orchestra Hit"],Brass:["57 Trumpet","58 Trombone","59 Tuba","60 Muted Trumpet","61 French Horn","62 Brass Section","63 Synth Brass 1","64 Synth Brass 2"],Reed:["65 Soprano Sax","66 Alto Sax","67 Tenor Sax","68 Baritone Sax","69 Oboe","70 English Horn","71 Bassoon","72 Clarinet"],Pipe:["73 Piccolo","74 Flute","75 Recorder","76 Pan Flute","77 Blown Bottle","78 Shakuhachi","79 Whistle","80 Ocarina"],"Synth Lead":["81 Lead 1 (square)","82 Lead 2 (sawtooth)","83 Lead 3 (calliope)","84 Lead 4 (chiff)","85 Lead 5 (charang)","86 Lead 6 (voice)","87 Lead 7 (fifths)","88 Lead 8 (bass + lead)"],"Synth Pad":["89 Pad 1 (new age)","90 Pad 2 (warm)","91 Pad 3 (polysynth)","92 Pad 4 (choir)","93 Pad 5 (bowed)","94 Pad 6 (metallic)","95 Pad 7 (halo)","96 Pad 8 (sweep)"],"Synth Effects":["97 FX 1 (rain)","98 FX 2 (soundtrack)","99 FX 3 (crystal)","100 FX 4 (atmosphere)","101 FX 5 (brightness)","102 FX 6 (goblins)","103 FX 7 (echoes)","104 FX 8 (sci-fi)"],Ethnic:["105 Sitar","106 Banjo","107 Shamisen","108 Koto","109 Kalimba","110 Bagpipe","111 Fiddle","112 Shanai"],Percussive:["113 Tinkle Bell","114 Agogo","115 Steel Drums","116 Woodblock","117 Taiko Drum","118 Melodic Tom","119 Synth Drum"],"Sound effects":["120 Reverse Cymbal","121 Guitar Fret Noise","122 Breath Noise","123 Seashore","124 Bird Tweet","125 Telephone Ring","126 Helicopter","127 Applause","128 Gunshot"]});MIDI.channels=function(){var e={};for(var t=0;t<16;t++){e[t]={instrument:0,mute:false,mono:false,omni:false,solo:false}}return e}();MIDI.pianoKeyOffset=21;MIDI.keyToNote={};MIDI.noteToKey={};(function(){var e=21;var t=108;var n=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];for(var r=e;r<=t;r++){var i=(r-12)/12>>0;var s=n[r%12]+i;MIDI.keyToNote[s]=r;MIDI.noteToKey[r]=s}})()})();var clone=function(e){if(typeof e!="object")return e;if(e==null)return e;var t=typeof e.length=="number"?[]:{};for(var n in e)t[n]=clone(e[n]);return t};(function(e){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";e.btoa||(e.btoa=function(n){n=escape(n);var r="";var i,s,o="";var u,a,f,l="";var c=0;do{i=n.charCodeAt(c++);s=n.charCodeAt(c++);o=n.charCodeAt(c++);u=i>>2;a=(i&3)<<4|s>>4;f=(s&15)<<2|o>>6;l=o&63;if(isNaN(s)){f=l=64}else if(isNaN(o)){l=64}r=r+t.charAt(u)+t.charAt(a)+t.charAt(f)+t.charAt(l);i=s=o="";u=a=f=l=""}while(c<n.length);return r});e.atob||(e.atob=function(e){var n="";var r,i,s="";var o,u,a,f="";var l=0;var c=/[^A-Za-z0-9\+\/\=]/g;if(c.exec(e)){alert("There were invalid base64 characters in the input text.\n"+"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n"+"Expect errors in decoding.")}e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{o=t.indexOf(e.charAt(l++));u=t.indexOf(e.charAt(l++));a=t.indexOf(e.charAt(l++));f=t.indexOf(e.charAt(l++));r=o<<2|u>>4;i=(u&15)<<4|a>>2;s=(a&3)<<6|f;n=n+String.fromCharCode(r);if(a!=64){n=n+String.fromCharCode(i)}if(f!=64){n=n+String.fromCharCode(s)}r=i=s="";o=u=a=f=""}while(l<e.length);return unescape(n)})})(this);var Base64Binary={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",decodeArrayBuffer:function(e){var t=Math.ceil(3*e.length/4);var n=new ArrayBuffer(t);this.decode(e,n);return n},decode:function(e,t){var n=this._keyStr.indexOf(e.charAt(e.length-1));var r=this._keyStr.indexOf(e.charAt(e.length-1));var i=Math.ceil(3*e.length/4);if(n==64)i--;if(r==64)i--;var s;var o,u,a;var f,l,c,h;var p=0;var d=0;if(t)s=new Uint8Array(t);else s=new Uint8Array(i);e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");for(p=0;p<i;p+=3){f=this._keyStr.indexOf(e.charAt(d++));l=this._keyStr.indexOf(e.charAt(d++));c=this._keyStr.indexOf(e.charAt(d++));h=this._keyStr.indexOf(e.charAt(d++));o=f<<2|l>>4;u=(l&15)<<4|c>>2;a=(c&3)<<6|h;s[p]=o;if(c!=64)s[p+1]=u;if(h!=64)s[p+2]=a}return s}};if(typeof MIDI==="undefined")var MIDI={};(function(){"use strict";var e={};var t=0;var n=function(n){t++;var r=new Audio;var i=n.split(";")[0];r.id="audio";r.setAttribute("preload","auto");r.setAttribute("audiobuffer",true);r.addEventListener("error",function(){e[i]=false;t--},false);r.addEventListener("canplaythrough",function(){e[i]=true;t--},false);r.src="data:"+n;document.body.appendChild(r)};MIDI.audioDetect=function(r){if(typeof Audio==="undefined")return r({});var i=new Audio;if(typeof i.canPlayType==="undefined")return r(e);var s=i.canPlayType('audio/ogg; codecs="vorbis"');s=s==="probably"||s==="maybe";var o=i.canPlayType("audio/mpeg");o=o==="probably"||o==="maybe";if(!s&&!o){r(e);return}if(s)n("audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=");if(o)n("audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");var u=(new Date).getTime();var a=window.setInterval(function(){var n=(new Date).getTime();var i=n-u>5e3;if(!t||i){window.clearInterval(a);r(e)}},1)}})()