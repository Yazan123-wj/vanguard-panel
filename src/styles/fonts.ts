import localFont from 'next/font/local';

export const fontBody = localFont({
  src: [
    {
      path: '../../public/fonts/Aileron-Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-ThinItalic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Aileron-UltraLight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-UltraLightItalic.otf',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Aileron-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Aileron-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Aileron-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-SemiBoldItalic.otf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Aileron-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Aileron-Heavy.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-HeavyItalic.otf',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Aileron-Black.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Aileron-BlackItalic.otf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});
