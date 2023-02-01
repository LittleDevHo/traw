import { styled } from 'stitches.config';

export const TrawButton = styled('button', {
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '100%',
  cursor: 'pointer',
  fontFamily: '$ui',
  fontWeight: 700,
  fontSize: '$2',
  border: '1px solid transparent',
  borderRadius: 50,
  backgroundColor: '#726EF6',
  color: 'white',
  padding: '4px 10px',

  '&[data-disabled]': {
    opacity: 0.3,
  },

  '&:disabled': {
    opacity: 0.3,
  },

  '&:hover': {
    backgroundColor: 'rgb(79, 77, 172)',
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '#726EF6',
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgb(79, 77, 172)',
        },
      },
      secondary: {
        backgroundColor: '#E983B2',
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(163 91 123)',
        },
      },
      text: {
        backgroundColor: 'transparent',
        color: '#2B2B59',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      icon: {
        padding: 1,
        backgroundColor: 'transparent',
        color: '#9B9EB5',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
});

export const TrawIconButton = styled('button', {
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '20px',
  height: '100%',
  cursor: 'pointer',
  fontFamily: '$ui',
  fontWeight: 700,
  fontSize: '$2',
  border: '1px solid transparent',
  borderRadius: 50,

  '&:hover': {
    backgroundColor: '$hover',
  },

  '&[data-disabled]': {
    opacity: 0.3,
  },

  '&:disabled': {
    opacity: 0.3,
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: '#726EF6',
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(114, 110, 246, 0.8)',
        },
      },
      secondary: {
        backgroundColor: '#E983B2',
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(233, 131, 178, 0.8)',
        },
      },
    },
  },
});
