import { Box, Button, Item } from '@suis-ui/kit';
import {
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  Plus,
  Square,
  Trash2,
} from 'lucide-solid';
import { Flip } from 'solid-flip';
import { createMemo, createSignal, For, Show } from 'solid-js';

import { Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { MenuButton } from '@/components/ui/menu-button';
import type {
  LevelData,
  LevelLayer,
  TileMapping,
  TilePlacement,
} from '@/models/level';
import type { LayerMoveDirection } from '@/stores/layers';
import { sortLayersForDisplay } from '@/stores/layers';
import { createDefaultTileName, getTileDisplayName } from '@/stores/palette';
import * as styles from './side-panel.css';

type LayerTabProps = {
  activeLayerId: string;
  selectedLayerId: string | null;
  level: LevelData;
  onAddLayer: () => void;
  onDeleteLayer: (layerId: string) => void;
  onMoveLayer: (layerId: string, direction: LayerMoveDirection) => void;
  onSelectActiveLayer: (layerId: string) => void;
  onSelectLayerRect: (layerId: string, selected: boolean) => void;
};

export const LayerTab = (props: LayerTabProps) => {
  const [deleteTargetId, setDeleteTargetId] = createSignal<string | null>(null);
  const [expandedLayerIds, setExpandedLayerIds] = createSignal<Set<string>>(
    new Set(),
  );
  const layers = createMemo(() => sortLayersForDisplay(props.level.layers));
  const layerTreeFlipKey = createMemo(() =>
    layers()
      .map((layer) =>
        [
          layer.id,
          layer.order,
          expandedLayerIds().has(layer.id) ? 'open' : 'closed',
          layer.tiles
            .map((tile) => `${tile.x},${tile.y},${tile.tileId}`)
            .join('|'),
        ].join(':'),
      )
      .join(';'),
  );
  const deleteTarget = createMemo(() =>
    props.level.layers.find((layer) => layer.id === deleteTargetId()),
  );
  const isLayerExpanded = (layerId: string) => expandedLayerIds().has(layerId);
  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayerIds((current) => {
      const next = new Set(current);

      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }

      return next;
    });
  };
  const handleCloseDelete = () => {
    setDeleteTargetId(null);
  };
  const handleConfirmDelete = () => {
    const targetId = deleteTargetId();

    if (!targetId) {
      return;
    }

    setExpandedLayerIds((current) => {
      const next = new Set(current);

      next.delete(targetId);

      return next;
    });
    handleCloseDelete();
    props.onDeleteLayer(targetId);
  };

  return (
    <Box gap={'xs'}>
      <Item
        size={'sm'}
        title={'Layers'}
        action={
          <Button
            variant={'ghost'}
            type={'icon'}
            size={'xs'}
            r={'lg'}
            onClick={props.onAddLayer}
          >
            <Icon name={Plus} />
          </Button>
        }
      />
      <Box as={'ul'} aria-label={'Layer tree'}>
        <For each={layers()}>
          {(layer, index) => (
            <LayerItem
              layer={layer}
              tileTable={props.level.tileTable}
              activeLayerId={props.activeLayerId}
              canMoveDown={index() < layers().length - 1}
              canMoveUp={index() > 0}
              disabledDelete={layers().length <= 1}
              expanded={isLayerExpanded(layer.id)}
              flipTrigger={layerTreeFlipKey()}
              selectedLayerId={props.selectedLayerId}
              onDeleteLayer={setDeleteTargetId}
              onMoveLayer={props.onMoveLayer}
              onSelectActiveLayer={props.onSelectActiveLayer}
              onSelectLayerRect={props.onSelectLayerRect}
              onToggleExpanded={toggleLayerExpanded}
            />
          )}
        </For>
      </Box>
      <Dialog
        open={Boolean(deleteTarget())}
        title={`${deleteTarget()?.name ?? 'Layer'} 삭제 확인`}
        description={`${deleteTarget()?.tiles.length ?? 0}개의 타일이 포함된 레이어를 삭제합니다.`}
        onClose={handleCloseDelete}
        footer={
          <>
            <Button variant={'ghost'} onClick={handleCloseDelete}>
              {'취소'}
            </Button>
            <Button variant={'primary'} onClick={handleConfirmDelete}>
              {'삭제'}
            </Button>
          </>
        }
      >
        <Show when={deleteTarget()}>
          {(layer) => (
            <Item
              size={'sm'}
              title={layer().name}
              description={`${layer().id} / order ${layer().order}`}
            />
          )}
        </Show>
      </Dialog>
    </Box>
  );
};

