export type QuestionDTO={id:string;position:number;title:string;statement:string;modelType:string;total:number;known:number;answer:number;totalLabel:string;knownLabel:string;unknownLabel:string;unit:string};
export type ActivityDTO={id:string;title:string;grade:number;objective:string;questions:QuestionDTO[]};
export type Placement={whole:string;part1:string;part2:string};
export type BarModel={whole:string;part1:string;part2:string;relationship:string};
export const blankPlacement=():Placement=>({whole:"",part1:"",part2:""});
export const format=(n:number)=>new Intl.NumberFormat("es-CL").format(n);
