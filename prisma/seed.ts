import {PrismaClient} from "@prisma/client";
const db=new PrismaClient();
async function main(){
 let activity=await db.activity.findFirst({where:{title:"Modelamos con barras de Singapur"}});
 if(!activity)activity=await db.activity.create({data:{title:"Modelamos con barras de Singapur",grade:5,objective:"Modelar y resolver situaciones problemáticas cotidianas mediante ecuaciones de un paso que involucren adiciones y sustracciones, utilizando representaciones pictóricas y simbólicas, explicando sus procedimientos y respetando las ideas de sus compañeros."}});
 const qs=[
 ["La convivencia","El curso reunió $15.000 para una convivencia. Gastó $6.000 en materiales. ¿Cuánto dinero queda?",15000,6000,"Dinero reunido","Dinero gastado","Dinero restante","pesos"],
 ["Biblioteca del curso","Hay 85 libros en la biblioteca del curso. De ellos, 37 son de ciencias y el resto son cuentos. ¿Cuántos son de cuentos?",85,37,"Total de libros","Libros de ciencias","Libros de cuentos","libros"],
 ["Materiales de clase","Para una actividad necesitamos 45 lápices. Ya tenemos 28. ¿Cuántos lápices faltan?",45,28,"Lápices necesarios","Lápices disponibles","Lápices faltantes","lápices"],
 ["Desafío de lectura","Una estudiante quiere leer 60 páginas. Ya leyó 36. ¿Cuántas páginas le faltan?",60,36,"Meta de páginas","Páginas leídas","Páginas pendientes","páginas"]
 ] as const;
 for(let i=0;i<qs.length;i++){
 const [title,statement,total,known,totalLabel,knownLabel,unknownLabel,unit]=qs[i];
 await db.question.upsert({where:{activityId_position:{activityId:activity.id,position:i+1}},update:{},create:{activityId:activity.id,position:i+1,title,statement,total,known,answer:total-known,totalLabel,knownLabel,unknownLabel,unit}});
 }
 console.log(`Seeded activity ${activity.id} with 4 questions`);
}
main().finally(()=>db.$disconnect());
