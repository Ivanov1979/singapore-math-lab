export type Problem = {id:number; story:string; tokens:string[]; left:string[]; right:string[]; amount:number; answer:number; question:string};
export const problems:Problem[]=[
{id:1,story:'Para una convivencia necesitamos $15.000. Ya reunimos $6.000. ¿Cuánto dinero falta?',tokens:['x','6.000','15.000'],left:['6.000','x'],right:['15.000'],amount:6000,answer:9000,question:'¿Por qué el total debe quedar en un platillo y las partes en el otro?'},
{id:2,story:'Una biblioteca tenía algunos libros. Recibió 12 libros y ahora tiene 30. ¿Cuántos tenía al principio?',tokens:['x','12','30'],left:['x','12'],right:['30'],amount:12,answer:18,question:'¿Qué representa x en esta situación?'},
{id:3,story:'En una campaña reunieron 48 botellas. El lunes juntaron 19. ¿Cuántas reunieron el martes?',tokens:['x','19','48'],left:['19','x'],right:['48'],amount:19,answer:29,question:'¿Cómo sabes que 48 representa el total?'},
{id:4,story:'Un curso tenía 42 lápices. Entregó algunos y quedaron 17. ¿Cuántos lápices entregó?',tokens:['x','17','42'],left:['17','x'],right:['42'],amount:17,answer:25,question:'¿Por qué la cantidad entregada es una parte del total inicial?'},
{id:5,story:'Para comprar materiales se necesitan $24.000. Un grupo aporta $9.000 y el resto lo aporta otro grupo. ¿Cuánto aporta el segundo grupo?',tokens:['x','9.000','24.000'],left:['9.000','x'],right:['24.000'],amount:9000,answer:15000,question:'¿Qué relación existe entre las partes y el total?'}
];
