// November 23 deck: old IDs reused for different reactions must lose old bindings.
const reassignedMapIds=new Set([33,94,120,523,542,551,598,599,600,648,661,665,764,869,894,897,649,2,5]);
for(const r of courseReactions)r.objects=r.objects.filter(id=>!reassignedMapIds.has(id));
for(const m of Object.values(courseMetabolites))m.ids=m.ids.filter(id=>!reassignedMapIds.has(id));
function bindReaction(id,objects){const r=courseReactions.find(r=>r.id===id);r.objects=[...new Set([...r.objects,...objects])];}
function bindCompound(name,ids,chapter,page){
 if(!courseMetabolites[name])courseMetabolite(name,[],chapter,page);
 courseMetabolites[name].ids=[...new Set([...courseMetabolites[name].ids,...ids])];
}
bindReaction('pc',[221,223,226,227]);bindReaction('acc',[382,384,385,386,387,388]);
bindReaction('hmg',[478,480,482,486]);bindReaction('gly-synth',[283,284,285,287]);
const glycogenSynthesis=courseReactions.find(r=>r.id==='gly-synth');glycogenSynthesis.equation='UDP-glucose + glycogen(n) → UDP + glycogen(n+1)';glycogenSynthesis.metabolites=['UDP-Glucose','Glycogen','UDP'];
bindReaction('pfk2',[1050,1052,1053,1056]);bindReaction('ast',[130,131,132,138,139]);
bindReaction('purines',[754,759,764,798,825]);bindReaction('amp-synth',[931,934,936]);bindReaction('impdh',[909,911,914,916]);bindReaction('atcase',[969,970,973]);bindReaction('rnr',[979,980,981,1022,1023,1024,1025,1027]);bindReaction('resp',[297,298,299,302,305]);
const updatedReactionRows=[
 ['pepck','PEP carboxykinase','Oxaloacetate + GTP → phosphoenolpyruvate + GDP + CO₂',['Oxaloacetate','GTP','Phosphoenolpyruvate','GDP','CO2'],'Ch20',9,[234,236,240,257,258,259]],
 ['g6pase','Glucose 6-phosphatase','Glucose 6-phosphate + H₂O → glucose + Pi',['Glucose 6-phosphate','Glucose','Pi'],'Ch20',13,[101,117,118]],
 ['udpg','UDP-glucose pyrophosphorylase','Glucose 1-phosphate + UTP ⇌ UDP-glucose + PPi',['Glucose 1-phosphate','UTP','UDP-Glucose','PPi'],'Ch20',38,[273,274,275,278,281]],
 ['debranch','Glycogen debranching enzyme','Glycogen branch → shorter glycogen + glucose',['Glycogen','Glucose'],'Ch14',49,[904]],
 ['frk','Fructokinase','Fructose + ATP → fructose 1-phosphate + ADP',['Fructose','ATP','Fructose 1-phosphate','ADP'],'Ch14',45,[335,336,337]],
 ['f1ald','Fructose 1-phosphate aldolase','Fructose 1-phosphate ⇌ DHAP + glyceraldehyde',['Fructose 1-phosphate','Dihydroxyacetone phosphate','Glyceraldehyde'],'Ch14',45,[343,344,346,348,349]],
 ['triokinase','Triose kinase','Glyceraldehyde + ATP → glyceraldehyde 3-phosphate + ADP',['Glyceraldehyde','ATP','Glyceraldehyde 3-phosphate','ADP'],'Ch14',45,[353,354,357]],
 ['mannose-hk','Hexokinase (mannose)','Mannose + ATP → mannose 6-phosphate + ADP',['Mannose','ATP','Mannose 6-phosphate','ADP'],'Ch14',45,[367,369,370,374]],
 ['mpi','Phosphomannose isomerase','Mannose 6-phosphate ⇌ fructose 6-phosphate',['Mannose','Mannose 6-phosphate','Fructose 6-phosphate'],'Ch14',45,[371,376]],
 ['complex1','NADH dehydrogenase (Complex I)','NADH + H⁺ + Q → NAD⁺ + QH₂; coupled proton translocation',['NADH','NAD+','Ubiquinone','Ubiquinol'],'Ch19-I',23,[184,185,188,189,194,197]],
 ['complex3','Cytochrome c reductase (Complex III)','QH₂ + oxidized cytochrome c → Q + reduced cytochrome c; proton translocation',['Ubiquinol','Ubiquinone','Oxidized cytochrome c','Reduced cytochrome c'],'Ch19-I',28,[249,250,251,252,265,268,269]],
 ['complex4','Cytochrome c oxidase (Complex IV)','Reduced cytochrome c + O₂ → oxidized cytochrome c + H₂O; proton translocation',['Reduced cytochrome c','Oxidized cytochrome c','Oxygen','Water'],'Ch19-I',34,[288,289,292,294]],
 ['gpd2','Mitochondrial glycerol 3-phosphate dehydrogenase','Glycerol 3-phosphate + Q → DHAP + QH₂',['Glycerol 3-phosphate','Ubiquinone','Dihydroxyacetone phosphate','Ubiquinol'],'Ch19-I',79,[198,199,200,202,212,213]],
 ['ucp','Uncoupling protein 1','Proton return through UCP1 dissipates the gradient as heat',['Proton'],'Ch19-I',72,[324,325,328,330,743]],
 ['acl','ATP citrate lyase','Citrate + ATP + CoA-SH → acetyl-CoA + oxaloacetate + ADP + Pi',['Citrate','ATP','CoA-SH','Acetyl-CoA','Oxaloacetate','ADP','Pi'],'Ch21',30,[426,428,429,434]],
 ['me','Malic enzyme','Malate + NADP⁺ → pyruvate + CO₂ + NADPH',['L-Malate','NADP+','Pyruvate','CO2','NADPH'],'Ch21',30,[409,410,411,414]],
 ['fas','Fatty acid synthase','Acetyl and malonyl units undergo repeated condensation, reduction, dehydration and reduction to form palmitate',['Acetyl-CoA','Malonyl-CoA','Malonyl-ACP','Acyl-KS','Ketoacyl-ACP','Hydroxyacyl-ACP','Enoyl-ACP','Acyl-ACP','Palmitate','NADPH','NADP+'],'Ch21',10,[190,218,219,228,235,243,246,247,248,270,272,276,291,300,338,375,392,394,397,398,401,402,403,405,407]],
 ['gpat','Glycerol phosphate acyltransferases','Glycerol 3-phosphate + 2 acyl-CoA → phosphatidate + 2 CoA-SH',['Glycerol 3-phosphate','Fatty acyl-CoA','Phosphatidate','CoA-SH'],'Ch21',39,[442,443,448]],
 ['pap','Phosphatidate phosphatase','Phosphatidate + H₂O → diacylglycerol + Pi',['Phosphatidate','Diacylglycerol','Pi'],'Ch21',39,[455,456,458]],
 ['dgat','Diacylglycerol acyltransferase','Diacylglycerol + acyl-CoA → triacylglycerol + CoA-SH',['Diacylglycerol','Fatty acyl-CoA','Triacylglycerol','CoA-SH'],'Ch21',39,[460,461,465]],
 ['acat','Cholesterol acyltransferase','Cholesterol + acyl-CoA → cholesteryl ester + CoA-SH',['Cholesterol','Fatty acyl-CoA','Cholesteryl ester','CoA-SH'],'Ch21',52,[498,502]],
 ['prpps','Ribose phosphate pyrophosphokinase','Ribose 5-phosphate + ATP → PRPP + AMP',['Ribose 5-phosphate','ATP','PRPP','AMP'],'Ch22',45,[693,694,695,744]],
 ['gmps','GMP synthetase','XMP + glutamine + ATP → GMP + glutamate + AMP + PPi',['XMP','Glutamine','ATP','GMP','Glutamate','AMP','PPi'],'Ch22',49,[918,919,920,927]],
 ['adsl','Adenylosuccinate lyase','Adenylosuccinate → AMP + fumarate',['Adenylosuccinate','AMP','Fumarate'],'Ch22',49,[928,930]],
 ['cps2','Carbamoyl phosphate synthetase II','Glutamine + HCO₃⁻ + 2 ATP → carbamoyl phosphate + glutamate + 2 ADP + Pi',['Glutamine','Bicarbonate','ATP','Carbamoyl phosphate','Glutamate','ADP','Pi'],'Ch22',53,[938,939,942,945]],
 ['ctps','CTP synthetase','UTP + glutamine + ATP → CTP + glutamate + ADP + Pi',['UTP','Glutamine','ATP','CTP','Glutamate','ADP','Pi'],'Ch22',53,[956,958,962,965]],
 ['dutpase','dUTPase','dUTP + H₂O → dUMP + PPi',['dUTP','dUMP','PPi'],'Ch22',74,[993,994,997]],
 ['tyms','Thymidylate synthase','dUMP + methylene-THF → dTMP + DHF',['dUMP','Methylene-THF','dTMP','DHF'],'Ch22',74,[998,1000,1004]],
 ['shmt','Serine hydroxymethyltransferase','Serine + THF ⇌ glycine + methylene-THF + H₂O',['Serine','THF','Glycine','Methylene-THF'],'Ch22',74,[1005,1006,1010]],
 ['dhfr','Dihydrofolate reductase','DHF + NADPH + H⁺ → THF + NADP⁺',['DHF','NADPH','THF','NADP+'],'Ch22',74,[1011,1012,1015]],
 ['xo','Xanthine oxidase','Hypoxanthine → xanthine → uric acid',['Hypoxanthine','Xanthine','Uric acid','Oxygen','Water'],'Ch22',78,[1035,1036,1037,1038,1043,1044]],
 ['nags','N-Acetylglutamate synthase','Glutamate + acetyl-CoA → N-acetylglutamate + CoA-SH',['Glutamate','Acetyl-CoA','N-Acetylglutamate','CoA-SH'],'Ch18',30,[1057,1060,1064,1065]]
];
updatedReactionRows.forEach(row=>courseReaction(...row));
courseReactions.find(r=>r.id==='tyms').regulation.push(effect('FdUMP','inhibits','FdUMP 抑制胸苷酸合酶，减少 dTMP 合成。','Ch22',89));
courseReactions.find(r=>r.id==='dhfr').regulation.push(effect('Methotrexate','inhibits','甲氨蝶呤抑制二氢叶酸还原酶，减少四氢叶酸再生。','Ch22',89));

