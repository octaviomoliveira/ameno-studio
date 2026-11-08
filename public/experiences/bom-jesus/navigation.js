/* eslint-disable @typescript-eslint/no-unused-vars -- Shared browser navigation data. */
// Only completed, encoded R036 takes are listed. R035 endpoints remain native 4K.
const cameraNodes = {"ambientes": ["Box1_P", "Box2_P", "Box3_P", "Car_P", "Mirror_P"], "materiais": ["Mirror_O", "Glass_O", "Floor_O", "Grille_O", "Rail_O", "Skirting_O", "Ceiling_O", "Linear_O", "Joinery_O", "Counter_O", "Artwork_O", "DarkFinish_O", "Totem_O", "Mineral_O", "Cabinet_O"]};
const nodeClips = {G_P: {poster: generalPoster, label: 'Visão geral'}};
const cameraEdges = [];
for (const category of ['ambientes', 'materiais']) {
  cameraNodes[category].forEach((node, i) => {
    const key = routes[category][i];
    nodeClips[node] = clips[key];
    cameraEdges.push({from: i ? cameraNodes[category][i-1] : 'G_P', to: node, key});
  });
}
cameraEdges.push({from: 'Mirror_O', to: 'G_P', key: 'MATERIALS_RETURN_HOME'});
const extraTakes = [
  {
    "id": "A_Box2_to_Box1",
    "from": "Box2_P",
    "to": "Box1_P"
  },
  {
    "id": "A_Box3_to_Box2",
    "from": "Box3_P",
    "to": "Box2_P"
  },
  {
    "id": "A_Car_to_Box3",
    "from": "Car_P",
    "to": "Box3_P"
  },
  {
    "id": "A_Mirror_to_Car",
    "from": "Mirror_P",
    "to": "Car_P"
  },
  {
    "id": "M_Glass_to_Mirror",
    "from": "Glass_O",
    "to": "Mirror_O"
  },
  {
    "id": "M_Floor_to_Glass",
    "from": "Floor_O",
    "to": "Glass_O"
  },
  {
    "id": "M_Grille_to_Floor",
    "from": "Grille_O",
    "to": "Floor_O"
  },
  {
    "id": "M_Rail_to_Grille",
    "from": "Rail_O",
    "to": "Grille_O"
  },
  {
    "id": "M_Skirting_to_Rail",
    "from": "Skirting_O",
    "to": "Rail_O"
  },
  {
    "id": "M_Ceiling_to_Skirting",
    "from": "Ceiling_O",
    "to": "Skirting_O"
  },
  {
    "id": "M_Linear_to_Ceiling",
    "from": "Linear_O",
    "to": "Ceiling_O"
  },
  {
    "id": "M_Joinery_to_Linear",
    "from": "Joinery_O",
    "to": "Linear_O"
  },
  {
    "id": "M_Counter_to_Joinery",
    "from": "Counter_O",
    "to": "Joinery_O"
  },
  {
    "id": "M_Artwork_to_Counter",
    "from": "Artwork_O",
    "to": "Counter_O"
  },
  {
    "id": "M_DarkFinish_to_Artwork",
    "from": "DarkFinish_O",
    "to": "Artwork_O"
  },
  {
    "id": "M_Totem_to_DarkFinish",
    "from": "Totem_O",
    "to": "DarkFinish_O"
  },
  {
    "id": "M_Mineral_to_Totem",
    "from": "Mineral_O",
    "to": "Totem_O"
  },
  {
    "id": "M_Cabinet_to_Mineral",
    "from": "Cabinet_O",
    "to": "Mineral_O"
  },
  {
    "id": "Box1_to_G",
    "from": "Box1_P",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Box2_P",
    "from": "G_P",
    "to": "Box2_P"
  },
  {
    "id": "DIRECT_Box2_P_TO_G_P",
    "from": "Box2_P",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Box3_P",
    "from": "G_P",
    "to": "Box3_P"
  },
  {
    "id": "DIRECT_Box3_P_TO_G_P",
    "from": "Box3_P",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Car_P",
    "from": "G_P",
    "to": "Car_P"
  },
  {
    "id": "DIRECT_Car_P_TO_G_P",
    "from": "Car_P",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Mirror_P",
    "from": "G_P",
    "to": "Mirror_P"
  },
  {
    "id": "DIRECT_Mirror_P_TO_G_P",
    "from": "Mirror_P",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Glass_O",
    "from": "G_P",
    "to": "Glass_O"
  },
  {
    "id": "DIRECT_Glass_O_TO_G_P",
    "from": "Glass_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Floor_O",
    "from": "G_P",
    "to": "Floor_O"
  },
  {
    "id": "DIRECT_Floor_O_TO_G_P",
    "from": "Floor_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Grille_O",
    "from": "G_P",
    "to": "Grille_O"
  },
  {
    "id": "DIRECT_Grille_O_TO_G_P",
    "from": "Grille_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Rail_O",
    "from": "G_P",
    "to": "Rail_O"
  },
  {
    "id": "DIRECT_Rail_O_TO_G_P",
    "from": "Rail_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Skirting_O",
    "from": "G_P",
    "to": "Skirting_O"
  },
  {
    "id": "DIRECT_Skirting_O_TO_G_P",
    "from": "Skirting_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Ceiling_O",
    "from": "G_P",
    "to": "Ceiling_O"
  },
  {
    "id": "DIRECT_Ceiling_O_TO_G_P",
    "from": "Ceiling_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Linear_O",
    "from": "G_P",
    "to": "Linear_O"
  },
  {
    "id": "DIRECT_Linear_O_TO_G_P",
    "from": "Linear_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Joinery_O",
    "from": "G_P",
    "to": "Joinery_O"
  },
  {
    "id": "DIRECT_Joinery_O_TO_G_P",
    "from": "Joinery_O",
    "to": "G_P"
  },
  {
    "id": "DIRECT_G_P_TO_Counter_O",
    "from": "G_P",
    "to": "Counter_O"
  }
];
for (const take of extraTakes) {
  clips[take.id] = {...nodeClips[take.to], src: 'media/r036/video_' + take.id + '.mp4'};
  cameraEdges.push({from: take.from, to: take.to, key: take.id});
}
// Never return through General (and re-enter the car) between material views.
function cameraPath(from, to) {
  const queue = [[from, []]], seen = new Set([from]);
  const withinMaterials = from.endsWith('_O') && to.endsWith('_O');
  while (queue.length) {
    const [node, path] = queue.shift();
    if (node === to) return path;
    for (const edge of cameraEdges) {
      if (edge.from !== node || seen.has(edge.to) || (withinMaterials && !edge.to.endsWith('_O'))) continue;
      seen.add(edge.to); queue.push([edge.to, [...path, edge]]);
    }
  }
  return null;
}
