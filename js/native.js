/* BC-16 NATIVE: runs only inside the Android app (Capacitor). On the web it does nothing.
   - Exports: the web app saves files with <a download>. Android's WebView cannot, so every download is
     written to the app's storage and handed to the share sheet (Save to Files, Drive, WhatsApp, email…).
   - Updates: the app reads version.json from GitHub; UPDATE opens the newest APK on the GitHub release page.
   - Full screen and screen-on are set by the Android side (MainActivity). */
(()=>{
"use strict";
const C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
document.documentElement.classList.add('native');
const P=C.Plugins||{},FS=P.Filesystem,SH=P.Share;
const say=t=>{try{(window.OS&&OS.say||(()=>{}))(t)}catch(e){}};
const b64=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=rej;r.readAsDataURL(blob)});
async function saveAndShare(href,name){
 name=(name||'bc16-export').replace(/[\\/:*?"<>|]+/g,'_');
 if(!FS){say('This app build cannot save files.');return}
 try{say('Saving '+name+'…');const blob=await (await fetch(href)).blob();const data=await b64(blob);
  const w=await FS.writeFile({path:'BC16/'+name,data,directory:'DATA',recursive:true});
  if(SH){try{await SH.share({title:name,text:'Made on BC-16',url:w.uri,dialogTitle:'Save or send '+name})}catch(e){/* closed */}}
  say('Saved '+name+'. Use the share sheet to keep it in Files or Drive, or send it.')}
 catch(e){say('Could not save '+name+': '+(e&&e.message||e))}}
const click=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){const h=this.getAttribute('href')||'';if(this.hasAttribute('download')&&/^(blob:|data:)/.test(h)){saveAndShare(h,this.getAttribute('download'));return}
 if(/^https?:/.test(h)&&!h.startsWith(location.origin)){window.open(h,'_system');return}return click.call(this)};
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[download]');if(!a)return;const h=a.getAttribute('href')||'';if(/^(blob:|data:)/.test(h)){e.preventDefault();saveAndShare(h,a.getAttribute('download'))}},true);
/* the phone's back button: close what is open, else step back through machines, else go to the studio floor; false = leave the app */
window.BC16_back=()=>{const close=document.querySelector('#askD,#keysD,#welcome');if(close){close.remove();return true}
 const sc=document.getElementById('smartCard');if(sc){sc.remove();return true}
 const co=document.getElementById('coach');if(co&&!co.hidden){const x=document.getElementById('cexit');if(x)x.click();return true}
 if(document.body.classList.contains('explain')){const e=document.getElementById('osExplain');if(e)e.click();return true}
 const pg=document.body.dataset.pg;if(pg&&pg!=='floor'&&window.BC16){BC16.home();return true}return false};
window.BC16_NATIVE={saveAndShare,platform:C.getPlatform()};
})();