const updatedCompounds={
 'Glucose':[123,133], 'Glucose 6-phosphate':[94], 'Phosphoenolpyruvate':[230],
 'Oxaloacetate':[256,427], 'L-Malate':[408], 'Citrate':[424],
 'Acetyl-CoA':[391,431,476,1062], 'Malonyl-CoA':[48],
 'Glutamate':[170,171,783,924,941,961], 'Glutamine':[766,923,940,960],
 'Aspartate':[129,598,935,971], 'Glycerol 3-phosphate':[209],
 'Dihydroxyacetone phosphate':[211,351], 'Ethanol':[332],
 'Fructose':[334], 'Fructose 1-phosphate':[341], 'Glyceraldehyde':[352],
 'Mannose':[365], 'Mannose 6-phosphate':[366], 'Galactose':[381], 'UDP-Galactose':[378],
 'UDP-Glucose':[282], 'Ubiquinone':[191,201,207,215], 'Ubiquinol':[193,203,206],
 'Oxidized cytochrome c':[253], 'Reduced cytochrome c':[254,290], 'Oxygen':[293],
 'Acyl-KS':[210], 'Malonyl-ACP':[233], 'Ketoacyl-ACP':[260], 'Hydroxyacyl-ACP':[277],
 'Enoyl-ACP':[368], 'Acyl-ACP':[396], 'Palmitate':[404,436],
 'Phosphatidate':[447], 'Diacylglycerol':[454], 'Triacylglycerol':[708,459],
 'Glycerophospholipids':[453], 'Acetoacetyl-CoA':[469], 'HMG-CoA':[471],
 'Mevalonate':[479], 'Activated isoprene':[488], 'Squalene':[490], 'Cholesterol':[492],
 'Bile acids':[496,506], 'Bile salts':[497,507], 'Cholesteryl ester':[501,508],
 'Serine':[512,1007], 'Alanine':[542], 'Asparagine':[648], 'Glycine':[1008],
 'PRPP':[742], '5-Phosphoribosylamine':[859], 'IMP':[869],
 'Adenylosuccinate':[897], 'GMP':[907,1028], 'AMP':[908,1029], 'XMP':[917],
 'Fumarate':[929], 'Carbamoyl phosphate':[946], 'UTP':[951], 'CTP':[957],
 'Carbamoyl aspartate':[967], 'UMP':[968], 'ADP':[419], 'ATP':[420,1017],
 'GDP':[452], 'GTP':[463,1018], 'CDP':[915], 'UDP':[974],
 'dNDP':[959,1020], 'dUDP':[976], 'dNTP':[983], 'dUTP':[984], 'dUMP':[996], 'dTMP':[999],
 'Methylene-THF':[1001], 'DHF':[1002], 'THF':[1003], 'NDP':[1019],
 'Xanthine':[1031], 'Hypoxanthine':[1032], 'Uric acid':[1034,1046], 'Thymine':[1048],
 'Fructose 2,6-bisphosphate':[1049], 'N-Acetylglutamate':[1059]
};
for(const [name,ids] of Object.entries(updatedCompounds))bindCompound(name,ids);
// Composite source labels open a choice, rather than assigning several molecules to one ID.
const mapCompoundGroups={157:['Alanine','Serine','Cysteine','Threonine','Glycine','Tryptophan'],158:['Alanine','Cysteine','Tryptophan'],164:['Asparagine','Aspartate'],166:['Phenylalanine','Tyrosine'],168:['Isoleucine','Methionine','Threonine','Valine'],173:['Glutamine','Arginine','Histidine','Proline'],176:['Isoleucine','Leucine','Threonine','Tryptophan'],178:['Leucine','Lysine','Phenylalanine','Threonine','Tryptophan'],514:['Glycine','Cysteine'],518:['Tryptophan','Phenylalanine','Tyrosine'],665:['Glutamine','Proline','Arginine']};
for(const names of Object.values(mapCompoundGroups))for(const name of names)bindCompound(name,[]);
// Record actual compound participation for the previously condensed course summaries.
Object.assign(courseReactions.find(r=>r.id==='amp-synth'),{equation:'IMP + aspartate + GTP → adenylosuccinate + GDP + Pi',metabolites:['IMP','Aspartate','GTP','Adenylosuccinate','GDP','Pi']});
Object.assign(courseReactions.find(r=>r.id==='impdh'),{metabolites:['IMP','XMP','NAD+','NADH']});
Object.assign(courseReactions.find(r=>r.id==='purines'),{name:'Glutamine-PRPP amidotransferase',equation:'PRPP + glutamine → 5-phosphoribosylamine + glutamate + PPi',metabolites:['PRPP','Glutamine','5-Phosphoribosylamine','Glutamate','PPi']});
Object.assign(courseReactions.find(r=>r.id==='atcase'),{metabolites:['Carbamoyl phosphate','Aspartate','Carbamoyl aspartate','Pi']});
courseReactions.find(r=>r.id==='rnr').metabolites.push('CDP','UDP','dADP','dGDP','dCDP','dUDP','NDP','dNDP');
for(const name of ['dADP','dGDP','dCDP'])bindCompound(name,[],'Ch22',62);

