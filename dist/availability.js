// Teaching-context rules, not a claim that every visible pathway is active.
// Animal profiles refer to mammalian physiology. Broad/unspecified profiles
// retain uncertain pathways; species and growth conditions need finer profiles.
function isPathwayAvailable(path, group, cell) {
  const photosyntheticPlants = ['C₃ Photosynthetic Cell', 'C₄ Mesophyll Cell', 'C₄ Bundle Sheath Cell'];
  const oxygenicMicrobes = ['Cyanobacterium', 'Algal Cell', 'Red Algal Cell'];
  const phototrophs = [...oxygenicMicrobes, 'Purple Photosynthetic Bacterium', 'Green Sulfur Bacterium'];
  switch (path) {
    case 'Thermogenesis':
      return group==='Animal' && cell==='Brown Adipocyte';
    case 'Aromatic Amino Acid Biosynthesis':
      return group!=='Animal';
    case 'Ethanol Metabolism':
      // This diagram represents hepatic ethanol oxidation, not all tissue or microbial alcohol pathways.
      return group === 'Animal' && cell === 'Hepatocyte';
    case 'Gluconeogenesis':
      return group !== 'Animal' || ['Hepatocyte', 'Renal Cell / Renal Cortex', 'Intestinal Epithelial Cell'].includes(cell);
    case 'Glyoxylate Cycle':
      return group !== 'Animal';
    case 'Light Reactions':
      return group === 'Plant' ? photosyntheticPlants.includes(cell) : group === 'Microbial' && phototrophs.includes(cell);
    case 'Calvin–Benson Cycle':
      return group === 'Plant' ? ['C₃ Photosynthetic Cell', 'C₄ Bundle Sheath Cell'].includes(cell) : group === 'Microbial' && [...oxygenicMicrobes, 'Purple Photosynthetic Bacterium'].includes(cell);
    case 'Photorespiration':
      return group === 'Plant' ? ['C₃ Photosynthetic Cell', 'C₄ Bundle Sheath Cell'].includes(cell) : group === 'Microbial' && oxygenicMicrobes.includes(cell);
    case 'C₄ Carbon Assimilation':
      // Both cell types participate; neither completes the intercellular cycle alone.
      return group === 'Plant' && ['C₄ Mesophyll Cell', 'C₄ Bundle Sheath Cell'].includes(cell);
    case 'Starch & Sucrose Metabolism':
      return group === 'Plant' || ['Algal Cell', 'Red Algal Cell'].includes(cell);
    case 'Cori Cycle':
    case 'Glucose–Alanine Cycle':
      // Organ cooperation remains accessible from either principal participant.
      return group === 'Animal' && ['Hepatocyte', 'Skeletal Muscle Cell'].includes(cell);
    case 'Lipoprotein Transport':
      return group === 'Animal';
    default:
      return true;
  }
}
