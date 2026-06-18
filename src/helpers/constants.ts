import {
  ArrowRight,
  Blocks,
  Hash,
  Plus,
  Square,
  Star,
  Triangle,
} from 'lucide-solid';

import type { IconType } from '@/components/ui/icon';
import type { CvShape, TileIcon } from '@/models/level';

export const TileIconMap = {
  structure: Square,
  star: Star,
  triangle: Triangle,
  plus: Plus,
  hash: Hash,
  arrow: ArrowRight,
} as const satisfies Record<TileIcon, IconType>;

export const CvShapeIconMap = {
  structure: Blocks,
  triangle: Triangle,
  star: Star,
  plus: Plus,
  hash: Hash,
  arrow: ArrowRight,
} as const satisfies Record<CvShape, IconType>;

const typedKeys = <T extends Record<string, unknown>>(value: T) =>
  Object.keys(value) as Array<Extract<keyof T, string>>;

export const TILE_ICON_PRESETS = typedKeys(
  TileIconMap,
) satisfies readonly TileIcon[];

export const CV_SHAPE_PRESETS = typedKeys(
  CvShapeIconMap,
) satisfies readonly CvShape[];
