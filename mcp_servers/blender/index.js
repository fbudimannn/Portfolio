import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const BLENDER_PATH = process.env.BLENDER_PATH || 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';

function executeBlenderPython(pythonScriptContent, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const tempScriptPath = path.join(process.cwd(), 'scratch', `blender_script_${Date.now()}.py`);
    fs.mkdirSync(path.dirname(tempScriptPath), { recursive: true });
    fs.writeFileSync(tempScriptPath, pythonScriptContent, 'utf8');

    const child = spawn(BLENDER_PATH, ['--background', '--python', tempScriptPath], {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      child.kill();
      cleanup();
      reject(new Error(`Blender process timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      try { fs.unlinkSync(tempScriptPath); } catch (e) {}
    }

    child.on('close', (code) => {
      cleanup();
      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        resolve({ success: false, code, stdout, stderr });
      }
    });

    child.on('error', (err) => {
      cleanup();
      reject(err);
    });
  });
}

// JSON-RPC 2.0 MCP Protocol Handler
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

function sendResponse(id, result) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(msg + '\n');
}

function sendError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
  process.stdout.write(msg + '\n');
}

const TOOLS = [
  {
    name: 'blender_run_python',
    description: 'Execute custom Python script (using bpy module) in Blender headless background mode.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Python script code using Blender bpy API' }
      },
      required: ['code']
    }
  },
  {
    name: 'blender_export_glb',
    description: 'Create 3D meshes (cube, sphere, cylinder, torus, planet, space_station) and export as WebGL ready .glb file.',
    inputSchema: {
      type: 'object',
      properties: {
        shape_type: { type: 'string', enum: ['cube', 'sphere', 'cylinder', 'torus', 'ico_sphere', 'monkey', 'custom'], description: '3D shape type to generate' },
        output_path: { type: 'string', description: 'Absolute or relative output file path ending in .glb or .gltf' },
        color_hex: { type: 'string', description: 'Hex color string e.g. #38bdf8' },
        metallic: { type: 'number', description: 'Metallic material property 0.0 to 1.0' },
        roughness: { type: 'number', description: 'Roughness material property 0.0 to 1.0' }
      },
      required: ['shape_type', 'output_path']
    }
  },
  {
    name: 'blender_render_image',
    description: 'Render a 3D scene script to a PNG/JPEG image using Eevee or Cycles render engine.',
    inputSchema: {
      type: 'object',
      properties: {
        output_image_path: { type: 'string', description: 'Output image file path e.g. public/rendered_scene.png' },
        engine: { type: 'string', enum: ['BLENDER_EEVEE_NEXT', 'CYCLES'], default: 'BLENDER_EEVEE_NEXT' },
        resolution_x: { type: 'number', default: 1024 },
        resolution_y: { type: 'number', default: 1024 }
      },
      required: ['output_image_path']
    }
  }
];

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);

    if (req.method === 'initialize') {
      sendResponse(req.id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'blender-mcp-server', version: '1.0.0' }
      });
      return;
    }

    if (req.method === 'tools/list') {
      sendResponse(req.id, { tools: TOOLS });
      return;
    }

    if (req.method === 'tools/call') {
      const { name, arguments: args } = req.params;

      if (name === 'blender_run_python') {
        const res = await executeBlenderPython(args.code);
        sendResponse(req.id, { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] });
        return;
      }

      if (name === 'blender_export_glb') {
        const targetPath = path.resolve(args.output_path);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        const script = `
import bpy

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

shape = "${args.shape_type}"
if shape == "cube":
    bpy.ops.mesh.primitive_cube_add(size=2)
elif shape == "sphere" or shape == "ico_sphere":
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=1.5)
elif shape == "cylinder":
    bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=2)
elif shape == "torus":
    bpy.ops.mesh.primitive_torus_add(major_radius=1.5, minor_radius=0.5)
elif shape == "monkey":
    bpy.ops.mesh.primitive_monkey_add(size=2)

obj = bpy.context.active_object

# Create material
mat = bpy.data.materials.new(name="MCP_Material")
mat.use_nodes = True
nodes = mat.node_tree.nodes
principled = nodes.get("Principled BSDF")

# Color hex parsing
hex_code = "${args.color_hex || '#38bdf8'}".lstrip("#")
if len(hex_code) == 6:
    r = int(hex_code[0:2], 16) / 255.0
    g = int(hex_code[2:4], 16) / 255.0
    b = int(hex_code[4:6], 16) / 255.0
    principled.inputs['Base Color'].default_value = (r, g, b, 1.0)

if 'Metallic' in principled.inputs:
    principled.inputs['Metallic'].default_value = ${args.metallic ?? 0.5}
if 'Roughness' in principled.inputs:
    principled.inputs['Roughness'].default_value = ${args.roughness ?? 0.2}

obj.data.materials.append(mat)

# Export to GLTF / GLB
bpy.ops.export_scene.gltf(filepath=r"${targetPath.replace(/\\/g, '/')}", export_format='GLB')
print("Successfully exported GLB to: ${targetPath.replace(/\\/g, '/')}")
`;
        const res = await executeBlenderPython(script);
        sendResponse(req.id, { content: [{ type: 'text', text: JSON.stringify({ ...res, exported_path: targetPath }, null, 2) }] });
        return;
      }

      if (name === 'blender_render_image') {
        const outImg = path.resolve(args.output_image_path);
        fs.mkdirSync(path.dirname(outImg), { recursive: true });

        const script = `
import bpy

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create sample metallic sphere with camera & light
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.5, location=(0, 0, 0))
sphere = bpy.context.active_object

mat = bpy.data.materials.new(name="RenderMat")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
bsdf.inputs['Base Color'].default_value = (0.22, 0.74, 0.97, 1.0)
bsdf.inputs['Metallic'].default_value = 0.8
bsdf.inputs['Roughness'].default_value = 0.1
sphere.data.materials.append(mat)

# Add Camera
bpy.ops.object.camera_add(location=(0, -5, 1), rotation=(1.37, 0, 0))
bpy.context.scene.camera = bpy.context.object

# Add Light
bpy.ops.object.light_add(type='POINT', location=(3, -3, 4))
light = bpy.context.object
light.data.energy = 1000

# Set render engine & resolution
bpy.context.scene.render.engine = '${args.engine || 'BLENDER_EEVEE_NEXT'}'
bpy.context.scene.render.resolution_x = ${args.resolution_x || 1024}
bpy.context.scene.render.resolution_y = ${args.resolution_y || 1024}
bpy.context.scene.render.filepath = r"${outImg.replace(/\\/g, '/')}"

bpy.ops.render.render(write_still=True)
print("Rendered image saved to: ${outImg.replace(/\\/g, '/')}")
`;
        const res = await executeBlenderPython(script);
        sendResponse(req.id, { content: [{ type: 'text', text: JSON.stringify({ ...res, rendered_image: outImg }, null, 2) }] });
        return;
      }

      sendError(req.id, -32601, `Tool not found: ${name}`);
    }
  } catch (err) {
    // Ignore JSON parse error on empty lines
  }
});
