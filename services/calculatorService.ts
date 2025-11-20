
import { StructuralPart, MaterialQuantities } from '../types';

const unitWeight = (dia: number) => (dia * dia) / 533; // kg per feet (approx for standard bars)
const BRICKS_PER_CFT_AGGREGATE = 9.5;
const DRY_VOLUME_MULTIPLIER = 1.54;
const CEMENT_BAG_VOLUME_CFT = 1.25;

export const calculatePartMaterials = (part: StructuralPart): MaterialQuantities => {
  const { type, data } = part;
  const mixRatioString = data.mixRatio || data.mortarRatio || '';
  
  let cementPart = 0, sandPart = 0, aggregatePart = 0, sumOfRatio = 0;
  
  if (mixRatioString) {
    const ratioParts = mixRatioString.split(':').map(Number);
    cementPart = ratioParts[0];
    sandPart = ratioParts[1];
    aggregatePart = ratioParts[2] || 0;
    sumOfRatio = ratioParts.reduce((a: number, b: number) => a + b, 0);
  }

  let wetVolume = 0;
  let steel: MaterialQuantities = {};
  let formworkArea = 0;

  switch (type) {
    case 'column':
    case 'short-column': {
      const floors = data.numberOfFloors || 1;
      wetVolume = (data.columnWidth / 12) * (data.columnDepth / 12) * data.columnHeight * floors * data.totalColumns;
      formworkArea = 2 * ((data.columnWidth / 12) + (data.columnDepth / 12)) * data.columnHeight * floors * data.totalColumns;

      const totalLen = (data.columnHeight * floors) + (data.lappingLength || 0);
      // Main Bars
      const mainBarWeight = totalLen * data.mainBarCount * data.totalColumns * unitWeight(data.mainBarDia);
      steel[`Steel ${data.mainBarDia}mm (kg)`] = mainBarWeight;

      // Ties
      const tieLen = (2 * (data.columnWidth/12 + data.columnDepth/12)) + (20 * data.tieBarDia / (25.4*12)); 
      const numTies = Math.ceil((totalLen * 12) / data.tieSpacing) * data.totalColumns;
      const tieWeight = tieLen * numTies * unitWeight(data.tieBarDia);
      steel[`Steel ${data.tieBarDia}mm (kg)`] = tieWeight;
      break;
    }
    case 'beam': 
    case 'grade-beam': {
      const effectiveDepth = type === 'beam' && data.slabThickness ? data.beamDepth - data.slabThickness : data.beamDepth;
      wetVolume = (data.beamWidth / 12) * (effectiveDepth / 12) * data.beamLength * data.totalBeams;
      
      formworkArea = (data.beamWidth/12 + 2 * (effectiveDepth/12)) * data.beamLength * data.totalBeams; 

      const devLength = data.supportWidth ? data.supportWidth : 0;
      const totalLength = data.beamLength + devLength;

      const mainBarTopWeight = totalLength * (data.mainTopCount || 2) * data.totalBeams * unitWeight(data.mainTopDia || 16);
      const mainBarBottomWeight = totalLength * (data.mainBottomCount || 2) * data.totalBeams * unitWeight(data.mainBottomDia || 16);
      const extraTopWeight = (data.beamLength / 3) * (data.extraTopCount || 0) * data.totalBeams * 2 * unitWeight(data.extraTopDia || 16);

      steel[`Steel ${data.mainTopDia}mm (kg)`] = (steel[`Steel ${data.mainTopDia}mm (kg)`] || 0) as number + mainBarTopWeight;
      steel[`Steel ${data.mainBottomDia}mm (kg)`] = (steel[`Steel ${data.mainBottomDia}mm (kg)`] || 0) as number + mainBarBottomWeight;
      if(data.extraTopCount) steel[`Steel ${data.extraTopDia}mm (kg)`] = (steel[`Steel ${data.extraTopDia}mm (kg)`] || 0) as number + extraTopWeight;

      const stirrupLen = (2 * (data.beamWidth/12 + data.beamDepth/12));
      const numStirrups = Math.ceil((data.beamLength * 12) / (data.stirrupSpacing || 6)) * data.totalBeams;
      const stirrupWeight = stirrupLen * numStirrups * unitWeight(data.stirrupDia || 10);
      steel[`Steel ${data.stirrupDia || 10}mm (kg)`] = (steel[`Steel ${data.stirrupDia || 10}mm (kg)`] || 0) as number + stirrupWeight;
      break;
    }
    case 'slab': {
      wetVolume = data.length * data.width * (data.thickness / 12);
      formworkArea = data.length * data.width;

      const mainSpacingFt = (data.mainBarSpacing || 6) / 12;
      const numMainBars = Math.ceil(data.width / mainSpacingFt); 
      const mainBarWeight = numMainBars * data.length * unitWeight(data.mainBarDia);
      steel[`Steel ${data.mainBarDia}mm (kg)`] = mainBarWeight;

      const distSpacingFt = (data.distBarSpacing || 8) / 12;
      const numDistBars = Math.ceil(data.length / distSpacingFt);
      const distBarWeight = numDistBars * data.width * unitWeight(data.distBarDia);
      steel[`Steel ${data.distBarDia}mm (kg)`] = distBarWeight;
      break;
    }
    case 'brickwork': {
      if (sumOfRatio === 0) return {};
      const grossVol = data.totalWallLength * data.wallHeight * (data.wallThickness / 12);
      const doorArea = (data.numberOfDoors || 0) * (data.doorHeight || 0) * (data.doorWidth || 0);
      const windowArea = (data.numberOfWindows || 0) * (data.windowHeight || 0) * (data.windowWidth || 0);
      const netArea = (data.totalWallLength * data.wallHeight) - doorArea - windowArea;
      const netVol = netArea * (data.wallThickness / 12);
      
      const totalBricks = netVol * (data.bricksPerCft || 11.5);
      const totalBricksWithWastage = totalBricks * (1 + (data.brickWastage || 0)/100);

      const mortarWet = netVol * 0.25;
      const mortarDry = mortarWet * 1.33 * (1 + (data.mortarWastage || 0)/100);
      
      const cementBags = (mortarDry * cementPart) / (sumOfRatio * CEMENT_BAG_VOLUME_CFT);
      const sandCft = (mortarDry * sandPart) / sumOfRatio;

      return {
        'Total Bricks (Nos.)': Math.ceil(totalBricksWithWastage),
        'Cement (bags)': Math.ceil(cementBags),
        'Sand (cft)': parseFloat(sandCft.toFixed(2)),
      };
    }
    case 'earthwork': {
        return {
            'Earthwork Volume (cft)': data.length * data.width * data.depth,
            ...(data.estimation ? {'Estimated Time': data.estimation.time, 'Manpower': data.estimation.manpower} : {})
        };
    }
    case 'pile': {
         const r = (data.pileDiameter / 12) / 2;
         wetVolume = Math.PI * r * r * data.pileLength * data.totalPiles;
         const mainSteel = (data.pileLength + (data.lappingLength || 0)) * data.mainBarCount * data.totalPiles * unitWeight(data.mainBarDia);
         steel[`Steel ${data.mainBarDia}mm (kg)`] = mainSteel;
         
         const tieLenPerFt = Math.PI * (data.pileDiameter / 12) * (12 / data.tieSpacing);
         const totalTieLen = tieLenPerFt * data.pileLength * data.totalPiles;
         const tieWeight = totalTieLen * unitWeight(data.tieBarDia);
         steel[`Steel ${data.tieBarDia}mm (kg)`] = tieWeight;
         break;
    }
    case 'pile-cap': 
    case 'standalone-footing':
    case 'combined-footing':
    case 'mat-foundation': {
        const count = data.totalCaps || data.totalFoundations || data.totalFootings || 1;
        const depth = data.depth || data.thickness;
        wetVolume = data.length * data.width * (depth / 12) * count;
        formworkArea = 2 * (data.length + data.width) * (depth / 12) * count;

        const spacingA = (data.mainBarSpacing || data.barSpacing) / 12;
        const numBarsA = Math.ceil(data.width / spacingA) + 1;
        const lenA = data.length * numBarsA;
        
        const spacingB = (data.mainBarSpacing || data.barSpacing) / 12;
        const numBarsB = Math.ceil(data.length / spacingB) + 1;
        const lenB = data.width * numBarsB;
        
        const layers = type === 'standalone-footing' ? 1 : 2;
        const dia = data.mainBarDia || data.barDia;
        
        const totalLen = (lenA + lenB) * layers * count;
        const weight = totalLen * unitWeight(dia);
        
        steel[`Steel ${dia}mm (kg)`] = weight;
        break;
    }
    case 'staircase': {
        const inclinedLen = Math.sqrt(Math.pow(data.flightLength, 2) + Math.pow(data.flightHeight, 2));
        const waistVol = inclinedLen * data.flightWidth * (data.waistSlabThickness/12);
        
        const numSteps = (data.flightHeight * 12) / data.riserHeight;
        const stepVol = (data.riserHeight/12) * (data.treadWidth/12) * 0.5 * data.flightWidth * numSteps;
        const landingVol = data.landingLength * data.landingWidth * (data.landingSlabThickness/12);
        wetVolume = (waistVol + stepVol + landingVol) * data.numberOfFlights;
        formworkArea = (inclinedLen * data.flightWidth + data.landingLength * data.landingWidth) * data.numberOfFlights;

        const mainBarLen = inclinedLen + data.landingLength;
        const numMainBars = Math.ceil(data.flightWidth / (data.mainBarSpacing/12));
        const mainWeight = mainBarLen * numMainBars * data.numberOfFlights * unitWeight(data.mainBarDia);
        steel[`Steel ${data.mainBarDia}mm (kg)`] = mainWeight;
        
        const distBarLen = data.flightWidth;
        const numDistBars = Math.ceil(mainBarLen / (data.distBarSpacing/12));
        const distWeight = distBarLen * numDistBars * data.numberOfFlights * unitWeight(data.distBarDia);
        steel[`Steel ${data.distBarDia}mm (kg)`] = distWeight;
        break;
    }
    case 'retaining-wall': {
        const stemVol = data.wallLength * data.wallHeight * (((data.stemThicknessTop + data.stemThicknessBottom)/2)/12);
        const baseVol = data.wallLength * data.baseSlabWidth * (data.baseSlabThickness/12);
        wetVolume = stemVol + baseVol;
        formworkArea = data.wallLength * data.wallHeight * 2;

        const numVert = Math.ceil(data.wallLength / (data.verticalBarSpacing/12));
        const vertWeight = numVert * data.wallHeight * unitWeight(data.verticalBarDia);
        steel[`Steel ${data.verticalBarDia}mm (kg)`] = vertWeight;

        const numHorz = Math.ceil(data.wallHeight / (data.horizontalBarSpacing/12));
        const horzWeight = numHorz * data.wallLength * unitWeight(data.horizontalBarDia);
        steel[`Steel ${data.horizontalBarDia}mm (kg)`] = horzWeight;
        
        const numBaseMain = Math.ceil(data.wallLength / (data.baseSlabSpacing/12));
        const baseMainWeight = numBaseMain * data.baseSlabWidth * unitWeight(data.baseSlabDia);
        steel[`Steel ${data.baseSlabDia}mm (kg)`] = (steel[`Steel ${data.baseSlabDia}mm (kg)`] || 0) as number + baseMainWeight;
        break;
    }
    case 'cc-casting': {
        wetVolume = data.length * data.width * (data.thickness / 12);
        break;
    }
  }

  if (sumOfRatio === 0) return steel;

  const dryVolume = wetVolume * DRY_VOLUME_MULTIPLIER;
  const cementBags = (dryVolume * cementPart) / (sumOfRatio * CEMENT_BAG_VOLUME_CFT);
  const sandCft = (dryVolume * sandPart) / sumOfRatio;
  const aggCft = aggregatePart ? (dryVolume * aggregatePart) / sumOfRatio : 0;

  const materials: MaterialQuantities = {
    'Cement (bags)': Math.ceil(cementBags),
    'Sand (cft)': parseFloat(sandCft.toFixed(2)),
    ...steel
  };

  if (aggCft > 0) {
    materials['Aggregate (cft)'] = parseFloat(aggCft.toFixed(2));
    materials['Bricks for Aggregate (Nos.)'] = Math.ceil(aggCft * BRICKS_PER_CFT_AGGREGATE);
  }
  
  if (formworkArea > 0) {
      materials['Formwork (sq.ft)'] = parseFloat(formworkArea.toFixed(2));
  }

  return materials;
};

export const calculateAllPartsMaterials = (parts: StructuralPart[]) => {
    return parts.map(part => {
        const materials = calculatePartMaterials(part);
        return { part, materials: materials || {} };
    });
};

export const aggregateMaterials = (allMaterials: any[] | StructuralPart[]) => {
    const total: any = {};
    let materialsToAggregate = allMaterials;

    // Check if input is StructuralPart[] and convert if needed
    if (allMaterials.length > 0 && 'type' in allMaterials[0]) {
        materialsToAggregate = calculateAllPartsMaterials(allMaterials as StructuralPart[]);
    }

    materialsToAggregate.forEach((item: any) => {
        const materials = item.materials || calculatePartMaterials(item); // Handle both formats
        if (materials) {
             Object.entries(materials).forEach(([key, val]) => {
                if (typeof val === 'number') {
                    total[key] = (total[key] || 0) + val;
                }
            });
        }
    });
    
    Object.keys(total).forEach(key => {
         if(typeof total[key] === 'number') {
             total[key] = Math.ceil(total[key] * 100) / 100;
         }
    });
    return total;
}
