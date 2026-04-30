import { map } from 'nanostores';

export type EditorTool = 'select' | 'brush' | 'erase' | 'pan';

export type EditorState = {
  canvasReady: boolean;
  selectedTool: EditorTool;
  zoom: number;
};

const initialState: EditorState = {
  canvasReady: false,
  selectedTool: 'select',
  zoom: 100,
};

export const editorStore = map<EditorState>(initialState);

export const setSelectedTool = (selectedTool: EditorTool) =>
  editorStore.setKey('selectedTool', selectedTool);
export const setZoom = (zoom: number) => editorStore.setKey('zoom', zoom);
export const setCanvasReady = (canvasReady: boolean) =>
  editorStore.setKey('canvasReady', canvasReady);
