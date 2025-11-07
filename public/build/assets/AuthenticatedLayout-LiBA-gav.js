import{r as u,a as S,j as s,L as k}from"./app-ClxbGJKO.js";import{A as D}from"./ApplicationLogo-DM-RmZTK.js";let Q={data:""},G=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||Q},J=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,X=/\/\*[^]*?\*\/|  +/g,I=/\n+/g,j=(e,t)=>{let r="",i="",n="";for(let o in e){let a=e[o];o[0]=="@"?o[1]=="i"?r=o+" "+a+";":i+=o[1]=="f"?j(a,o):o+"{"+j(a,o[1]=="k"?"":t)+"}":typeof a=="object"?i+=j(a,t?t.replace(/([^,])+/g,l=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,d=>/&/.test(d)?d.replace(/&/g,l):l?l+" "+d:d)):o):a!=null&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),n+=j.p?j.p(o,a):o+":"+a+";")}return r+(t&&n?t+"{"+n+"}":n)+i},y={},_=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+_(e[r]);return t}return e},ee=(e,t,r,i,n)=>{let o=_(e),a=y[o]||(y[o]=(d=>{let c=0,m=11;for(;c<d.length;)m=101*m+d.charCodeAt(c++)>>>0;return"go"+m})(o));if(!y[a]){let d=o!==e?e:(c=>{let m,p,h=[{}];for(;m=J.exec(c.replace(X,""));)m[4]?h.shift():m[3]?(p=m[3].replace(I," ").trim(),h.unshift(h[0][p]=h[0][p]||{})):h[0][m[1]]=m[2].replace(I," ").trim();return h[0]})(e);y[a]=j(n?{["@keyframes "+a]:d}:d,r?"":"."+a)}let l=r&&y.g?y.g:null;return r&&(y.g=y[a]),((d,c,m,p)=>{p?c.data=c.data.replace(p,d):c.data.indexOf(d)===-1&&(c.data=m?d+c.data:c.data+d)})(y[a],t,i,l),a},te=(e,t,r)=>e.reduce((i,n,o)=>{let a=t[o];if(a&&a.call){let l=a(r),d=l&&l.props&&l.props.className||/^go/.test(l)&&l;a=d?"."+d:l&&typeof l=="object"?l.props?"":j(l,""):l===!1?"":l}return i+n+(a??"")},"");function E(e){let t=this||{},r=e.call?e(t.p):e;return ee(r.unshift?r.raw?te(r,[].slice.call(arguments,1),t.p):r.reduce((i,n)=>Object.assign(i,n&&n.call?n(t.p):n),{}):r,G(t.target),t.g,t.o,t.k)}let V,B,P;E.bind({g:1});let b=E.bind({k:1});function re(e,t,r,i){j.p=t,V=e,B=r,P=i}function w(e,t){let r=this||{};return function(){let i=arguments;function n(o,a){let l=Object.assign({},o),d=l.className||n.className;r.p=Object.assign({theme:B&&B()},l),r.o=/ *go\d+/.test(d),l.className=E.apply(r,i)+(d?" "+d:"");let c=e;return e[0]&&(c=l.as||e,delete l.as),P&&c[0]&&P(l),V(c,l)}return t?t(n):n}}var se=e=>typeof e=="function",z=(e,t)=>se(e)?e(t):e,ae=(()=>{let e=0;return()=>(++e).toString()})(),U=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),oe=20,T="default",F=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:i}=t;return F(e,{type:e.toasts.find(a=>a.id===i.id)?1:0,toast:i});case 3:let{toastId:n}=t;return{...e,toasts:e.toasts.map(a=>a.id===n||n===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+o}))}}},$=[],Y={toasts:[],pausedAt:void 0,settings:{toastLimit:oe}},v={},q=(e,t=T)=>{v[t]=F(v[t]||Y,e),$.forEach(([r,i])=>{r===t&&i(v[t])})},Z=e=>Object.keys(v).forEach(t=>q(e,t)),ie=e=>Object.keys(v).find(t=>v[t].toasts.some(r=>r.id===e)),A=(e=T)=>t=>{q(t,e)},ne={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},le=(e={},t=T)=>{let[r,i]=u.useState(v[t]||Y),n=u.useRef(v[t]);u.useEffect(()=>(n.current!==v[t]&&i(v[t]),$.push([t,i]),()=>{let a=$.findIndex(([l])=>l===t);a>-1&&$.splice(a,1)}),[t]);let o=r.toasts.map(a=>{var l,d,c;return{...e,...e[a.type],...a,removeDelay:a.removeDelay||((l=e[a.type])==null?void 0:l.removeDelay)||e?.removeDelay,duration:a.duration||((d=e[a.type])==null?void 0:d.duration)||e?.duration||ne[a.type],style:{...e.style,...(c=e[a.type])==null?void 0:c.style,...a.style}}});return{...r,toasts:o}},de=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||ae()}),N=e=>(t,r)=>{let i=de(t,e,r);return A(i.toasterId||ie(i.id))({type:2,toast:i}),i.id},x=(e,t)=>N("blank")(e,t);x.error=N("error");x.success=N("success");x.loading=N("loading");x.custom=N("custom");x.dismiss=(e,t)=>{let r={type:3,toastId:e};t?A(t)(r):Z(r)};x.dismissAll=e=>x.dismiss(void 0,e);x.remove=(e,t)=>{let r={type:4,toastId:e};t?A(t)(r):Z(r)};x.removeAll=e=>x.remove(void 0,e);x.promise=(e,t,r)=>{let i=x.loading(t.loading,{...r,...r?.loading});return typeof e=="function"&&(e=e()),e.then(n=>{let o=t.success?z(t.success,n):void 0;return o?x.success(o,{id:i,...r,...r?.success}):x.dismiss(i),n}).catch(n=>{let o=t.error?z(t.error,n):void 0;o?x.error(o,{id:i,...r,...r?.error}):x.dismiss(i)}),e};var ce=1e3,ue=(e,t="default")=>{let{toasts:r,pausedAt:i}=le(e,t),n=u.useRef(new Map).current,o=u.useCallback((p,h=ce)=>{if(n.has(p))return;let f=setTimeout(()=>{n.delete(p),a({type:4,toastId:p})},h);n.set(p,f)},[]);u.useEffect(()=>{if(i)return;let p=Date.now(),h=r.map(f=>{if(f.duration===1/0)return;let M=(f.duration||0)+f.pauseDuration-(p-f.createdAt);if(M<0){f.visible&&x.dismiss(f.id);return}return setTimeout(()=>x.dismiss(f.id,t),M)});return()=>{h.forEach(f=>f&&clearTimeout(f))}},[r,i,t]);let a=u.useCallback(A(t),[t]),l=u.useCallback(()=>{a({type:5,time:Date.now()})},[a]),d=u.useCallback((p,h)=>{a({type:1,toast:{id:p,height:h}})},[a]),c=u.useCallback(()=>{i&&a({type:6,time:Date.now()})},[i,a]),m=u.useCallback((p,h)=>{let{reverseOrder:f=!1,gutter:M=8,defaultPosition:W}=h||{},H=r.filter(g=>(g.position||W)===(p.position||W)&&g.height),K=H.findIndex(g=>g.id===p.id),R=H.filter((g,O)=>O<K&&g.visible).length;return H.filter(g=>g.visible).slice(...f?[R+1]:[0,R]).reduce((g,O)=>g+(O.height||0)+M,0)},[r]);return u.useEffect(()=>{r.forEach(p=>{if(p.dismissed)o(p.id,p.removeDelay);else{let h=n.get(p.id);h&&(clearTimeout(h),n.delete(p.id))}})},[r,o]),{toasts:r,handlers:{updateHeight:d,startPause:l,endPause:c,calculateOffset:m}}},pe=b`
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
}`,fe=w("div")`
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
`,ge=w("div")`
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
}`,be=w("div")`
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
`,je=w("div")`
  position: absolute;
`,we=w("div")`
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
}`,Ne=w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ke} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Me=({toast:e})=>{let{icon:t,type:r,iconTheme:i}=e;return t!==void 0?typeof t=="string"?u.createElement(Ne,null,t):t:r==="blank"?null:u.createElement(we,null,u.createElement(ge,{...i}),r!=="loading"&&u.createElement(je,null,r==="error"?u.createElement(fe,{...i}):u.createElement(be,{...i})))},Ce=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Le=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,$e="0%{opacity:0;} 100%{opacity:1;}",ze="0%{opacity:1;} 100%{opacity:0;}",Ee=w("div")`
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
`,Ae=w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,He=(e,t)=>{let r=e.includes("top")?1:-1,[i,n]=U()?[$e,ze]:[Ce(r),Le(r)];return{animation:t?`${b(i)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(n)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Oe=u.memo(({toast:e,position:t,style:r,children:i})=>{let n=e.height?He(e.position||t||"top-center",e.visible):{opacity:0},o=u.createElement(Me,{toast:e}),a=u.createElement(Ae,{...e.ariaProps},z(e.message,e));return u.createElement(Ee,{className:e.className,style:{...n,...r,...e.style}},typeof i=="function"?i({icon:o,message:a}):u.createElement(u.Fragment,null,o,a))});re(u.createElement);var De=({id:e,className:t,style:r,onHeightUpdate:i,children:n})=>{let o=u.useCallback(a=>{if(a){let l=()=>{let d=a.getBoundingClientRect().height;i(e,d)};l(),new MutationObserver(l).observe(a,{subtree:!0,childList:!0,characterData:!0})}},[e,i]);return u.createElement("div",{ref:o,className:t,style:r},n)},Be=(e,t)=>{let r=e.includes("top"),i=r?{top:0}:{bottom:0},n=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:U()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...i,...n}},Pe=E`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,C=16,Te=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:i,children:n,toasterId:o,containerStyle:a,containerClassName:l})=>{let{toasts:d,handlers:c}=ue(r,o);return u.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:C,left:C,right:C,bottom:C,pointerEvents:"none",...a},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(m=>{let p=m.position||t,h=c.calculateOffset(m,{reverseOrder:e,gutter:i,defaultPosition:t}),f=Be(p,h);return u.createElement(De,{id:m.id,key:m.id,onHeightUpdate:c.updateHeight,className:m.visible?Pe:"",style:f},m.type==="custom"?z(m.message,m):n?n(m):u.createElement(Oe,{toast:m,position:p}))}))},L=x;function We(){const{flash:e}=S().props;return u.useEffect(()=>{e?.success&&L.success(e.success,{duration:3e3,position:"top-right"}),e?.error&&L.error(e.error,{duration:3e3,position:"top-right"}),e?.warning&&L(e.warning,{duration:3e3,position:"top-right",icon:"⚠️"}),e?.info&&L(e.info,{duration:3e3,position:"top-right",icon:"ℹ️"})},[e]),s.jsx(Te,{position:"top-right",toastOptions:{duration:3e3,style:{background:"#fff",color:"#333",boxShadow:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",borderRadius:"0.5rem",padding:"1rem"},success:{duration:3e3,style:{background:"#10b981",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#10b981"}},error:{duration:3e3,style:{background:"#ef4444",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#ef4444"}}}})}function Se({header:e,children:t}){const r=S().props.auth.user,[i,n]=u.useState(!1),[o,a]=u.useState(!1),l=()=>{switch(r.role){case"admin":return"admin.dashboard";case"company":return"company.dashboard";case"partner":return"partner.dashboard";case"staff":return"staff.dashboard";case"klien":case"client":return"klien.dashboard";default:return"dashboard"}},d=[{name:"Dashboard",href:route(l()),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"})}),active:route().current(l())||route().current("dashboard")},...r.role==="admin"?[{name:"Projects",href:route("admin.projects.bundles.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),active:route().current("admin.projects.*")},{name:"Project Templates",href:route("admin.project-templates.template-bundles.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"})}),active:route().current("admin.project-templates.*")},{name:"Users",href:route("admin.users.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"})}),active:route().current("admin.users.*")},{name:"Clients",href:route("admin.clients.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"})}),active:route().current("admin.clients.*")}]:[],...r.role==="company"?[{name:"My Projects",href:route("company.projects.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})}),active:route().current("company.projects.*")},{name:"My Clients",href:route("company.clients.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"})}),active:route().current("company.clients.*")}]:[],...r.role==="client"||r.role==="klien"?[{name:"My Projects",href:route("klien.projects.index"),icon:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"})}),active:route().current("klien.projects.*")}]:[]];return s.jsxs("div",{className:"min-h-screen bg-gray-100 flex",children:[s.jsx(We,{}),i&&s.jsx("div",{className:"fixed inset-0 z-40 lg:hidden",children:s.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-75",onClick:()=>n(!1)})}),s.jsxs("div",{className:`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:static lg:inset-0 ${i?"translate-x-0":"-translate-x-full"} lg:translate-x-0 ${o?"w-16":"w-64"} bg-white shadow-lg overflow-visible`,children:[s.jsxs("div",{className:`flex items-center px-4 py-4 border-b border-gray-200 ${o?"justify-center":"justify-between"}`,children:[!o&&s.jsxs(k,{href:"/",className:"flex items-center space-x-3",children:[s.jsx(D,{className:"h-8 w-8"}),s.jsxs("div",{className:"flex flex-col",children:[s.jsx("span",{className:"text-lg font-bold text-primary-600",children:"AURA"}),s.jsx("span",{className:"text-xs text-gray-500",children:"Audit, Reporting & Analyze"})]})]}),o&&s.jsx(D,{className:"h-8 w-8"}),s.jsx("button",{onClick:()=>a(!o),className:"hidden lg:block p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100",children:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:o?"M13 7l5 5-5 5M6 12h12":"M11 17l-5-5 5-5M18 12H6"})})})]}),s.jsx("nav",{className:"flex-1 px-4 py-4 pb-40 space-y-2 overflow-y-auto",children:d.map((c,m)=>s.jsxs("div",{className:"relative group",onMouseEnter:p=>{if(o){const h=p.currentTarget.getBoundingClientRect(),f=p.currentTarget.querySelector(".tooltip-content");f&&(f.style.position="fixed",f.style.left=`${h.right+12}px`,f.style.top=`${h.top+h.height/2}px`,f.style.transform="translateY(-50%)")}},children:[s.jsxs(k,{href:c.href,className:`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${c.active?"bg-primary-100 text-primary-700 border-r-2 border-primary-600":"text-gray-600 hover:bg-gray-100 hover:text-gray-900"} ${o?"justify-center":""}`,children:[s.jsx("span",{className:`${o?"":"mr-3"}`,children:c.icon}),!o&&s.jsx("span",{children:c.name})]}),o&&s.jsxs("div",{className:"tooltip-content fixed px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl pointer-events-none",children:[c.name,s.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"})]})]},c.name))})]}),s.jsx("div",{className:`fixed bottom-0 left-0 z-50 transition-all duration-300 ease-in-out ${i?"translate-x-0":"-translate-x-full"} lg:translate-x-0 ${o?"w-16":"w-64"} bg-white border-t border-r border-gray-200 shadow-lg`,children:s.jsxs("div",{className:"p-4",children:[s.jsx("div",{className:`flex items-center ${o?"justify-center":""}`,children:s.jsxs("div",{className:"flex items-center",children:[s.jsx("div",{className:"flex-shrink-0",children:r.profile_photo?s.jsx("img",{src:`/storage/${r.profile_photo}`,alt:r.name,className:`${o?"w-10 h-10":"w-8 h-8"} rounded-full object-cover border-2 border-primary-300 transition-all duration-300`}):s.jsx("div",{className:`${o?"w-10 h-10":"w-8 h-8"} rounded-full bg-primary-100 flex items-center justify-center transition-all duration-300`,children:s.jsx("span",{className:`${o?"text-base":"text-sm"} font-medium text-primary-600`,children:r.name.charAt(0).toUpperCase()})})}),!o&&s.jsxs("div",{className:"ml-3",children:[s.jsx("div",{className:"text-sm font-medium text-gray-900",children:r.name}),s.jsx("div",{className:"text-xs text-gray-500",children:r.role?r.role.charAt(0).toUpperCase()+r.role.slice(1):"User"})]})]})}),o?s.jsxs("div",{className:"mt-3 space-y-1",children:[s.jsxs("div",{className:"relative group",children:[s.jsx(k,{href:route("profile.edit"),className:"flex items-center justify-center px-1 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})})}),s.jsxs("div",{className:"absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl",children:["Profile",s.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"})]})]}),s.jsxs("div",{className:"relative group",children:[s.jsx(k,{href:route("logout"),method:"post",as:"button",className:"flex items-center justify-center w-full px-1 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:s.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})})}),s.jsxs("div",{className:"absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl",children:["Logout",s.jsx("div",{className:"absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"})]})]})]}):s.jsxs("div",{className:"mt-3 space-y-1",children:[s.jsxs(k,{href:route("profile.edit"),className:"flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:[s.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})}),"Profile"]}),s.jsxs(k,{href:route("logout"),method:"post",as:"button",className:"flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100",children:[s.jsx("svg",{className:"w-4 h-4 mr-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),"Logout"]})]})]})}),s.jsxs("div",{className:"flex-1 flex flex-col overflow-hidden",children:[s.jsx("header",{className:"bg-white shadow-sm border-b border-gray-200 lg:hidden",children:s.jsxs("div",{className:"flex items-center justify-between px-4 py-3",children:[s.jsx("button",{onClick:()=>n(!i),className:"p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100",children:s.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})}),s.jsxs("div",{className:"flex items-center space-x-3",children:[s.jsx(D,{className:"h-8 w-8"}),s.jsxs("div",{className:"flex flex-col",children:[s.jsx("span",{className:"text-lg font-bold text-primary-600",children:"AURA"}),s.jsx("span",{className:"text-xs text-gray-500",children:"Audit, Reporting & Analyze"})]})]}),s.jsx("div",{className:"w-10"})," "]})}),e&&s.jsx("header",{className:"bg-white shadow-sm border-b border-gray-200",children:s.jsx("div",{className:"px-4 py-4 sm:px-6 lg:px-8",children:e})}),s.jsx("main",{className:"flex-1 overflow-y-auto",children:t})]})]})}export{Se as A};
