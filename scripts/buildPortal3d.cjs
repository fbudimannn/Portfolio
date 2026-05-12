const fs = require('fs');
let code = fs.readFileSync('portal/index.js', 'utf8');

// Replace imports
code = code.replace(/import \{ (.*?) \} from 'three\/addons\/(.*?)'/g, "import { $1 } from 'three/examples/jsm/$2'");

// Replace top
const top = `export function init3DPortal(container) {
    if (!container) return null;
    const width = container.clientWidth;
    const height = container.clientHeight;
`;
code = code.replace('// Scene setup', top + '\n    // Scene setup');

code = code.replace('scene.background = new THREE.Color(0x000000);', 'scene.background = null;');
code = code.replace(/window\.innerWidth/g, 'width');
code = code.replace(/window\.innerHeight/g, 'height');
code = code.replace('new THREE.WebGLRenderer({ antialias: true });', 'new THREE.WebGLRenderer({ antialias: true, alpha: true });\n    renderer.setClearColor(0x000000, 0);');
code = code.replace(/const root = document\.getElementById\('root'\) \?\? document\.body;\s*root\.appendChild\(renderer\.domElement\);/g, 'container.appendChild(renderer.domElement);');

code = code.replace('renderer.setAnimationLoop(animate);', "container.dataset.initialized = 'true';");

const bottom = `
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
        composer.setSize(newWidth, newHeight);
    });

    return {
        start: () => renderer.setAnimationLoop(animate),
        stop: () => renderer.setAnimationLoop(null)
    };
}
`;

code = code.replace(/\/\/ Resize[\s\S]*/, bottom);

fs.writeFileSync('src/portal3d.js', code);
console.log('Fixed src/portal3d.js');
