import { ThemePalette } from '../types';

export interface ThemeTokens {
  name: string;
  personality: string;
  vars: Record<string, string>;
  heatLevels: [string, string, string, string];
}

export const GET_THEME_TOKENS = (palette: ThemePalette, isLatte: boolean): ThemeTokens => {
  if (palette === 'lavender-blush') {
    return isLatte
      ? {
          name: 'Soft Lavender',
          personality: 'Creative • Dreamy • Calm',
          vars: {
            '--bg-page': '#F9F7FC',
            '--bg-sidebar': '#F2EDF9',
            '--bg-surface': '#FFFFFF',
            '--bg-elevated': '#F4EFFA',
            '--text-main': '#2B2138',
            '--text-muted': '#7A6B8A',
            '--border-subtle': '#E6DDF2',
            '--track-bg': '#E9E1F4',
            '--accent': '#845EC2',
            '--accent-soft': 'rgba(132, 94, 194, 0.12)',
            '--glow': 'rgba(155, 114, 207, 0.16)'
          },
          heatLevels: ['bg-[#F0EBF8] border-[#E4DCF0]', 'bg-[#D5C4EE] border-[#C5B0E6]', 'bg-[#A685E2] border-[#9571D8]', 'bg-[#7E57C2] border-[#6C46B0] text-white']
        }
      : {
          name: 'Velvet Lavender',
          personality: 'Evening • Reflective • Gentle',
          vars: {
            '--bg-page': '#15121C',
            '--bg-sidebar': '#110E17',
            '--bg-surface': '#1D1826',
            '--bg-elevated': '#251F30',
            '--text-main': '#F2ECF9',
            '--text-muted': '#9E91B0',
            '--border-subtle': 'rgba(255, 255, 255, 0.07)',
            '--track-bg': 'rgba(255, 255, 255, 0.07)',
            '--accent': '#A982DB',
            '--accent-soft': 'rgba(169, 130, 219, 0.16)',
            '--glow': 'rgba(169, 130, 219, 0.15)'
          },
          heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#5E4382]/60 border-[#73539C]/40', 'bg-[#845EC2]/80 border-[#9B72CF]', 'bg-[#B388EB] border-[#C8A8F0] text-black']
        };
  }

  if (palette === 'peach-terracotta') {
    return isLatte
      ? {
          name: 'Warm Terracotta',
          personality: 'Grounded • Artisanal • Warm',
          vars: {
            '--bg-page': '#FBF8F6',
            '--bg-sidebar': '#F5EFEA',
            '--bg-surface': '#FFFFFF',
            '--bg-elevated': '#F7F1EC',
            '--text-main': '#33241E',
            '--text-muted': '#876F66',
            '--border-subtle': '#E8DDD5',
            '--track-bg': '#ECE0D8',
            '--accent': '#C86D51',
            '--accent-soft': 'rgba(200, 109, 81, 0.12)',
            '--glow': 'rgba(200, 109, 81, 0.14)'
          },
          heatLevels: ['bg-[#F3ECE8] border-[#E6DBD4]', 'bg-[#E6BFB3] border-[#D9ABA0]', 'bg-[#D18872] border-[#C47760]', 'bg-[#B85D43] border-[#A34E36] text-white']
        }
      : {
          name: 'Fireside Clay',
          personality: 'Cozy • Hearth • Focused',
          vars: {
            '--bg-page': '#171312',
            '--bg-sidebar': '#120F0E',
            '--bg-surface': '#211B19',
            '--bg-elevated': '#2A2220',
            '--text-main': '#F7EFEA',
            '--text-muted': '#A8958D',
            '--border-subtle': 'rgba(255, 255, 255, 0.07)',
            '--track-bg': 'rgba(255, 255, 255, 0.07)',
            '--accent': '#D47A5E',
            '--accent-soft': 'rgba(212, 122, 94, 0.16)',
            '--glow': 'rgba(212, 122, 94, 0.14)'
          },
          heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#6E3D2E]/60 border-[#854B3A]/40', 'bg-[#A85840]/80 border-[#C86D51]', 'bg-[#DF8A70] border-[#F0B29E] text-black']
        };
  }

  if (palette === 'matcha-cream') {
    return isLatte
      ? {
          name: 'Matcha Mist',
          personality: 'Botanical • Fresh • Serene',
          vars: {
            '--bg-page': '#F7F9F6',
            '--bg-sidebar': '#EEF3EC',
            '--bg-surface': '#FFFFFF',
            '--bg-elevated': '#F1F6EF',
            '--text-main': '#1F2D24',
            '--text-muted': '#667B6C',
            '--border-subtle': '#DCE5D8',
            '--track-bg': '#DDE7DA',
            '--accent': '#52796F',
            '--accent-soft': 'rgba(82, 121, 111, 0.12)',
            '--glow': 'rgba(82, 121, 111, 0.14)'
          },
          heatLevels: ['bg-[#EDF2EB] border-[#DFE7DC]', 'bg-[#B7D1C1] border-[#A3C2AF]', 'bg-[#74A18E] border-[#618F7B]', 'bg-[#4A7866] border-[#3B6353] text-white']
        }
      : {
          name: 'Forest Calm',
          personality: 'Deep Woods • Quiet • Steady',
          vars: {
            '--bg-page': '#121714',
            '--bg-sidebar': '#0E1210',
            '--bg-surface': '#19211C',
            '--bg-elevated': '#212B25',
            '--text-main': '#ECF4EE',
            '--text-muted': '#8FA696',
            '--border-subtle': 'rgba(255, 255, 255, 0.07)',
            '--track-bg': 'rgba(255, 255, 255, 0.07)',
            '--accent': '#6B9E8F',
            '--accent-soft': 'rgba(107, 158, 143, 0.16)',
            '--glow': 'rgba(107, 158, 143, 0.14)'
          },
          heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#2F4F44]/60 border-[#3E6658]/40', 'bg-[#4E8070]/80 border-[#639685]', 'bg-[#7BB5A3] border-[#98C9BA] text-black']
        };
  }

  // Default: 'warm-sage' (Mehrsan)
  return isLatte
    ? {
        name: 'Warm Stone & Sage',
        personality: 'Morning Light • Organic • Clear',
        vars: {
          '--bg-page': '#F7F5F0',
          '--bg-sidebar': '#EFECE6',
          '--bg-surface': '#FFFFFF',
          '--bg-elevated': '#F3F0EA',
          '--text-main': '#262421',
          '--text-muted': '#78736A',
          '--border-subtle': '#E2DDD3',
          '--track-bg': '#E5E0D5',
          '--accent': '#4F6F68',
          '--accent-soft': 'rgba(79, 111, 104, 0.12)',
          '--glow': 'rgba(79, 111, 104, 0.14)'
        },
        heatLevels: ['bg-[#ECE8E0] border-[#DFD9CE]', 'bg-[#B2C7C1] border-[#9EB5AE]', 'bg-[#6F968D] border-[#5D837A]', 'bg-[#4A6E66] border-[#3C5C55] text-white']
      }
    : {
        name: 'Cozy Espresso & Sage',
        personality: 'Deep Work • Warm • Grounded',
        vars: {
          '--bg-page': '#161514',
          '--bg-sidebar': '#121110',
          '--bg-surface': '#1E1C1A',
          '--bg-elevated': '#252220',
          '--text-main': '#F2EFE9',
          '--text-muted': '#9C968E',
          '--border-subtle': 'rgba(255, 255, 255, 0.07)',
          '--track-bg': 'rgba(255, 255, 255, 0.07)',
          '--accent': '#6B948B',
          '--accent-soft': 'rgba(107, 148, 139, 0.16)',
          '--glow': 'rgba(107, 148, 139, 0.14)'
        },
        heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#334A44]/60 border-[#425E57]/40', 'bg-[#52786F]/80 border-[#668C83]', 'bg-[#82B0A5] border-[#9EC4BB] text-black']
      };
};
