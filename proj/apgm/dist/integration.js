var ce=Object.defineProperty;var ue=(r,t)=>{for(var e in t)ce(r,e,{get:t[e],enumerable:!0})};var a={};ue(a,{Parser:()=>P,all:()=>gr,choice:()=>le,eof:()=>xr,fail:()=>pe,lazy:()=>de,location:()=>Ct,match:()=>me,ok:()=>st,text:()=>fe});var P=class{constructor(r){this.action=r}parse(r){let t={index:0,line:1,column:1},e=new Ar({input:r,location:t}),n=this.skip(xr).action(e);return n.type==="ActionOK"?{type:"ParseOK",value:n.value}:{type:"ParseFail",location:n.furthest,expected:n.expected}}tryParse(r){let t=this.parse(r);if(t.type==="ParseOK")return t.value;let{expected:e,location:n}=t,{line:o,column:i}=n,c=`parse error at line ${o} column ${i}: expected ${e.join(", ")}`;throw new Error(c)}and(r){return new P(t=>{let e=this.action(t);if(e.type==="ActionFail")return e;t=t.moveTo(e.location);let n=t.merge(e,r.action(t));if(n.type==="ActionOK"){let o=[e.value,n.value];return t.merge(n,t.ok(n.location.index,o))}return n})}skip(r){return this.and(r).map(([t])=>t)}next(r){return this.and(r).map(([,t])=>t)}or(r){return new P(t=>{let e=this.action(t);return e.type==="ActionOK"?e:t.merge(e,r.action(t))})}chain(r){return new P(t=>{let e=this.action(t);if(e.type==="ActionFail")return e;let n=r(e.value);return t=t.moveTo(e.location),t.merge(e,n.action(t))})}map(r){return this.chain(t=>st(r(t)))}thru(r){return r(this)}desc(r){return new P(t=>{let e=this.action(t);return e.type==="ActionOK"?e:{type:"ActionFail",furthest:e.furthest,expected:r}})}wrap(r,t){return r.next(this).skip(t)}trim(r){return this.wrap(r,r)}repeat(r=0,t=1/0){if(!hr(r,t))throw new Error(`repeat: bad range (${r} to ${t})`);return r===0?this.repeat(1,t).or(st([])):new P(e=>{let n=[],o=this.action(e);if(o.type==="ActionFail")return o;for(;o.type==="ActionOK"&&n.length<t;){if(n.push(o.value),o.location.index===e.location.index)throw new Error("infinite loop detected; don't call .repeat() with parsers that can accept zero characters");e=e.moveTo(o.location),o=e.merge(o,this.action(e))}return o.type==="ActionFail"&&n.length<r?o:e.merge(o,e.ok(e.location.index,n))})}sepBy(r,t=0,e=1/0){if(!hr(t,e))throw new Error(`sepBy: bad range (${t} to ${e})`);return t===0?this.sepBy(r,1,e).or(st([])):e===1?this.map(n=>[n]):this.chain(n=>r.next(this).repeat(t-1,e-1).map(o=>[n,...o]))}node(r){return gr(Ct,this,Ct).map(([t,e,n])=>({type:"ParseNode",name:r,value:e,start:t,end:n}))}};function hr(r,t){return r<=t&&r>=0&&t>=0&&Number.isInteger(r)&&r!==1/0&&(Number.isInteger(t)||t===1/0)}var Ct=new P(r=>r.ok(r.location.index,r.location));function st(r){return new P(t=>t.ok(t.location.index,r))}function pe(r){return new P(t=>t.fail(t.location.index,r))}var xr=new P(r=>r.location.index<r.input.length?r.fail(r.location.index,["<EOF>"]):r.ok(r.location.index,"<EOF>"));function fe(r){return new P(t=>{let e=t.location.index,n=e+r.length;return t.input.slice(e,n)===r?t.ok(n,r):t.fail(e,[r])})}function me(r){for(let e of r.flags)switch(e){case"i":case"s":case"m":case"u":continue;default:throw new Error("only the regexp flags 'imsu' are supported")}let t=new RegExp(r.source,r.flags+"y");return new P(e=>{let n=e.location.index;t.lastIndex=n;let o=e.input.match(t);if(o){let i=n+o[0].length,c=e.input.slice(n,i);return e.ok(i,c)}return e.fail(n,[String(r)])})}function gr(...r){return r.reduce((t,e)=>t.chain(n=>e.map(o=>[...n,o])),st([]))}function le(...r){return r.reduce((t,e)=>t.or(e))}function de(r){let t=new P(e=>(t.action=r().action,t.action(e)));return t}function he(r,t){return[...new Set([...r,...t])]}var Ar=class{constructor(r){this.input=r.input,this.location=r.location}moveTo(r){return new Ar({input:this.input,location:r})}_internal_move(r){if(r===this.location.index)return this.location;let t=this.location.index,e=r,n=this.input.slice(t,e),{line:o,column:i}=this.location;for(let c of n)c===`
`?(o++,i=1):i++;return{index:r,line:o,column:i}}ok(r,t){return{type:"ActionOK",value:t,location:this._internal_move(r),furthest:{index:-1,line:-1,column:-1},expected:[]}}fail(r,t){return{type:"ActionFail",furthest:this._internal_move(r),expected:t}}merge(r,t){if(t.furthest.index>r.furthest.index)return t;let e=t.furthest.index===r.furthest.index?he(r.expected,t.expected):r.expected;return t.type==="ActionOK"?{type:"ActionOK",location:t.location,value:t.value,furthest:r.furthest,expected:e}:{type:"ActionFail",furthest:r.furthest,expected:e}}};var m=class{pretty(){return"unimplemented"}doesReturnValue(){return!1}isSameComponent(t){return!0}};var bt=0,yt=1,Et=2,Zt="A1",zt="B0",Ut="B1",br="ADD";function xe(r){switch(r){case bt:return Zt;case yt:return zt;case Et:return Ut}}function ge(r){switch(r){case Zt:return bt;case zt:return yt;case Ut:return Et}}var O=class extends m{constructor(t){super(),this.op=t}pretty(){return`${br} ${xe(this.op)}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(n===br&&(o===Zt||o===zt||o===Ut))return new O(ge(o))}doesReturnValue(){switch(this.op){case bt:return!1;case yt:return!0;case Et:return!0}}isSameComponent(t){return t instanceof O}};var Q=0,tt=1,at=2,ct=3,j=4,q=5,ut=6,St="INC",kt="TDEC",Pt="READ",wt="SET",Ft="B2DX",Wt="B2DY",Vt="B2D",Ae="DEC",yr="SQX",Er="SQY",Sr="SQ";function Pr(r){switch(r){case St:return Q;case kt:return tt;case Pt:return at;case wt:return ct}}function be(r){switch(r){case Q:return St;case tt:return kt;case at:return Pt;case ct:return wt}}function wr(r){switch(r){case Ft:return j;case Wt:return q;case Vt:return ut}}function ye(r){switch(r){case j:return Ft;case q:return Wt;case ut:return Vt}}var A=class extends m{constructor(t,e){super(),this.op=t,this.axis=e}pretty(){return`${be(this.op)} ${ye(this.axis)}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(!(n===void 0||o===void 0)){if(n===St||n===kt){if(o===Ft||o===Wt)return new A(Pr(n),wr(o))}else if((n===Pt||n===wt)&&o===Vt)return new A(Pr(n),wr(o));switch(n){case St:switch(o){case yr:return new A(Q,j);case Er:return new A(Q,q);default:return}case Ae:switch(o){case yr:return new A(tt,j);case Er:return new A(tt,q);default:return}case Pt:switch(o){case Sr:return new A(at,ut);default:return}case wt:switch(o){case Sr:return new A(ct,ut);default:return}}}}doesReturnValue(){switch(this.op){case Q:return!1;case tt:return!0;case at:return!0;case ct:return!1}}isSameComponent(t){if(t instanceof A){let e=this.axis,n=t.axis;return e===j&&n===q?!1:!(e===q&&n===j)}return!1}};var pt=0,ft=1,Gt=2,Nt=3,Yt="INC",Ht="TDEC",Xt="READ",jt="SET",Gr="B";function Ee(r){switch(r){case pt:return Yt;case ft:return Ht;case Gt:return Xt;case Nt:return jt}}function Se(r){switch(r){case Yt:return pt;case Ht:return ft;case Xt:return Gt;case jt:return Nt}}var G=class extends m{constructor(t,e){super(),this.op=t,this.regNumber=e,this.registerCache=void 0}pretty(){return`${Ee(this.op)} ${Gr}${this.regNumber}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(!(n===void 0||o===void 0)&&(n===Yt||n===Ht||n===Xt||n===jt)&&o.startsWith(Gr)){let i=o.slice(1);if(/^[0-9]+$/u.test(i))return new G(Se(n),parseInt(i,10))}}doesReturnValue(){switch(this.op){case pt:return!1;case ft:return!0;case Gt:return!0;case Nt:return!1}}isSameComponent(t){return t instanceof G?this.regNumber===t.regNumber:!1}};var Nr="HALT_OUT",x=class extends m{constructor(){super()}pretty(){return Nr}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==1)return;let[n]=e;if(n===Nr)return new x}doesReturnValue(){return!1}isSameComponent(t){return t instanceof x}};var qt=0,Kt=1,Jt="0",Qt="1",Mr="MUL";function Pe(r){switch(r){case Jt:return qt;case Qt:return Kt}}function we(r){switch(r){case qt:return Jt;case Kt:return Qt}}var k=class extends m{constructor(t){super(),this.op=t}pretty(){return`${Mr} ${we(this.op)}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(n===Mr&&(o===Jt||o===Qt))return new k(Pe(o))}doesReturnValue(){return!0}isSameComponent(t){return t instanceof k}};var Lr="NOP",b=class extends m{constructor(){super()}pretty(){return Lr}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==1)return;let[n]=e;if(n===Lr)return new b}doesReturnValue(){return!0}isSameComponent(t){return t instanceof b}};var Br="OUTPUT",F=class extends m{constructor(t){super(),this.digit=t}pretty(){return`${Br} ${this.digit}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(n===Br&&o!==void 0)return new F(o)}doesReturnValue(){return!1}isSameComponent(t){return t instanceof F}};var Mt=0,Lt=1,Bt=2,tr="A1",rr="B0",er="B1",Tr="SUB";function Ge(r){switch(r){case Mt:return tr;case Lt:return rr;case Bt:return er}}function Ne(r){switch(r){case tr:return Mt;case rr:return Lt;case er:return Bt}}var W=class extends m{constructor(t){super(),this.op=t}pretty(){return`${Tr} ${Ge(this.op)}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(n===Tr&&(o===tr||o===rr||o===er))return new W(Ne(o))}doesReturnValue(){switch(this.op){case Mt:return!1;case Lt:return!0;case Bt:return!0}}isSameComponent(t){return t instanceof W}};var Tt=0,mt=1,nr="INC",or="TDEC",$r="U",Me="R";function Le(r){switch(r){case Tt:return nr;case mt:return or}}function Be(r){switch(r){case nr:return Tt;case or:return mt}}var N=class extends m{constructor(t,e){super(),this.op=t,this.regNumber=e,this.registerCache=void 0}pretty(){return`${Le(this.op)} ${$r}${this.regNumber}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(!(n===void 0||o===void 0)&&(n===nr||n===or)&&(o.startsWith($r)||o.startsWith(Me))){let i=o.slice(1);if(/^[0-9]+$/u.test(i))return new N(Be(n),parseInt(i,10))}}doesReturnValue(){switch(this.op){case Tt:return!1;case mt:return!0}}isSameComponent(t){return t instanceof N?this.regNumber===t.regNumber:!1}};var $t=0,Rt=1,vt=2,It=3,Dt=4,ir="INC",sr="DEC",ar="READ",cr="SET",ur="RESET";function Te(r){switch(r){case $t:return ir;case Rt:return sr;case vt:return ar;case It:return cr;case Dt:return ur}}function $e(r){switch(r){case ir:return $t;case sr:return Rt;case ar:return vt;case cr:return It;case ur:return Dt}}var _=class extends m{constructor(t,e){super(),this.op=t,this.regNumber=e}pretty(){return`${Te(this.op)} T${this.regNumber}`}static parse(t){let e=t.trim().split(/\s+/u);if(e.length!==2)return;let[n,o]=e;if(!(n===void 0||o===void 0)&&(n===ir||n===sr||n===ar||n===cr||n===ur)&&o.startsWith("T")){let i=o.slice(1);if(/^[0-9]+$/u.test(i))return new _($e(n),parseInt(i,10))}}doesReturnValue(){switch(this.op){case $t:return!0;case Rt:return!0;case vt:return!0;case It:return!1;case Dt:return!1}}isSameComponent(t){return t instanceof _?this.regNumber===t.regNumber:!1}};function rt(r){let t=[G.parse,N.parse,A.parse,b.parse,O.parse,k.parse,W.parse,F.parse,x.parse,_.parse];for(let e of t){let n=e(r);if(n!==void 0)return n}}var vi=Number.parseInt,Ii=Number.isNaN;var De=a.match(/[0-9]+/).desc(["number"]).map(r=>({raw:r,value:parseInt(r,10)})),Oe=a.match(/0x[a-fA-F0-9]+/).desc(["hexadecimal number"]).map(r=>({raw:r,value:parseInt(r,16)})),Rr=Oe.or(De).desc(["number"]);var h=class{constructor(){}},p=class extends Error{constructor(e,n,o){super(e,o);this.apgmSpan=n}};function vr(r){return`line ${r.line} column ${r.column}`}function g(r){return r!==void 0?` at ${vr(r)}`:""}var M=class extends h{constructor(e,n,o){super();this.name=e;this.args=n;this.span=o}transform(e){return e(new M(this.name,this.args.map(n=>n.transform(e)),this.span))}pretty(){return`${this.name}(${this.args.map(e=>e.pretty()).join(", ")})`}};var L=class extends h{constructor(e,n,o,i,c){super();this.modifier=e;this.cond=n;this.thenBody=o;this.elseBody=i;this.span=c}transform(e){return e(new L(this.modifier,this.cond.transform(e),this.thenBody.transform(e),this.elseBody!==void 0?this.elseBody.transform(e):void 0,this.span))}pretty(){let e=`if_${this.modifier==="Z"?"z":"nz"}`,n=this.cond.pretty(),o=this.elseBody===void 0?"":` else ${this.elseBody.pretty()}`;return`${e} (${n}) ${this.thenBody.pretty()}`+o}};var B=class extends h{constructor(e){super();this.body=e}transform(e){return e(new B(this.body.transform(e)))}pretty(){return`loop ${this.body.pretty()}`}};var ht=class{constructor(t,e,n,o){this.name=t;this.args=e;this.body=n;this.span=o}pretty(){return`macro ${this.name}(${this.args.map(t=>t.pretty()).join(", ")}) ${this.body.pretty()}`}};var xt=class{constructor(t,e,n){this.macros=t;this.headers=e;this.seqExpr=n}pretty(){return[this.macros.map(t=>t.pretty()).join(`
`),this.headers.map(t=>t.toString()).join(`
`),this.seqExpr.prettyInner()].join(`
`)}};var gt=class{constructor(t,e){this.name=t;this.content=e}toString(){let t=this.content.startsWith(" ")?"":" ";return`#${this.name}${t}${this.content}`}};var C=class extends h{constructor(e,n,o){super();this.value=e;this.span=n;this.raw=o}transform(e){return e(this)}pretty(){return this.value.toString()}};var V=class extends h{constructor(e,n){super();this.value=e;this.span=n}transform(e){return e(this)}pretty(){return'"'+this.value+'"'}};var v=class extends h{constructor(e){super();this.exprs=e}transform(e){return e(new v(this.exprs.map(n=>n.transform(e))))}pretty(){return`{${this.prettyInner()}}`}prettyInner(){return this.exprs.map(e=>e instanceof L||e instanceof B||e instanceof T?e.pretty():e.pretty()+";").join(`
`)}};var Z=class extends h{constructor(e,n){super();this.name=e;this.span=n}transform(e){return e(this)}pretty(){return this.name}};var T=class extends h{constructor(e,n,o){super();this.modifier=e;this.cond=n;this.body=o}transform(e){return e(new T(this.modifier,this.cond.transform(e),this.body.transform(e)))}pretty(){return`while_${this.modifier==="Z"?"z":"nz"}(${this.cond.pretty()}) ${this.body.pretty()}`}};function Ot(r,t){let e=t.split(/\r?\n/),n=e[r.line-2],o=e[r.line-1],i=e[r.line],c=" ".repeat(Math.max(0,r.column-1))+"^",f=n===void 0?[]:[n],u=i===void 0?[]:[i],S=" | ",R=r.line.toString(),ot=" ".repeat(R.length);return[...f.map(it=>ot+S+it),R+S+o,ot+S+c,...u.map(it=>ot+S+it)]}function _e(r,t){let e=Ot(r.location,t);return[`parse error at line ${r.location.line} column ${r.location.column}:`,`  expected ${r.expected.join(", ")}`,"",...e].join(`
`)}function Ir(r,t){let e=r.parse(t);if(e.type==="ParseOK")return e.value;throw new p(_e(e,t),{start:e.location,end:e.location})}function Y(r,t){let e=t.length;return{start:r,end:{index:r.index+e-1,line:r.line,column:r.column+e}}}var Dr=a.location.chain(r=>a.text('"').next(a.match(/[^"]*/)).skip(a.text('"')).desc(["string"]).map(t=>({value:t,span:Y(r,`"${t}"`)})));var Ce=a.match(/\/\*(\*(?!\/)|[^*])*\*\//s).desc([]),d=a.match(/\s*/).desc(["space"]).sepBy(Ce).map(()=>{}),Ze=a.match(/\s+/).desc(["space"]),ze=/[a-zA-Z_][a-zA-Z_0-9]*/u,Cr=a.match(ze).desc(["identifier"]),Ue=Cr.wrap(d,d),ke=d.chain(()=>a.location.chain(r=>Cr.skip(d).map(t=>[t,Y(r,t)]))),Fe=/[a-zA-Z_][a-zA-Z_0-9]*!/u,Zr=a.match(Fe).wrap(d,d).desc(["macro name"]);function I(r){return a.text(r).wrap(d,d)}function Or(r){return a.location.chain(e=>a.text(r).map(n=>[n,Y(e,r)])).wrap(d,d)}var We=I(",").desc(["`,`"]),zr=I("(").desc(["`(`"]),Ur=I(")").desc(["`)`"]),Ve=I(";").desc(["`;`"]),Ye=I("{").desc(["`{`"]),He=I("}").desc(["`}`"]),kr=ke.map(([r,t])=>new Z(r,t));function Fr(r){return a.lazy(()=>r()).sepBy(We).wrap(zr,Ur)}function Xe(){return d.next(a.location).chain(r=>a.choice(Zr,Ue).chain(t=>Fr(()=>H()).map(e=>new M(t,e,Y(r,t)))))}var je=a.location.chain(r=>Rr.map(t=>new C(t.value,Y(r,t.raw),t.raw))).wrap(d,d),qe=Dr.wrap(d,d).map(r=>new V(r.value,r.span)),Wr=a.lazy(()=>sn()).repeat(),Ke=Wr.wrap(Ye,He).map(r=>new v(r)),Je=a.choice(I("while_z"),I("while_nz")).map(r=>r==="while_z"?"Z":"NZ"),Vr=a.lazy(()=>H()).wrap(zr,Ur),Yr=Je.chain(r=>Vr.chain(t=>H().map(e=>new T(r,t,e)))),Hr=I("loop").next(a.lazy(()=>H())).map(r=>new B(r)),Qe=a.choice(Or("if_z"),Or("if_nz")).map(r=>r[0]==="if_z"?["Z",r[1]]:["NZ",r[1]]),Xr=Qe.chain(([r,t])=>Vr.chain(e=>a.lazy(()=>H()).chain(n=>a.choice(I("else").next(a.lazy(()=>H())),a.ok(void 0)).map(o=>new L(r,e,n,o,t))))),_r="macro",tn=d.chain(r=>a.location.chain(t=>a.text(_r).next(Ze).map(e=>Y(t,_r))));function pr(){return tn.and(Zr).chain(([r,t])=>Fr(()=>kr).map(e=>({span:r,name:t,args:e})))}function rn(){return pr().chain(({span:r,name:t,args:e})=>a.lazy(()=>H()).map(n=>new ht(t,e,n,r)))}var en=a.match(/.*/),nn=a.text("#").next(a.match(/REGISTERS|COMPONENTS/)).desc(["#REGISTERS","#COMPONENTS"]).chain(r=>en.map(t=>new gt(r,t))),on=nn.wrap(d,d).repeat();function H(){return a.choice(Hr,Yr,Xr,a.lazy(()=>Xe()),Ke,kr,je,qe)}function sn(){return a.choice(Hr,Yr,Xr,H().skip(Ve))}function an(){return rn().repeat().chain(r=>on.chain(t=>Wr.wrap(d,d).map(e=>new xt(r,t,new v(e)))))}function jr(r){return Ir(an(),r)}var y=class{constructor(){}};var E=class extends y{constructor(e){super();this.actions=e}transform(e){return e(this)}};var l=class extends y{constructor(e){super();this.exprs=e}transform(e){return e(new l(this.exprs.map(n=>n.transform(e))))}};function K(r){return r instanceof l&&r.exprs.every(t=>K(t))}function et(r){if(r instanceof E)return r;if(r instanceof l&&r.exprs.length===1){let t=r.exprs[0];return et(t)}}var D=class extends y{constructor(e,n,o){super();this.cond=e;this.thenBody=n;this.elseBody=o}transform(e){return e(new D(this.cond.transform(e),this.thenBody.transform(e),this.elseBody.transform(e)))}};var z=class extends y{constructor(e){super();this.body=e;this.kind="loop"}transform(e){return e(new z(this.body.transform(e)))}};var U=class extends y{constructor(e,n,o){super();this.modifier=e;this.cond=n;this.body=o}transform(e){return e(new U(this.modifier,this.cond.transform(e),this.body.transform(e)))}};var X=class extends y{constructor(e,n){super();this.level=e;this.span=n;this.kind="break"}transform(e){return e(this)}};var s=class{static incU(t){return s.nonReturn(`INC U${t}`)}static incUMulti(...t){return new E([...t.map(e=>`INC U${e}`),"NOP"])}static tdecU(t){return s.single(`TDEC U${t}`)}static addA1(){return s.nonReturn("ADD A1")}static addB0(){return s.single("ADD B0")}static addB1(){return s.single("ADD B1")}static incB2DX(){return s.nonReturn("INC B2DX")}static tdecB2DX(){return s.single("TDEC B2DX")}static incB2DY(){return s.nonReturn("INC B2DY")}static tdecB2DY(){return s.single("TDEC B2DY")}static readB2D(){return s.single("READ B2D")}static setB2D(){return s.nonReturn("SET B2D")}static incB(t){return s.nonReturn(`INC B${t}`)}static tdecB(t){return s.single(`TDEC B${t}`)}static readB(t){return s.single(`READ B${t}`)}static setB(t){return s.nonReturn(`SET B${t}`)}static haltOUT(){return s.single("HALT_OUT")}static mul0(){return s.single("MUL 0")}static mul1(){return s.single("MUL 1")}static nop(){return s.single("NOP")}static output(t){return s.nonReturn(`OUTPUT ${t}`)}static subA1(){return s.nonReturn("SUB A1")}static subB0(){return s.single("SUB B0")}static subB1(){return s.single("SUB B1")}static nonReturn(t){return new E([t,"NOP"])}static single(t){return new E([t])}};function cn(r,t){if(r.args.length!==0)throw new p(`"${r.name}" expects empty argments${g(r.span?.start)}`,r.span);return t}function qr(r,t){if(r.args.length!==1)throw new p(`number of arguments is not 1: "${r.name}"${g(r.span?.start)}`,r.span);let e=r.args[0];if(!(e instanceof C))throw new p(`argument is not a number: "${r.name}"${g(r.span?.start)}`,r.span);return t(e.value)}function un(r,t){if(r.args.length!==1)throw new p(`number of arguments is not 1: "${r.name}"${g(r.span?.start)}`,r.span);let e=r.args[0];if(!(e instanceof V))throw new p(`argument is not a string: "${r.name}"${g(r.span?.start)}`,r.span);return t(e.value)}var Kr=new Map([["nop",s.nop()],["inc_b2dx",s.incB2DX()],["inc_b2dy",s.incB2DY()],["tdec_b2dx",s.tdecB2DX()],["tdec_b2dy",s.tdecB2DY()],["read_b2d",s.readB2D()],["set_b2d",s.setB2D()],["add_a1",s.addA1()],["add_b0",s.addB0()],["add_b1",s.addB1()],["sub_a1",s.subA1()],["sub_b0",s.subB0()],["sub_b1",s.subB1()],["mul_0",s.mul0()],["mul_1",s.mul1()],["halt_out",s.haltOUT()]]),Jr=new Map([["inc_u",s.incU],["tdec_u",s.tdecU],["inc_b",s.incB],["tdec_b",s.tdecB],["read_b",s.readB],["set_b",s.setB]]),Qr=new Map([["output",s.output]]);function pn(r){let t=Kr.get(r.name);if(t!==void 0)return cn(r,t);let e=Jr.get(r.name);if(e!==void 0)return qr(r,e);let n=Qr.get(r.name);if(n!==void 0)return un(r,n);switch(r.name){case"break":return r.args.length===0?new X(void 0,r.span):qr(r,o=>new X(o,r.span));case"repeat":{if(r.args.length!==2)throw new p(`"repeat" takes two arguments${g(r.span?.start)}`,r.span);let o=r.args[0];if(!(o instanceof C))throw new p(`first argument of "repeat" must be a number${g(r.span?.start)}`,r.span);let i=r.args[1];if(i===void 0)throw new Error("internal error");let c=_t(i);return new l(Array(o.value).fill(0).map(()=>c))}}throw new p(`Unknown ${r.name.endsWith("!")?"macro":"function"}: "${r.name}"${g(r.span?.start)}`,r.span)}function _t(r){let t=_t;if(r instanceof M)return pn(r);if(r instanceof L)return r.modifier==="Z"?new D(t(r.cond),t(r.thenBody),r.elseBody===void 0?new l([]):t(r.elseBody)):new D(t(r.cond),r.elseBody===void 0?new l([]):t(r.elseBody),t(r.thenBody));if(r instanceof B)return new z(t(r.body));if(r instanceof C)throw new p(`number is not allowed: ${r.raw??r.value}${g(r.span?.start)}`,r.span);if(r instanceof v)return new l(r.exprs.map(e=>t(e)));if(r instanceof V)throw new p(`string is not allowed: ${r.pretty()}${g(r.span?.start)}`,r.span);if(r instanceof T)return new U(r.modifier,t(r.cond),t(r.body));throw r instanceof Z?new p(`macro variable is not allowed: variable "${r.name}"${g(r.span?.start)}`,r.span):Error("internal error")}function fn(r){let t="",e=!1,n=0;for(;n<r.length;){let o=r[n],i=r[n+1];o==="/"&&i==="*"?(n+=2,e=!0):o==="*"&&i==="/"?(e=!1,n+=2):(e||(t+=o),n++)}return t}function mn(r){let t=[],e=/(macro\s+([a-zA-Z_][a-zA-Z_0-9]*?!)\s*\(.*?\))/gs,n=fn(r).matchAll(e);for(let o of n){let i=pr().parse(o[0]);i.type==="ParseOK"&&t.push({name:i.value.name,args:i.value.args.map(c=>c.name)})}return t}function te(r){return r.transform(ln)}function ln(r){return r instanceof l?dn(r):r}function re(r,t){let e=ee(fr(r),fr(t));return e===void 0?void 0:ne(e)}function ee(r,t){if(r.length===0)return t.slice();if(t.length===0)return r.slice();if(r.some(u=>u instanceof x)||t.some(u=>u instanceof x))return;let e=r.filter(u=>!(u instanceof b)),n=t.filter(u=>!(u instanceof b)),o=e.every(u=>!u.doesReturnValue()),i=n.every(u=>!u.doesReturnValue());if(!o&&!i||!e.every(u=>n.every(S=>!u.isSameComponent(S))))return;let f=e.concat(n);return o&&i&&f.push(new b),f}function fr(r){return r.actions.flatMap(t=>{let e=rt(t);return e!==void 0?[e]:[]})}function ne(r){return new E(r.map(t=>t.pretty()))}function dn(r){let t=[],e=[],n=()=>{e.length!==0&&(t.push(ne(e)),e=[])};for(let o of r.exprs)if(o instanceof E){let i=fr(o),c=ee(e,i);c===void 0?(n(),e=i):e=c}else n(),t.push(o);return n(),new l(t)}var w=class{constructor(t,e,n){this.input=t;this.output=e;this.inputZNZ=n}};function hn(r){let t=r.prevOutput,e=t;return(t==="*"||t==="Z")&&(e=" "+t),`${r.currentState}; ${e}; ${r.nextState}; ${r.actions.join(", ")}`}var $=class{constructor(t){this.inner=t;if(this.inner.actions.length===0)throw Error("actions must be nonempty")}},mr=class{#o=0;#e=[];#n;#i;constructor(t={}){this.#n=t.prefix??"STATE_",this.#i=!(t.noOptimize??!1)}#r(){return this.#o++,`${this.#n}${this.#o}`}#s(t,e,n="*"){return new $({currentState:t,prevOutput:n,nextState:e,actions:["NOP"]})}transpile(t){let e="INITIAL",n=this.#r()+"_INITIAL",o=this.#s(e,n,"ZZ"),i=this.#n+"END",c=this.#t(new w(n,i,"*"),t),f=new $({currentState:i,prevOutput:"*",nextState:i,actions:["HALT_OUT"]});return[o,...c,f].map(u=>hn(u.inner))}#t(t,e){if(e instanceof E)return[this.#c(t,e)];if(e instanceof l)return this.#p(t,e);if(e instanceof D)return this.#f(t,e);if(e instanceof z)return this.#m(t,e);if(e instanceof U)return this.#d(t,e);if(e instanceof X)return this.#h(t,e);throw Error("unknown expr")}#c(t,e){return new $({currentState:t.input,prevOutput:t.inputZNZ,nextState:t.output,actions:e.actions})}#p(t,e){if(K(e))return[this.#s(t.input,t.output,t.inputZNZ)];if(e.exprs.length===1){let c=e.exprs[0];if(c===void 0)throw new Error("internal error");return this.#t(t,c)}let n=[],o=t.input,i=e.exprs.length-1;for(let[c,f]of e.exprs.entries())if(c!==i){let u=this.#r();n=n.concat(this.#t(new w(o,u,c===0?t.inputZNZ:"*"),f)),o=u}else n=n.concat(this.#t(new w(o,t.output,"*"),f));return n}#f(t,e){if(this.#i&&K(e.thenBody)&&K(e.elseBody))return this.#t(t,e.cond);let n=this.#r(),o=this.#t(new w(t.input,n,t.inputZNZ),e.cond),[i,...c]=this.#t(new w(n,t.output,"Z"),e.thenBody),[f,...u]=this.#t(new w(n,t.output,"NZ"),e.elseBody);return[...o,i,f,...c,...u]}#m(t,e){let{startState:n,fromZOrNZ:o}=this.#a(t);this.#e.push(t.output);let i=this.#t(new w(n,n,"*"),e.body);return this.#e.pop(),[...o,...i]}#u(t,e,n,o){let{startState:i,fromZOrNZ:c}=this.#a(t),f=this.#r(),u=this.#c(new w(i,f,"*"),e),S=new $({currentState:f,prevOutput:"Z",nextState:o==="Z"?f:t.output,actions:o==="Z"?n.actions:["NOP"]}),R=new $({currentState:f,prevOutput:"NZ",nextState:o==="Z"?t.output:f,actions:o==="Z"?["NOP"]:n.actions});return[...c,u,S,R]}#l(t,e,n){let{startState:o,fromZOrNZ:i}=this.#a(t),c=this.#r(),f=this.#t(new w(o,c,"*"),e),u=new $({currentState:c,prevOutput:"Z",nextState:n==="Z"?o:t.output,actions:["NOP"]}),S=new $({currentState:c,prevOutput:"NZ",nextState:n==="Z"?t.output:o,actions:["NOP"]});return[...i,...f,u,S]}#d(t,e){let n=this.#i;if(n&&K(e.body)){let J=et(e.cond);return J!==void 0?this.#u(t,J,J,e.modifier):this.#l(t,e.cond,e.modifier)}let o=et(e.body),i=et(e.cond);if(n&&i!==void 0&&o!==void 0){let J=re(o,i);if(J!==void 0)return this.#u(t,i,J,e.modifier)}let{startState:c,fromZOrNZ:f}=this.#a(t),u=this.#r(),S=this.#t(new w(c,u,"*"),e.cond),R=this.#r()+"_WHILE_BODY",ot=new $({currentState:u,prevOutput:"Z",nextState:e.modifier==="Z"?R:t.output,actions:["NOP"]}),dr=new $({currentState:u,prevOutput:"NZ",nextState:e.modifier==="Z"?t.output:R,actions:["NOP"]});this.#e.push(t.output);let it=this.#t(new w(R,c,"*"),e.body);return this.#e.pop(),[...f,...S,ot,dr,...it]}#a(t){let e=t.inputZNZ==="*"?t.input:this.#r(),n=t.inputZNZ==="*"?[]:[this.#s(t.input,e,t.inputZNZ)];return{startState:e,fromZOrNZ:n}}#h(t,e){let n=e.level??1;if(n<1)throw new p("break level is less than 1",e.span);let o=this.#e[this.#e.length-n];if(o===void 0)throw n===1?new p("break outside while or loop",e.span):new p("break level is greater than number of nests of while or loop",e.span);return[this.#s(t.input,o,t.inputZNZ)]}};function lr(r,t={}){return new mr(t).transpile(r)}function oe(r){let t=new Set,e=[];for(let n of r)t.has(n)?e.push(n):t.add(n);return e}function ie(r){return`${r} argument${r===1?"":"s"}`}function xn(){throw new Error("internal error")}function gn(r,t){let e=t.args;if(e.length!==r.args.length)throw new p(`Error at "${r.name}": this macro takes ${ie(r.args.length)} but ${ie(e.length)} was supplied`+ +`${g(t.span?.start)}`,t.span);let n=new Map(r.args.map((o,i)=>[o.name,e[i]??xn()]));return r.body.transform(o=>{if(o instanceof Z){let i=n.get(o.name);if(i===void 0)throw new p(`scope error: Unknown variable "${o.name}"${g(o.span?.start)}`,o.span);return i}else return o})}var An=1e5,At=class{constructor(t,e){this.#e=0;this.main=t,this.#o=e}#o;#e;static make(t){let e=new Map(t.macros.map(n=>[n.name,n]));if(e.size<t.macros.length){let o=oe(t.macros.map(f=>f.name))[0],i=t.macros.slice().reverse().find(f=>f.name===o)?.span,c=i?.start;throw new p(`There is a macro with the same name: "${o}"`+g(c),i)}return new At(t,e)}expand(){return this.#n(this.main.seqExpr)}#n(t){if(An<this.#e)throw Error("too many macro expansion");return this.#e++,t.transform(e=>this.#i(e))}#i(t){return t instanceof M?this.#r(t):t}#r(t){let e=this.#o.get(t.name);if(e!==void 0){let n=gn(e,t);return this.#n(n)}else return t}};function se(r){return At.make(r).expand()}function ae(r){return r.transform(bn)}function bn(r){return r instanceof l?yn(r):r}function yn(r){let t=[];for(let e of r.exprs)e instanceof l?t=t.concat(e.exprs):t.push(e);return new l(t)}function nt(r=void 0,t,...e){r&&console.log(r+" Start",performance.now());let n=t(...e);return r&&console.log(r+" End",performance.now()),n}function En(r,{log:t,noOptimize:e}){if(e===!0)return r;let n=nt(t?"optimize apgl seq":void 0,ae,r);return nt(t?"optimize apgl action":void 0,te,n)}function rp(r,t={}){let e=t.log??!1,n=nt(e?"apgm parse":void 0,jr,r);try{let o=nt(e?"apgm macro expaned":void 0,se,n),i=nt(e?"apgm to apgl":void 0,_t,o),c=En(i,{log:e,noOptimize:t.noOptimize}),f=nt(e?"apgl to apgsembly":void 0,lr,c,t),u=["# State    Input    Next state    Actions","# ---------------------------------------"];return n.headers.map(R=>R.toString()).concat(u,f)}catch(o){throw o instanceof p&&o.apgmSpan?new p([o.message,...Ot(o.apgmSpan.start,r)].join(`
`),o.apgmSpan,{cause:o.cause}):o}}export{mn as completionParser,Kr as emptyArgFuncs,rp as integration,Jr as numArgFuncs,Qr as strArgFuncs};
