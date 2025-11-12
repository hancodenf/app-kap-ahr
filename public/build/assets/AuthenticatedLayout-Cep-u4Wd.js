import{r as c,a as I,j as s,L as k}from"./app-DFTi_ukI.js";import{A as K}from"./ApplicationLogo-DSNKFDf_.js";let Q={data:""},G=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||Q},J=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,X=/\/\*[^]*?\*\/|  +/g,T=/\n+/g,N=(e,t)=>{let r="",o="",l="";for(let n in e){let a=e[n];n[0]=="@"?n[1]=="i"?r=n+" "+a+";":o+=n[1]=="f"?N(a,n):n+"{"+N(a,n[1]=="k"?"":t)+"}":typeof a=="object"?o+=N(a,t?t.replace(/([^,])+/g,i=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,u=>/&/.test(u)?u.replace(/&/g,i):i?i+" "+u:u)):n):a!=null&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),l+=N.p?N.p(n,a):n+":"+a+";")}return r+(t&&l?t+"{"+l+"}":l)+o},y={},R=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+R(e[r]);return t}return e},ee=(e,t,r,o,l)=>{let n=R(e),a=y[n]||(y[n]=(u=>{let p=0,m=11;for(;p<u.length;)m=101*m+u.charCodeAt(p++)>>>0;return"go"+m})(n));if(!y[a]){let u=n!==e?e:(p=>{let m,d,h=[{}];for(;m=J.exec(p.replace(X,""));)m[4]?h.shift():m[3]?(d=m[3].replace(T," ").trim(),h.unshift(h[0][d]=h[0][d]||{})):h[0][m[1]]=m[2].replace(T," ").trim();return h[0]})(e);y[a]=N(l?{["@keyframes "+a]:u}:u,r?"":"."+a)}let i=r&&y.g?y.g:null;return r&&(y.g=y[a]),((u,p,m,d)=>{d?p.data=p.data.replace(d,u):p.data.indexOf(u)===-1&&(p.data=m?u+p.data:p.data+u)})(y[a],t,o,i),a},te=(e,t,r)=>e.reduce((o,l,n)=>{let a=t[n];if(a&&a.call){let i=a(r),u=i&&i.props&&i.props.className||/^go/.test(i)&&i;a=u?"."+u:i&&typeof i=="object"?i.props?"":N(i,""):i===!1?"":i}return o+l+(a??"")},"");function A(e){let t=this||{},r=e.call?e(t.p):e;return ee(r.unshift?r.raw?te(r,[].slice.call(arguments,1),t.p):r.reduce((o,l)=>Object.assign(o,l&&l.call?l(t.p):l),{}):r,G(t.target),t.g,t.o,t.k)}let V,D,P;A.bind({g:1});let b=A.bind({k:1});function re(e,t,r,o){N.p=t,V=e,D=r,P=o}function C(e,t){let r=this||{};return function(){let o=arguments;function l(n,a){let i=Object.assign({},n),u=i.className||l.className;r.p=Object.assign({theme:D&&D()},i),r.o=/ *go\d+/.test(u),i.className=A.apply(r,o)+(u?" "+u:"");let p=e;return e[0]&&(p=i.as||e,delete i.as),P&&p[0]&&P(i),V(p,i)}return t?t(l):l}}var se=e=>typeof e=="function",$=(e,t)=>se(e)?e(t):e,ae=(()=>{let e=0;return()=>(++e).toString()})(),_=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),oe=20,S="default",F=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:o}=t;return F(e,{type:e.toasts.find(a=>a.id===o.id)?1:0,toast:o});case 3:let{toastId:l}=t;return{...e,toasts:e.toasts.map(a=>a.id===l||l===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+n}))}}},E=[],U={toasts:[],pausedAt:void 0,settings:{toastLimit:oe}},v={},Y=(e,t=S)=>{v[t]=F(v[t]||U,e),E.forEach(([r,o])=>{r===t&&o(v[t])})},q=e=>Object.keys(v).forEach(t=>Y(e,t)),ie=e=>Object.keys(v).find(t=>v[t].toasts.some(r=>r.id===e)),H=(e=S)=>t=>{Y(t,e)},ne={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},le=(e={},t=S)=>{let[r,o]=c.useState(v[t]||U),l=c.useRef(v[t]);c.useEffect(()=>(l.current!==v[t]&&o(v[t]),E.push([t,o]),()=>{let a=E.findIndex(([i])=>i===t);a>-1&&E.splice(a,1)}),[t]);let n=r.toasts.map(a=>{var i,u,p;return{...e,...e[a.type],...a,removeDelay:a.removeDelay||((i=e[a.type])==null?void 0:i.removeDelay)||e?.removeDelay,duration:a.duration||((u=e[a.type])==null?void 0:u.duration)||e?.duration||ne[a.type],style:{...e.style,...(p=e[a.type])==null?void 0:p.style,...a.style}}});return{...r,toasts:n}},de=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||ae()}),M=e=>(t,r)=>{let o=de(t,e,r);return H(o.toasterId||ie(o.id))({type:2,toast:o}),o.id},x=(e,t)=>M("blank")(e,t);x.error=M("error");x.success=M("success");x.loading=M("loading");x.custom=M("custom");x.dismiss=(e,t)=>{let r={type:3,toastId:e};t?H(t)(r):q(r)};x.dismissAll=e=>x.dismiss(void 0,e);x.remove=(e,t)=>{let r={type:4,toastId:e};t?H(t)(r):q(r)};x.removeAll=e=>x.remove(void 0,e);x.promise=(e,t,r)=>{let o=x.loading(t.loading,{...r,...r?.loading});return typeof e=="function"&&(e=e()),e.then(l=>{let n=t.success?$(t.success,l):void 0;return n?x.success(n,{id:o,...r,...r?.success}):x.dismiss(o),l}).catch(l=>{let n=t.error?$(t.error,l):void 0;n?x.error(n,{id:o,...r,...r?.error}):x.dismiss(o)}),e};var ce=1e3,ue=(e,t="default")=>{let{toasts:r,pausedAt:o}=le(e,t),l=c.useRef(new Map).current,n=c.useCallback((d,h=ce)=>{if(l.has(d))return;let f=setTimeout(()=>{l.delete(d),a({type:4,toastId:d})},h);l.set(d,f)},[]);c.useEffect(()=>{if(o)return;let d=Date.now(),h=r.map(f=>{if(f.duration===1/0)return;let j=(f.duration||0)+f.pauseDuration-(d-f.createdAt);if(j<0){f.visible&&x.dismiss(f.id);return}return setTimeout(()=>x.dismiss(f.id,t),j)});return()=>{h.forEach(f=>f&&clearTimeout(f))}},[r,o,t]);let a=c.useCallback(H(t),[t]),i=c.useCallback(()=>{a({type:5,time:Date.now()})},[a]),u=c.useCallback((d,h)=>{a({type:1,toast:{id:d,height:h}})},[a]),p=c.useCallback(()=>{o&&a({type:6,time:Date.now()})},[o,a]),m=c.useCallback((d,h)=>{let{reverseOrder:f=!1,gutter:j=8,defaultPosition:w}=h||{},O=r.filter(g=>(g.position||w)===(d.position||w)&&g.height),Z=O.findIndex(g=>g.id===d.id),W=O.filter((g,B)=>B<Z&&g.visible).length;return O.filter(g=>g.visible).slice(...f?[W+1]:[0,W]).reduce((g,B)=>g+(B.height||0)+j,0)},[r]);return c.useEffect(()=>{r.forEach(d=>{if(d.dismissed)n(d.id,d.removeDelay);else{let h=l.get(d.id);h&&(clearTimeout(h),l.delete(d.id))}})},[r,n]),{toasts:r,handlers:{updateHeight:u,startPause:i,endPause:p,calculateOffset:m}}},pe=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,me=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,he=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,fe=C("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${pe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${me} 0.15s ease-out forwards;
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
    animation: ${he} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,xe=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ge=C("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${xe} 1s linear infinite;
`,ve=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,ye=b`
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
}`,be=C("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ve} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${ye} 0.2s ease-out forwards;
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
`,je=C("div")`
  position: absolute;
`,we=C("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ke=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ne=C("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ke} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Ce=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return t!==void 0?typeof t=="string"?c.createElement(Ne,null,t):t:r==="blank"?null:c.createElement(we,null,c.createElement(ge,{...o}),r!=="loading"&&c.createElement(je,null,r==="error"?c.createElement(fe,{...o}):c.createElement(be,{...o})))},Me=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Le=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,ze="0%{opacity:0;} 100%{opacity:1;}",Ee="0%{opacity:1;} 100%{opacity:0;}",$e=C("div")`
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
`,Ae=C("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,He=(e,t)=>{let r=e.includes("top")?1:-1,[o,l]=_()?[ze,Ee]:[Me(r),Le(r)];return{animation:t?`${b(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(l)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Oe=c.memo(({toast:e,position:t,style:r,children:o})=>{let l=e.height?He(e.position||t||"top-center",e.visible):{opacity:0},n=c.createElement(Ce,{toast:e}),a=c.createElement(Ae,{...e.ariaProps},$(e.message,e));return c.createElement($e,{className:e.className,style:{...l,...r,...e.style}},typeof o=="function"?o({icon:n,message:a}):c.createElement(c.Fragment,null,n,a))});re(c.createElement);var Be=({id:e,className:t,style:r,onHeightUpdate:o,children:l})=>{let n=c.useCallback(a=>{if(a){let i=()=>{let u=a.getBoundingClientRect().height;o(e,u)};i(),new MutationObserver(i).observe(a,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return c.createElement("div",{ref:n,className:t,style:r},l)},De=(e,t)=>{let r=e.includes("top"),o=r?{top:0}:{bottom:0},l=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:_()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...o,...l}},Pe=A`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,L=16,Se=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:o,children:l,toasterId:n,containerStyle:a,containerClassName:i})=>{let{toasts:u,handlers:p}=ue(r,n);return c.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:L,left:L,right:L,bottom:L,pointerEvents:"none",...a},className:i,onMouseEnter:p.startPause,onMouseLeave:p.endPause},u.map(m=>{let d=m.position||t,h=p.calculateOffset(m,{reverseOrder:e,gutter:o,defaultPosition:t}),f=De(d,h);return c.createElement(Be,{id:m.id,key:m.id,onHeightUpdate:p.updateHeight,className:m.visible?Pe:"",style:f},m.type==="custom"?$(m.message,m):l?l(m):c.createElement(Oe,{toast:m,position:d}))}))},z=x;function We(){const{flash:e}=I().props;return c.useEffect(()=>{e?.success&&z.success(e.success,{duration:3e3,position:"top-right"}),e?.error&&z.error(e.error,{duration:3e3,position:"top-right"}),e?.warning&&z(e.warning,{duration:3e3,position:"top-right",icon:"⚠️"}),e?.info&&z(e.info,{duration:3e3,position:"top-right",icon:"ℹ️"})},[e]),s.jsx(Se,{position:"top-right",toastOptions:{duration:3e3,style:{background:"#fff",color:"#333",boxShadow:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",borderRadius:"0.5rem",padding:"1rem"},success:{duration:3e3,style:{background:"#10b981",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#10b981"}},error:{duration:3e3,style:{background:"#ef4444",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#ef4444"}}}})}function Re({header:e,children:t}){const r=I().props.auth.user,[o,l]=c.useState(!1),[n,a]=c.useState(!1),[i,u]=c.useState(()=>typeof window<"u"?localStorage.getItem("sidebarCollapsed")==="true":!1);c.useEffect(()=>{localStorage.setItem("sidebarCollapsed",String(i))},[i]);const p=()=>{switch(r.role){case"admin":return"admin.dashboard";case"company":return"company.dashboard";case"partner":return"partner.dashboard";case"staff":return"staff.dashboard";case"klien":case"client":return"klien.dashboard";default:return"dashboard"}},m=[{name:"Dashboard",href:route(p()),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"})}),active:route().current(p())||route().current("dashboard")},...r.role==="admin"?[{name:"Projects",href:route("admin.projects.bundles.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),active:route().current("admin.projects.*")},{name:"Project Templates",href:route("admin.project-templates.template-bundles.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"})}),active:route().current("admin.project-templates.*")},{name:"Users",href:route("admin.users.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"})}),active:route().current("admin.users.*")},{name:"Clients",href:route("admin.clients.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"})}),active:route().current("admin.clients.*")}]:[],...r.role==="company"?[{name:"My Projects",href:route("company.projects.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),active:route().current("company.projects.*")},{name:"My Clients",href:route("company.clients.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"})}),active:route().current("company.clients.*")}]:[],...r.role==="client"||r.role==="klien"?[{name:"My Projects",href:route("klien.projects.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"})}),active:route().current("klien.projects.*")}]:[]];return s.jsxs("div",{className:"h-screen bg-gray-100 flex flex-col overflow-hidden",children:[s.jsx(We,{}),s.jsxs("header",{className:"fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-4",children:[s.jsx("button",{onClick:()=>l(!o),className:"lg:hidden p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100",children:s.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})}),s.jsxs(k,{href:"/",className:"flex items-center space-x-3 ml-2 lg:ml-0",children:[s.jsx(K,{className:"h-8 w-8"}),s.jsxs("div",{className:"flex flex-col",children:[s.jsx("span",{className:"text-lg font-bold text-primary-600",children:"AURA"}),s.jsx("span",{className:"text-xs text-gray-500",children:"Audit, Reporting & Analyze"})]})]}),s.jsx("div",{className:"flex-1"}),s.jsxs("div",{className:"hidden lg:flex items-center space-x-3 relative",children:[s.jsxs("div",{className:"text-right",children:[s.jsx("div",{className:"text-sm font-medium text-gray-900",children:r.name}),s.jsx("div",{className:"text-xs text-gray-500",children:r.role?r.role.charAt(0).toUpperCase()+r.role.slice(1):"User"})]}),s.jsx("button",{onClick:()=>a(!n),className:"flex items-center focus:outline-none",children:r.profile_photo?s.jsx("img",{src:`/storage/${r.profile_photo}`,alt:r.name,className:"w-10 h-10 rounded-full object-cover border-2 border-primary-300 hover:border-primary-400 transition-colors"}):s.jsx("div",{className:"w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors border-2 border-primary-300 hover:border-primary-400",children:s.jsx("span",{className:"text-base font-medium text-primary-600",children:r.name.charAt(0).toUpperCase()})})}),n&&s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>a(!1)}),s.jsxs("div",{className:"absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50",children:[s.jsxs(k,{href:route("profile.edit"),className:"flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",onClick:()=>a(!1),children:[s.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})}),"Profile"]}),s.jsxs(k,{href:route("logout"),method:"post",as:"button",className:"flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",onClick:()=>a(!1),children:[s.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),"Logout"]})]})]})]})]}),o&&s.jsx("div",{className:"fixed inset-0 z-40 lg:hidden",style:{top:"64px"},children:s.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-75",onClick:()=>l(!1)})}),s.jsxs("div",{className:"flex flex-1 pt-16 overflow-hidden",children:[s.jsxs("div",{className:`fixed left-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${o?"translate-x-0":"-translate-x-full"} lg:translate-x-0 ${i?"w-16":"w-64"} bg-white border-r border-gray-200`,style:{top:"64px",bottom:0},children:[s.jsx("nav",{className:"flex-1 px-4 py-4 space-y-2 overflow-y-auto",children:m.map((d,h)=>s.jsxs("div",{className:"relative group",onMouseEnter:f=>{if(i){const j=f.currentTarget.getBoundingClientRect(),w=f.currentTarget.querySelector(".tooltip-content");w&&(w.style.position="fixed",w.style.left=`${j.right+12}px`,w.style.top=`${j.top+j.height/2}px`,w.style.transform="translateY(-50%)")}},children:[s.jsxs(k,{href:d.href,className:`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${d.active?"bg-primary-100 text-primary-700 border-r-2 border-primary-600":"text-gray-600 hover:bg-gray-100 hover:text-gray-900"} ${i?"justify-center":""}`,children:[s.jsx("span",{className:`${i?"":"mr-3"}`,children:d.icon}),!i&&s.jsx("span",{children:d.name})]}),i&&s.jsxs("div",{className:"tooltip-content fixed px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl pointer-events-none",children:[d.name,s.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"})]})]},d.name))}),s.jsx("div",{className:"border-t border-gray-200 p-4",children:i?s.jsxs("div",{className:"space-y-1",children:[s.jsxs("div",{className:"relative group",children:[s.jsx(k,{href:route("profile.edit"),className:"flex items-center justify-center px-1 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})})}),s.jsxs("div",{className:"absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl",children:["Profile",s.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"})]})]}),s.jsxs("div",{className:"relative group",children:[s.jsx(k,{href:route("logout"),method:"post",as:"button",className:"flex items-center justify-center w-full px-1 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})})}),s.jsxs("div",{className:"absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl",children:["Logout",s.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"})]})]})]}):s.jsxs("div",{className:"space-y-1",children:[s.jsxs(k,{href:route("profile.edit"),className:"flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:[s.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})}),"Profile"]}),s.jsxs(k,{href:route("logout"),method:"post",as:"button",className:"flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:[s.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),"Logout"]})]})})]}),s.jsxs("div",{className:`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${i?"lg:ml-16":"lg:ml-64"}`,children:[e&&s.jsx("header",{className:"bg-white shadow-sm border-b border-gray-200 flex-shrink-0",children:s.jsxs("div",{className:"px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-3",children:[s.jsx("button",{onClick:()=>u(!i),className:"hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0",title:i?"Expand sidebar":"Collapse sidebar",children:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})}),s.jsx("div",{className:"flex-1 min-w-0",children:e})]})}),s.jsx("main",{className:"flex-1 overflow-y-auto bg-gray-100",children:t})]})]})]})}export{Re as A};
