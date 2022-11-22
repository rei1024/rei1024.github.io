var ie=Object.defineProperty;var se=(e,t)=>{for(var r in t)ie(e,r,{get:t[r],enumerable:!0})};var u={};se(u,{Parser:()=>g,all:()=>hr,choice:()=>pe,default:()=>xr,eof:()=>dr,fail:()=>ae,lazy:()=>fe,location:()=>_t,match:()=>ce,ok:()=>nt,text:()=>ue});var g=class{constructor(t){this.action=t}parse(t){let r={index:0,line:1,column:1},n=new ot({input:t,location:r}),o=this.skip(dr).action(n);return o.type==="ActionOK"?{type:"ParseOK",value:o.value}:{type:"ParseFail",location:o.furthest,expected:o.expected}}tryParse(t){let r=this.parse(t);if(r.type==="ParseOK")return r.value;let{expected:n,location:o}=r,{line:i,column:a}=o,p=`parse error at line ${i} column ${a}: expected ${n.join(", ")}`;throw new Error(p)}and(t){return new g(r=>{let n=this.action(r);if(n.type==="ActionFail")return n;r=r.moveTo(n.location);let o=r.merge(n,t.action(r));if(o.type==="ActionOK"){let i=[n.value,o.value];return r.merge(o,r.ok(o.location.index,i))}return o})}skip(t){return this.and(t).map(([r])=>r)}next(t){return this.and(t).map(([,r])=>r)}or(t){return new g(r=>{let n=this.action(r);return n.type==="ActionOK"?n:r.merge(n,t.action(r))})}chain(t){return new g(r=>{let n=this.action(r);if(n.type==="ActionFail")return n;let o=t(n.value);return r=r.moveTo(n.location),r.merge(n,o.action(r))})}map(t){return this.chain(r=>nt(t(r)))}thru(t){return t(this)}desc(t){return new g(r=>{let n=this.action(r);return n.type==="ActionOK"?n:{type:"ActionFail",furthest:n.furthest,expected:t}})}wrap(t,r){return t.next(this).skip(r)}trim(t){return this.wrap(t,t)}repeat(t=0,r=1/0){if(!mr(t,r))throw new Error(`repeat: bad range (${t} to ${r})`);return t===0?this.repeat(1,r).or(nt([])):new g(n=>{let o=[],i=this.action(n);if(i.type==="ActionFail")return i;for(;i.type==="ActionOK"&&o.length<r;){if(o.push(i.value),i.location.index===n.location.index)throw new Error("infinite loop detected; don't call .repeat() with parsers that can accept zero characters");n=n.moveTo(i.location),i=n.merge(i,this.action(n))}return i.type==="ActionFail"&&o.length<t?i:n.merge(i,n.ok(n.location.index,o))})}sepBy(t,r=0,n=1/0){if(!mr(r,n))throw new Error(`sepBy: bad range (${r} to ${n})`);return r===0?this.sepBy(t,1,n).or(nt([])):n===1?this.map(o=>[o]):this.chain(o=>t.next(this).repeat(r-1,n-1).map(i=>[o,...i]))}node(t){return hr(_t,this,_t).map(([r,n,o])=>({type:"ParseNode",name:t,value:n,start:r,end:o}))}};function mr(e,t){return e<=t&&e>=0&&t>=0&&Number.isInteger(e)&&e!==1/0&&(Number.isInteger(t)||t===1/0)}var _t=new g(e=>e.ok(e.location.index,e.location));function nt(e){return new g(t=>t.ok(t.location.index,e))}function ae(e){return new g(t=>t.fail(t.location.index,e))}var dr=new g(e=>e.location.index<e.input.length?e.fail(e.location.index,["<EOF>"]):e.ok(e.location.index,"<EOF>"));function ue(e){return new g(t=>{let r=t.location.index,n=r+e.length;return t.input.slice(r,n)===e?t.ok(n,e):t.fail(r,[e])})}function ce(e){for(let r of e.flags)switch(r){case"i":case"s":case"m":case"u":continue;default:throw new Error("only the regexp flags 'imsu' are supported")}let t=new RegExp(e.source,e.flags+"y");return new g(r=>{let n=r.location.index;t.lastIndex=n;let o=r.input.match(t);if(o){let i=n+o[0].length,a=r.input.slice(n,i);return r.ok(i,a)}return r.fail(n,[String(e)])})}function hr(...e){return e.reduce((t,r)=>t.chain(n=>r.map(o=>[...n,o])),nt([]))}function pe(...e){return e.reduce((t,r)=>t.or(r))}function fe(e){let t=new g(r=>(t.action=e().action,t.action(r)));return t}function le(e,t){return[...new Set([...e,...t])]}var ot=class{constructor(t){this.input=t.input,this.location=t.location}moveTo(t){return new ot({input:this.input,location:t})}_internal_move(t){if(t===this.location.index)return this.location;let r=this.location.index,n=t,o=this.input.slice(r,n),{line:i,column:a}=this.location;for(let p of o)p===`
`?(i++,a=1):a++;return{index:t,line:i,column:a}}ok(t,r){return{type:"ActionOK",value:r,location:this._internal_move(t),furthest:{index:-1,line:-1,column:-1},expected:[]}}fail(t,r){return{type:"ActionFail",furthest:this._internal_move(t),expected:r}}merge(t,r){if(r.furthest.index>t.furthest.index)return r;let n=r.furthest.index===t.furthest.index?le(t.expected,r.expected):t.expected;return r.type==="ActionOK"?{type:"ActionOK",location:r.location,value:r.value,furthest:t.furthest,expected:n}:{type:"ActionFail",furthest:t.furthest,expected:n}}};var xr=null;var l=class{pretty(){return"unimplemented"}extractUnaryRegisterNumbers(){return[]}extractBinaryRegisterNumbers(){return[]}extractLegacyTRegisterNumbers(){return[]}doesReturnValue(){return!1}isSameComponent(t){return!0}};var dt=0,ht=1,xt=2,Ot="A1",Ct="B0",Zt="B1",gr="ADD";function me(e){switch(e){case dt:return Ot;case ht:return Ct;case xt:return Zt}}function de(e){switch(e){case Ot:return dt;case Ct:return ht;case Zt:return xt}}var D=class extends l{constructor(t){super(),this.op=t}pretty(){return`${gr} ${me(this.op)}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===gr&&(o===Ot||o===Ct||o===Zt))return new D(de(o))}doesReturnValue(){switch(this.op){case dt:return!1;case ht:return!0;case xt:return!0}}isSameComponent(t){return t instanceof D}};var Q=0,tt=1,it=2,st=3,X=4,q=5,at=6,gt="INC",zt="TDEC",At="READ",bt="SET",Ut="B2DX",kt="B2DY",Ft="B2D",he="DEC",Ar="SQX",br="SQY",Er="SQ";function yr(e){switch(e){case gt:return Q;case zt:return tt;case At:return it;case bt:return st}}function xe(e){switch(e){case Q:return gt;case tt:return zt;case it:return At;case st:return bt}}function Sr(e){switch(e){case Ut:return X;case kt:return q;case Ft:return at}}function ge(e){switch(e){case X:return Ut;case q:return kt;case at:return Ft}}var A=class extends l{constructor(t,r){super(),this.op=t,this.axis=r}pretty(){return`${xe(this.op)} ${ge(this.axis)}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)){if(n===gt||n===zt){if(o===Ut||o===kt)return new A(yr(n),Sr(o))}else if((n===At||n===bt)&&o===Ft)return new A(yr(n),Sr(o));switch(n){case gt:switch(o){case Ar:return new A(Q,X);case br:return new A(Q,q);default:return}case he:switch(o){case Ar:return new A(tt,X);case br:return new A(tt,q);default:return}case At:switch(o){case Er:return new A(it,at);default:return}case bt:switch(o){case Er:return new A(st,at);default:return}}}}doesReturnValue(){switch(this.op){case Q:return!1;case tt:return!0;case it:return!0;case st:return!1}}isSameComponent(t){return t instanceof A?this.axis===X&&t.axis===q?!1:!(this.axis===q&&t.axis===X):!1}};var Et=0,yt=1,St=2,wt=3,Wt="INC",Vt="TDEC",Yt="READ",Ht="SET",wr="B";function Ae(e){switch(e){case Et:return Wt;case yt:return Vt;case St:return Yt;case wt:return Ht}}function be(e){switch(e){case Wt:return Et;case Vt:return yt;case Yt:return St;case Ht:return wt}}var R=class extends l{constructor(t,r){super(),this.op=t,this.regNumber=r,this.registerCache=void 0}extractBinaryRegisterNumbers(){return[this.regNumber]}pretty(){return`${Ae(this.op)} ${wr}${this.regNumber}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)&&(n===Wt||n===Vt||n===Yt||n===Ht)&&o.startsWith(wr)){let i=o.slice(1);if(/^[0-9]+$/u.test(i))return new R(be(n),parseInt(i,10))}}doesReturnValue(){switch(this.op){case Et:return!1;case yt:return!0;case St:return!0;case wt:return!1}}isSameComponent(t){return t instanceof R?this.regNumber===t.regNumber:!1}};var Pr="HALT_OUT",b=class extends l{constructor(){super()}pretty(){return Pr}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==1)return;let[n]=r;if(n===Pr)return new b}doesReturnValue(){return!1}isSameComponent(t){return t instanceof b}};var jt=0,Xt=1,qt="0",Kt="1",Gr="MUL";function Ee(e){switch(e){case qt:return jt;case Kt:return Xt}}function ye(e){switch(e){case jt:return qt;case Xt:return Kt}}var U=class extends l{constructor(t){super(),this.op=t}pretty(){return`${Gr} ${ye(this.op)}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===Gr&&(o===qt||o===Kt))return new U(Ee(o))}doesReturnValue(){return!0}isSameComponent(t){return t instanceof U}};var S=class extends l{constructor(){super()}pretty(){return"NOP"}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==1)return;let[n]=r;if(n==="NOP")return new S}doesReturnValue(){return!0}isSameComponent(t){return t instanceof S}};var Nr="OUTPUT",k=class extends l{constructor(t){super(),this.digit=t}pretty(){return`${Nr} ${this.digit}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===Nr&&o!==void 0)return new k(o)}doesReturnValue(){return!1}isSameComponent(t){return t instanceof k}};var Pt=0,Gt=1,Nt=2,Jt="A1",Qt="B0",tr="B1",Mr="SUB";function Se(e){switch(e){case Pt:return Jt;case Gt:return Qt;case Nt:return tr}}function we(e){switch(e){case Jt:return Pt;case Qt:return Gt;case tr:return Nt}}var F=class extends l{constructor(t){super(),this.op=t}pretty(){return`${Mr} ${Se(this.op)}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===Mr&&(o===Jt||o===Qt||o===tr))return new F(we(o))}doesReturnValue(){switch(this.op){case Pt:return!1;case Gt:return!0;case Nt:return!0}}isSameComponent(t){return t instanceof F}};var Mt=0,Lt=1,rr="INC",er="TDEC",Lr="U",Pe="R";function Ge(e){switch(e){case Mt:return rr;case Lt:return er}}function Ne(e){switch(e){case rr:return Mt;case er:return Lt}}var T=class extends l{constructor(t,r){super(),this.op=t,this.regNumber=r,this.registerCache=void 0}extractUnaryRegisterNumbers(){return[this.regNumber]}pretty(){return`${Ge(this.op)} ${Lr}${this.regNumber}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)&&(n===rr||n===er)&&(o.startsWith(Lr)||o.startsWith(Pe))){let i=o.slice(1);if(/^[0-9]+$/u.test(i))return new T(Ne(n),parseInt(i,10))}}doesReturnValue(){switch(this.op){case Mt:return!1;case Lt:return!0}}isSameComponent(t){return t instanceof T?this.regNumber===t.regNumber:!1}};var Bt=0,Rt=1,Tt=2,$t=3,vt=4,nr="INC",or="DEC",ir="READ",sr="SET",ar="RESET";function Me(e){switch(e){case Bt:return nr;case Rt:return or;case Tt:return ir;case $t:return sr;case vt:return ar}}function Le(e){switch(e){case nr:return Bt;case or:return Rt;case ir:return Tt;case sr:return $t;case ar:return vt}}var W=class extends l{constructor(t,r){super(),this.op=t,this.regNumber=r}extractLegacyTRegisterNumbers(){return[this.regNumber]}pretty(){return`${Me(this.op)} T${this.regNumber}`}static parse(t){let r=t.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)&&(n===nr||n===or||n===ir||n===sr||n===ar)&&o.startsWith("T")){let i=o.slice(1);if(/^[0-9]+$/u.test(i))return new W(Le(n),parseInt(i,10))}}doesReturnValue(){switch(this.op){case Bt:return!0;case Rt:return!0;case Tt:return!0;case $t:return!1;case vt:return!1}}isSameComponent(t){return t instanceof W?this.regNumber===t.regNumber:!1}};function ut(e){let t=[R.parse,T.parse,A.parse,S.parse,D.parse,U.parse,F.parse,k.parse,b.parse,W.parse];for(let r of t){let n=r(e);if(n!==void 0)return n}}var Te=u.match(/[0-9]+/).desc(["number"]).map(e=>({raw:e,value:parseInt(e,10)})),$e=u.match(/0x[a-fA-F0-9]+/).desc(["hexadecimal number"]).map(e=>({raw:e,value:parseInt(e,16)})),Br=$e.or(Te).desc(["number"]);var h=class{constructor(){}},f=class extends Error{constructor(r,n,o){super(r,o);this.apgmSpan=n}};function Rr(e){return`line ${e.line} column ${e.column}`}function x(e){return e!==void 0?` at ${Rr(e)}`:""}var G=class extends h{constructor(r,n,o){super();this.name=r;this.args=n;this.span=o}transform(r){return r(new G(this.name,this.args.map(n=>n.transform(r)),this.span))}pretty(){return`${this.name}(${this.args.map(r=>r.pretty()).join(", ")})`}};var N=class extends h{constructor(r,n,o,i,a){super();this.modifier=r;this.cond=n;this.thenBody=o;this.elseBody=i;this.span=a}transform(r){return r(new N(this.modifier,this.cond.transform(r),this.thenBody.transform(r),this.elseBody!==void 0?this.elseBody.transform(r):void 0,this.span))}pretty(){let r=`if_${this.modifier==="Z"?"z":"nz"}`,n=this.cond.pretty(),o=this.elseBody===void 0?"":` else ${this.elseBody.pretty()}`;return`${r} (${n}) ${this.thenBody.pretty()}`+o}};var M=class extends h{constructor(r){super();this.body=r}transform(r){return r(new M(this.body.transform(r)))}pretty(){return`loop ${this.body.pretty()}`}};var pt=class{constructor(t,r,n,o){this.name=t;this.args=r;this.body=n;this.span=o}pretty(){return`macro ${this.name}(${this.args.map(t=>t.pretty()).join(", ")}) ${this.body.pretty()}`}};var ft=class{constructor(t,r,n){this.macros=t;this.headers=r;this.seqExpr=n}pretty(){return[this.macros.map(t=>t.pretty()).join(`
`),this.headers.map(t=>t.toString()).join(`
`),this.seqExpr.prettyInner()].join(`
`)}};var lt=class{constructor(t,r){this.name=t;this.content=r}toString(){let t=this.content.startsWith(" ")?"":" ";return`#${this.name}${t}${this.content}`}};var _=class extends h{constructor(r,n,o){super();this.value=r;this.span=n;this.raw=o}transform(r){return r(this)}pretty(){return this.value.toString()}};var V=class extends h{constructor(r,n){super();this.value=r;this.span=n}transform(r){return r(this)}pretty(){return'"'+this.value+'"'}};var $=class extends h{constructor(r){super();this.exprs=r}transform(r){return r(new $(this.exprs.map(n=>n.transform(r))))}pretty(){return`{${this.prettyInner()}}`}prettyInner(){return this.exprs.map(r=>r instanceof N||r instanceof M||r instanceof L?r.pretty():r.pretty()+";").join(`
`)}};var O=class extends h{constructor(r,n){super();this.name=r;this.span=n}transform(r){return r(this)}pretty(){return this.name}};var L=class extends h{constructor(r,n,o){super();this.modifier=r;this.cond=n;this.body=o}transform(r){return r(new L(this.modifier,this.cond.transform(r),this.body.transform(r)))}pretty(){return`while_${this.modifier==="Z"?"z":"nz"}(${this.cond.pretty()}) ${this.body.pretty()}`}};function It(e,t){let r=t.split(/\n|\r\n/),n=r[e.line-2],o=r[e.line-1],i=r[e.line],a=" ".repeat(Math.max(0,e.column-1))+"^",p=[...n===void 0?[]:[n],o],c=[...i===void 0?[]:[i]],P="| ";return[...p.map(et=>P+et)," ".repeat(P.length)+a,...c.map(et=>P+et)]}function ve(e,t){let r=It(e.location,t);return[`parse error at line ${e.location.line} column ${e.location.column}:`,`  expected ${e.expected.join(", ")}`,"",...r].join(`
`)}function Tr(e,t){let r=e.parse(t);if(r.type==="ParseOK")return r.value;throw new f(ve(r,t),{start:r.location,end:r.location})}function Y(e,t){return{start:e,end:{index:e.index+t.length-1,line:e.line,column:e.column+t.length}}}var $r=u.location.chain(e=>u.text('"').next(u.match(/[^"]*/)).skip(u.text('"')).desc(["string"]).map(t=>({value:t,span:Y(e,`"${t}"`)})));var Ie=u.match(/\/\*(\*(?!\/)|[^*])*\*\//s).desc([]),d=u.match(/\s*/).desc(["space"]).sepBy(Ie).map(()=>{}),De=u.match(/\s+/).desc(["space"]),_e=/[a-zA-Z_][a-zA-Z_0-9]*/u,Ir=u.match(_e).desc(["identifier"]),Oe=Ir.wrap(d,d),Ce=d.chain(()=>u.location.chain(e=>Ir.skip(d).map(t=>[t,Y(e,t)]))),Ze=/[a-zA-Z_][a-zA-Z_0-9]*!/u,Dr=u.match(Ze).wrap(d,d).desc(["macro name"]);function v(e){return u.text(e).wrap(d,d)}function vr(e){return u.location.chain(r=>u.text(e).map(n=>[n,Y(r,e)])).wrap(d,d)}var ze=v(",").desc(["`,`"]),_r=v("(").desc(["`(`"]),Or=v(")").desc(["`)`"]),Ue=v(";").desc(["`;`"]),ke=v("{").desc(["`{`"]),Fe=v("}").desc(["`}`"]),Cr=Ce.map(([e,t])=>new O(e,t));function Zr(e){return u.lazy(()=>e()).sepBy(ze).wrap(_r,Or)}function We(){return d.next(u.location).chain(e=>u.choice(Dr,Oe).chain(t=>Zr(()=>H()).map(r=>new G(t,r,Y(e,t)))))}var Ve=u.location.chain(e=>Br.map(t=>new _(t.value,Y(e,t.raw),t.raw))).wrap(d,d),Ye=$r.wrap(d,d).map(e=>new V(e.value,e.span));function zr(){return u.lazy(()=>rn()).repeat()}function He(){return zr().wrap(ke,Fe).map(e=>new $(e))}var je=u.choice(v("while_z"),v("while_nz")).map(e=>e==="while_z"?"Z":"NZ"),Ur=u.lazy(()=>H()).wrap(_r,Or);function kr(){return je.chain(e=>Ur.chain(t=>u.lazy(()=>H()).map(r=>new L(e,t,r))))}function Fr(){return v("loop").next(u.lazy(()=>H())).map(e=>new M(e))}var Xe=u.choice(vr("if_z"),vr("if_nz")).map(e=>e[0]==="if_z"?["Z",e[1]]:["NZ",e[1]]);function Wr(){return Xe.chain(([e,t])=>Ur.chain(r=>u.lazy(()=>H()).chain(n=>u.choice(v("else").next(u.lazy(()=>H())),u.ok(void 0)).map(o=>new N(e,r,n,o,t)))))}function ur(){let e="macro";return d.chain(r=>u.location.chain(n=>u.text(e).next(De).map(o=>Y(n,e)))).and(Dr).chain(([r,n])=>Zr(()=>Cr).map(o=>({span:r,name:n,args:o})))}function qe(){return ur().chain(({span:e,name:t,args:r})=>u.lazy(()=>H()).map(n=>new pt(t,r,n,e)))}var Ke=u.match(/.*/),Je=u.text("#").next(u.match(/REGISTERS|COMPONENTS/)).desc(["#REGISTERS","#COMPONENTS"]).chain(e=>Ke.map(t=>new lt(e,t))),Qe=Je.wrap(d,d).repeat();function tn(){return qe().repeat().chain(e=>Qe.chain(t=>zr().wrap(d,d).map(r=>new ft(e,t,new $(r)))))}function Vr(e){return Tr(tn(),e)}function H(){return u.choice(Fr(),kr(),Wr(),We(),He(),Cr,Ve,Ye)}function rn(){return u.choice(Fr(),kr(),Wr(),H().skip(Ue))}var E=class{constructor(){}};var y=class extends E{constructor(r){super();this.actions=r}transform(r){return r(this)}};var m=class extends E{constructor(r){super();this.exprs=r}transform(r){return r(new m(this.exprs.map(n=>n.transform(r))))}};function K(e){return e instanceof m&&e.exprs.every(t=>K(t))}function rt(e){if(e instanceof y)return e;if(e instanceof m&&e.exprs.length===1){let t=e.exprs[0];return rt(t)}}var I=class extends E{constructor(r,n,o){super();this.cond=r;this.thenBody=n;this.elseBody=o}transform(r){return r(new I(this.cond.transform(r),this.thenBody.transform(r),this.elseBody.transform(r)))}};var C=class extends E{constructor(r){super();this.body=r;this.kind="loop"}transform(r){return r(new C(this.body.transform(r)))}};var Z=class extends E{constructor(r,n,o){super();this.modifier=r;this.cond=n;this.body=o}transform(r){return r(new Z(this.modifier,this.cond.transform(r),this.body.transform(r)))}};var j=class extends E{constructor(r,n){super();this.level=r;this.span=n;this.kind="break"}transform(r){return r(this)}};var s=class{static incU(t){return s.nonReturn(`INC U${t}`)}static incUMulti(...t){return new y([...t.map(r=>`INC U${r}`),"NOP"])}static tdecU(t){return s.single(`TDEC U${t}`)}static addA1(){return s.nonReturn("ADD A1")}static addB0(){return s.single("ADD B0")}static addB1(){return s.single("ADD B1")}static incB2DX(){return s.nonReturn("INC B2DX")}static tdecB2DX(){return s.single("TDEC B2DX")}static incB2DY(){return s.nonReturn("INC B2DY")}static tdecB2DY(){return s.single("TDEC B2DY")}static readB2D(){return s.single("READ B2D")}static setB2D(){return s.nonReturn("SET B2D")}static incB(t){return s.nonReturn(`INC B${t}`)}static tdecB(t){return s.single(`TDEC B${t}`)}static readB(t){return s.single(`READ B${t}`)}static setB(t){return s.nonReturn(`SET B${t}`)}static haltOUT(){return s.single("HALT_OUT")}static mul0(){return s.single("MUL 0")}static mul1(){return s.single("MUL 1")}static nop(){return s.single("NOP")}static output(t){return s.nonReturn(`OUTPUT ${t}`)}static subA1(){return s.nonReturn("SUB A1")}static subB0(){return s.single("SUB B0")}static subB1(){return s.single("SUB B1")}static nonReturn(t){return new y([t,"NOP"])}static single(t){return new y([t])}};function en(e,t){if(e.args.length!==0)throw new f(`"${e.name}" expects empty argments${x(e.span?.start)}`,e.span);return t}function Yr(e,t){if(e.args.length!==1)throw new f(`number of arguments is not 1: "${e.name}"${x(e.span?.start)}`,e.span);let r=e.args[0];if(!(r instanceof _))throw new f(`argument is not a number: "${e.name}"${x(e.span?.start)}`,e.span);return t(r.value)}function nn(e,t){if(e.args.length!==1)throw new f(`number of arguments is not 1: "${e.name}"${x(e.span?.start)}`,e.span);let r=e.args[0];if(!(r instanceof V))throw new f(`argument is not a string: "${e.name}"${x(e.span?.start)}`,e.span);return t(r.value)}var Hr=new Map([["nop",s.nop()],["inc_b2dx",s.incB2DX()],["inc_b2dy",s.incB2DY()],["tdec_b2dx",s.tdecB2DX()],["tdec_b2dy",s.tdecB2DY()],["read_b2d",s.readB2D()],["set_b2d",s.setB2D()],["add_a1",s.addA1()],["add_b0",s.addB0()],["add_b1",s.addB1()],["sub_a1",s.subA1()],["sub_b0",s.subB0()],["sub_b1",s.subB1()],["mul_0",s.mul0()],["mul_1",s.mul1()],["halt_out",s.haltOUT()]]),jr=new Map([["inc_u",s.incU],["tdec_u",s.tdecU],["inc_b",s.incB],["tdec_b",s.tdecB],["read_b",s.readB],["set_b",s.setB]]),Xr=new Map([["output",s.output]]);function on(e){let t=Hr.get(e.name);if(t!==void 0)return en(e,t);let r=jr.get(e.name);if(r!==void 0)return Yr(e,r);let n=Xr.get(e.name);if(n!==void 0)return nn(e,n);switch(e.name){case"break":return e.args.length===0?new j(void 0,e.span):Yr(e,o=>new j(o,e.span));case"repeat":{if(e.args.length!==2)throw new f(`"repeat" takes two arguments${x(e.span?.start)}`,e.span);let o=e.args[0];if(!(o instanceof _))throw new f(`first argument of "repeat" must be a number${x(e.span?.start)}`,e.span);let i=e.args[1];if(i===void 0)throw new Error("internal error");let a=Dt(i);return new m(Array(o.value).fill(0).map(()=>a))}}throw new f(`Unknown ${e.name.endsWith("!")?"macro":"function"}: "${e.name}"${x(e.span?.start)}`,e.span)}function Dt(e){let t=Dt;if(e instanceof G)return on(e);if(e instanceof N)return e.modifier==="Z"?new I(t(e.cond),t(e.thenBody),e.elseBody===void 0?new m([]):t(e.elseBody)):new I(t(e.cond),e.elseBody===void 0?new m([]):t(e.elseBody),t(e.thenBody));if(e instanceof M)return new C(t(e.body));if(e instanceof _)throw new f(`number is not allowed: ${e.raw??e.value}${x(e.span?.start)}`,e.span);if(e instanceof $)return new m(e.exprs.map(r=>t(r)));if(e instanceof V)throw new f(`string is not allowed: ${e.pretty()}${x(e.span?.start)}`,e.span);if(e instanceof O)throw new f(`macro variable is not allowed: variable "${e.name}"${x(e.span?.start)}`,e.span);if(e instanceof L)return new Z(e.modifier,t(e.cond),t(e.body));throw Error("internal error")}function sn(e){let t="",r=!1,n=0;for(;n<e.length;){let o=e[n],i=e[n+1];o==="/"&&i==="*"?(n+=2,r=!0):o==="*"&&i==="/"?(r=!1,n+=2):(r||(t+=o),n++)}return t}function an(e){let t=[],r=/(macro\s+([a-zA-Z_][a-zA-Z_0-9]*?!)\s*\(.*?\))/gs,n=sn(e).matchAll(r);for(let o of n){let i=ur().parse(o[0]);i.type==="ParseOK"&&t.push({name:i.value.name,args:i.value.args.map(a=>a.name)})}return t}function qr(e){return e.transform(un)}function un(e){return e instanceof m?cn(e):e}function Kr(e,t){let r=Jr(cr(e),cr(t));return r===void 0?void 0:new y(r.map(n=>n.pretty()))}function Jr(e,t){if(e.length===0)return t.slice();if(t.length===0)return e.slice();if(e.some(c=>c instanceof b)||t.some(c=>c instanceof b))return;let r=e.filter(c=>!(c instanceof S)),n=t.filter(c=>!(c instanceof S)),o=r.every(c=>!c.doesReturnValue()),i=n.every(c=>!c.doesReturnValue());if(!o&&!i||!r.every(c=>n.every(P=>!c.isSameComponent(P))))return;let p=r.concat(n);return o&&i&&p.push(new S),p}function cr(e){return e.actions.flatMap(t=>{let r=ut(t);return r!==void 0?[r]:[]})}function cn(e){let t=[],r=[],n=()=>{r.length!==0&&(t.push(new y(r.map(o=>o.pretty()))),r=[])};for(let o of e.exprs)if(o instanceof y){let i=cr(o),a=Jr(r,i);a===void 0?(n(),r=i):r=a}else n(),t.push(o);return n(),new m(t)}var w=class{constructor(t,r,n){this.input=t;this.output=r;this.inputZNZ=n}},B=class{constructor(t){this.inner=t;if(this.inner.actions.length===0)throw Error("action must be nonempty")}toLineString(){let t=this.inner.prevOutput,r=t;return(t==="*"||t==="Z")&&(r=" "+t),`${this.inner.currentState}; ${r}; ${this.inner.nextState}; ${this.inner.actions.join(", ")}`}},pr=class{constructor(t={}){this.id=0;this.#t=[];this.prefix=t.prefix??"STATE_",this.optimize=!(t.noOptimize??!1)}#t;getFreshName(){return this.id++,`${this.prefix}${this.id}`}emitTransition(t,r,n="*"){return new B({currentState:t,prevOutput:n,nextState:r,actions:["NOP"]})}transpile(t){let r="INITIAL",n=this.getFreshName()+"_INITIAL",o=this.emitTransition(r,n,"ZZ"),i=this.prefix+"END",a=this.transpileExpr(new w(n,i,"*"),t),p=new B({currentState:i,prevOutput:"*",nextState:i,actions:["HALT_OUT"]});return[o,...a,p].map(c=>c.toLineString())}transpileExpr(t,r){if(r instanceof y)return[this.#e(t,r)];if(r instanceof m)return this.#o(t,r);if(r instanceof I)return this.#i(t,r);if(r instanceof C)return this.#s(t,r);if(r instanceof Z)return this.#u(t,r);if(r instanceof j)return this.#c(t,r);throw Error("unknown expr")}#e(t,r){return new B({currentState:t.input,prevOutput:t.inputZNZ,nextState:t.output,actions:r.actions})}#o(t,r){if(K(r))return[this.emitTransition(t.input,t.output,t.inputZNZ)];if(r.exprs.length===1){let a=r.exprs[0];if(a===void 0)throw new Error("internal error");return this.transpileExpr(t,a)}let n=[],o=t.input,i=r.exprs.length-1;for(let[a,p]of r.exprs.entries())if(a===0){let c=this.getFreshName();n=n.concat(this.transpileExpr(new w(o,c,t.inputZNZ),p)),o=c}else if(a===i)n=n.concat(this.transpileExpr(new w(o,t.output,"*"),p));else{let c=this.getFreshName();n=n.concat(this.transpileExpr(new w(o,c,"*"),p)),o=c}return n}#i(t,r){if(this.optimize&&K(r.thenBody)&&K(r.elseBody))return this.transpileExpr(t,r.cond);let n=this.getFreshName(),o=this.transpileExpr(new w(t.input,n,t.inputZNZ),r.cond),[i,...a]=this.transpileExpr(new w(n,t.output,"Z"),r.thenBody),[p,...c]=this.transpileExpr(new w(n,t.output,"NZ"),r.elseBody);return[...o,i,p,...a,...c]}#s(t,r){let{startState:n,fromZOrNZ:o}=this.#r(t);this.#t.push(t.output);let i=this.transpileExpr(new w(n,n,"*"),r.body);return this.#t.pop(),[...o,...i]}#n(t,r,n,o){let{startState:i,fromZOrNZ:a}=this.#r(t),p=this.getFreshName(),c=this.#e(new w(i,p,"*"),r),P=new B({currentState:p,prevOutput:"Z",nextState:o==="Z"?p:t.output,actions:o==="Z"?n.actions:["NOP"]}),z=new B({currentState:p,prevOutput:"NZ",nextState:o==="Z"?t.output:p,actions:o==="Z"?["NOP"]:n.actions});return[...a,c,P,z]}#a(t,r,n){let{startState:o,fromZOrNZ:i}=this.#r(t),a=this.getFreshName(),p=this.transpileExpr(new w(o,a,"*"),r),c=new B({currentState:a,prevOutput:"Z",nextState:n==="Z"?o:t.output,actions:["NOP"]}),P=new B({currentState:a,prevOutput:"NZ",nextState:n==="Z"?t.output:o,actions:["NOP"]});return[...i,...p,c,P]}#u(t,r){let n=this.optimize;if(n&&K(r.body)){let J=rt(r.cond);return J!==void 0?this.#n(t,J,J,r.modifier):this.#a(t,r.cond,r.modifier)}let o=rt(r.body),i=rt(r.cond);if(n&&i!==void 0&&o!==void 0){let J=Kr(o,i);if(J!==void 0)return this.#n(t,i,J,r.modifier)}let{startState:a,fromZOrNZ:p}=this.#r(t),c=this.getFreshName(),P=this.transpileExpr(new w(a,c,"*"),r.cond),z=this.getFreshName()+"_WHILE_BODY",et=new B({currentState:c,prevOutput:"Z",nextState:r.modifier==="Z"?z:t.output,actions:["NOP"]}),ne=new B({currentState:c,prevOutput:"NZ",nextState:r.modifier==="Z"?t.output:z,actions:["NOP"]});this.#t.push(t.output);let oe=this.transpileExpr(new w(z,a,"*"),r.body);return this.#t.pop(),[...p,...P,et,ne,...oe]}#r(t){let r=t.inputZNZ==="*"?t.input:this.getFreshName(),n=t.inputZNZ==="*"?[]:[this.emitTransition(t.input,r,t.inputZNZ)];return{startState:r,fromZOrNZ:n}}#c(t,r){let n=r.level??1;if(n<1)throw new f("break level is less than 1",r.span);let o=this.#t[this.#t.length-n];if(o===void 0)throw n===1?new f("break outside while or loop",r.span):new f("break level is greater than number of nests of while or loop",r.span);return[this.emitTransition(t.input,o,t.inputZNZ)]}};function fr(e,t={}){return new pr(t).transpile(e)}function Qr(e){let t=new Set,r=[];for(let n of e)t.has(n)?r.push(n):t.add(n);return r}function te(e){return`${e} argument${e===1?"":"s"}`}function pn(){throw new Error("internal error")}function fn(e,t){let r=t.args;if(r.length!==e.args.length)throw new f(`argument length mismatch: "${e.name}" expect ${te(e.args.length)} but given ${te(r.length)}${x(t.span?.start)}`,t.span);let n=new Map(e.args.map((o,i)=>[o.name,r[i]??pn()]));return e.body.transform(o=>{if(o instanceof O){let i=n.get(o.name);if(i===void 0)throw new f(`scope error: Unknown variable "${o.name}"${x(o.span?.start)}`,o.span);return i}else return o})}var lr=class{constructor(t){this.count=0;this.maxCount=1e5;if(this.main=t,this.macroMap=new Map(t.macros.map(r=>[r.name,r])),this.macroMap.size<t.macros.length){let n=Qr(t.macros.map(a=>a.name))[0],o=t.macros.slice().reverse().find(a=>a.name===n)?.span,i=o?.start;throw new f(`There is a macro with the same name: "${n}"`+x(i),o)}}expand(){return this.expandExpr(this.main.seqExpr)}expandExpr(t){if(this.maxCount<this.count)throw Error("too many macro expansion");return this.count++,t.transform(r=>this.expandOnce(r))}expandOnce(t){return t instanceof G?this.expandFuncAPGMExpr(t):t}expandFuncAPGMExpr(t){let r=this.macroMap.get(t.name);if(r!==void 0){let n=fn(r,t);return this.expandExpr(n)}else return t}};function re(e){return new lr(e).expand()}function ee(e){return e.transform(ln)}function ln(e){return e instanceof m?mn(e):e}function mn(e){let t=[];for(let r of e.exprs)r instanceof m?t=t.concat(r.exprs):t.push(r);return new m(t)}function mt(e,t,r=void 0){let n=e(t);return r!==void 0&&console.log(r,JSON.stringify(n,null,"  ")),n}function dn(e,{log:t,noOptimize:r}){if(r===!0)return e;let n=mt(ee,e,t?"optimized apgl seq":void 0);return mt(qr,n,t?"optimized apgl action":void 0)}function Qu(e,t={}){let r=t.log??!1,n=mt(Vr,e,r?"apgm":void 0);try{let o=mt(re,n,r?"apgm expaned":void 0),i=mt(Dt,o,r?"apgl":void 0),a=dn(i,{log:r,noOptimize:t.noOptimize}),p=fr(a,t),c=["# State    Input    Next state    Actions","# ---------------------------------------"];return n.headers.map(z=>z.toString()).concat(c,p)}catch(o){throw o instanceof f&&o.apgmSpan?new f([o.message,...It(o.apgmSpan.start,e)].join(`
`),o.apgmSpan,{cause:o.cause}):o}}export{an as completionParser,Hr as emptyArgFuncs,Qu as integration,jr as numArgFuncs,Xr as strArgFuncs};
