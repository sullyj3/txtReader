var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function i(t){return"function"==typeof t}function u(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function r(t){return null==t?"":t}function s(t,n){t.appendChild(n)}function l(t,n,e){t.insertBefore(n,e||null)}function c(t){t.parentNode.removeChild(t)}function d(t){return document.createElement(t)}function a(t){return document.createTextNode(t)}function f(){return a(" ")}function p(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function h(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}let m;function $(t){m=t}function g(t){(function(){if(!m)throw new Error("Function called outside component initialization");return m})().$$.on_mount.push(t)}const x=[],y=[],b=[],k=[],T=Promise.resolve();let v=!1;function _(t){b.push(t)}function L(t){k.push(t)}const J=new Set;let w=0;function S(){const t=m;do{for(;w<x.length;){const t=x[w];w++,$(t),D(t.$$)}for($(null),x.length=0,w=0;y.length;)y.pop()();for(let t=0;t<b.length;t+=1){const n=b[t];J.has(n)||(J.add(n),n())}b.length=0}while(x.length);for(;k.length;)k.pop()();v=!1,J.clear(),$(t)}function D(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(_)}}const M=new Set;function E(t,n){t&&t.i&&(M.delete(t),t.i(n))}function N(t,n,e,o){if(t&&t.o){if(M.has(t))return;M.add(t),undefined.c.push((()=>{M.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}else o&&o()}function C(t,n,e){const o=t.$$.props[n];void 0!==o&&(t.$$.bound[o]=e,e(t.$$.ctx[o]))}function j(t){t&&t.c()}function O(t,e,u,r){const{fragment:s,on_mount:l,on_destroy:c,after_update:d}=t.$$;s&&s.m(e,u),r||_((()=>{const e=l.map(n).filter(i);c?c.push(...e):o(e),t.$$.on_mount=[]})),d.forEach(_)}function A(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function z(t,n){-1===t.$$.dirty[0]&&(x.push(t),v||(v=!0,T.then(S)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function F(n,i,u,r,s,l,d,a=[-1]){const f=m;$(n);const p=n.$$={fragment:null,ctx:null,props:l,update:t,not_equal:s,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(i.context||(f?f.$$.context:[])),callbacks:e(),dirty:a,skip_bound:!1,root:i.target||f.$$.root};d&&d(p.root);let h=!1;if(p.ctx=u?u(n,i.props||{},((t,e,...o)=>{const i=o.length?o[0]:e;return p.ctx&&s(p.ctx[t],p.ctx[t]=i)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](i),h&&z(n,t)),e})):[],p.update(),h=!0,o(p.before_update),p.fragment=!!r&&r(p.ctx),i.target){if(i.hydrate){const t=function(t){return Array.from(t.childNodes)}(i.target);p.fragment&&p.fragment.l(t),t.forEach(c)}else p.fragment&&p.fragment.c();i.intro&&E(n.$$.fragment),O(n,i.target,i.anchor,i.customElement),S()}$(f)}class H{$destroy(){A(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function I(t){let n,e,i,u,r,a,m,$;return{c(){n=d("button"),n.textContent="Clear",e=f(),i=d("div"),u=d("label"),u.textContent="Join lines",r=f(),a=d("input"),h(u,"for","join-lines"),h(a,"type","checkbox"),h(i,"id","join-lines")},m(o,c){l(o,n,c),l(o,e,c),l(o,i,c),s(i,u),s(i,r),s(i,a),a.checked=t[1],m||($=[p(n,"click",t[5]),p(a,"change",t[9])],m=!0)},p(t,n){2&n&&(a.checked=t[1])},d(t){t&&c(n),t&&c(e),t&&c(i),m=!1,o($)}}}function P(n){let e,i,u,r,a,m,$,g,x,y,b,k,T,v=n[0]&&I(n);return{c(){e=d("div"),i=d("span"),u=d("input"),r=f(),a=d("p"),a.textContent="(Or press ctrl-V)",m=f(),$=d("div"),g=d("label"),g.textContent="Dark mode",x=f(),y=d("input"),b=f(),v&&v.c(),h(u,"type","file"),h(u,"name","choose file"),h(g,"for","theme-toggle"),h(y,"type","checkbox"),h($,"id","theme-toggle"),h(e,"id","menu")},m(t,o){l(t,e,o),s(e,i),s(i,u),n[7](u),s(i,r),s(i,a),s(e,m),s(e,$),s($,g),s($,x),s($,y),y.checked=n[2],s(e,b),v&&v.m(e,null),k||(T=[p(u,"change",n[6]),p(y,"change",n[8])],k=!0)},p(t,[n]){4&n&&(y.checked=t[2]),t[0]?v?v.p(t,n):(v=I(t),v.c(),v.m(e,null)):v&&(v.d(1),v=null)},i:t,o:t,d(t){t&&c(e),n[7](null),v&&v.d(),k=!1,o(T)}}}function q(t,n,e){let o,i,{menuDisplayText:u}=n,{menuShouldJoinLines:r}=n,{darkMode:s=!1}=n;return t.$$set=t=>{"menuDisplayText"in t&&e(0,u=t.menuDisplayText),"menuShouldJoinLines"in t&&e(1,r=t.menuShouldJoinLines),"darkMode"in t&&e(2,s=t.darkMode)},t.$$.update=()=>{if(8&t.$$.dirty){const t=o&&o[0]?o[0]:null;t&&(async t=>{e(0,u={type:"FileText",fileName:t.name,text:await t.text()})})(t)}},[u,r,s,o,i,()=>{e(0,u=null),e(3,o=null),e(4,i.value=null,i)},function(){o=this.files,e(3,o)},function(t){y[t?"unshift":"push"]((()=>{i=t,e(4,i)}))},function(){s=this.checked,e(2,s)},function(){r=this.checked,e(1,r)}]}class B extends H{constructor(t){super(),F(this,t,q,P,u,{menuDisplayText:0,menuShouldJoinLines:1,darkMode:2})}}function R(t){let n,e=t[0].fileName+"";return{c(){n=d("h1"),h(n,"id","filename"),h(n,"class","svelte-1s6z1hc")},m(t,o){l(t,n,o),n.innerHTML=e},p(t,o){1&o&&e!==(e=t[0].fileName+"")&&(n.innerHTML=e)},d(t){t&&c(n)}}}function V(t){let n,e;return{c(){n=d("pre"),e=a(t[1]),h(n,"id","text"),h(n,"class","svelte-1s6z1hc")},m(t,o){l(t,n,o),s(n,e)},p(t,n){2&n&&function(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}(e,t[1])},d(t){t&&c(n)}}}function G(n){let e,o,i=n[0]&&"FileText"===n[0].type&&R(n),u=n[0]&&V(n);return{c(){e=d("div"),i&&i.c(),o=f(),u&&u.c(),h(e,"id","text-display"),h(e,"class","svelte-1s6z1hc")},m(t,n){l(t,e,n),i&&i.m(e,null),s(e,o),u&&u.m(e,null)},p(t,[n]){t[0]&&"FileText"===t[0].type?i?i.p(t,n):(i=R(t),i.c(),i.m(e,o)):i&&(i.d(1),i=null),t[0]?u?u.p(t,n):(u=V(t),u.c(),u.m(e,null)):u&&(u.d(1),u=null)},i:t,o:t,d(t){t&&c(e),i&&i.d(),u&&u.d()}}}function K(t){return t.replaceAll(/\s*(\r\n?|\n)/g," ")}function Q(t){return t.trim().length>0}function U(t,n,e){let o,{displayText:i}=n,{shouldJoinLines:u}=n;return t.$$set=t=>{"displayText"in t&&e(0,i=t.displayText),"shouldJoinLines"in t&&e(2,u=t.shouldJoinLines)},t.$$.update=()=>{5&t.$$.dirty&&i&&e(1,o=u?i.text.split(/(\r\n|\n)(\r\n?|\n)+/).map(K).filter(Q).join("\n\n"):i.text)},[i,o,u]}class W extends H{constructor(t){super(),F(this,t,U,G,u,{displayText:0,shouldJoinLines:2})}}function X(t){let n,e,o,i,u,a,m,$,g,x,b,k;function T(n){t[5](n)}function v(n){t[6](n)}function _(n){t[7](n)}let J={};return void 0!==t[1]&&(J.menuDisplayText=t[1]),void 0!==t[2]&&(J.menuShouldJoinLines=t[2]),void 0!==t[0]&&(J.darkMode=t[0]),o=new B({props:J}),y.push((()=>C(o,"menuDisplayText",T))),y.push((()=>C(o,"menuShouldJoinLines",v))),y.push((()=>C(o,"darkMode",_))),$=new W({props:{displayText:t[1],shouldJoinLines:t[2]}}),{c(){n=f(),e=d("main"),j(o.$$.fragment),m=f(),j($.$$.fragment),document.title="TxtReader",h(e,"class",g=r(t[3])+" svelte-g4hu83")},m(i,u){l(i,n,u),l(i,e,u),O(o,e,null),s(e,m),O($,e,null),x=!0,b||(k=p(e,"paste",t[4]),b=!0)},p(t,[n]){const s={};!i&&2&n&&(i=!0,s.menuDisplayText=t[1],L((()=>i=!1))),!u&&4&n&&(u=!0,s.menuShouldJoinLines=t[2],L((()=>u=!1))),!a&&1&n&&(a=!0,s.darkMode=t[0],L((()=>a=!1))),o.$set(s);const l={};2&n&&(l.displayText=t[1]),4&n&&(l.shouldJoinLines=t[2]),$.$set(l),(!x||8&n&&g!==(g=r(t[3])+" svelte-g4hu83"))&&h(e,"class",g)},i(t){x||(E(o.$$.fragment,t),E($.$$.fragment,t),x=!0)},o(t){N(o.$$.fragment,t),N($.$$.fragment,t),x=!1},d(t){t&&c(n),t&&c(e),A(o),A($),b=!1,k()}}}function Y(t,n,e){let o=null,i=!1,u=!1,r="lightTheme";return g((()=>{const t=window.sessionStorage.getItem("displayText");t&&e(1,o=JSON.parse(t))})),t.$$.update=()=>{1&t.$$.dirty&&e(3,r=u?"darkTheme":"lightTheme")},[u,o,i,r,t=>{t.preventDefault(),e(1,o={type:"Pasted",text:t.clipboardData.getData("text")}),window.sessionStorage.setItem("displayText",JSON.stringify(o))},function(t){o=t,e(1,o)},function(t){i=t,e(2,i)},function(t){u=t,e(0,u)}]}return new class extends H{constructor(t){super(),F(this,t,Y,X,u,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
