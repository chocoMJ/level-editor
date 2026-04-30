import { Box, Button, type ButtonProps } from '@suis-ui/kit';
import { type JSX, Show, splitProps, type ValidComponent } from 'solid-js';

import { Icon, type IconType } from '@/components/ui/icon';

export type ItemProps<T extends ValidComponent> = ButtonProps<T> & {
  title?: string;
  description?: string;

  icon?: IconType;

  children?: JSX.Element;
};
export const Item = <T extends ValidComponent>(props: ItemProps<T>) => {
  const [local, rest] = splitProps(props, [
    'title',
    'description',
    'icon',
    'children',
  ]);

  return (
    <Button
      {...(rest as ButtonProps<T>)}
      w={rest.w ?? '100%'}
      variant={rest.variant ?? 'ghost'}
      direction={rest.direction ?? 'row'}
      justify={rest.justify ?? 'center'}
      align={rest.align ?? 'flex-start'}
      gap={rest.gap ?? 'xs'}
    >
      <Show when={local.icon}>{(icon) => <Icon name={icon()} />}</Show>
      <Box flex>
        <Show when={local.title}>
          <Box text={'body'}>{local.title}</Box>
        </Show>
        <Show when={local.description}>
          <Box text={'caption'} c={'text.caption'}>
            {local.description}
          </Box>
        </Show>
      </Box>
      <Box>{local.children}</Box>
    </Button>
  );
};
