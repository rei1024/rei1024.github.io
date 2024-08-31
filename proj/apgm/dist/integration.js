var Sr=Object.defineProperty;var Er=(t,e)=>{for(var r in e)Sr(t,r,{get:e[r],enumerable:!0})};var a={};Er(a,{Parser:()=>_,all:()=>Ne,choice:()=>wr,eof:()=>Me,fail:()=>yr,lazy:()=>Mr,location:()=>Wt,match:()=>Gr,ok:()=>pt,text:()=>Pr});var _=class Q{constructor(e){this.action=e}parse(e){let r={index:0,line:1,column:1},n=new Br({input:e,location:r}),o=this.skip(Me).action(n);return o.type==="ActionOK"?{type:"ParseOK",value:o.value}:{type:"ParseFail",location:o.furthest,expected:o.expected}}tryParse(e){let r=this.parse(e);if(r.type==="ParseOK")return r.value;let{expected:n,location:o}=r,{line:s,column:i}=o,c=`parse error at line ${s} column ${i}: expected ${n.join(", ")}`;throw new Error(c)}and(e){return new Q(r=>{let n=this.action(r);if(n.type==="ActionFail")return n;r=r.moveTo(n.location);let o=r.merge(n,e.action(r));if(o.type==="ActionOK"){let s=[n.value,o.value];return r.merge(o,r.ok(o.location.index,s))}return o})}skip(e){return this.and(e).map(([r])=>r)}next(e){return this.and(e).map(([,r])=>r)}or(e){return new Q(r=>{let n=this.action(r);return n.type==="ActionOK"?n:r.merge(n,e.action(r))})}chain(e){return new Q(r=>{let n=this.action(r);if(n.type==="ActionFail")return n;let o=e(n.value);return r=r.moveTo(n.location),r.merge(n,o.action(r))})}map(e){return this.chain(r=>pt(e(r)))}thru(e){return e(this)}desc(e){return new Q(r=>{let n=this.action(r);return n.type==="ActionOK"?n:{type:"ActionFail",furthest:n.furthest,expected:e}})}wrap(e,r){return e.next(this).skip(r)}trim(e){return this.wrap(e,e)}repeat(e=0,r=1/0){if(!we(e,r))throw new Error(`repeat: bad range (${e} to ${r})`);return e===0?this.repeat(1,r).or(pt([])):new Q(n=>{let o=[],s=this.action(n);if(s.type==="ActionFail")return s;for(;s.type==="ActionOK"&&o.length<r;){if(o.push(s.value),s.location.index===n.location.index)throw new Error("infinite loop detected; don't call .repeat() with parsers that can accept zero characters");n=n.moveTo(s.location),s=n.merge(s,this.action(n))}return s.type==="ActionFail"&&o.length<e?s:n.merge(s,n.ok(n.location.index,o))})}sepBy(e,r=0,n=1/0){if(!we(r,n))throw new Error(`sepBy: bad range (${r} to ${n})`);return r===0?this.sepBy(e,1,n).or(pt([])):n===1?this.map(o=>[o]):this.chain(o=>e.next(this).repeat(r-1,n-1).map(s=>[o,...s]))}node(e){return Ne(Wt,this,Wt).map(([r,n,o])=>({type:"ParseNode",name:e,value:n,start:r,end:o}))}};function we(t,e){return t<=e&&t>=0&&e>=0&&Number.isInteger(t)&&t!==1/0&&(Number.isInteger(e)||e===1/0)}var Wt=new _(t=>t.ok(t.location.index,t.location));function pt(t){return new _(e=>e.ok(e.location.index,t))}function yr(t){return new _(e=>e.fail(e.location.index,t))}var Me=new _(t=>t.location.index<t.input.length?t.fail(t.location.index,["<EOF>"]):t.ok(t.location.index,"<EOF>"));function Pr(t){return new _(e=>{let r=e.location.index,n=r+t.length;return e.input.slice(r,n)===t?e.ok(n,t):e.fail(r,[t])})}function Gr(t){for(let r of t.flags)switch(r){case"i":case"s":case"m":case"u":continue;default:throw new Error("only the regexp flags 'imsu' are supported")}let e=new RegExp(t.source,t.flags+"y");return new _(r=>{let n=r.location.index;e.lastIndex=n;let o=r.input.match(e);if(o){let s=n+o[0].length,i=r.input.slice(n,s);return r.ok(s,i)}return r.fail(n,[String(t)])})}function Ne(...t){return t.reduce((e,r)=>e.chain(n=>r.map(o=>[...n,o])),pt([]))}function wr(...t){return t.reduce((e,r)=>e.or(r))}function Mr(t){let e=new _(r=>(e.action=t().action,e.action(r)));return e}function Nr(t,e){return[...new Set([...t,...e])]}var Br=class Be{constructor(e){this.input=e.input,this.location=e.location}moveTo(e){return new Be({input:this.input,location:e})}_internal_move(e){if(e===this.location.index)return this.location;let r=this.location.index,n=e,o=this.input.slice(r,n),{line:s,column:i}=this.location;for(let c of o)c===`
`?(s++,i=1):i++;return{index:e,line:s,column:i}}ok(e,r){return{type:"ActionOK",value:r,location:this._internal_move(e),furthest:{index:-1,line:-1,column:-1},expected:[]}}fail(e,r){return{type:"ActionFail",furthest:this._internal_move(e),expected:r}}merge(e,r){if(r.furthest.index>e.furthest.index)return r;let n=r.furthest.index===e.furthest.index?Nr(e.expected,r.expected):e.expected;return r.type==="ActionOK"?{type:"ActionOK",location:r.location,value:r.value,furthest:e.furthest,expected:n}:{type:"ActionFail",furthest:e.furthest,expected:n}}};var f=class{pretty(){return""}doesReturnValue(){return!1}isSameComponent(e){return!0}};var Ht="A1",Vt="B0",Yt="B1",Le="ADD",Lr=t=>{switch(t){case 0:return Ht;case 1:return Vt;case 2:return Yt}},Tr=t=>{switch(t){case Ht:return 0;case Vt:return 1;case Yt:return 2}},tt=class t extends f{constructor(e){super(),this.op=e}pretty(){return`${Le} ${Lr(this.op)}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===Le&&(o===Ht||o===Vt||o===Yt))return new t(Tr(o))}doesReturnValue(){switch(this.op){case 0:return!1;case 1:return!0;case 2:return!0}}isSameComponent(e){return e instanceof t}};var Bt="INC",Xt="TDEC",Lt="READ",Tt="SET",jt="B2DX",qt="B2DY",Kt="B2D",$r="DEC",Te="SQX",$e="SQY",Re="SQ",ve=t=>{switch(t){case Bt:return 0;case Xt:return 1;case Lt:return 2;case Tt:return 3}},Rr=t=>{switch(t){case 0:return Bt;case 1:return Xt;case 2:return Lt;case 3:return Tt}},De=t=>{switch(t){case jt:return 4;case qt:return 5;case Kt:return 6}},vr=t=>{switch(t){case 4:return jt;case 5:return qt;case 6:return Kt}},dt=class t extends f{constructor(e,r){super(),this.op=e,this.axis=r}pretty(){return`${Rr(this.op)} ${vr(this.axis)}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)){if(n===Bt||n===Xt){if(o===jt||o===qt)return new t(ve(n),De(o))}else if((n===Lt||n===Tt)&&o===Kt)return new t(ve(n),De(o));switch(n){case Bt:switch(o){case Te:return new t(0,4);case $e:return new t(0,5);default:return}case $r:switch(o){case Te:return new t(1,4);case $e:return new t(1,5);default:return}case Lt:switch(o){case Re:return new t(2,6);default:return}case Tt:switch(o){case Re:return new t(3,6);default:return}}}}doesReturnValue(){switch(this.op){case 0:return!1;case 1:return!0;case 2:return!0;case 3:return!1}}isSameComponent(e){if(e instanceof t){let r=this.axis,n=e.axis;return r===4&&n===5?!1:!(r===5&&n===4)}return!1}};var Jt="INC",Qt="TDEC",te="READ",ee="SET",Ie="B",Dr=t=>{switch(t){case 0:return Jt;case 1:return Qt;case 2:return te;case 3:return ee}},Ir=t=>{switch(t){case Jt:return 0;case Qt:return 1;case te:return 2;case ee:return 3}},O=class t extends f{constructor(e,r){super(),this.op=e,this.regNumber=r,this.registerCache=void 0}pretty(){return`${Dr(this.op)} ${Ie}${this.regNumber}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)&&(n===Jt||n===Qt||n===te||n===ee)&&o.startsWith(Ie)){let s=o.slice(1);if(/^[0-9]+$/u.test(s))return new t(Ir(n),parseInt(s,10))}}doesReturnValue(){switch(this.op){case 0:return!1;case 1:return!0;case 2:return!0;case 3:return!1}}isSameComponent(e){return e instanceof t?this.regNumber===e.regNumber:!1}};var _e="HALT_OUT",S=class t extends f{constructor(){super()}pretty(){return _e}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==1)return;let[n]=r;if(n===_e)return new t}doesReturnValue(){return!1}isSameComponent(e){return e instanceof t}};var oe="0",se="1",Oe="MUL",_r=t=>{switch(t){case oe:return 0;case se:return 1}},Or=t=>{switch(t){case 0:return oe;case 1:return se}},xt=class t extends f{constructor(e){super(),this.op=e}pretty(){return`${Oe} ${Or(this.op)}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===Oe&&(o===oe||o===se))return new t(_r(o))}doesReturnValue(){return!0}isSameComponent(e){return e instanceof t}};var Ce="NOP",G=class t extends f{constructor(){super()}pretty(){return Ce}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==1)return;let[n]=r;if(n===Ce)return new t}doesReturnValue(){return!0}isSameComponent(e){return e instanceof t}};var Ze="OUTPUT",At=class t extends f{constructor(e){super(),this.digit=e}pretty(){return`${Ze} ${this.digit}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===Ze&&o!==void 0)return new t(o)}doesReturnValue(){return!1}isSameComponent(e){return e instanceof t}};var ie="A1",ae="B0",ce="B1",ze="SUB",Cr=t=>{switch(t){case 0:return ie;case 1:return ae;case 2:return ce}},Zr=t=>{switch(t){case ie:return 0;case ae:return 1;case ce:return 2}},gt=class t extends f{constructor(e){super(),this.op=e}pretty(){return`${ze} ${Cr(this.op)}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(n===ze&&(o===ie||o===ae||o===ce))return new t(Zr(o))}doesReturnValue(){switch(this.op){case 0:return!1;case 1:return!0;case 2:return!0}}isSameComponent(e){return e instanceof t}};var pe="INC",ue="TDEC",Ue="U",zr="R",Ur=t=>{switch(t){case 0:return pe;case 1:return ue}},kr=t=>{switch(t){case pe:return 0;case ue:return 1}},C=class t extends f{constructor(e,r){super(),this.op=e,this.regNumber=r,this.registerCache=void 0}pretty(){return`${Ur(this.op)} ${Ue}${this.regNumber}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)&&(n===pe||n===ue)&&(o.startsWith(Ue)||o.startsWith(zr))){let s=o.slice(1);if(/^[0-9]+$/u.test(s))return new t(kr(n),parseInt(s,10))}}doesReturnValue(){switch(this.op){case 0:return!1;case 1:return!0}}isSameComponent(e){return e instanceof t?this.regNumber===e.regNumber:!1}};var me="INC",fe="DEC",de="READ",le="SET",he="RESET",Fr=t=>{switch(t){case 0:return me;case 1:return fe;case 2:return de;case 3:return le;case 4:return he}},Wr=t=>{switch(t){case me:return 0;case fe:return 1;case de:return 2;case le:return 3;case he:return 4}},nt=class t extends f{constructor(e,r){super(),this.op=e,this.regNumber=r}pretty(){return`${Fr(this.op)} T${this.regNumber}`}static parse(e){let r=e.trim().split(/\s+/u);if(r.length!==2)return;let[n,o]=r;if(!(n===void 0||o===void 0)&&(n===me||n===fe||n===de||n===le||n===he)&&o.startsWith("T")){let s=o.slice(1);if(/^[0-9]+$/u.test(s))return new t(Wr(n),parseInt(s,10))}}doesReturnValue(){switch(this.op){case 0:return!0;case 1:return!0;case 2:return!0;case 3:return!1;case 4:return!1}}isSameComponent(e){return e instanceof t?this.regNumber===e.regNumber:!1}};var Y=t=>{let e=[O.parse,C.parse,dt.parse,G.parse,tt.parse,xt.parse,gt.parse,At.parse,S.parse,nt.parse];for(let r of e){let n=r(t);if(n!==void 0)return n}};var E=()=>{throw Error("internal error")};var X=class{pretty(){return""}},ot=class t extends X{constructor(e){super(),this.content=e}static get key(){return"#COMPONENTS"}pretty(){return t.key+" "+this.content}},st=class t extends X{constructor(e){super(),this.content=e}static get key(){return"#REGISTERS"}pretty(){return t.key+" "+this.content}},xe=class extends X{constructor(e){super(),this.str=e}getString(){return this.str}pretty(){return this.getString()}},Ae=class extends X{constructor(){super()}pretty(){return""}},Hr=t=>{switch(t){case"Z":return t;case"NZ":return t;case"ZZ":return t;case"*":return t;default:return}},j=class extends X{constructor({state:e,input:r,nextState:n,actions:o,line:s}){super(),this.state=e,this.input=r,this.nextState=n,this.actions=o,this.line=s,this._string=`${this.state}; ${this.input};${" ".repeat(2-this.input.length)} ${this.nextState}; ${this.actions.map(i=>i.pretty()).join(", ")}`}pretty(){return this._string}},ke=(t,e)=>{let r=t.trim();if(r==="")return new Ae;if(r.startsWith("#"))return r.startsWith(ot.key)?new ot(r.slice(ot.key.length).trim()):r.startsWith(st.key)?new st(r.slice(st.key.length).trim()):new xe(t);let n=r.split(/\s*;\s*/u);if(n.length<4)return`Invalid line "${t}"${St(e)}`;if(n.length>4)return n[4]===""?`Extraneous semicolon "${t}"${St(e)}`:`Invalid line "${t}"${St(e)}`;let o=n[0]??E(),s=n[1]??E(),i=n[2]??E(),p=(n[3]??E()).trim().split(/\s*,\s*/u).filter(B=>B!==""),A=[];for(let B of p){let I=Y(B);if(I===void 0)return`Unknown action "${B}" in "${t}"${St(e)}`;A.push(I)}let g=Hr(s);return g===void 0?`Unknown input "${s}" in "${t}"${St(e)}. Expect "Z", "NZ", "ZZ" or "*"`:new j({state:o,input:g,nextState:i,actions:A,line:e})},St=t=>t!==void 0?` at line ${t}`:"";var xi=Number.parseInt,Ai=Number.isNaN;var it=class t{constructor(e){this.array=e}getArray(){return this.array}pretty(){return this.array.map(e=>e.pretty()).join(`
`)}static parse(e){let n=e.split(/\r\n|\n|\r/u).map((i,c)=>ke(i,c+1)),o=n.flatMap(i=>typeof i=="string"?[i]:[]);if(o.length>0)return o.join(`
`);let s=n.flatMap(i=>typeof i!="string"?[i]:[]);return new t(s)}};function ge(t){let e=t.getArray(),r=e.flatMap(s=>s instanceof j?[s]:[]),n=r.reduce((s,i)=>Math.max(s,i.state.length),0),o=r.reduce((s,i)=>Math.max(s,i.nextState.length),0);return e.map(s=>{if(s instanceof j){let i=n-s.state.length,c=2-s.input.length,p=o-s.nextState.length;return`${s.state}; ${" ".repeat(i)}${s.input}; ${" ".repeat(c)}${s.nextState}; ${" ".repeat(p)}${s.actions.map(A=>A.pretty()).join(", ")}`}else return s.pretty()}).join(`
`)}function Fe(t){let e=it.parse(t);if(typeof e=="string")throw new Error(e);return ge(e)}var Xr=a.match(/[0-9]+/).desc(["number"]).map(t=>({raw:t,value:parseInt(t,10)})),jr=a.match(/0x[a-fA-F0-9]+/).desc(["hexadecimal number"]).map(t=>({raw:t,value:parseInt(t,16)})),We=jr.or(Xr).desc(["number"]);var l=class{constructor(){}},u=class extends Error{constructor(r,n,o){super(r,o);this.apgmSpan=n}};function He(t){return`line ${t.line} column ${t.column}`}function x(t){return t!==void 0?` at ${He(t)}`:""}var L=class t extends l{constructor(r,n,o){super();this.name=r;this.args=n;this.span=o}transform(r){return r(new t(this.name,this.args.map(n=>n.transform(r)),this.span))}pretty(){return`${this.name}(${this.args.map(r=>r.pretty()).join(", ")})`}getSpan(){return this.span}};var T=class t extends l{constructor(r,n,o,s,i){super();this.modifier=r;this.cond=n;this.thenBody=o;this.elseBody=s;this.span=i}transform(r){return r(new t(this.modifier,this.cond.transform(r),this.thenBody.transform(r),this.elseBody!==void 0?this.elseBody.transform(r):void 0,this.span))}pretty(){let r=`if_${this.modifier==="Z"?"z":"nz"}`,n=this.cond.pretty(),o=this.elseBody===void 0?"":` else ${this.elseBody.pretty()}`;return`${r} (${n}) ${this.thenBody.pretty()}`+o}getSpan(){return this.span}};var $=class t extends l{constructor(r){super();this.body=r}transform(r){return r(new t(this.body.transform(r)))}pretty(){return`loop ${this.body.pretty()}`}getSpan(){}};var yt=class{constructor(e,r,n,o){this.name=e;this.args=r;this.body=n;this.span=o}pretty(){return`macro ${this.name}(${this.args.map(e=>e.pretty()).join(", ")}) ${this.body.pretty()}`}};var Pt=class{constructor(e,r,n){this.macros=e;this.headers=r;this.seqExpr=n}pretty(){return[this.macros.map(e=>e.pretty()).join(`
`),this.headers.map(e=>e.toString()).join(`
`),this.seqExpr.prettyInner()].join(`
`)}};var Gt=class{constructor(e,r){this.name=e;this.content=r}toString(){let e=this.content.startsWith(" ")?"":" ";return`#${this.name}${e}${this.content}`}};var R=class extends l{constructor(r,n,o){super();this.value=r;this.span=n;this.raw=o}transform(r){return r(this)}pretty(){return this.value.toString()}getSpan(){return this.span}};var Z=class extends l{constructor(r,n){super();this.value=r;this.span=n}transform(r){return r(this)}pretty(){return'"'+this.value+'"'}getSpan(){return this.span}};var z=class t extends l{constructor(r){super();this.exprs=r}transform(r){return r(new t(this.exprs.map(n=>n.transform(r))))}pretty(){return`{${this.prettyInner()}}`}prettyInner(){return this.exprs.map(r=>r instanceof T||r instanceof $||r instanceof v?r.pretty():r.pretty()+";").join(`
`)}getSpan(){}};var D=class extends l{constructor(r,n){super();this.name=r;this.span=n}transform(r){return r(this)}pretty(){return this.name}getSpan(){return this.span}};var v=class t extends l{constructor(r,n,o){super();this.modifier=r;this.cond=n;this.body=o}transform(r){return r(new t(this.modifier,this.cond.transform(r),this.body.transform(r)))}pretty(){return`while_${this.modifier==="Z"?"z":"nz"}(${this.cond.pretty()}) ${this.body.pretty()}`}getSpan(){}};function kt(t,e,r){let n=t.split(/\r?\n/),o=n[e.line-2],s=n[e.line-1],i=n[e.line],c=" ".repeat(Math.max(0,e.column-1))+"^".repeat(r===void 0?1:Math.max(1,r.column-e.column)),p=o===void 0?[]:[o],A=i===void 0?[]:[i],g=" | ",B=e.line.toString(),I=" ".repeat(B.length);return[...p.map(M=>I+g+M),B+g+s,I+g+c,...A.map(M=>I+g+M)]}function qr(t,e){let r=kt(e,t.location);return[`Error: Parse error at line ${t.location.line} column ${t.location.column}:`,`  expected ${t.expected.join(", ")}`,"",...r].join(`
`)}function Ve(t,e){let r=t.parse(e);if(r.type==="ParseOK")return r.value;throw new u(qr(r,e),{start:r.location,end:r.location})}function U(t,e){let r=e.length;return{start:t,end:{index:t.index+r-1,line:t.line,column:t.column+r}}}var Ye=a.location.chain(t=>a.text('"').next(a.match(/[^"]*/)).skip(a.text('"')).desc(["string"]).map(e=>({value:e,span:U(t,`"${e}"`)})));var Kr=a.match(/\/\*(\*(?!\/)|[^*])*\*\//s).desc([]),d=a.match(/\s*/).desc(["space"]).sepBy(Kr).map(()=>{}),Jr=a.match(/\s+/).desc(["space"]),Qr=/[a-zA-Z_][a-zA-Z_0-9]*/u,qe=a.match(Qr).desc(["identifier"]),tn=qe.wrap(d,d),en=d.chain(()=>a.location.chain(t=>qe.skip(d).map(e=>[e,U(t,e)]))),rn=/[a-zA-Z_][a-zA-Z_0-9]*!/u,Ke=a.match(rn).wrap(d,d).desc(["macro name"]);function N(t){return a.text(t).wrap(d,d)}function Xe(t){return a.location.chain(r=>a.text(t).map(n=>[n,U(r,t)])).wrap(d,d)}var nn=N(",").desc(["`,`"]),Je=N("(").desc(["`(`"]),Qe=N(")").desc(["`)`"]),on=N(";").desc(["`;`"]),sn=N("{").desc(["`{`"]),an=N("}").desc(["`}`"]),tr=en.map(([t,e])=>new D(t,e));function er(t){return a.lazy(()=>t()).sepBy(nn).wrap(Je,Qe)}function cn(){return d.next(a.location).chain(t=>a.choice(Ke,tn).chain(e=>er(()=>k()).map(r=>new L(e,r,U(t,e)))))}var pn=a.location.chain(t=>We.map(e=>new R(e.value,U(t,e.raw),e.raw))).wrap(d,d),un=Ye.wrap(d,d).map(t=>new Z(t.value,t.span)),rr=a.lazy(()=>bn()).repeat(),mn=rr.wrap(sn,an).map(t=>new z(t)),fn=a.choice(N("while_z"),N("while_nz")).map(t=>t==="while_z"?"Z":"NZ"),nr=a.lazy(()=>k()).wrap(Je,Qe),or=fn.chain(t=>nr.chain(e=>k().map(r=>new v(t,e,r)))),sr=N("loop").next(a.lazy(()=>k())).map(t=>new $(t)),dn=a.choice(Xe("if_z"),Xe("if_nz")).map(t=>t[0]==="if_z"?["Z",t[1]]:["NZ",t[1]]),ir=dn.chain(([t,e])=>nr.chain(r=>a.lazy(()=>k()).chain(n=>a.choice(N("else").next(a.lazy(()=>k())),a.ok(void 0)).map(o=>new T(t,r,n,o,e))))),je="macro",ln=d.chain(t=>a.location.chain(e=>a.text(je).next(Jr).map(r=>U(e,je))));function be(){return ln.and(Ke).chain(([t,e])=>er(()=>tr).map(r=>({span:t,name:e,args:r})))}function hn(){return be().chain(({span:t,name:e,args:r})=>a.lazy(()=>k()).map(n=>new yt(e,r,n,t)))}var xn=a.match(/.*/),An=a.text("#").next(a.match(/REGISTERS|COMPONENTS/)).desc(["#REGISTERS","#COMPONENTS"]).chain(t=>xn.map(e=>new Gt(t,e))),gn=An.wrap(d,d).repeat();function k(){return a.choice(sr,or,ir,a.lazy(()=>cn()),mn,tr,pn,un)}function bn(){return a.choice(sr,or,ir,k().skip(on))}function Sn(){return hn().repeat().chain(t=>gn.chain(e=>rr.wrap(d,d).map(r=>new Pt(t,e,new z(r)))))}function ar(t){return Ve(Sn(),t)}var b=class{constructor(){}};var y=class extends b{constructor(r){super();this.actions=r}transform(r){return r(this)}};var h=class t extends b{constructor(r){super();this.exprs=r}transform(r){return r(new t(this.exprs.map(n=>n.transform(r))))}};function q(t){return t instanceof h&&t.exprs.every(e=>q(e))}function at(t){if(t instanceof y)return t;if(t instanceof h&&t.exprs.length===1){let e=t.exprs[0];return at(e)}}var F=class t extends b{constructor(r,n,o){super();this.cond=r;this.thenBody=n;this.elseBody=o}transform(r){return r(new t(this.cond.transform(r),this.thenBody.transform(r),this.elseBody.transform(r)))}};var K=class t extends b{constructor(r){super();this.body=r}kind="loop";transform(r){return r(new t(this.body.transform(r)))}};var J=class t extends b{constructor(r,n,o){super();this.modifier=r;this.cond=n;this.body=o}transform(r){return r(new t(this.modifier,this.cond.transform(r),this.body.transform(r)))}};var W=class extends b{constructor(r,n){super();this.level=r;this.span=n}kind="break";transform(r){return r(this)}};var m=class t{static incU(e){return t.nonReturn(`INC U${e}`)}static incUMulti(...e){return new y([...e.map(r=>`INC U${r}`),"NOP"])}static tdecU(e){return t.single(`TDEC U${e}`)}static addA1(){return t.nonReturn("ADD A1")}static addB0(){return t.single("ADD B0")}static addB1(){return t.single("ADD B1")}static incB2DX(){return t.nonReturn("INC B2DX")}static tdecB2DX(){return t.single("TDEC B2DX")}static incB2DY(){return t.nonReturn("INC B2DY")}static tdecB2DY(){return t.single("TDEC B2DY")}static readB2D(){return t.single("READ B2D")}static setB2D(){return t.nonReturn("SET B2D")}static incB(e){return t.nonReturn(`INC B${e}`)}static tdecB(e){return t.single(`TDEC B${e}`)}static readB(e){return t.single(`READ B${e}`)}static setB(e){return t.nonReturn(`SET B${e}`)}static haltOUT(){return t.single("HALT_OUT")}static mul0(){return t.single("MUL 0")}static mul1(){return t.single("MUL 1")}static nop(){return t.single("NOP")}static output(e){return t.nonReturn(`OUTPUT ${e}`)}static subA1(){return t.nonReturn("SUB A1")}static subB0(){return t.single("SUB B0")}static subB1(){return t.single("SUB B1")}static nonReturn(e){return new y([e,"NOP"])}static single(e){return new y([e])}};function En(t,e){if(t.args.length!==0)throw new u(`"${t.name}" expects empty arguments${x(t.span?.start)}`,t.span);return e}function cr(t,e){if(t.args.length!==1)throw new u(`number of arguments is not 1:"${t.name}"${x(t.span?.start)}`,t.span);let r=t.args[0];if(!(r instanceof R))throw new u(`argument is not a number: "${t.name}"${x(t.span?.start)}`,r.getSpan()??t.span);return e(r.value)}function yn(t,e){if(t.args.length!==1)throw new u(`number of arguments is not 1: "${t.name}"${x(t.span?.start)}`,t.span);let r=t.args[0];if(!(r instanceof Z))throw new u(`argument is not a string: "${t.name}"${x(t.span?.start)}`,r.getSpan()??t.span);return e(r.value)}var pr=new Map([["nop",m.nop()],["inc_b2dx",m.incB2DX()],["inc_b2dy",m.incB2DY()],["tdec_b2dx",m.tdecB2DX()],["tdec_b2dy",m.tdecB2DY()],["read_b2d",m.readB2D()],["set_b2d",m.setB2D()],["add_a1",m.addA1()],["add_b0",m.addB0()],["add_b1",m.addB1()],["sub_a1",m.subA1()],["sub_b0",m.subB0()],["sub_b1",m.subB1()],["mul_0",m.mul0()],["mul_1",m.mul1()],["halt_out",m.haltOUT()]]),ur=new Map([["inc_u",m.incU],["tdec_u",m.tdecU],["inc_b",m.incB],["tdec_b",m.tdecB],["read_b",m.readB],["set_b",m.setB]]),mr=new Map([["output",m.output]]);function Pn(t){let e=pr.get(t.name);if(e!==void 0)return En(t,e);let r=ur.get(t.name);if(r!==void 0)return cr(t,r);let n=mr.get(t.name);if(n!==void 0)return yn(t,n);switch(t.name){case"break":return t.args.length===0?new W(void 0,t.span):cr(t,o=>new W(o,t.span));case"repeat":{if(t.args.length!==2)throw new u(`"repeat" takes two arguments${x(t.span?.start)}`,t.span);let o=t.args[0];if(!(o instanceof R))throw new u(`first argument of "repeat" must be a number${x(t.span?.start)}`,o.getSpan()??t.span);let s=t.args[1];if(s===void 0)throw new Error("internal error");let i=Ft(s);return new h(Array(o.value).fill(0).map(()=>i))}}throw new u(`Unknown ${t.name.endsWith("!")?"macro":"function"}: "${t.name}"${x(t.span?.start)}`,t.span)}function Ft(t){let e=Ft;if(t instanceof L)return Pn(t);if(t instanceof T)return t.modifier==="Z"?new F(e(t.cond),e(t.thenBody),t.elseBody===void 0?new h([]):e(t.elseBody)):new F(e(t.cond),t.elseBody===void 0?new h([]):e(t.elseBody),e(t.thenBody));if(t instanceof $)return new K(e(t.body));if(t instanceof R)throw new u(`number is not allowed: ${t.raw??t.value}${x(t.span?.start)}`,t.span);if(t instanceof z)return new h(t.exprs.map(r=>e(r)));if(t instanceof Z)throw new u(`string is not allowed: ${t.pretty()}${x(t.span?.start)}`,t.span);if(t instanceof v)return new J(t.modifier,e(t.cond),e(t.body));throw t instanceof D?new u(`macro variable is not allowed: variable "${t.name}"${x(t.span?.start)}`,t.span):Error("internal error")}function Gn(t){let e="",r=!1,n=0;for(;n<t.length;){let o=t[n],s=t[n+1];o==="/"&&s==="*"?(n+=2,r=!0):o==="*"&&s==="/"?(r=!1,n+=2):(r||(e+=o),n++)}return e}function wn(t){let e=[],r=/(macro\s+([a-zA-Z_][a-zA-Z_0-9]*?!)\s*\(.*?\))/gs,n=Gn(t).matchAll(r);for(let o of n){let s=be().parse(o[0]);s.type==="ParseOK"&&e.push({name:s.value.name,args:s.value.args.map(i=>i.name)})}return e}function fr(t){return t.transform(Mn)}function Mn(t){return t instanceof h?Bn(t):t}function dr(t,e){let r=lr(Se(t),Se(e));return r===void 0?void 0:hr(r)}var Nn=new G;function lr(t,e){if(t.length===0)return e.slice();if(e.length===0)return t.slice();if(t.some(p=>p instanceof S)||e.some(p=>p instanceof S))return;let r=t.filter(p=>!(p instanceof G)),n=e.filter(p=>!(p instanceof G)),o=r.every(p=>!p.doesReturnValue()),s=n.every(p=>!p.doesReturnValue());if(!o&&!s||!r.every(p=>n.every(A=>!p.isSameComponent(A))))return;let c=r.concat(n);return o&&s&&c.push(Nn),c}function Se(t){return t.actions.flatMap(e=>{let r=Y(e);return r!==void 0?[r]:[]})}function hr(t){return new y(t.map(e=>e.pretty()))}function Bn(t){let e=[],r=[],n=()=>{r.length!==0&&(e.push(hr(r)),r=[])};for(let o of t.exprs)if(o instanceof y){let s=Se(o),i=lr(r,s);i===void 0?(n(),r=s):r=i}else n(),e.push(o);return n(),new h(e)}var P=class{constructor(e,r,n){this.input=e;this.output=r;this.inputZNZ=n}};function Ln(t){let e=t.prevOutput,r=e;return(e==="*"||e==="Z")&&(r=" "+e),`${t.currentState}; ${r}; ${t.nextState}; ${t.actions.join(", ")}`}var w=class{constructor(e){this.inner=e;if(this.inner.actions.length===0)throw Error("actions must be nonempty")}},Ee=class{#i=0;#r=[];#n;#o;constructor(e={}){this.#n=e.prefix??"STATE_",this.#o=!(e.noOptimize??!1)}#e(){return this.#i++,`${this.#n}${this.#i}`}#s(e,r,n="*"){return new w({currentState:e,prevOutput:n,nextState:r,actions:["NOP"]})}transpile(e){let r="INITIAL",n=this.#e(),o=this.#s(r,n,"ZZ"),s=this.#n+"END",i=this.#t(new P(n,s,"*"),e),c=new w({currentState:s,prevOutput:"*",nextState:s,actions:["HALT_OUT"]});return[o,...i,c].map(p=>Ln(p.inner))}#t(e,r){if(r instanceof y)return[this.#c(e,r)];if(r instanceof h)return this.#u(e,r);if(r instanceof F)return this.#m(e,r);if(r instanceof K)return this.#f(e,r);if(r instanceof J)return this.#l(e,r);if(r instanceof W)return this.#h(e,r);throw Error("unknown expr")}#c(e,r){return new w({currentState:e.input,prevOutput:e.inputZNZ,nextState:e.output,actions:r.actions})}#u(e,r){if(q(r))return[this.#s(e.input,e.output,e.inputZNZ)];if(r.exprs.length===1){let i=r.exprs[0];if(i===void 0)throw new Error("internal error");return this.#t(e,i)}let n=[],o=e.input,s=r.exprs.length-1;for(let[i,c]of r.exprs.entries())if(i!==s){let p=this.#e();n=n.concat(this.#t(new P(o,p,i===0?e.inputZNZ:"*"),c)),o=p}else n=n.concat(this.#t(new P(o,e.output,"*"),c));return n}#m(e,r){if(this.#o&&q(r.thenBody)&&q(r.elseBody))return this.#t(e,r.cond);let n=this.#e(),o=this.#t(new P(e.input,n,e.inputZNZ),r.cond),[s,...i]=this.#t(new P(n,e.output,"Z"),r.thenBody),[c,...p]=this.#t(new P(n,e.output,"NZ"),r.elseBody);return[...o,s,c,...i,...p]}#f(e,r){let{startState:n,fromZOrNZ:o}=this.#a(e);this.#r.push(e.output);let s=this.#t(new P(n,n,"*"),r.body);return this.#r.pop(),[...o,...s]}#p(e,r,n,o){let{startState:s,fromZOrNZ:i}=this.#a(e),c=this.#e(),p=this.#c(new P(s,c,"*"),r),A=new w({currentState:c,prevOutput:"Z",nextState:o==="Z"?c:e.output,actions:o==="Z"?n.actions:["NOP"]}),g=new w({currentState:c,prevOutput:"NZ",nextState:o==="Z"?e.output:c,actions:o==="Z"?["NOP"]:n.actions});return[...i,p,A,g]}#d(e,r,n){let{startState:o,fromZOrNZ:s}=this.#a(e),i=this.#e(),c=this.#t(new P(o,i,"*"),r),p=new w({currentState:i,prevOutput:"Z",nextState:n==="Z"?o:e.output,actions:["NOP"]}),A=new w({currentState:i,prevOutput:"NZ",nextState:n==="Z"?e.output:o,actions:["NOP"]});return[...s,...c,p,A]}#l(e,r){let n=this.#o;if(n&&q(r.body)){let M=at(r.cond);return M!==void 0?this.#p(e,M,M,r.modifier):this.#d(e,r.cond,r.modifier)}let o=at(r.body),s=at(r.cond);if(n&&s!==void 0&&o!==void 0){let M=dr(o,s);if(M!==void 0)return this.#p(e,s,M,r.modifier)}let{startState:i,fromZOrNZ:c}=this.#a(e),p=this.#e(),A=this.#t(new P(i,p,"*"),r.cond),g=this.#e()+"_WHILE_BODY",B=new w({currentState:p,prevOutput:"Z",nextState:r.modifier==="Z"?g:e.output,actions:["NOP"]}),I=new w({currentState:p,prevOutput:"NZ",nextState:r.modifier==="Z"?e.output:g,actions:["NOP"]});this.#r.push(e.output);let Ge=this.#t(new P(g,i,"*"),r.body);return this.#r.pop(),[...c,...A,B,I,...Ge]}#a(e){let r=e.inputZNZ==="*"?e.input:this.#e(),n=e.inputZNZ==="*"?[]:[this.#s(e.input,r,e.inputZNZ)];return{startState:r,fromZOrNZ:n}}#h(e,r){let n=r.level??1;if(n<1)throw new u("break level is less than 1",r.span);let o=this.#r[this.#r.length-n];if(o===void 0)throw n===1?new u("break outside while or loop",r.span):new u("break level is greater than number of nests of while or loop",r.span);return[this.#s(e.input,o,e.inputZNZ)]}};function ye(t,e={}){return new Ee(e).transpile(t)}function xr(t){let e=new Set,r=[];for(let n of t)e.has(n)?r.push(n):e.add(n);return r}function Ar(t){return`${t} argument${t===1?"":"s"}`}function Tn(){throw new Error("internal error")}function $n(t,e){let r=e.args;if(r.length!==t.args.length)throw new u(`Error at "${t.name}": this macro takes ${Ar(t.args.length)} but ${Ar(r.length)} was supplied${x(e.span?.start)}`,e.span);let n=new Map(t.args.map((o,s)=>[o.name,r[s]??Tn()]));return t.body.transform(o=>{if(o instanceof D){let s=n.get(o.name);if(s===void 0)throw new u(`Error: Unknown variable "${o.name}"${x(o.span?.start)}`,o.span);return s}else return o})}var Rn=1e5,Pe=class t{#i;#r=0;#n;constructor(e,r){this.#n=e,this.#i=r}static make(e){let r=new Map(e.macros.map(n=>[n.name,n]));if(r.size<e.macros.length){let o=xr(e.macros.map(c=>c.name))[0],s=e.macros.slice().reverse().find(c=>c.name===o)?.span,i=s?.start;throw new u(`There is a macro with the same name: "${o}"`+x(i),s)}return new t(e,r)}expand(){return this.#o(this.#n.seqExpr)}#o(e){if(Rn<this.#r)throw Error("too many macro expansion");return this.#r++,e.transform(r=>this.#e(r))}#e(e){return e instanceof L?this.#s(e):e}#s(e){let r=this.#i.get(e.name);if(r!==void 0){let n=$n(r,e);return this.#o(n)}else return e}};function gr(t){return Pe.make(t).expand()}function br(t){return t.transform(vn)}function vn(t){return t instanceof h?Dn(t):t}function Dn(t){let e=[];for(let r of t.exprs)r instanceof h?e=e.concat(r.exprs):e.push(r);return new h(e)}function ct(t=void 0,e,...r){t&&console.log(t+" Start",performance.now());let n=e(...r);return t&&console.log(t+" End",performance.now()),n}function In(t,{log:e,noOptimize:r}){if(r===!0)return t;let n=ct(e?"optimize apgl seq":void 0,br,t);return ct(e?"optimize apgl action":void 0,fr,n)}function zu(t,e={}){let r=e.log??!1,n=ct(r?"apgm parse":void 0,ar,t);try{let o=ct(r?"apgm macro expand":void 0,gr,n),s=ct(r?"apgm to apgl":void 0,Ft,o),i=In(s,{log:r,noOptimize:e.noOptimize}),c=ct(r?"apgl to apgsembly":void 0,ye,i,e),p=["# State    Input    Next state    Actions","# ---------------------------------------"];return n.headers.map(g=>g.toString()).concat(p,c)}catch(o){throw o instanceof u&&o.apgmSpan?new u([o.message,...kt(t,o.apgmSpan.start,o.apgmSpan.end)].join(`
`),o.apgmSpan,{cause:o.cause}):o}}export{wn as completionParser,pr as emptyArgFuncs,Fe as formatAPGsembly,zu as integration,ur as numArgFuncs,mr as strArgFuncs};
