
const updatedRouteRows=[
 ['pepck','Oxaloacetate','Phosphoenolpyruvate','Gluconeogenesis'],
 ['g6pase','Glucose 6-phosphate','Glucose','Gluconeogenesis'],
 ['udpg','Glucose 1-phosphate','UDP-Glucose','Glycogen Metabolism',true],
 ['gly-synth','UDP-Glucose','Glycogen','Glycogen Metabolism'],
 ['debranch','Glycogen','Glucose','Glycogen Metabolism'],
 ['frk','Fructose','Fructose 1-phosphate','Fructose Metabolism'],
 ['f1ald','Fructose 1-phosphate','Dihydroxyacetone phosphate','Fructose Metabolism',true],
 ['f1ald','Fructose 1-phosphate','Glyceraldehyde','Fructose Metabolism',true],
 ['triokinase','Glyceraldehyde','Glyceraldehyde 3-phosphate','Fructose Metabolism'],
 ['mannose-hk','Mannose','Mannose 6-phosphate','Mannose Metabolism'],
 ['mpi','Mannose 6-phosphate','Fructose 6-phosphate','Mannose Metabolism',true],
 ['gal-entry','Galactose','UDP-Galactose','Galactose Metabolism'],
 ['gal-entry','UDP-Galactose','UDP-Glucose','Galactose Metabolism',true],
 ['acl','Citrate','Acetyl-CoA','Fatty Acid Biosynthesis'],
 ['acl','Citrate','Oxaloacetate','Fatty Acid Biosynthesis'],
 ['me','L-Malate','Pyruvate','Fatty Acid Biosynthesis'],
 ['fas','Acetyl-CoA','Palmitate','Fatty Acid Biosynthesis'],
 ['fas','Malonyl-CoA','Palmitate','Fatty Acid Biosynthesis'],
 ['gpat','Glycerol 3-phosphate','Phosphatidate','Triacylglycerol Metabolism'],
 ['pap','Phosphatidate','Diacylglycerol','Triacylglycerol Metabolism'],
 ['dgat','Diacylglycerol','Triacylglycerol','Triacylglycerol Metabolism'],
 ['chol-start','Acetyl-CoA','Acetoacetyl-CoA','Cholesterol Metabolism'],
 ['chol-start','Acetoacetyl-CoA','HMG-CoA','Cholesterol Metabolism'],
 ['chol-isoprene','Mevalonate','Activated isoprene','Cholesterol Metabolism'],
 ['chol-squalene','Activated isoprene','Squalene','Cholesterol Metabolism'],
 ['chol-final','Squalene','Cholesterol','Cholesterol Metabolism'],
 ['acat','Cholesterol','Cholesteryl ester','Cholesterol Metabolism'],
 ['chol-bile','Cholesterol','Bile acids','Cholesterol Metabolism'],
 ['prpps','Ribose 5-phosphate','PRPP','Purine Biosynthesis'],
 ['purines','PRPP','5-Phosphoribosylamine','Purine Biosynthesis'],
 ['pur-ring','5-Phosphoribosylamine','IMP','Purine Biosynthesis'],
 ['amp-synth','IMP','Adenylosuccinate','Purine Biosynthesis'],
 ['adsl','Adenylosuccinate','AMP','Purine Biosynthesis'],
 ['impdh','IMP','XMP','Purine Biosynthesis'],
 ['gmps','XMP','GMP','Purine Biosynthesis'],
 ['atcase','Aspartate','Carbamoyl aspartate','Pyrimidine Biosynthesis'],
 ['atcase','Carbamoyl phosphate','Carbamoyl aspartate','Pyrimidine Biosynthesis'],
 ['pyr-ring','Carbamoyl aspartate','UMP','Pyrimidine Biosynthesis'],
 ['ump-kinases','UMP','UTP','Pyrimidine Biosynthesis'],
 ['ctps','UTP','CTP','Pyrimidine Biosynthesis'],
 ['rnr','ADP','dADP','Deoxyribonucleotide Biosynthesis'],
 ['rnr','GDP','dGDP','Deoxyribonucleotide Biosynthesis'],
 ['rnr','CDP','dCDP','Deoxyribonucleotide Biosynthesis'],
 ['rnr','UDP','dUDP','Deoxyribonucleotide Biosynthesis'],
 ['ndpk','dUDP','dUTP','Deoxyribonucleotide Biosynthesis',true],
 ['dutpase','dUTP','dUMP','Deoxyribonucleotide Biosynthesis'],
 ['tyms','dUMP','dTMP','Deoxyribonucleotide Biosynthesis'],
 ['pur-deg','AMP','Hypoxanthine','Purine Degradation'],
 ['pur-deg','GMP','Xanthine','Purine Degradation'],
 ['xo','Hypoxanthine','Xanthine','Purine Degradation'],
 ['xo','Xanthine','Uric acid','Purine Degradation'],
 ['pyr-deg','Thymine','L-Methylmalonyl-CoA','Pyrimidine Degradation'],
 ['pyr-deg','L-Methylmalonyl-CoA','Succinyl-CoA','Pyrimidine Degradation']
];
updatedRouteRows.forEach(row=>routeStep(...row));
Object.assign(compoundAliases,{'Fructose':['Fru'],'Fructose 1-phosphate':['F1P'],'Mannose':['Man'],'Mannose 6-phosphate':['M6P'],'Galactose':['Gal'],'UDP-Glucose':['UDPG'],'UDP-Galactose':['UDPGal'],'Palmitate':['C16:0'],'Phosphatidate':['PA'],'Diacylglycerol':['DAG'],'Triacylglycerol':['TAG','TG'],'Ubiquinone':['Q','CoQ'],'Ubiquinol':['QH2'],'Adenylosuccinate':['AdSucc'],'Carbamoyl aspartate':['Carbamoylaspartate'],'Methylene-THF':['5,10-methylene-THF'],'N-Acetylglutamate':['NAG']});
Object.assign(enzymeAliases,{pepck:['PEPCK','PCK'],g6pase:['G6Pase','G6PC'],udpg:['UGPase'],frk:['KHK','Fructokinase'],f1ald:['ALDOB'],triokinase:['TKFC'],mpi:['MPI','PMI'],complex1:['Complex I','Complex 1','CI'],complex3:['Complex III','Complex 3','CIII'],complex4:['Complex IV','Complex 4','CIV'],gpd2:['GPD2'],ucp:['UCP1','Thermogenin'],acl:['ACLY','ACL'],me:['ME','ME1'],fas:['FAS','FASN','KS','KR','HD','ER','AT','MT','TE'],gpat:['GPAT'],pap:['PAP','Lipin'],dgat:['DGAT'],acat:['ACAT','SOAT'],prpps:['PRPPS'],gmps:['GMPS'],adsl:['ADSL'],cps2:['CPS2','CPS-II'],ctps:['CTPS'],dutpase:['DUT','dUTPase'],tyms:['TYMS','TS'],dhfr:['DHFR'],shmt:['SHMT'],xo:['XO','XOR'],nags:['NAGS']});