// Summary arrows in the source remain marked as multi-step records.
const mapSummaryRows=[
 ['gal-entry','Galactose utilization (multiple steps)','Galactose → UDP-galactose ⇌ UDP-glucose',['Galactose','UDP-Galactose','UDP-Glucose'],'Ch14',45,[377,379]],
 ['pur-ring','Purine ring assembly (multiple steps)','5-Phosphoribosylamine → IMP',['5-Phosphoribosylamine','IMP'],'Ch22',47,[863]],
 ['pyr-ring','Pyrimidine ring assembly (multiple steps)','Carbamoyl aspartate → UMP',['Carbamoyl aspartate','UMP'],'Ch22',53,[948,950,966]],
 ['ump-kinases','UMP phosphorylation (two steps)','UMP + 2 ATP → UTP + 2 ADP',['UMP','ATP','UTP','ADP'],'Ch22',53,[952,955]],
 ['ndpk','Nucleoside diphosphate kinase','dNDP + ATP ⇌ dNTP + ADP',['dNDP','dNTP','dUDP','dUTP','ATP','ADP'],'Ch22',74,[982,985,986]],
 ['chol-start','Cytosolic HMG-CoA formation (two steps)','Acetyl-CoA → acetoacetyl-CoA → HMG-CoA',['Acetyl-CoA','Acetoacetyl-CoA','HMG-CoA'],'Ch21',49,[466,467,468,470,472,473,474,477]],
 ['chol-isoprene','Activated isoprene formation (multiple steps)','Mevalonate → activated isoprene',['Mevalonate','Activated isoprene'],'Ch21',48,[487]],
 ['chol-squalene','Squalene formation (multiple steps)','Activated isoprene → squalene',['Activated isoprene','Squalene'],'Ch21',48,[489]],
 ['chol-final','Cholesterol formation (multiple steps)','Squalene → cholesterol',['Squalene','Cholesterol'],'Ch21',48,[491]],
 ['chol-bile','Bile acid synthesis (multiple steps)','Cholesterol → bile acids and bile salts',['Cholesterol','Bile acids','Bile salts'],'Ch21',51,[493,494,495]],
 ['pur-deg','Purine breakdown to bases (multiple steps)','AMP → hypoxanthine; GMP → xanthine',['AMP','GMP','Hypoxanthine','Xanthine'],'Ch22',78,[1030,1033]],
 ['pyr-deg','Thymine breakdown (multiple steps)','Thymine → methylmalonyl-CoA → succinyl-CoA',['Thymine','L-Methylmalonyl-CoA','Succinyl-CoA'],'Ch22',84,[1047]]
];
mapSummaryRows.forEach(row=>{courseReaction(...row);courseReactions.at(-1).summary=true;});
for(const names of [['Fructose','Mannose','Galactose'],['IMP','XMP','Adenylosuccinate','GMP','AMP'],['Carbamoyl aspartate','UMP','UTP','CTP']]){
 const ref=names[0]==='Fructose'?['Ch14',45]:names[0]==='IMP'?['Ch22',49]:['Ch22',53];
 for(const name of names)courseMetabolites[name].structure=ref;
}
for(const name of ['Methylene-THF','DHF','THF','dTMP','dUMP'])courseMetabolites[name].reference=['Ch22',74];
courseMetabolites['Malonyl-CoA'].structure=['Ch21',10];
courseMetabolites['Cholesterol'].reference=['Ch21',48];

