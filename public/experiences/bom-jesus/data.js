// Native 4K stills and web copies of the approved Topaz 4K/60 videos.
/* eslint-disable @typescript-eslint/no-unused-vars -- Shared globals consumed by the following classic app.js script. */
const mediaRoot = 'media/r035/';
const generalPoster = mediaRoot + 'General_4k.jpg';
const routes = {
  ambientes: ['HOME_P_Box1', 'ARROW_A01_P_Box1_Box2', 'ARROW_A02_P_Box2_Box3', 'ARROW_A03_P_Box3_Car', 'ARROW_A04_P_Car_Mirror'],
  materiais: ['HOME_P_Mirror', 'ARROW_M01_P_Mirror_Glass', 'ARROW_M02_P_Glass_Floor', 'ARROW_M03_P_Floor_Grille', 'ARROW_M04_P_Grille_Rail', 'ARROW_M05_P_Rail_Skirting', 'ARROW_M06_P_Skirting_Ceiling', 'ARROW_M07_P_Ceiling_Linear', 'ARROW_M08_DEPART_Linear_Joinery', 'ARROW_M09_O_Joinery_Counter', 'ARROW_M10_O_Counter_Artwork', 'ARROW_M11_O_Artwork_DarkFinish', 'ARROW_M12_O_DarkFinish_Totem', 'ARROW_M13_O_Totem_Mineral', 'ARROW_M14_O_Mineral_Cabinet'],
};
const viewLabels = {
  HOME_P_Box1: 'Box 1', ARROW_A01_P_Box1_Box2: 'Box 2', ARROW_A02_P_Box2_Box3: 'Box 3',
  ARROW_A03_P_Box3_Car: 'Área de trabalho', ARROW_A04_P_Car_Mirror: 'Espelho bronze',
  HOME_P_Mirror: 'Espelho bronze', ARROW_M01_P_Mirror_Glass: 'Vidro',
  ARROW_M02_P_Glass_Floor: 'Piso dos boxes', ARROW_M03_P_Floor_Grille: 'Grelhas',
  ARROW_M04_P_Grille_Rail: 'Trilhos', ARROW_M05_P_Rail_Skirting: 'Rodapé iluminado',
  ARROW_M06_P_Skirting_Ceiling: 'Telas tensionadas', ARROW_M07_P_Ceiling_Linear: 'Luminárias de sobrepor',
  ARROW_M08_DEPART_Linear_Joinery: 'Marcenaria', ARROW_M09_O_Joinery_Counter: 'Bancada',
  ARROW_M10_O_Counter_Artwork: 'Quadros', ARROW_M11_O_Artwork_DarkFinish: 'Revestimento preto',
  ARROW_M12_O_DarkFinish_Totem: 'Totem', ARROW_M13_O_Totem_Mineral: 'Painel mineral',
  ARROW_M14_O_Mineral_Cabinet: 'Armário', MATERIALS_RETURN_HOME: 'Visão geral', INTRO_I01: 'A cabine',
};
const clips = Object.fromEntries(Object.entries(viewLabels).map(([key, label]) => [key, {
  src: mediaRoot + key + '_4k60.mp4', poster: mediaRoot + key + '_4k.jpg', label,
}]));
