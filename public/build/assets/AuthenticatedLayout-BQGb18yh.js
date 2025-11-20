import{r as d,a as K,j as t,L as C,c as ee,b as te}from"./app-BbZP3b29.js";import{A as re}from"./ApplicationLogo-Daz3bnXP.js";let se={data:""},oe=e=>{if(typeof window=="object"){let r=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return r.nonce=window.__nonce__,r.parentNode||(e||document.head).appendChild(r),r.firstChild}return e||se},ae=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,ie=/\/\*[^]*?\*\/|  +/g,F=/\n+/g,L=(e,r)=>{let s="",a="",l="";for(let n in e){let o=e[n];n[0]=="@"?n[1]=="i"?s=n+" "+o+";":a+=n[1]=="f"?L(o,n):n+"{"+L(o,n[1]=="k"?"":r)+"}":typeof o=="object"?a+=L(o,r?r.replace(/([^,])+/g,i=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,c=>/&/.test(c)?c.replace(/&/g,i):i?i+" "+c:c)):n):o!=null&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),l+=L.p?L.p(n,o):n+":"+o+";")}return s+(r&&l?r+"{"+l+"}":l)+a},j={},Y=e=>{if(typeof e=="object"){let r="";for(let s in e)r+=s+Y(e[s]);return r}return e},ne=(e,r,s,a,l)=>{let n=Y(e),o=j[n]||(j[n]=(c=>{let u=0,p=11;for(;u<c.length;)p=101*p+c.charCodeAt(u++)>>>0;return"go"+p})(n));if(!j[o]){let c=n!==e?e:(u=>{let p,m,h=[{}];for(;p=ae.exec(u.replace(ie,""));)p[4]?h.shift():p[3]?(m=p[3].replace(F," ").trim(),h.unshift(h[0][m]=h[0][m]||{})):h[0][p[1]]=p[2].replace(F," ").trim();return h[0]})(e);j[o]=L(l?{["@keyframes "+o]:c}:c,s?"":"."+o)}let i=s&&j.g?j.g:null;return s&&(j.g=j[o]),((c,u,p,m)=>{m?u.data=u.data.replace(m,c):u.data.indexOf(c)===-1&&(u.data=p?c+u.data:u.data+c)})(j[o],r,a,i),o},le=(e,r,s)=>e.reduce((a,l,n)=>{let o=r[n];if(o&&o.call){let i=o(s),c=i&&i.props&&i.props.className||/^go/.test(i)&&i;o=c?"."+c:i&&typeof i=="object"?i.props?"":L(i,""):i===!1?"":i}return a+l+(o??"")},"");function W(e){let r=this||{},s=e.call?e(r.p):e;return ne(s.unshift?s.raw?le(s,[].slice.call(arguments,1),r.p):s.reduce((a,l)=>Object.assign(a,l&&l.call?l(r.p):l),{}):s,oe(r.target),r.g,r.o,r.k)}let q,T,U;W.bind({g:1});let w=W.bind({k:1});function de(e,r,s,a){L.p=r,q=e,T=s,U=a}function M(e,r){let s=this||{};return function(){let a=arguments;function l(n,o){let i=Object.assign({},n),c=i.className||l.className;s.p=Object.assign({theme:T&&T()},i),s.o=/ *go\d+/.test(c),i.className=W.apply(s,a)+(c?" "+c:"");let u=e;return e[0]&&(u=i.as||e,delete i.as),U&&u[0]&&U(i),q(u,i)}return r?r(l):l}}var ce=e=>typeof e=="function",O=(e,r)=>ce(e)?e(r):e,ue=(()=>{let e=0;return()=>(++e).toString()})(),Z=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let r=matchMedia("(prefers-reduced-motion: reduce)");e=!r||r.matches}return e}})(),me=20,R="default",Q=(e,r)=>{let{toastLimit:s}=e.settings;switch(r.type){case 0:return{...e,toasts:[r.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(o=>o.id===r.toast.id?{...o,...r.toast}:o)};case 2:let{toast:a}=r;return Q(e,{type:e.toasts.find(o=>o.id===a.id)?1:0,toast:a});case 3:let{toastId:l}=r;return{...e,toasts:e.toasts.map(o=>o.id===l||l===void 0?{...o,dismissed:!0,visible:!1}:o)};case 4:return r.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(o=>o.id!==r.toastId)};case 5:return{...e,pausedAt:r.time};case 6:let n=r.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(o=>({...o,pauseDuration:o.pauseDuration+n}))}}},D=[],G={toasts:[],pausedAt:void 0,settings:{toastLimit:me}},y={},J=(e,r=R)=>{y[r]=Q(y[r]||G,e),D.forEach(([s,a])=>{s===r&&a(y[r])})},X=e=>Object.keys(y).forEach(r=>J(e,r)),pe=e=>Object.keys(y).find(r=>y[r].toasts.some(s=>s.id===e)),I=(e=R)=>r=>{J(r,e)},he={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},xe=(e={},r=R)=>{let[s,a]=d.useState(y[r]||G),l=d.useRef(y[r]);d.useEffect(()=>(l.current!==y[r]&&a(y[r]),D.push([r,a]),()=>{let o=D.findIndex(([i])=>i===r);o>-1&&D.splice(o,1)}),[r]);let n=s.toasts.map(o=>{var i,c,u;return{...e,...e[o.type],...o,removeDelay:o.removeDelay||((i=e[o.type])==null?void 0:i.removeDelay)||e?.removeDelay,duration:o.duration||((c=e[o.type])==null?void 0:c.duration)||e?.duration||he[o.type],style:{...e.style,...(u=e[o.type])==null?void 0:u.style,...o.style}}});return{...s,toasts:n}},fe=(e,r="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:r,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:s?.id||ue()}),S=e=>(r,s)=>{let a=fe(r,e,s);return I(a.toasterId||pe(a.id))({type:2,toast:a}),a.id},f=(e,r)=>S("blank")(e,r);f.error=S("error");f.success=S("success");f.loading=S("loading");f.custom=S("custom");f.dismiss=(e,r)=>{let s={type:3,toastId:e};r?I(r)(s):X(s)};f.dismissAll=e=>f.dismiss(void 0,e);f.remove=(e,r)=>{let s={type:4,toastId:e};r?I(r)(s):X(s)};f.removeAll=e=>f.remove(void 0,e);f.promise=(e,r,s)=>{let a=f.loading(r.loading,{...s,...s?.loading});return typeof e=="function"&&(e=e()),e.then(l=>{let n=r.success?O(r.success,l):void 0;return n?f.success(n,{id:a,...s,...s?.success}):f.dismiss(a),l}).catch(l=>{let n=r.error?O(r.error,l):void 0;n?f.error(n,{id:a,...s,...s?.error}):f.dismiss(a)}),e};var ge=1e3,ve=(e,r="default")=>{let{toasts:s,pausedAt:a}=xe(e,r),l=d.useRef(new Map).current,n=d.useCallback((m,h=ge)=>{if(l.has(m))return;let x=setTimeout(()=>{l.delete(m),o({type:4,toastId:m})},h);l.set(m,x)},[]);d.useEffect(()=>{if(a)return;let m=Date.now(),h=s.map(x=>{if(x.duration===1/0)return;let b=(x.duration||0)+x.pauseDuration-(m-x.createdAt);if(b<0){x.visible&&f.dismiss(x.id);return}return setTimeout(()=>f.dismiss(x.id,r),b)});return()=>{h.forEach(x=>x&&clearTimeout(x))}},[s,a,r]);let o=d.useCallback(I(r),[r]),i=d.useCallback(()=>{o({type:5,time:Date.now()})},[o]),c=d.useCallback((m,h)=>{o({type:1,toast:{id:m,height:h}})},[o]),u=d.useCallback(()=>{a&&o({type:6,time:Date.now()})},[a,o]),p=d.useCallback((m,h)=>{let{reverseOrder:x=!1,gutter:b=8,defaultPosition:z}=h||{},k=s.filter(v=>(v.position||z)===(m.position||z)&&v.height),P=k.findIndex(v=>v.id===m.id),H=k.filter((v,E)=>E<P&&v.visible).length;return k.filter(v=>v.visible).slice(...x?[H+1]:[0,H]).reduce((v,E)=>v+(E.height||0)+b,0)},[s]);return d.useEffect(()=>{s.forEach(m=>{if(m.dismissed)n(m.id,m.removeDelay);else{let h=l.get(m.id);h&&(clearTimeout(h),l.delete(m.id))}})},[s,n]),{toasts:s,handlers:{updateHeight:c,startPause:i,endPause:u,calculateOffset:p}}},ye=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,be=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,je=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,we=M("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ye} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${be} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${je} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ke=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Ne=M("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ke} 1s linear infinite;
`,Ce=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Le=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Me=M("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ce} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Le} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,ze=M("div")`
  position: absolute;
`,Ee=M("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,$e=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Se=M("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${$e} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,He=({toast:e})=>{let{icon:r,type:s,iconTheme:a}=e;return r!==void 0?typeof r=="string"?d.createElement(Se,null,r):r:s==="blank"?null:d.createElement(Ee,null,d.createElement(Ne,{...a}),s!=="loading"&&d.createElement(ze,null,s==="error"?d.createElement(we,{...a}):d.createElement(Me,{...a})))},Ae=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Be=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,De="0%{opacity:0;} 100%{opacity:1;}",Oe="0%{opacity:1;} 100%{opacity:0;}",We=M("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Ie=M("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Pe=(e,r)=>{let s=e.includes("top")?1:-1,[a,l]=Z()?[De,Oe]:[Ae(s),Be(s)];return{animation:r?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(l)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Ve=d.memo(({toast:e,position:r,style:s,children:a})=>{let l=e.height?Pe(e.position||r||"top-center",e.visible):{opacity:0},n=d.createElement(He,{toast:e}),o=d.createElement(Ie,{...e.ariaProps},O(e.message,e));return d.createElement(We,{className:e.className,style:{...l,...s,...e.style}},typeof a=="function"?a({icon:n,message:o}):d.createElement(d.Fragment,null,n,o))});de(d.createElement);var Te=({id:e,className:r,style:s,onHeightUpdate:a,children:l})=>{let n=d.useCallback(o=>{if(o){let i=()=>{let c=o.getBoundingClientRect().height;a(e,c)};i(),new MutationObserver(i).observe(o,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return d.createElement("div",{ref:n,className:r,style:s},l)},Ue=(e,r)=>{let s=e.includes("top"),a=s?{top:0}:{bottom:0},l=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:Z()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${r*(s?1:-1)}px)`,...a,...l}},Re=W`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,A=16,_e=({reverseOrder:e,position:r="top-center",toastOptions:s,gutter:a,children:l,toasterId:n,containerStyle:o,containerClassName:i})=>{let{toasts:c,handlers:u}=ve(s,n);return d.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:A,left:A,right:A,bottom:A,pointerEvents:"none",...o},className:i,onMouseEnter:u.startPause,onMouseLeave:u.endPause},c.map(p=>{let m=p.position||r,h=u.calculateOffset(p,{reverseOrder:e,gutter:a,defaultPosition:r}),x=Ue(m,h);return d.createElement(Te,{id:p.id,key:p.id,onHeightUpdate:u.updateHeight,className:p.visible?Re:"",style:x},p.type==="custom"?O(p.message,p):l?l(p):d.createElement(Ve,{toast:p,position:m}))}))},B=f;function Fe(){const{flash:e}=K().props;return d.useEffect(()=>{e?.success&&B.success(e.success,{duration:3e3,position:"top-right"}),e?.error&&B.error(e.error,{duration:3e3,position:"top-right"}),e?.warning&&B(e.warning,{duration:3e3,position:"top-right",icon:"⚠️"}),e?.info&&B(e.info,{duration:3e3,position:"top-right",icon:"ℹ️"})},[e]),t.jsx(_e,{position:"top-right",toastOptions:{duration:3e3,style:{background:"#fff",color:"#333",boxShadow:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",borderRadius:"0.5rem",padding:"1rem"},success:{duration:3e3,style:{background:"#10b981",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#10b981"}},error:{duration:3e3,style:{background:"#ef4444",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#ef4444"}}}})}function qe({header:e,children:r}){const s=K().props.auth.user,[a,l]=d.useState(!1),[n,o]=d.useState(!1),[i,c]=d.useState(()=>typeof window<"u"?localStorage.getItem("sidebarCollapsed")==="true":!1),[u,p]=d.useState(()=>typeof window<"u"?localStorage.getItem("security_unlocked")==="true":!1),[m,h]=d.useState(!1),[x,b]=d.useState(""),[z,k]=d.useState("");d.useEffect(()=>{localStorage.setItem("sidebarCollapsed",String(i))},[i]),d.useEffect(()=>{const g=N=>{(N.ctrlKey||N.metaKey)&&N.key==="k"&&s.role==="admin"&&(N.preventDefault(),u?confirm("Lock security monitoring access? You will need to enter the key again to unlock.")&&P():h(!0))};return window.addEventListener("keydown",g),()=>window.removeEventListener("keydown",g)},[s.role,u]);const P=()=>{p(!1),localStorage.removeItem("security_unlocked"),window.location.href=route("admin.security.lock")},H=async g=>{g.preventDefault(),k("");try{(await ee.post(route("admin.security.unlock"),{key:x})).data.success&&(p(!0),localStorage.setItem("security_unlocked","true"),h(!1),b(""),te.reload())}catch(N){k(N.response?.data?.message||"Invalid key")}},v=()=>{switch(s.role){case"admin":return"admin.dashboard";case"company":return"company.dashboard";case"partner":return"partner.dashboard";case"staff":return"staff.dashboard";case"klien":case"client":return"klien.dashboard";default:return"dashboard"}},E=[{name:"Dashboard",href:route(v()),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"})}),active:route().current(v())||route().current("dashboard")},...s.role==="admin"?[{name:"Projects",href:route("admin.projects.bundles.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),active:route().current("admin.projects.*")},{name:"Project Templates",href:route("admin.project-templates.template-bundles.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"})}),active:route().current("admin.project-templates.*")},{name:"Users",href:route("admin.users.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"})}),active:route().current("admin.users.*")},{name:"Registered AP",href:route("admin.registered-aps.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),active:route().current("admin.registered-aps.*")},...u?[{name:"Login Security",href:route("admin.login-security.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"})}),active:route().current("admin.login-security.*")}]:[],{name:"Clients",href:route("admin.clients.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"})}),active:route().current("admin.clients.*")},{name:"News",href:route("admin.news.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"})}),active:route().current("admin.news.*")}]:[],...s.role==="company"?[{name:"My Projects",href:route("company.projects.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),active:route().current("company.projects.*")},{name:"My Clients",href:route("company.clients.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"})}),active:route().current("company.clients.*")}]:[],...s.role==="client"||s.role==="klien"?[{name:"My Projects",href:route("klien.projects.index"),icon:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"})}),active:route().current("klien.projects.*")}]:[]];return t.jsxs("div",{className:"h-screen bg-gray-100 flex flex-col overflow-hidden",children:[t.jsx(Fe,{}),t.jsxs("header",{className:"fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-4",children:[t.jsx("button",{onClick:()=>l(!a),className:"lg:hidden p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100",children:t.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})}),t.jsxs(C,{href:"/",className:"flex items-center space-x-3 ml-2 lg:ml-0",children:[t.jsx(re,{className:"h-8 w-8"}),t.jsxs("div",{className:"flex flex-col",children:[t.jsx("span",{className:"text-lg font-bold text-primary-600",children:t.jsx("strong",{children:"AURA"})}),t.jsx("span",{className:"text-xs text-gray-500",children:"Audit, Reporting & Analyze"})]})]}),t.jsx("div",{className:"flex-1"}),t.jsxs("div",{className:"hidden lg:flex items-center space-x-3 relative",children:[t.jsxs("div",{className:"text-right",children:[t.jsx("div",{className:"text-sm font-medium text-gray-900",children:s.name}),t.jsx("div",{className:"text-xs text-gray-500",children:s.role?s.role.charAt(0).toUpperCase()+s.role.slice(1):"User"})]}),t.jsx("button",{onClick:()=>o(!n),className:"flex items-center focus:outline-none",children:s.profile_photo?t.jsx("img",{src:`/storage/${s.profile_photo}`,alt:s.name,className:"w-10 h-10 rounded-full object-cover border-2 border-primary-300 hover:border-primary-400 transition-colors"}):t.jsx("div",{className:"w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors border-2 border-primary-300 hover:border-primary-400",children:t.jsx("span",{className:"text-base font-medium text-primary-600",children:s.name.charAt(0).toUpperCase()})})}),n&&t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>o(!1)}),t.jsxs("div",{className:"absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50",children:[t.jsxs(C,{href:route("profile.edit"),className:"flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",onClick:()=>o(!1),children:[t.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})}),"Profile"]}),t.jsxs(C,{href:route("logout"),method:"post",as:"button",className:"flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",onClick:()=>o(!1),children:[t.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),"Logout"]})]})]})]})]}),a&&t.jsx("div",{className:"fixed inset-0 z-40 lg:hidden",style:{top:"64px"},children:t.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-75",onClick:()=>l(!1)})}),t.jsxs("div",{className:"flex flex-1 pt-16 overflow-hidden",children:[t.jsxs("div",{className:`fixed left-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${a?"translate-x-0":"-translate-x-full"} lg:translate-x-0 ${i?"w-16":"w-64"} bg-cover bg-center bg-no-repeat shadow-xl`,style:{top:"64px",bottom:0,backgroundImage:"url(/AHR.jpg)"},children:[t.jsx("div",{className:"absolute inset-0"}),t.jsx("nav",{className:"relative z-10 flex-1 px-4 py-4 space-y-2 overflow-y-auto",children:E.map((g,N)=>t.jsxs("div",{className:"relative group",onMouseEnter:_=>{if(i){const V=_.currentTarget.getBoundingClientRect(),$=_.currentTarget.querySelector(".tooltip-content");$&&($.style.position="fixed",$.style.left=`${V.right+12}px`,$.style.top=`${V.top+V.height/2}px`,$.style.transform="translateY(-50%)")}},children:[t.jsxs(C,{href:g.href,className:`flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${g.active?"bg-white/95 text-gray-900 shadow-lg scale-[1.02]":"text-white/90 hover:bg-white/20 hover:text-white backdrop-blur-sm"} ${i?"justify-center":""}`,children:[t.jsx("span",{className:`${i?"":"mr-3"}`,children:g.icon}),!i&&t.jsx("span",{children:g.name})]}),i&&t.jsxs("div",{className:"tooltip-content fixed px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl pointer-events-none",children:[g.name,t.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900"})]})]},g.name))}),t.jsx("div",{className:"relative z-10 border-t border-white/20 p-4 backdrop-blur-sm",children:i?t.jsxs("div",{className:"space-y-1",children:[t.jsxs("div",{className:"relative group",children:[t.jsx(C,{href:route("profile.edit"),className:"flex items-center justify-center px-1 py-2 text-sm text-white/90 rounded-lg hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm",children:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})})}),t.jsxs("div",{className:"absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl",children:["Profile",t.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900"})]})]}),t.jsxs("div",{className:"relative group",children:[t.jsx(C,{href:route("logout"),method:"post",as:"button",className:"flex items-center justify-center w-full px-1 py-2 text-sm text-white/90 rounded-lg hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm",children:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})})}),t.jsxs("div",{className:"absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl",children:["Logout",t.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900"})]})]})]}):t.jsxs("div",{className:"space-y-1",children:[t.jsxs(C,{href:route("profile.edit"),className:"flex items-center px-3 py-2.5 text-sm font-medium text-white/90 rounded-lg hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm",children:[t.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})}),"Profile"]}),t.jsxs(C,{href:route("logout"),method:"post",as:"button",className:"flex items-center w-full px-3 py-2.5 text-sm font-medium text-white/90 rounded-lg hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm",children:[t.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),"Logout"]})]})})]}),t.jsxs("div",{className:`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${i?"lg:ml-16":"lg:ml-64"}`,children:[e&&t.jsx("header",{className:"bg-white shadow-sm border-b border-gray-200 flex-shrink-0",children:t.jsxs("div",{className:"px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-3",children:[t.jsx("button",{onClick:()=>c(!i),className:"hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0",title:i?"Expand sidebar":"Collapse sidebar",children:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})}),t.jsx("div",{className:"flex-1 min-w-0",children:e})]})}),t.jsx("main",{className:"flex-1 overflow-y-auto bg-gray-100",children:r})]}),m&&t.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:t.jsxs("div",{className:"bg-white rounded-lg shadow-xl p-6 w-96 max-w-md",children:[t.jsxs("div",{className:"flex items-center justify-between mb-4",children:[t.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"Security Access"}),t.jsx("button",{onClick:()=>{h(!1),b(""),k("")},className:"text-gray-400 hover:text-gray-600",children:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),t.jsxs("form",{onSubmit:H,children:[t.jsxs("div",{className:"mb-4",children:[t.jsx("label",{htmlFor:"unlockKey",className:"block text-sm font-medium text-gray-700 mb-2",children:"Enter Security Key"}),t.jsx("input",{id:"unlockKey",type:"password",value:x,onChange:g=>b(g.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",placeholder:"Enter key...",autoFocus:!0}),z&&t.jsx("p",{className:"mt-2 text-sm text-red-600",children:z})]}),t.jsxs("div",{className:"flex gap-3",children:[t.jsx("button",{type:"button",onClick:()=>{h(!1),b(""),k("")},className:"flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",children:"Cancel"}),t.jsx("button",{type:"submit",className:"flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",children:"Unlock"})]})]}),t.jsxs("p",{className:"mt-4 text-xs text-gray-500 text-center",children:["Press ",t.jsx("kbd",{className:"px-2 py-1 bg-gray-100 border border-gray-300 rounded",children:"Ctrl"})," + ",t.jsx("kbd",{className:"px-2 py-1 bg-gray-100 border border-gray-300 rounded",children:"K"})," to open this dialog"]})]})})]})]})}export{qe as A};