type LayerItemProps = {
  canMoveDown: boolean;
  canMoveUp: boolean;
  disabledDelete: boolean;
  expanded: boolean;
  flipTrigger: string;
  layer: LevelLayer;
  tileTable: TileMapping[];
  activeLayerId?: string;
  selectedLayerId?: string | null;
  onDeleteLayer: (layerId: string) => void;
  onMoveLayer: (layerId: string, direction: LayerMoveDirection) => void;
  onSelectActiveLayer: (layerId: string) => void;
  onSelectLayerRect: (layerId: string, selected: boolean) => void;
  onToggleExpanded: (layerId: string) => void;
};

const getTileFlipId = (layerId: string, tile: TilePlacement) =>
  `side-panel-layer-${layerId}-tile-${tile.x}-${tile.y}`;

const LayerItem = (props: LayerItemProps) => {
  const tileNameById = createMemo(
    () =>
      new Map(
        props.tileTable.map((tile) => [tile.tileId, getTileDisplayName(tile)]),
      ),
  );
  const getTileName = (tileId: number) =>
    tileNameById().get(tileId) ?? createDefaultTileName(tileId);

  return (
    <Flip
      id={`side-panel-layer-${props.layer.id}`}
      with={props.flipTrigger}
      properties={['translate', 'opacity']}
      enter={styles.treeItemEnterStyle}
      exit={styles.treeItemExitStyle}
    >
      <Box as={'li'}>
        <Box direction={'row'} align={'center'} gap={'xxs'}>
          <Item
            as={Button}
            flex
            variant={'ghost'}
            active={props.selectedLayerId === props.layer.id}
            onClick={() =>
              props.onSelectLayerRect(
                props.layer.id,
                props.selectedLayerId !== props.layer.id,
              )
            }
            media={
              <Box direction={'row'} align={'center'} gap={'xxs'}>
                <Box>
                  <Button
                    variant={'ghost'}
                    type={'icon'}
                    size={'xs'}
                    disabled={!props.canMoveUp}
                    onClick={() => props.onMoveLayer(props.layer.id, 'up')}
                  >
                    <Icon name={ChevronUp} size={12} />
                  </Button>
                  <Button
                    variant={'ghost'}
                    type={'icon'}
                    size={'xs'}
                    disabled={!props.canMoveDown}
                    onClick={() => props.onMoveLayer(props.layer.id, 'down')}
                  >
                    <Icon name={ChevronDown} size={12} />
                  </Button>
                </Box>
              </Box>
            }
            title={
              <Box
                direction={'row'}
                justify={'flex-start'}
                align={'center'}
                gap={'xs'}
              >
                <Box as={'span'}>{props.layer.name}</Box>
              </Box>
            }
            description={props.layer.id}
            action={
              <Box direction={'row'} align={'center'} gap={'xxs'}>
                <Button
                  variant={'ghost'}
                  type={'icon'}
                  size={'xs'}
                  r={'sm'}
                  onClick={(event) => {
                    props.onSelectActiveLayer(props.layer.id);
                    props.onToggleExpanded(props.layer.id);
                    event.stopPropagation();
                  }}
                >
                  <Icon name={props.expanded ? ChevronUp : ChevronDown} />
                </Button>
                <MenuButton
                  variant={'ghost'}
                  type={'icon'}
                  size={'xs'}
                  r={'sm'}
                  items={[
                    {
                      label: '레이어 삭제',
                      icon: Trash2,
                      onClick: () => props.onDeleteLayer(props.layer.id),
                    },
                  ]}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Icon name={EllipsisVertical} />
                </MenuButton>
              </Box>
            }
          />
        </Box>
        <Show when={props.expanded}>
          <Box as={'ul'} pl={'md'}>
            <For each={props.layer.tiles}>
              {(tile) => (
                <Flip
                  id={getTileFlipId(props.layer.id, tile)}
                  with={props.flipTrigger}
                  properties={['translate', 'opacity']}
                  enter={styles.treeItemEnterStyle}
                  exit={styles.treeItemExitStyle}
                >
                  <Box as={'li'} class={styles.tileNode}>
                    <Item
                      class={styles.tileItem}
                      media={<Icon name={Square} />}
                      title={
                        <Box
                          direction={'row'}
                          justify={'flex-start'}
                          align={'center'}
                          gap={'xs'}
                        >
                          <Box as={'span'}>{getTileName(tile.tileId)}</Box>
                          <Box
                            as={'span'}
                            text={'caption'}
                            c={'text.caption'}
                          >{`#${tile.tileId} / ${tile.x}, ${tile.y}`}</Box>
                        </Box>
                      }
                      justify={'flex-start'}
                    />
                  </Box>
                </Flip>
              )}
            </For>
          </Box>
        </Show>
      </Box>
    </Flip>
  );
};
