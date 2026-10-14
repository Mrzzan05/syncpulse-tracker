import { ThemePalette } from './types';

export interface CalmStyle {
  name: string;
  pageBg: string;
  sidebarBg: string;
  surfaceBg: string;
  subtleBg: string;
  textMain: string;
  textMuted: string;
  divider: string;
  trackBg: string;
  primaryBtn: string;
  softBadge: string;
  activeNav: string;
  progressBar: string;
  accentText: string;
  heatLevels: [string, string, string, string];
}

// Ultra-calm, low-contrast, eye-soothing palettes inspired by Things 3 & Headspace
export const GET_COZY_THEME = (palette: ThemePalette, isLatte: boolean): CalmStyle => {
  if (palette === 'lavender-blush') {
    return isLatte
      ? {
          name: 'Soft Lavender',
          pageBg: 'bg-[#F9F7FC]',
          sidebarBg: 'bg-[#F2EDF9] border-[#E5DDF0]',
          surfaceBg: 'bg-white border-[#EAE2F3] shadow-sm shadow-purple-950/[0.02]',
          subtleBg: 'bg-[#F4EFFA] border-[#E6DDF2]',
          textMain: 'text-[#2B2138]',
          textMuted: 'text-[#7A6B8A]',
          divider: 'border-[#ECE6F4]',
          trackBg: 'bg-[#E9E1F4]',
          primaryBtn: 'bg-[#845EC2] hover:bg-[#734EB0] text-white',
          softBadge: 'bg-[#F0E9F9] text-[#6B46A8] border-[#DFD2F2]',
          activeNav: 'bg-[#E8DEF6] text-[#2B2138] font-semibold',
          progressBar: 'bg-[#845EC2]',
          accentText: 'text-[#734EB0]',
          heatLevels: ['bg-[#F0EBF8] border-[#E4DCF0]', 'bg-[#D5C4EE] border-[#C5B0E6]', 'bg-[#A685E2] border-[#9571D8]', 'bg-[#7E57C2] border-[#6C46B0]']
        }
      : {
          name: 'Velvet Lavender',
          pageBg: 'bg-[#15121C]',
          sidebarBg: 'bg-[#110E17] border-white/[0.06]',
          surfaceBg: 'bg-[#1D1826] border-white/[0.06]',
          subtleBg: 'bg-[#171320] border-white/[0.05]',
          textMain: 'text-[#F2ECF9]',
          textMuted: 'text-[#9E91B0]',
          divider: 'border-white/[0.06]',
          trackBg: 'bg-white/[0.07]',
          primaryBtn: 'bg-[#9B72CF] hover:bg-[#8A60C0] text-white',
          softBadge: 'bg-[#9B72CF]/15 text-[#D8C2F2] border-[#9B72CF]/25',
          activeNav: 'bg-white/[0.08] text-white font-semibold',
          progressBar: 'bg-[#A982DB]',
          accentText: 'text-[#C8A8F0]',
          heatLevels: ['bg-white/[0.04] border-white/[0.05]', 'bg-[#5E4382]/60 border-[#73539C]/40', 'bg-[#845EC2]/80 border-[#9B72CF]', 'bg-[#B388EB] border-[#C8A8F0]']
        };
  }

  if (palette === 'peach-terracotta') {
    return isLatte
      ? {
          name: 'Warm Terracotta',
          pageBg: 'bg-[#FBF8F6]',
          sidebarBg: 'bg-[#F5EFEA] border-[#E8DDD5]',
          surfaceBg: 'bg-white border-[#EDE3DC] shadow-sm shadow-stone-900/[0.02]',
          subtleBg: 'bg-[#F7F1EC] border-[#E8DDD5]',
          textMain: 'text-[#33241E]',
          textMuted: 'text-[#876F66]',
          divider: 'border-[#EFE6DF]',
          trackBg: 'bg-[#ECE0D8]',
          primaryBtn: 'bg-[#C86D51] hover:bg-[#B55D42] text-white',
          softBadge: 'bg-[#F6E8E3] text-[#A85238] border-[#E8D1C9]',
          activeNav: 'bg-[#EFE2DA] text-[#33241E] font-semibold',
          progressBar: 'bg-[#C86D51]',
          accentText: 'text-[#B55D42]',
          heatLevels: ['bg-[#F3ECE8] border-[#E6DBD4]', 'bg-[#E6BFB3] border-[#D9ABA0]', 'bg-[#D18872] border-[#C47760]', 'bg-[#B85D43] border-[#A34E36]']
        }
      : {
          name: 'Fireside Clay',
          pageBg: 'bg-[#171312]',
          sidebarBg: 'bg-[#120F0E] border-white/[0.06]',
          surfaceBg: 'bg-[#211B19] border-white/[0.06]',
          subtleBg: 'bg-[#1A1514] border-white/[0.05]',
          textMain: 'text-[#F7EFEA]',
          textMuted: 'text-[#A8958D]',
          divider: 'border-white/[0.06]',
          trackBg: 'bg-white/[0.07]',
          primaryBtn: 'bg-[#C86D51] hover:bg-[#B55D42] text-white',
          softBadge: 'bg-[#C86D51]/15 text-[#F0C4B6] border-[#C86D51]/25',
          activeNav: 'bg-white/[0.08] text-white font-semibold',
          progressBar: 'bg-[#D47A5E]',
          accentText: 'text-[#E8A590]',
          heatLevels: ['bg-white/[0.04] border-white/[0.05]', 'bg-[#6E3D2E]/60 border-[#854B3A]/40', 'bg-[#A85840]/80 border-[#C86D51]', 'bg-[#DF8A70] border-[#F0B29E]']
        };
  }

  if (palette === 'matcha-cream') {
    return isLatte
      ? {
          name: 'Matcha Mist',
          pageBg: 'bg-[#F7F9F6]',
          sidebarBg: 'bg-[#EEF3EC] border-[#DCE5D8]',
          surfaceBg: 'bg-white border-[#E2EBE0] shadow-sm shadow-stone-900/[0.02]',
          subtleBg: 'bg-[#F1F6EF] border-[#DCE5D8]',
          textMain: 'text-[#1F2D24]',
          textMuted: 'text-[#667B6C]',
          divider: 'border-[#E6EEE4]',
          trackBg: 'bg-[#DDE7DA]',
          primaryBtn: 'bg-[#52796F] hover:bg-[#43665D] text-white',
          softBadge: 'bg-[#E6F0EA] text-[#3F6359] border-[#CFE0D6]',
          activeNav: 'bg-[#E0EBDD] text-[#1F2D24] font-semibold',
          progressBar: 'bg-[#52796F]',
          accentText: 'text-[#43665D]',
          heatLevels: ['bg-[#EDF2EB] border-[#DFE7DC]', 'bg-[#B7D1C1] border-[#A3C2AF]', 'bg-[#74A18E] border-[#618F7B]', 'bg-[#4A7866] border-[#3B6353]']
        }
      : {
          name: 'Forest Calm',
          pageBg: 'bg-[#121714]',
          sidebarBg: 'bg-[#0E1210] border-white/[0.06]',
          surfaceBg: 'bg-[#19211C] border-white/[0.06]',
          subtleBg: 'bg-[#141A16] border-white/[0.05]',
          textMain: 'text-[#ECF4EE]',
          textMuted: 'text-[#8FA696]',
          divider: 'border-white/[0.06]',
          trackBg: 'bg-white/[0.07]',
          primaryBtn: 'bg-[#52796F] hover:bg-[#618B80] text-white',
          softBadge: 'bg-[#52796F]/20 text-[#B8D8CE] border-[#52796F]/30',
          activeNav: 'bg-white/[0.08] text-white font-semibold',
          progressBar: 'bg-[#6B9E8F]',
          accentText: 'text-[#98C9BA]',
          heatLevels: ['bg-white/[0.04] border-white/[0.05]', 'bg-[#2F4F44]/60 border-[#3E6658]/40', 'bg-[#4E8070]/80 border-[#639685]', 'bg-[#7BB5A3] border-[#98C9BA]']
        };
  }

  // Default: 'warm-sage' (Mehrsan â€” Warm Stone & Muted Sage)
  return isLatte
    ? {
        name: 'Warm Stone & Sage',
        pageBg: 'bg-[#F7F5F0]',
        sidebarBg: 'bg-[#EFECE6] border-[#E2DDD3]',
        surfaceBg: 'bg-white border-[#E6E1D8] shadow-sm shadow-stone-900/[0.02]',
        subtleBg: 'bg-[#F3F0EA] border-[#E2DDD3]',
        textMain: 'text-[#262421]',
        textMuted: 'text-[#78736A]',
        divider: 'border-[#EAE5DC]',
        trackBg: 'bg-[#E5E0D5]',
        primaryBtn: 'bg-[#4F6F68] hover:bg-[#415D57] text-white',
        softBadge: 'bg-[#EAE6DF] text-[#425E58] border-[#D8D2C7]',
        activeNav: 'bg-[#E4DFD5] text-[#262421] font-semibold',
        progressBar: 'bg-[#4F6F68]',
        accentText: 'text-[#425E58]',
        heatLevels: ['bg-[#ECE8E0] border-[#DFD9CE]', 'bg-[#B2C7C1] border-[#9EB5AE]', 'bg-[#6F968D] border-[#5D837A]', 'bg-[#4A6E66] border-[#3C5C55]']
      }
    : {
        name: 'Cozy Espresso',
        pageBg: 'bg-[#161514]',
        sidebarBg: 'bg-[#121110] border-white/[0.06]',
        surfaceBg: 'bg-[#1E1C1A] border-white/[0.06]',
        subtleBg: 'bg-[#181715] border-white/[0.05]',
        textMain: 'text-[#F2EFE9]',
        textMuted: 'text-[#9C968E]',
        divider: 'border-white/[0.06]',
        trackBg: 'bg-white/[0.07]',
        primaryBtn: 'bg-[#587B73] hover:bg-[#668C83] text-white',
        softBadge: 'bg-[#587B73]/20 text-[#C2DBD5] border-[#587B73]/30',
        activeNav: 'bg-white/[0.08] text-white font-semibold',
        progressBar: 'bg-[#6B948B]',
        accentText: 'text-[#9EC4BB]',
        heatLevels: ['bg-white/[0.04] border-white/[0.05]', 'bg-[#334A44]/60 border-[#425E57]/40', 'bg-[#52786F]/80 border-[#668C83]', 'bg-[#82B0A5] border-[#9EC4BB]']
      };
};
