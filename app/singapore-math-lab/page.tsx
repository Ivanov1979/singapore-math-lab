'use client';

import { useState } from 'react';
import styles from './page.module.css';

type Problem = {title:string;story:string;total:string;part:string;other:string;equation:string;answers:string[];solution:number;hint:string};
const problems:Problem[]=[
 {title:'Los lápices',story:'En una caja había algunos lápices. Al agregar 6 lápices, ahora hay 12. ¿Cuántos había inicialmente?',total:'12',part:'x',other:'6',equation:'x+6=12',answers:['x+6=12','6+x=12','12=x+6','12=6+x'],solution:6,hint:'¿Qué cantidad representa el total? ¿Cuál es la parte que desconoces?'},
 {title:'Las láminas de Sofía',story:'Sofía tiene 8 láminas y recibe algunas más. Ahora tiene 15. ¿Cuántas láminas recibió?',total:'15',part:'8',other:'x',equation:'8+x=15',answers:['8+x=15','x+8=15','15=8+x','15=x+8'],solution:7,hint:'Las láminas que tenía y las que recibió forman el total.'},
 {title:'Los libros de la biblioteca',story:'En la biblioteca había 18 libros. Se prestaron algunos y quedaron 11. ¿Cuántos libros se prestaron?',total:'18',part:'11',other:'x',equation:'18-x=11',answers:['18-x=11','18-11=x','x+11=18','11+x=18','18=11+x','18=x+11'],solution:7,hint:'El total inicial se divide en los libros que quedaron y los prestados.'},
 {title:'Los autitos de Martín',story:'Martín tenía algunos autitos. Regaló 4 y le quedaron 9. ¿Cuántos tenía al principio?',total:'x',part:'4',other:'9',equation:'x-4=9',answers:['x-4=9','x=4+9','x=9+4','4+9=x','9+4=x'],solution:13,hint:'Aquí el total inicial es la incógnita.'}
];
const balanceTasks=[
 {title:'Observa: una caja y cinco canicas',story:'La balanza está en equilibrio. Observa una caja y 5 canicas a la izquierda; hay 9 canicas a la derecha. Escribe la ecuación y encuentra x.',a:5,b:9,kind:'add',solution:4,eq:['x+5=9','5+x=9','9=x+5','9=5+x']},
 {title:'Observa: tres canicas retiradas',story:'Una caja contenía una cantidad desconocida de canicas. Se retiraron 3 y quedaron 5. ¿Cuántas canicas había inicialmente?',a:3,b:5,kind:'sub',solution:8,eq:['x-3=5','5=x-3','x=5+3','x=3+5']}
];
const buildTasks=[
 {title:'Construye: la caja y seis canicas',story:'Una balanza está equilibrada. En el platillo izquierdo hay una caja con una cantidad desconocida de canicas y 6 canicas sueltas. En el derecho hay 12 canicas sueltas. Construye la balanza y resuelve.',a:6,b:12,solution:6,eq:['x+6=12','6+x=12','12=x+6','12=6+x']},
 {title:'Desafío final: la caja misteriosa',story:'Una balanza está equilibrada. En el platillo izquierdo hay una caja con una cantidad desconocida de canicas y 8 canicas sueltas. En el derecho hay 15 canicas sueltas. Construye la balanza y resuelve.',a:8,b:15,solution:7,eq:['x+8=15','8+x=15','15=x+8','15=8+x']}
];
function normalized(s:string){return s.toLowerCase().replace(/\s/g,'').replace(/×/g,'*').replace(/[−–]/g,'-').replace(/,/g,'.');}
function Marble({small=false}:{small?:boolean}){return <span className={`${styles.marble} ${small?styles.smallMarble:''}`} aria-label="Canica"/>;}
function Crate(){return <span className={styles.crate}>x</span>;}
function DropZone({children,onDropItem,caption,active=false}:{children:React.ReactNode;onDropItem:(item:string)=>void;caption:string;active?:boolean}){
 return <div className={`${styles.drop} ${active?styles.dropActive:''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();onDropItem(e.dataTransfer.getData('text/plain'));}} onClick={()=>onDropItem('selected')} role="group" aria-label={caption}><span className={styles.dropCaption}>{caption}</span>{children}</div>;
}
function BarActivity({idx}:{idx:number}){
 const p=problems[idx];const [slots,setSlots]=useState<Record<string,string>>({});const [selected,setSelected]=useState('');const [verified,setVerified]=useState(false);const [eq,setEq]=useState('');const [eqOk,setEqOk]=useState(false);const [answer,setAnswer]=useState('');const [answerOk,setAnswerOk]=useState(false);
 const values=[p.total,p.part,p.other];const tokens=Array.from(new Set(values));const correct=slots.total===p.total&&((slots.part===p.part&&slots.other===p.other)||(slots.part===p.other&&slots.other===p.part));
 function place(key:string,raw:string){const value=raw==='selected'?selected:raw;if(!tokens.includes(value))return;setSlots(old=>{const n={...old};Object.keys(n).forEach(k=>{if(n[k]===value)delete n[k]});n[key]=value;return n});setVerified(false);setEqOk(false);setAnswerOk(false);setSelected('');}
 return <section className={styles.panel}><p className={styles.story}>{p.story.split(/(\d+)/).map((piece,i)=>/^\d+$/.test(piece)?<span key={i} className={`${styles.token} ${selected===piece?styles.selected:''}`} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',piece)} onClick={()=>setSelected(piece)}>{piece}</span>:<span key={i}>{piece}</span>)}</p><p className={styles.instructions}>1. Arrastra las cantidades directamente desde el enunciado hacia las barras. También puedes seleccionar una ficha y tocar el espacio.</p><div className={styles.inlineTokens}>Incógnita: <span className={`${styles.token} ${selected==='x'?styles.selected:''}`} draggable onDragStart={e=>e.dataTransfer.setData('text/plain','x')} onClick={()=>setSelected('x')}>x</span></div><div className={styles.barDiagram}><DropZone caption="Barra total" onDropItem={v=>place('total',v)} active={!!slots.total}><div className={`${styles.bar} ${styles.total}`}>{slots.total||'¿Total?'}</div></DropZone><div className={styles.parts}><DropZone caption="Primera parte" onDropItem={v=>place('part',v)} active={!!slots.part}><div className={`${styles.bar} ${styles.partA}`}>{slots.part||'¿Parte?'}</div></DropZone><DropZone caption="Segunda parte" onDropItem={v=>place('other',v)} active={!!slots.other}><div className={`${styles.bar} ${styles.partB}`}>{slots.other||'¿Parte?'}</div></DropZone></div></div><button onClick={()=>setVerified(true)}>Comprobar diagrama</button>{verified&&<p className={correct?styles.good:styles.hint}>{correct?'¡El diagrama representa correctamente el problema!':p.hint}</p>}{verified&&correct&&<div className={styles.next}><label>2. Escribe tu ecuación (sin espacios si prefieres):<input value={eq} onChange={e=>{setEq(e.target.value);setEqOk(false);setAnswerOk(false)}} placeholder="Escribe tu ecuación"/></label><button onClick={()=>setEqOk(true)}>Comprobar ecuación</button>{eqOk&&<p className={p.answers.some(v=>normalized(v)===normalized(eq))?styles.good:styles.hint}>{p.answers.some(v=>normalized(v)===normalized(eq))?'¡Ecuación correcta!':'Revisa cómo se relacionan el total y las partes.'}</p>}{eqOk&&p.answers.some(v=>normalized(v)===normalized(eq))&&<div><label>3. Resuelve para x:<input inputMode="numeric" value={answer} onChange={e=>{setAnswer(e.target.value);setAnswerOk(false)}} placeholder="x = ..."/></label><button onClick={()=>setAnswerOk(true)}>Comprobar solución</button>{answerOk&&<p className={Number(answer)===p.solution?styles.good:styles.hint}>{Number(answer)===p.solution?'¡Correcto! Explica a tu compañero por qué tu resultado funciona.':'Comprueba sustituyendo tu valor en la ecuación.'}</p>}</div>}</div>}</section>;
}
function BalanceFrame(){return <svg className={styles.balanceFrame} viewBox="0 0 900 350" preserveAspectRatio="none" aria-hidden="true"><path d="M70 66 H830" stroke="#64748b" strokeWidth="19" strokeLinecap="round"/><path d="M450 76 V295" stroke="#64748b" strokeWidth="24"/><path d="M335 300 H565" stroke="#64748b" strokeWidth="21" strokeLinecap="round"/><path d="M207 66 L111 222 M207 66 L303 222 M693 66 L597 222 M693 66 L789 222" stroke="#a7b4c8" strokeWidth="8" strokeLinejoin="round"/><path d="M88 222 H326 L301 262 H113 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="7"/><path d="M574 222 H812 L787 262 H599 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="7"/></svg>}
function Scale({left,right,boxes=1,sub=false}:{left:number;right:number;boxes?:number;sub?:boolean}){return <div className={styles.scaleWrap}><BalanceFrame/><div className={styles.plateRow}><div className={styles.plate}><div className={styles.plateContents}>{Array.from({length:boxes},(_,i)=><Crate key={i}/>)}{Array.from({length:left},(_,i)=><Marble key={i} small/>)}</div></div><div className={styles.plate}><div className={styles.plateContents}>{Array.from({length:right},(_,i)=><Marble key={i} small/>)}</div></div></div>{sub&&<p className={styles.subNote}>Se retiraron 3 canicas de la cantidad inicial de la caja. Las 5 canicas representan lo que quedó.</p>}</div>}
function ObserveActivity({idx}:{idx:number}){const t=balanceTasks[idx];const [eq,setEq]=useState('');const [check,setCheck]=useState(false);const [x,setX]=useState('');const [solved,setSolved]=useState(false);const correct=t.eq.some(s=>normalized(s)===normalized(eq));return <section className={styles.panel}><p className={styles.story}>{t.story}</p>{t.kind==='add'?<Scale left={t.a} right={t.b}/>:<div className={styles.observeSub}><div className={styles.subEquation}><Crate/><span className={styles.minus}>−</span>{Array.from({length:3},(_,i)=><Marble key={i}/>)}<span className={styles.minus}>=</span>{Array.from({length:5},(_,i)=><Marble key={i}/>)}</div><p>La caja representa la cantidad inicial; las tres canicas se retiran.</p></div>}<label>1. Escribe la ecuación que representa la situación:<input value={eq} onChange={e=>{setEq(e.target.value);setCheck(false);setSolved(false)}} placeholder="Tu ecuación"/></label><button onClick={()=>setCheck(true)}>Comprobar ecuación</button>{check&&<p className={correct?styles.good:styles.hint}>{correct?'¡Bien! Ahora resuelve para x.':'Observa qué cantidad es desconocida y qué operación se realiza.'}</p>}{check&&correct&&<div className={styles.next}><label>2. ¿Cuánto vale x?<input inputMode="numeric" value={x} onChange={e=>{setX(e.target.value);setSolved(false)}} placeholder="x = ..."/></label><button onClick={()=>setSolved(true)}>Comprobar resultado</button>{solved&&<p className={Number(x)===t.solution?styles.good:styles.hint}>{Number(x)===t.solution?'¡Correcto! Explica tu procedimiento.':'Revisa la igualdad y vuelve a intentarlo.'}</p>}</div>}</section>}
function BuildActivity({idx}:{idx:number}){
 const t=buildTasks[idx];
 type Place='tray'|'left'|'right';
 const total=t.a+t.b;
 const [places,setPlaces]=useState<Record<number,Place>>({});
 const [boxSide,setBoxSide]=useState<Place>('tray');
 const [selectedIds,setSelectedIds]=useState<number[]>([]);
 const [boxSelected,setBoxSelected]=useState(false);
 const [checked,setChecked]=useState(false);
 const [eq,setEq]=useState('');
 const [eqChecked,setEqChecked]=useState(false);
 const [removed,setRemoved]=useState(0);
 const [x,setX]=useState('');
 const [solved,setSolved]=useState(false);
 const position=(id:number):Place=>places[id]??'tray';
 const ids=(place:Place)=>Array.from({length:total},(_,i)=>i).filter(id=>position(id)===place);
 const left=ids('left').length,right=ids('right').length;
 const built=left===t.a&&right===t.b&&boxSide==='left';
 const eqCorrect=t.eq.some(v=>normalized(v)===normalized(eq));
 const modelLocked=checked&&built&&eqChecked&&eqCorrect;
 function resetChecks(){setChecked(false);setEqChecked(false);setSolved(false);setRemoved(0);}
 function toggleMarble(id:number){
   if(modelLocked)return;
   setBoxSelected(false);
   setSelectedIds(old=>old.includes(id)?old.filter(v=>v!==id):[...old,id]);
 }
 function toggleBox(){if(modelLocked)return;setSelectedIds([]);setBoxSelected(v=>!v);}
 function moveTo(target:Place,draggedId?:number,dragBox=false){
   if(modelLocked)return;
   if(dragBox|| (draggedId===undefined&&boxSelected)){
     setBoxSide(target);setBoxSelected(false);setSelectedIds([]);resetChecks();return;
   }
   const moving=draggedId===undefined?selectedIds:(selectedIds.includes(draggedId)?selectedIds:[draggedId]);
   if(!moving.length)return;
   setPlaces(old=>{
     const next={...old};
     moving.forEach(id=>{next[id]=target});
     return next;
   });
   setSelectedIds([]);setBoxSelected(false);resetChecks();
 }
 function startMarbleDrag(e:React.DragEvent<HTMLElement>,id:number){
   if(modelLocked){e.preventDefault();return;}
   e.stopPropagation();
   e.dataTransfer.effectAllowed='move';
   e.dataTransfer.setData('text/plain',`marble:${id}`);
 }
 function startBoxDrag(e:React.DragEvent<HTMLElement>){
   if(modelLocked){e.preventDefault();return;}
   e.stopPropagation();e.dataTransfer.effectAllowed='move';
   e.dataTransfer.setData('text/plain','box');
 }
 function onTargetDrop(e:React.DragEvent<HTMLElement>,target:Place){
   e.preventDefault();e.stopPropagation();
   const data=e.dataTransfer.getData('text/plain');
   if(data==='box')moveTo(target,undefined,true);
   else if(data.startsWith('marble:')){
     const id=Number(data.slice(7));
     if(Number.isInteger(id)&&id>=0&&id<total)moveTo(target,id);
   }
 }
 function MarblePiece({id}:{id:number}){
   const active=selectedIds.includes(id);
   return <button type="button" draggable={!modelLocked}
     onDragStart={e=>startMarbleDrag(e,id)}
     onClick={e=>{e.stopPropagation();toggleMarble(id);}}
     className={`${styles.pickableMarble} ${active?styles.pickedMarble:''}`}
     aria-pressed={active} aria-label={`Canica ${id+1}${active?', seleccionada':''}`}
     title="Haz clic para seleccionar o arrastra al otro lugar">
       <Marble small={position(id)!=='tray'}/>
     </button>;
 }
 function BoxPiece(){
   return <button type="button" draggable={!modelLocked} onDragStart={startBoxDrag}
      onClick={e=>{e.stopPropagation();toggleBox();}}
      className={`${styles.pickableMarble} ${boxSelected?styles.pickedMarble:''}`}
      aria-pressed={boxSelected} aria-label="Caja con incógnita x"><Crate/></button>;
 }
 function Target({side,caption}:{side:Place;caption:string}){
   return <div className={styles.drop} role="group" aria-label={caption}
     onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';}}
     onDrop={e=>onTargetDrop(e,side)}
     onClick={()=>moveTo(side)}>
       <span className={styles.dropCaption}>{caption}</span>
       <div className={styles.buildContents}>
         {boxSide===side&&<BoxPiece/>}
         {ids(side).slice(modelLocked?removed:0).map(id=><MarblePiece key={id} id={id}/>)}
       </div>
     </div>;
 }
 function restart(){
   setPlaces({});setBoxSide('tray');setSelectedIds([]);setBoxSelected(false);
   setChecked(false);setEq('');setEqChecked(false);setRemoved(0);setX('');setSolved(false);
 }
 return <section className={styles.panel}>
   <p className={styles.story}>{t.story}</p>
   <p className={styles.instructions}>1. Haz clic directamente sobre varias canicas para seleccionarlas (se marcarán con un borde). Luego arrastra una de las seleccionadas al platillo. También puedes seleccionar y tocar el destino. Si te equivocas, selecciona las canicas del platillo y devuélvelas a la bandeja, o muévelas al otro platillo.</p>
   <div className={styles.scaleBuild}><BalanceFrame/><div className={styles.buildPlates}>
     <Target side="left" caption="Platillo izquierdo"/>
     <Target side="right" caption="Platillo derecho"/>
   </div></div>
   <div className={styles.counts}>Izquierda: {boxSide==='left'?'1 caja + ':''}{left} canicas · Derecha: {boxSide==='right'?'1 caja + ':''}{right} canicas</div>
   <div className={`${styles.tray} ${styles.directTray}`} role="group" aria-label="Bandeja de objetos sueltos"
     onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';}}
     onDrop={e=>onTargetDrop(e,'tray')} onClick={()=>moveTo('tray')}>
     <strong>Bandeja de objetos sueltos</strong>
     <p className={styles.instructions}>Selecciona las canicas directamente. Puedes elegir cualquier cantidad, sin botones numéricos.</p>
     <div className={styles.trayItems}>
       {boxSide==='tray'&&<BoxPiece/>}
       <div className={styles.marblesTray}>{ids('tray').map(id=><MarblePiece key={id} id={id}/>)}</div>
     </div>
     <p className={styles.instructions}>Canicas disponibles: {ids('tray').length}. Seleccionadas: {selectedIds.length}{boxSelected?' + caja':''}. Arrastra las seleccionadas juntas o haz clic en el destino.</p>
   </div>
   <div className={styles.actions}><button onClick={()=>setChecked(true)}>Comprobar modelo</button><button className={styles.secondary} onClick={restart}>Reiniciar</button></div>
   {checked&&<p className={built?styles.good:styles.hint}>{built?'¡Representación correcta!':'Comprueba la posición de la caja y cuenta las canicas de cada platillo. Puedes corregirlo arrastrando los objetos de regreso.'}</p>}
   {checked&&built&&<div className={styles.next}>
     <label>2. Escribe la ecuación:<input value={eq} onChange={e=>{setEq(e.target.value);setEqChecked(false);setRemoved(0)}} placeholder="Escribe la ecuación"/></label>
     <button onClick={()=>setEqChecked(true)}>Comprobar ecuación</button>
     {eqChecked&&<p className={eqCorrect?styles.good:styles.hint}>{eqCorrect?'¡Muy bien! Ahora conserva la igualdad retirando la misma cantidad de canicas de ambos lados.':'Revisa la relación entre la caja, las canicas sueltas y el total.'}</p>}
     {eqChecked&&eqCorrect&&<div className={styles.next}>
       <p>3. Retira una canica de cada platillo en cada paso. La balanza mantiene la igualdad.</p>
       <button disabled={removed>=t.a} onClick={()=>setRemoved(v=>v+1)}>Retirar 1 canica de cada lado ({removed}/{t.a})</button>
       {removed>0&&<p>Ahora quedan {left-removed} canicas a la izquierda y {right-removed} a la derecha.</p>}
       {removed===t.a&&<div className={styles.next}><p className={styles.good}>¡La caja quedó frente a {t.b-t.a} canicas!</p>
         <label>4. ¿Cuánto vale x?<input inputMode="numeric" value={x} onChange={e=>{setX(e.target.value);setSolved(false)}} placeholder="x = ..."/></label>
         <button onClick={()=>setSolved(true)}>Comprobar solución</button>
         {solved&&<p className={Number(x)===t.solution?styles.good:styles.hint}>{Number(x)===t.solution?'¡Correcto! Explica por qué quitar la misma cantidad conserva la igualdad.':'Cuenta las canicas que quedaron frente a la caja.'}</p>}
       </div>}
     </div>}
   </div>}
 </section>;
}
export default function Page(){const [activity,setActivity]=useState(0);return <main className={styles.main}><header className={styles.header}><span className={styles.kicker}>MATEMÁTICA · 5.º BÁSICO</span><h1>Singapore Math Lab</h1><p>Ocho desafíos: modelar con barras, interpretar balanzas y construir igualdades.</p></header><nav className={styles.nav} aria-label="Elegir actividad">{Array.from({length:8},(_,i)=><button key={i} className={activity===i?styles.current:styles.navButton} onClick={()=>setActivity(i)}>{i+1}</button>)}</nav><div className={styles.progress}>Actividad {activity+1} de 8 · {activity<4?'Diagramas de barras':activity<6?'Observación de balanzas':'Construcción de balanzas'}</div><h2>{activity<4?problems[activity].title:activity<6?balanceTasks[activity-4].title:buildTasks[activity-6].title}</h2><div key={activity}>{activity<4?<BarActivity idx={activity}/>:activity<6?<ObserveActivity idx={activity-4}/>:<BuildActivity idx={activity-6}/>}</div><footer className={styles.footer}><button className={styles.secondary} disabled={activity===0} onClick={()=>setActivity(v=>v-1)}>← Anterior</button><button disabled={activity===7} onClick={()=>setActivity(v=>v+1)}>Siguiente →</button></footer></main>}
