const lightingLabels = {
  LIGHT_DEMO_welcome: 'Boas-vindas e dimerização',
  LIGHT_L01: 'Acender lineares',
  LIGHT_L03: 'Acender telas tensionadas',
  LIGHT_DEMO_baseboard: 'Rodapé iluminado',
  LIGHT_DEMO_cascade: 'Acender box por box',
};
Object.assign(clips, Object.fromEntries(Object.entries(lightingLabels).map(([key, label]) => [key, {
  src: mediaRoot + key + '_4k60.mp4', poster: mediaRoot + key + '_4k.jpg', label,
}])));
routes.iluminacao = Object.keys(lightingLabels);
