import{j as B}from"./vendor-framer-BL8owgo7.js";import{a4 as u}from"./vendor-lucide-C-t7Y5dN.js";import{S as ne,l as ie,W as ae,A as re,D as F,b as se,a as ce,p as le,o as de,G as me,q as he,c as H,s as W,r as j,g as D,h as pe,n as fe,C as we,M as N}from"./vendor-three-hfL7bMD4.js";const Me=({isMobile:o})=>{const d=u.useRef(null),m=u.useRef(null);return u.useEffect(()=>{var G;if(!m.current||!d.current)return;d.current;const k=m.current,a=new ne,s=new ie(45,window.innerWidth/window.innerHeight,.1,1e3);s.position.z=8;const r=new ae({canvas:k,alpha:!0,antialias:!o,powerPreference:o?"low-power":"high-performance"});r.setSize(window.innerWidth,window.innerHeight),r.setPixelRatio(o?1:Math.min(window.devicePixelRatio,2));const T=new re(16777215,.45);a.add(T);const g=new F(16777215,1.2);g.position.set(10,10,5),a.add(g);const x=new F(14938877,.7);x.position.set(-10,-10,-5),a.add(x);const h=o?450:2e3,p=new se,c=new Float32Array(h*3),V=new Float32Array(h);for(let t=0;t<h*3;t+=3){const i=o?80:150;c[t]=(Math.random()-.5)*i,c[t+1]=(Math.random()-.5)*i,c[t+2]=(Math.random()-.5)*(o?40:100)-30,V[t/3]=.02+Math.random()*(o?.02:.05)}p.setAttribute("position",new ce(c,3));const M=new le({color:16569165,size:.25,transparent:!0,opacity:.8,sizeAttenuation:!0}),f=new de(p,M);a.add(f);const e=new me,z=new he({uniforms:{light1Pos:{value:new W(10,10,5).normalize()},light1Color:{value:new H(3718648)},light2Pos:{value:new W(-10,-10,-5).normalize()},light2Color:{value:new H(8490232)}},vertexShader:`
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,fragmentShader:`
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                uniform vec3 light1Pos;
                uniform vec3 light1Color;
                uniform vec3 light2Pos;
                uniform vec3 light2Color;
                
                vec3 icos[12];
                
                void main() {
                    float phi = 1.61803398875;
                    icos[0] = normalize(vec3(-1.0, phi, 0.0));
                    icos[1] = normalize(vec3(1.0, phi, 0.0));
                    icos[2] = normalize(vec3(-1.0, -phi, 0.0));
                    icos[3] = normalize(vec3(1.0, -phi, 0.0));
                    
                    icos[4] = normalize(vec3(0.0, -1.0, phi));
                    icos[5] = normalize(vec3(0.0, 1.0, phi));
                    icos[6] = normalize(vec3(0.0, -1.0, -phi));
                    icos[7] = normalize(vec3(0.0, 1.0, -phi));
                    
                    icos[8] = normalize(vec3(phi, 0.0, -1.0));
                    icos[9] = normalize(vec3(phi, 0.0, 1.0));
                    icos[10] = normalize(vec3(-phi, 0.0, -1.0));
                    icos[11] = normalize(vec3(-phi, 0.0, 1.0));
                    
                    vec3 p = normalize(vPosition);
                    
                    float firstMax = -1.0;
                    float secondMax = -1.0;
                    for (int i = 0; i < 12; i++) {
                        float d = dot(p, icos[i]);
                        if (d > firstMax) {
                            secondMax = firstMax;
                            firstMax = d;
                        } else if (d > secondMax) {
                            secondMax = d;
                        }
                    }
                    
                    // Base Colors
                    vec3 baseColor = vec3(0.96, 0.96, 0.98); // White hexagons
                    
                    // Pentagons
                    if (firstMax > 0.89) {
                        baseColor = vec3(0.08, 0.08, 0.10); // Deep charcoal/black
                    }
                    
                    // Seams around pentagons
                    float seam1 = abs(firstMax - 0.89);
                    if (seam1 < 0.018) {
                        baseColor = vec3(0.0, 0.0, 0.0);
                    }
                    
                    // Seams between hexagons
                    float edgeVal = firstMax - secondMax;
                    if (edgeVal < 0.048 && firstMax <= 0.89) {
                        baseColor = vec3(0.0, 0.0, 0.0);
                    }
                    
                    // Lighting calculation
                    vec3 n = normalize(vNormal);
                    
                    // Light 1 (Blue)
                    float diff1 = max(dot(n, light1Pos), 0.0);
                    vec3 r1 = reflect(-light1Pos, n);
                    float spec1 = pow(max(dot(r1, vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
                    
                    // Light 2 (Purple)
                    float diff2 = max(dot(n, light2Pos), 0.0);
                    vec3 r2 = reflect(-light2Pos, n);
                    float spec2 = pow(max(dot(r2, vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
                    
                    // Ambient Light
                    vec3 ambient = vec3(0.2) * baseColor;
                    
                    // Combined Diffuse & Specular
                    vec3 diffuse = (diff1 * light1Color + diff2 * light2Color) * baseColor * 0.9;
                    vec3 specular = (spec1 * light1Color * 0.45) + (spec2 * light2Color * 0.35);
                    
                    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
                }
            `}),P=new j(1.5,o?24:64,o?24:64),Y=new D(P,z);e.add(Y);const C=new j(1.52,32,32),S=new pe({color:3718648,wireframe:!0,transparent:!0,opacity:.12}),q=new D(C,S);e.add(q);const I=new fe(6333946,2,8);e.add(I),a.add(e);let w=window.scrollY,b=window.scrollY;const y=()=>{b=window.scrollY};window.addEventListener("scroll",y,{passive:!0});const L=()=>{s.aspect=window.innerWidth/window.innerHeight,s.updateProjectionMatrix(),r.setSize(window.innerWidth,window.innerHeight)};window.addEventListener("resize",L);const n=((G=window.matchMedia)==null?void 0:G.call(window,"(prefers-reduced-motion: reduce)").matches)??!1?"reduced":o?"mobile":"normal";let A=new we,v,R=0;const _=n==="normal"?16:50,E=t=>{if(v=requestAnimationFrame(E),t-R<_)return;R=t;const i=Math.min(A.getDelta(),.06),Q=A.getElapsedTime(),U=n==="normal"?.15:.06,X=n==="normal"?.08:.03,Z=n==="normal"?1.5:.8,J=n==="normal"?.15:.08,K=n==="normal"?.02:.005,O=n==="normal"?.01:.002;e.rotation.y+=i*U,e.rotation.x+=i*X,e.position.y=Math.sin(Q*Z)*J,w+=(b-w)*.08;const $=Math.max(1e3,document.documentElement.scrollHeight-window.innerHeight),l=Math.min(Math.max(w/$,0),1),ee=-l*4,oe=l*3,te=l*1.5;e.position.y+=ee,e.position.x=N.lerp(e.position.x,oe,.08),e.position.z=N.lerp(e.position.z,te,.08),e.rotation.z=l*Math.PI*2,f.rotation.y+=i*K,f.rotation.x+=i*O,r.render(a,s)};return v=requestAnimationFrame(E),()=>{window.removeEventListener("scroll",y),window.removeEventListener("resize",L),cancelAnimationFrame(v),P.dispose(),z.dispose(),C.dispose(),S.dispose(),p.dispose(),M.dispose(),r.dispose()}},[]),B.jsx("div",{ref:d,className:"fixed inset-0 pointer-events-none",style:{zIndex:0,background:"radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)"},children:B.jsx("canvas",{ref:m,className:"w-full h-full block"})})};export{Me as default};
