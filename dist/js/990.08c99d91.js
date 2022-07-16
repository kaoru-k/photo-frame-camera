"use strict";(self["webpackChunkphoto_frame_camera"]=self["webpackChunkphoto_frame_camera"]||[]).push([[990],{990:function(t,e,n){n.r(e),n.d(e,{createSwipeBackGesture:function(){return c}});var r=n(587),a=n(545),o=n(515);
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const c=(t,e,n,c,i)=>{const s=t.ownerDocument.defaultView,u=(0,a.i)(t),h=t=>{const e=50,{startX:n}=t;return u?n>=s.innerWidth-e:n<=e},l=t=>u?-t.deltaX:t.deltaX,d=t=>u?-t.velocityX:t.velocityX,f=t=>h(t)&&e(),m=t=>{const e=l(t),n=e/s.innerWidth;c(n)},p=t=>{const e=l(t),n=s.innerWidth,a=e/n,o=d(t),c=n/2,u=o>=0&&(o>.2||e>c),h=u?1-a:a,f=h*n;let m=0;if(f>5){const t=f/Math.abs(o);m=Math.min(t,540)}i(u,a<=0?.01:(0,r.j)(0,a,.9999),m)};return(0,o.A)({el:t,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:f,onStart:n,onMove:m,onEnd:p})}}}]);
//# sourceMappingURL=990.08c99d91.js.map