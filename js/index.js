var D=document,M=Math,W=window,$=function(a,b){return b=b||D,a.startsWith(".")?b.getElementsByClassName(a.substr(1,a.length)):a.startsWith("#")?b.getElementById(a.substr(1,a.length)):b.getElementsByTagName(a)},draggableContainer=$("#draggables"),drag=$(".drag",draggableContainer),maxZIndex=5*drag.length,dragged=!1,startPos=!1,currentZIndex=1,forEach=function(a,b){for(var c=0;c<a.length;c++)a.hasOwnProperty(c)&&b(a[c])},cl={has:function has(a,b){return a.className&&-1<a.className.indexOf(b)},add:function add(a,b){cl.has(a,b)||(a.className&&(b=a.className+" "+b),a.className=b)},rm:function rm(a,b){cl.has(a,b)&&(a.className=a.className.replace(b,"").trim())},toggle:function toggle(a,b){cl.has(a,b)?cl.rm(a,b):cl.add(a,b)}},on=function(a,b,c){a&&a.addEventListener(b,c)},onload=function(a){return function(b){if(cl.has(b.target,"bg")){var c=b.target,d=c.getBoundingClientRect().width,e=c.getBoundingClientRect().height,f=0,g=0,h=.7*W.innerWidth;if(d>h){var k=d/h+.1;d/=k,e/=k}var l=.7*W.innerHeight;if(e>l){var m=e/l+.1;e/=m,d/=m}var i=W.innerWidth-d,j=W.innerHeight-e;f=M.random()*i,g=M.random()*j,f="".concat(M.floor(percentFromPixels("Width",f)),"%"),g="".concat(M.floor(percentFromPixels("Height",g)),"%"),a.style.left=f,a.style.top=g}}};forEach(drag,function(a){var b=M.random(),c={left:"100%",top:"100%"};.7<b?c.left="-".concat(c.left):.3>b&&(c.top="-".concat(c.top)),a.style.left=c.left,a.style.top=c.top;var d=$(".bg",a)[0];on(d,"load",onload(a))});var touchHandler=function(a){var b=a.changedTouches[0],c=D.createEvent("MouseEvent"),d={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup"}[a.type];return c.initMouseEvent(d,!0,!0,W,1,b.screenX,b.screenY,b.clientX,b.clientY,!1,!1,!1,!1,0,null),b.target.dispatchEvent(c),a.preventDefault(),a.stopPropagation(),!1},doNothing=function(a){return a.preventDefault(),!1},getPos=function(a){return parseInt(a.replace("%",""))},percentFromPixels=function(a,b){return 100*(b/W["inner".concat(a)])},pixelsFromPercent=function(a,b){return b*W["inner".concat(a)]/100},isOutOfBounds=function(a){return a.clientX>=W.innerWidth||0>=a.clientX||a.clientY>=W.innerHeight||0>=a.clientY},onDrag=function(a){dragged=a.currentTarget.parentNode,cl.add(dragged,"dragged"),startPos={left:pixelsFromPercent("Width",getPos(dragged.style.left)),top:pixelsFromPercent("Height",getPos(dragged.style.top))},currentZIndex+=1,dragged.style.zIndex=currentZIndex,dragged.offset={left:a.clientX-pixelsFromPercent("Width",getPos(dragged.style.left)),top:a.clientY-pixelsFromPercent("Height",getPos(dragged.style.top))},dragged.style.opacity=.8,on(D,"mousemove",onMousemove),on(D,"mouseup",onDrop),on(D,"mouseout",onDropIfOutOfBounds)},onDrop=function(){dragged&&(forEach(drag,function(a){cl.rm(a,"dragged"),a===dragged?cl.add(dragged,"dropped"):cl.rm(a,"dropped")}),dragged.style.opacity=1,dragged=!1,startPos=!1)},onDropIfOutOfBounds=function(a){isOutOfBounds(a)&&onDrop(a)},onMousemove=function(a){if(dragged){var b={left:W.innerWidth-dragged.clientWidth,top:W.innerHeight-dragged.clientHeight},c=a.clientX-dragged.offset.left;0>c?c=0:c>b.left&&(c=b.left),dragged.style.left="".concat(percentFromPixels("Width",c),"%");var d=a.clientY-dragged.offset.top;0>d?d=0:d>b.top&&(d=b.top),dragged.style.top="".concat(percentFromPixels("Height",d),"%")}};W.onload=function(){forEach(drag,function(b){var c=$(".bg",b)[0];if(c){on(c,"dragstart",doNothing),on(c,"mousedown",onDrag),on(c,"touchstart",touchHandler,!0),on(c,"touchmove",touchHandler,!0),on(c,"touchend",touchHandler,!0),on(c,"touchcancel",touchHandler,!0);var a=c.parentNode.style;(a&&"100%"===a.left||"-100%"===a.left)&&c.dispatchEvent(new Event("load"))}var d=$("a",b)[0];d&&on(d,"touchend",function(a){return a.stopPropagation(),!1})})};var menuContainer=$(".nav")[0];if(menuContainer){var active=$(".active",menuContainer)[0],toggleMenu=function(a){return a.preventDefault(),cl.toggle(menuContainer,"show"),!1};active&&on(active,"click",toggleMenu)}var trigger=$(".about-page-trigger")[0];trigger&&on(trigger,"click",function(a){return a.preventDefault(),cl.toggle(D.body,"about-visible"),!1});