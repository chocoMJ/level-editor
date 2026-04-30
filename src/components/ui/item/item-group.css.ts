import { vars } from '@suis-ui/kit';
import { style } from '@vanilla-extract/css';

export const itemGroupStyle = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flexShrink: 0,

  padding: vars.size.space.xs,
  borderRadius: vars.size.space.md,
  overflow: 'hidden',

  selectors: {
    '&:has( + [data-item-group])': {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    '[data-item-group] + &': {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderTopStyle: 'solid',
      borderTopWidth: vars.size.line.md,
      borderTopColor: vars.color.surface.higher,
    },
  },
});
