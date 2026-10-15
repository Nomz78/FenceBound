const o=require(process.argv[2]);for(const[k,v]of Object.entries(o)){if(!v||v.error||!v.bom||!v.addons){console.log("\n=== "+k,JSON.stringify(v));continue;}
console.log("\n=== "+k,"h="+v.heightIn,"sp="+v.spacing,"postH="+v.postHeightIn,"embed="+JSON.stringify(v.embed),"mid="+v.mid,"addons="+v.addons.join(","));
console.log("stats",JSON.stringify(v.stats),"posts@",v.linePostPositions.join(" "));
v.bom.forEach(r=>console.log("  ",r.qty,r.unit,"|",r.name,"->",r.key,r.dbUnit,r.cost));console.log("  pricing",JSON.stringify(v.pricing));}