courseReaction('aa-serine','Serine biosynthesis (multiple steps)','3-Phosphoglycerate → serine',['3-Phosphoglycerate','Serine'],'Ch22',25,[511]);
courseReaction('aa-glycys','Glycine and cysteine biosynthesis (multiple steps)','Serine → glycine or cysteine',['Serine','Glycine','Cysteine'],'Ch22',25,[513]);
courseReaction('aa-asn','Asparagine synthetase','Aspartate + glutamine + ATP → asparagine + glutamate + AMP + PPi',['Aspartate','Glutamine','ATP','Asparagine','Glutamate','AMP','PPi'],'Ch22',25,[600]);
courseReaction('aa-aromatic','Aromatic amino acid biosynthesis (multiple steps)','PEP and erythrose 4-phosphate supply the aromatic amino acid pathway in plants and microbes',['Phosphoenolpyruvate','Tryptophan','Phenylalanine','Tyrosine'],'Ch22',30,[523]);
courseReaction('aa-glu-family','Glutamate-family amino acid biosynthesis (multiple steps)','Glutamate → glutamine, proline or arginine',['Glutamate','Glutamine','Proline','Arginine'],'Ch22',25,[661]);
bindReaction('alt',[551]);bindReaction('ast',[599]);
for(const id of ['fas','aa-serine','aa-glycys','aa-aromatic','aa-glu-family'])courseReactions.find(r=>r.id===id).summary=true;
courseMetabolites['Serine'].reference=['Ch22',25];
for(const id of ['aa-serine','aa-glycys','aa-asn','aa-aromatic','aa-glu-family'])for(const name of courseReactions.find(r=>r.id===id).metabolites)bindCompound(name,[]);

