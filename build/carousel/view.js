import*as e from"@wordpress/interactivity";var t={d:(e,n)=>{for(var r in n)t.o(n,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const n=(r={store:()=>e.store},o={},t.d(o,r),o);var r,o;document.addEventListener("DOMContentLoaded",(()=>{const e=document.querySelectorAll('[data-wp-interactive="squareonesoftware"][data-wp-context]');window.carouselStores={},e.forEach((e=>{const t=e.getAttribute("id");let r={};try{r=JSON.parse(e.getAttribute("data-wp-context"))}catch(e){console.error(`Error parsing PHP context for carousel ${t}:`,e)}const o=Object.assign({currentIndex:0,transform:"translateX(0%)",isTransitioning:!1,itemsTotal:0,clonesCount:0,itemsPerView:3,scroll:1,loop:!0,slideWidth:null},r);o.loop&&(o.currentIndex=o.clonesCount);const{state:s,actions:a}=(0,n.store)("squareonesoftware-"+t,{actions:{moveForward(){s.isTransitioning||(s.isTransitioning=!0,s.currentIndex+=s.scroll,l())},moveBack(){s.isTransitioning||(s.isTransitioning=!0,s.currentIndex-=s.scroll,l())}},state:o});window.carouselStores[t]={state:s,actions:a};const i=e.querySelector(".carousel-track"),c=e.querySelector(".carousel-container");if(!i||!c)return;function l(){if(window.innerWidth<=760){const e=74.0740740741*s.currentIndex;i.style.transform=`translateX(-${e}%)`,c.classList.add("mobile-partial-view")}else{const e=100/(s.itemsPerView-.3)*s.currentIndex;i.style.transform=`translateX(-${e}%)`,c.classList.remove("mobile-partial-view")}}i.addEventListener("transitionend",(()=>{s.isTransitioning=!1,s.currentIndex>=s.itemsTotal+s.clonesCount?(i.style.transition="none",s.currentIndex=s.currentIndex-s.itemsTotal,l(),requestAnimationFrame((()=>{i.offsetHeight,i.style.transition="transform 0.3s ease-out"}))):s.currentIndex<s.clonesCount&&(i.style.transition="none",s.currentIndex=s.currentIndex+s.itemsTotal,l(),requestAnimationFrame((()=>{i.offsetHeight,i.style.transition="transform 0.3s ease-out"})))})),i.style.transition="none",l(),i.offsetHeight,setTimeout((()=>{i.style.transition="transform 0.3s ease-out"}),50),window.addEventListener("resize",l);let d=0,u=0,m=!1;i.addEventListener("touchstart",(e=>{e.touches&&e.touches.length&&(d=e.touches[0].clientX,u=d,m=!0)})),i.addEventListener("touchmove",(e=>{m&&e.touches&&e.touches.length&&(u=e.touches[0].clientX)})),i.addEventListener("touchend",(()=>{if(!m)return;m=!1;const e=u-d;Math.abs(e)>50&&(e<0?a.moveForward():a.moveBack())}));let v=!1,f=0,w=0;i.addEventListener("mousedown",(e=>{e.preventDefault(),v=!0,f=e.clientX,w=f})),i.addEventListener("mousemove",(e=>{v&&(w=e.clientX)})),i.addEventListener("mouseup",(()=>{if(!v)return;v=!1;const e=w-f;Math.abs(e)>50&&(e<0?a.moveForward():a.moveBack())})),i.addEventListener("mouseleave",(()=>{if(v){v=!1;const e=w-f;Math.abs(e)>50&&(e<0?a.moveForward():a.moveBack())}}));const h=e.querySelector(".carousel-prev[data-carousel-id]");h&&h.addEventListener("click",(()=>{a.moveBack()}));const p=e.querySelector(".carousel-next[data-carousel-id]");p&&p.addEventListener("click",(()=>{a.moveForward()}))}))}));