const fs = require('fs');
let code = fs.readFileSync('src/portal3d.js', 'utf8');
code = code.replace(/const PHASE_COLLAPSE = 22\.0;\r?\nconst PHASE_END = 25\.0;\r?\n/g, '');
code = code.replace(/    \} else if \(animTime < PHASE_COLLAPSE\) \{[\s\S]*?    \} else \{[\s\S]*?groundGeom\.attributes\.aAlpha\.needsUpdate = true;\r?\n    \}/g, `    } else {
        // Full portal phase
        portalScale = 1.0;
        portalAlpha = 1.0;
        sparkAlpha = 0;
    }`);
code = code.replace(/    \/\/ Fade ground sparks during collapse[\s\S]*?groundGeom\.attributes\.aAlpha\.needsUpdate = true;/g, '    groundGeom.attributes.aAlpha.needsUpdate = true;');
fs.writeFileSync('src/portal3d.js', code);
console.log('Phases removed');