// For reactions absent from the lecture excerpts, cite the supplied core map itself.
courseReaction('adh','Alcohol dehydrogenase','Ethanol + NAD⁺ ⇌ acetaldehyde + NADH + H⁺',['Ethanol','NAD+','Acetaldehyde','NADH'],'Atlas',1,[873,874,878]);
courseReaction('aldh','Aldehyde dehydrogenase','Acetaldehyde + NAD⁺ + H₂O → acetate + NADH + H⁺',['Acetaldehyde','NAD+','Acetate','NADH'],'Atlas',1,[879,880,885,888,890,893]);
courseReaction('acss','Acetyl-CoA synthetase','Acetate + CoA-SH + ATP → acetyl-CoA + AMP + PPi',['Acetate','CoA-SH','ATP','Acetyl-CoA','AMP','PPi'],'Atlas',1,[895,896,898,899]);
bindCompound('Acetate',[883,889]);
const mapTransportRows=[
 ['agc','Aspartate–glutamate carrier (AGC1/AGC2)','Mitochondrial aspartate / cytosolic glutamate exchange',['Aspartate','Glutamate'],'Ch19-I',78,[119,125,128,145]],
 ['ogc','Malate–α-ketoglutarate carrier (OGC)','Malate / α-ketoglutarate exchange across the inner mitochondrial membrane',['L-Malate','α-Ketoglutarate'],'Ch19-I',78,[99,100,103,104]],
 ['ant','Adenine nucleotide translocase','ADP import / ATP export across the inner mitochondrial membrane',['ADP','ATP'],'Ch19-I',72,[306,308,310,313,315]],
 ['pic','Phosphate translocase','Phosphate transport into the mitochondrial matrix',['Pi','Proton'],'Ch19-I',72,[307,309,317,320,321]],
 ['citrate-carrier','Citrate transporter','Citrate transport between the mitochondrial matrix and cytosol',['Citrate'],'Ch21',30,[421,422,423,425]],
 ['glut2','GLUT2','Glucose transport across the plasma membrane',['Glucose'],'Atlas',1,[148,154,172,180,181]],
 ['g6pt','Glucose 6-phosphate transporter','Glucose 6-phosphate transport into the endoplasmic reticulum',['Glucose 6-phosphate'],'Ch20',13,[50,57,76,87]],
 ['er-glucose','ER glucose transporter','Glucose transport out of the endoplasmic reticulum',['Glucose'],'Ch20',13,[126,127,134]],
 ['er-pi','ER phosphate transporter','Phosphate transport out of the endoplasmic reticulum',['Pi'],'Ch20',13,[136,137,140,142,143,144]]
];
mapTransportRows.forEach(row=>courseReaction(...row));

// A related course figure is shown separately when no isolated structure is curated.
for(const m of Object.values(courseMetabolites))if(!m.structure&&!m.reference){
 const reaction=courseReactions.find(r=>r.metabolites.includes(m.name)&&r.source[0]!=='Atlas');
 if(reaction)m.reference=reaction.source;
}
// The long dashed links join repeated labels in the source drawing; they are
// not enzyme reactions and must never supply clickable reaction objects.
const referenceLinkIds=new Set(atlasData.objects.filter(o=>o.referenceLink).map(o=>o.id));
for(const r of courseReactions)r.objects=r.objects.filter(id=>!referenceLinkIds.has(id));
for(const m of Object.values(courseMetabolites))m.ids=m.ids.filter(id=>!referenceLinkIds.has(id));
// Shape 828 belongs to the methylmalonyl-CoA -> succinyl-CoA branch,
// not the nearby ketone-body synthesis branch.
courseReactions.find(r=>r.id==='ketone').objects=courseReactions.find(r=>r.id==='ketone').objects.filter(id=>id!==828);
