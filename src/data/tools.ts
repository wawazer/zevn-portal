import type { Tool } from '../types';

export const tools: Tool[] = [
  {
    id: 'shortlink',
    name: 'Shortlink & Analytics',
    subdomain: 'go.zevn.web.id',
    url: 'https://go.zevn.web.id',
    category: 'Links',
    status: 'live',
    description:
      'Pemendek tautan cepat bebas iklan dengan pelacakan klik real-time.',
    shortcutKey: '1',
  },
  {
    id: 'utility-suite',
    name: 'Client-Side Utility Suite',
    subdomain: 'tools.zevn.web.id',
    url: 'https://tools.zevn.web.id',
    category: 'Utilities',
    status: 'live',
    description:
      'Kumpulan alat pemrosesan lokal di browser tanpa upload ke server.',
    shortcutKey: '2',
  },
  {
    id: 'ai-router',
    name: 'AI Model Router',
    subdomain: 'router.zevn.web.id',
    url: 'https://router.zevn.web.id',
    category: 'AI & Infra',
    status: 'live',
    description:
      'Gateway terpusat untuk manajemen dan routing berbagai API model AI.',
    shortcutKey: '3',
  },
  {
    id: 'image-optimizer',
    name: 'Marketplace Image Optimizer',
    subdomain: 'tools.zevn.web.id/image',
    url: 'https://tools.zevn.web.id/image',
    category: 'E-Commerce',
    status: 'beta',
    description:
      'Kompresi massal WebP/JPG & auto-crop rasio 1:1 / 4:5 untuk foto produk.',
    shortcutKey: '4',
  },
  {
    id: 'json-sql-formatter',
    name: 'JSON & SQL Formatter',
    subdomain: 'tools.zevn.web.id/format',
    url: 'https://tools.zevn.web.id/format',
    category: 'Dev Tools',
    status: 'beta',
    description:
      'Validasi payload JSON, beautify query SQL, dan decoder JWT instan.',
    shortcutKey: '5',
  },
  {
    id: 'qr-utm-builder',
    name: 'QR & UTM Link Builder',
    subdomain: 'tools.zevn.web.id/qr',
    url: 'https://tools.zevn.web.id/qr',
    category: 'E-Commerce',
    status: 'soon',
    description:
      'Generator QR Code kustom terintegrasi dengan parameter kampanye UTM.',
    shortcutKey: '6',
  },
   {
    id: 'porto',
    name: 'Portofolio & Resume',
    subdomain: 'porto.zevn.web.id',
    url: 'https://porto.zevn.web.id',
    category: 'Links',
    status: 'live',
    description:
      'just npc portofolio.',
    shortcutKey: '7',
  },

];

export const categories = [
  'All',
  'Links',
  'Utilities',
  'E-Commerce',
  'Dev Tools',
  'AI & Infra',
] as const;
