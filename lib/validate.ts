import type {BarModel,Placement,QuestionDTO} from "./types";
export function correctPlacement(p:Placement,q:QuestionDTO){return p.whole===String(q.total)&&p.part1===String(q.known)&&p.part2==="x";}
export function correctBar(b:BarModel,q:QuestionDTO){return b.whole===String(q.total)&&b.part1===String(q.known)&&b.part2==="x"&&b.relationship==="part+part=whole";}
export function correctEquation(tokens:string[],q:QuestionDTO){
 const s=tokens.join("");if(!/^[0-9x+\-=]+$/.test(s))return false;
 const parts=s.split("=");if(parts.length!==2||!s.includes("x"))return false;
 const evalSide=(side:string,x:number)=>{const expanded=side.replaceAll("x",String(x));if(!/^\d+(?:[+-]\d+)*$/.test(expanded))return NaN;return (expanded.match(/[+-]?\d+/g)||[]).reduce((a,v)=>a+Number(v),0);};
 return evalSide(parts[0],q.answer)===evalSide(parts[1],q.answer)
  && evalSide(parts[0],q.answer+1)!==evalSide(parts[1],q.answer+1)
  && s.includes(String(q.total))&&s.includes(String(q.known));
}