routeStep('aa-serine','3-Phosphoglycerate','Serine','Amino Acid Biosynthesis');
routeStep('aa-glycys','Serine','Glycine','Amino Acid Biosynthesis');
routeStep('aa-glycys','Serine','Cysteine','Amino Acid Biosynthesis');
routeStep('aa-asn','Aspartate','Asparagine','Amino Acid Biosynthesis');
for(const name of ['Tryptophan','Phenylalanine','Tyrosine'])routeStep('aa-aromatic','Phosphoenolpyruvate',name,'Aromatic Amino Acid Biosynthesis');
for(const name of ['Glutamine','Proline','Arginine'])routeStep('aa-glu-family','Glutamate',name,'Amino Acid Biosynthesis');
Object.assign(compoundAliases,{'Serine':['Ser'],'Glycine':['Gly'],'Asparagine':['Asn'],'Tryptophan':['Trp'],'Phenylalanine':['Phe'],'Tyrosine':['Tyr'],'Proline':['Pro'],'Cysteine':['Cys']});

routeStep('adh','Ethanol','Acetaldehyde','Ethanol Metabolism',true);
routeStep('aldh','Acetaldehyde','Acetate','Ethanol Metabolism');
routeStep('acss','Acetate','Acetyl-CoA','Ethanol Metabolism');
Object.assign(compoundAliases,{'Acetate':['AcO','Acetate']});
Object.assign(enzymeAliases,{adh:['ADH'],aldh:['ALDH','ALDH1','ALDH2'],acss:['ACSS','ACSS2'],agc:['AGC1','AGC2'],ogc:['OGC'],ant:['ANT'],pic:['PiC'],g6pt:['G6PT'],'citrate-carrier':['CIC','SLC25A1'],glut2:['GLUT2']});
