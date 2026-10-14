import { ThemePalette } from './types';

export interface CozyStyle {
  name: string;
  pageBg: string;
  sidebarBg: string;
  cardBg: string;
  innerCardBg: string;
  dockBg: string;
  textMain: string;
  textMuted: string;
  divider: string;
  trackBg: string;
  orb1: string;
  orb2: string;
  primaryBtn: string;
  softBadge: string;
  streakBadge: string;
  doneBadge: string;
  activeNav: string;
  activeBorder: string;
  progressBar: string;
  accentText: string;
  barColor: string;
  timelineLine: string;
  selectionCls: string;
  heatLevels: [string, string, string, string];
}

export const GET_COZY_THEME = (palette: ThemePalette, isLatte: boolean): CozyStyle => {
  const streakBadge = isLatte
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

  const doneBadge = isLatte
    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  if (palette === 'lavender-blush') {
    return isLatte
      ? {
          name: 'Lavender Oat Latte 💜',
          pageBg: 'bg-[#FAF5FF]',
          sidebarBg: 'bg-[#F3E8FF]/95 border-purple-200',
          cardBg: 'bg-white/90 border-purple-200/90 shadow-sm shadow-purple-950/5',
          innerCardBg: 'bg-[#F6EEFC]/90 border-purple-200/75',
          dockBg: 'bg-white/95 border-purple-300 shadow-2xl shadow-purple-950/10',
          textMain: 'text-[#2E1B3B]',
          textMuted: 'text-[#6A517D]',
          divider: 'border-purple-200/80',
          trackBg: 'bg-purple-200/70',
          orb1: 'bg-purple-300/40',
          orb2: 'bg-pink-300/35',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B47AEA] to-[#D685B8] hover:opacity-95 text-white shadow-md shadow-purple-500/20',
          softBadge: 'bg-purple-100 text-purple-900 border-purple-300',
          streakBadge,
          doneBadge,
          activeNav: 'bg-purple-200/80 text-[#2E1B3B] font-bold border-purple-300',
          activeBorder: 'border-purple-400 shadow-lg shadow-purple-300/30',
          progressBar: 'bg-gradient-to-r from-[#9D65C9] via-[#C084FC] to-[#F472B6]',
          accentText: 'text-[#7E3AF2]',
          barColor: 'from-[#9D65C9] to-[#E879F9]',
          timelineLine: 'border-purple-300',
          selectionCls: 'selection:bg-purple-300/50',
          heatLevels: ['bg-purple-100 border-purple-200', 'bg-purple-300 border-purple-400', 'bg-purple-500 border-purple-600', 'bg-fuchsia-600 border-fuchsia-700']
        }
      : {
          name: 'Cozy Velvet Lavender 💜',
          pageBg: 'bg-[#170F21]',
          sidebarBg: 'bg-[#120B1B]/95 border-purple-300/15',
          cardBg: 'bg-[#231832]/85 border-purple-300/15 shadow-xl shadow-black/30',
          innerCardBg: 'bg-[#160F20]/85 border-purple-300/15',
          dockBg: 'bg-[#1E142B]/95 border-purple-400/30 shadow-2xl shadow-black/70',
          textMain: 'text-[#F7F1FF]',
          textMuted: 'text-[#C4B2D6]',
          divider: 'border-purple-300/15',
          trackBg: 'bg-purple-950/80',
          orb1: 'bg-[#9D65C9]/20',
          orb2: 'bg-[#E879F9]/15',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B779E2] to-[#D977B4] hover:opacity-95 text-white shadow-lg shadow-purple-950/50',
          softBadge: 'bg-purple-400/15 text-purple-200 border-purple-300/30',
          streakBadge,
          doneBadge,
          activeNav: 'bg-purple-500/25 text-white border-purple-400/40',
          activeBorder: 'border-purple-400/50 shadow-xl shadow-purple-950/60',
          progressBar: 'bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#F472B6]',
          accentText: 'text-[#DFB6FF]',
          barColor: 'from-[#A855F7] to-[#F472B6]',
          timelineLine: 'border-purple-400/30',
          selectionCls: 'selection:bg-purple-500/40',
          heatLevels: ['bg-purple-950/70 border-purple-800/40', 'bg-purple-700/70 border-purple-500/50', 'bg-purple-500 border-purple-400', 'bg-fuchsia-400 border-pink-300']
        };
  }

  if (palette === 'peach-terracotta') {
    return isLatte
      ? {
          name: 'Warm Terracotta Latte',
          pageBg: 'bg-[#FDF8F5]',
          sidebarBg: 'bg-[#F9EFEA]/95 border-orange-200',
          cardBg: 'bg-white/90 border-orange-200/90 shadow-sm',
          innerCardBg: 'bg-[#FAF0EA]/90 border-orange-200/75',
          dockBg: 'bg-white/95 border-orange-300 shadow-2xl',
          textMain: 'text-[#362019]',
          textMuted: 'text-[#7C584C]',
          divider: 'border-orange-200/80',
          trackBg: 'bg-orange-200/70',
          orb1: 'bg-amber-300/35',
          orb2: 'bg-rose-300/30',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-md',
          softBadge: 'bg-orange-100 text-orange-900 border-orange-300',
          streakBadge,
          doneBadge,
          activeNav: 'bg-orange-200/75 text-[#362019] border-orange-300',
          activeBorder: 'border-orange-400 shadow-lg',
          progressBar: 'bg-gradient-to-r from-[#D97757] to-[#F59E0B]',
          accentText: 'text-[#B84A24]',
          barColor: 'from-[#D97757] to-[#F59E0B]',
          timelineLine: 'border-orange-300',
          selectionCls: 'selection:bg-orange-300/50',
          heatLevels: ['bg-orange-100 border-orange-200', 'bg-orange-300 border-orange-400', 'bg-orange-500 border-orange-600', 'bg-amber-600 border-amber-700']
        }
      : {
          name: 'Fireside Terracotta',
          pageBg: 'bg-[#1B1311]',
          sidebarBg: 'bg-[#140E0C]/95 border-orange-300/15',
          cardBg: 'bg-[#291D1B]/85 border-orange-300/15',
          innerCardBg: 'bg-[#16100E]/85 border-orange-300/15',
          dockBg: 'bg-[#241917]/95 border-orange-400/30 shadow-2xl',
          textMain: 'text-[#FDF4F0]',
          textMuted: 'text-[#CBB2A8]',
          divider: 'border-orange-300/15',
          trackBg: 'bg-orange-950/80',
          orb1: 'bg-orange-500/15',
          orb2: 'bg-amber-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-lg',
          softBadge: 'bg-orange-400/15 text-orange-200 border-orange-300/30',
          streakBadge,
          doneBadge,
          activeNav: 'bg-orange-500/20 text-white border-orange-400/40',
          activeBorder: 'border-orange-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#EA580C] to-[#FBBF24]',
          accentText: 'text-[#FDBA8C]',
          barColor: 'from-[#EA580C] to-[#FBBF24]',
          timelineLine: 'border-orange-400/30',
          selectionCls: 'selection:bg-orange-500/40',
          heatLevels: ['bg-orange-950/60 border-orange-900/40', 'bg-orange-700/60 border-orange-600/40', 'bg-orange-500 border-orange-400', 'bg-amber-400 border-yellow-300']
        };
  }

  if (palette === 'matcha-cream') {
    return isLatte
      ? {
          name: 'Matcha Oat Milk',
          pageBg: 'bg-[#F6F9F4]',
          sidebarBg: 'bg-[#EBF2E6]/95 border-emerald-200',
          cardBg: 'bg-white/90 border-emerald-200/90 shadow-sm',
          innerCardBg: 'bg-[#ECF3E8]/90 border-emerald-200/75',
          dockBg: 'bg-white/95 border-emerald-300 shadow-2xl',
          textMain: 'text-[#1B2E22]',
          textMuted: 'text-[#4F6D59]',
          divider: 'border-emerald-200/80',
          trackBg: 'bg-emerald-200/70',
          orb1: 'bg-emerald-300/30',
          orb2: 'bg-lime-300/25',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-md',
          softBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          streakBadge,
          doneBadge,
          activeNav: 'bg-emerald-200/75 text-[#1B2E22] border-emerald-300',
          activeBorder: 'border-emerald-400 shadow-lg',
          progressBar: 'bg-gradient-to-r from-[#4E8C6F] to-[#84CC16]',
          accentText: 'text-[#2D6A4F]',
          barColor: 'from-[#4E8C6F] to-[#84CC16]',
          timelineLine: 'border-emerald-300',
          selectionCls: 'selection:bg-emerald-300/50',
          heatLevels: ['bg-emerald-100 border-emerald-200', 'bg-emerald-300 border-emerald-400', 'bg-emerald-500 border-emerald-600', 'bg-teal-600 border-teal-700']
        }
      : {
          name: 'Forest Matcha Night',
          pageBg: 'bg-[#101914]',
          sidebarBg: 'bg-[#0B120E]/95 border-emerald-300/15',
          cardBg: 'bg-[#18261F]/85 border-emerald-300/15',
          innerCardBg: 'bg-[#0D1411]/85 border-emerald-300/15',
          dockBg: 'bg-[#15221B]/95 border-emerald-400/30 shadow-2xl',
          textMain: 'text-[#F0FAF4]',
          textMuted: 'text-[#A7C4B3]',
          divider: 'border-emerald-300/15',
          trackBg: 'bg-emerald-950/80',
          orb1: 'bg-emerald-500/15',
          orb2: 'bg-teal-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-lg',
          softBadge: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
          streakBadge,
          doneBadge,
          activeNav: 'bg-emerald-500/20 text-white border-emerald-400/40',
          activeBorder: 'border-emerald-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#10B981] to-[#84CC16]',
          accentText: 'text-[#86EFAC]',
          barColor: 'from-[#10B981] to-[#84CC16]',
          timelineLine: 'border-emerald-400/30',
          selectionCls: 'selection:bg-emerald-500/40',
          heatLevels: ['bg-emerald-950/60 border-emerald-900/40', 'bg-emerald-700/60 border-emerald-600/40', 'bg-emerald-500 border-emerald-400', 'bg-lime-400 border-emerald-300']
        };
  }

  // Default: 'warm-sage' (Mehrsan)
  return isLatte
    ? {
        name: 'Warm Oat & Sage ☕',
        pageBg: 'bg-[#FBF9F5]',
        sidebarBg: 'bg-[#F3EFE6]/95 border-[#DDD3C0]',
        cardBg: 'bg-white/90 border-[#E2D9C8] shadow-sm shadow-stone-900/5',
        innerCardBg: 'bg-[#F4EFE6]/90 border-[#DDD3C0]',
        dockBg: 'bg-white/95 border-[#C8BFA8] shadow-2xl shadow-stone-900/10',
        textMain: 'text-[#292524]',
        textMuted: 'text-[#68625D]',
        divider: 'border-[#E2D9C8]',
        trackBg: 'bg-[#E5DEC9]',
        orb1: 'bg-amber-200/45',
        orb2: 'bg-teal-200/40',
        primaryBtn: 'bg-gradient-to-r from-[#4A6B65] via-[#5B7F78] to-[#B87D4B] hover:opacity-95 text-white shadow-md',
        softBadge: 'bg-[#EFECE6] text-[#3B5752] border-[#CFC6B4]',
        streakBadge,
        doneBadge,
        activeNav: 'bg-[#E5DEC9] text-[#292524] font-bold border-[#C8BFA8]',
        activeBorder: 'border-[#5B7F78] shadow-lg',
        progressBar: 'bg-gradient-to-r from-[#4A6B65] via-[#66968C] to-[#D99B52]',
        accentText: 'text-[#3F5E58]',
        barColor: 'from-[#4A6B65] to-[#D99B52]',
        timelineLine: 'border-[#CFC6B4]',
        selectionCls: 'selection:bg-[#D99B52]/30',
        heatLevels: ['bg-[#EBE5D9] border-[#DCD3C2]', 'bg-[#94B0A7] border-[#7A9A90]', 'bg-[#5B7F78] border-[#4A6B65]', 'bg-[#C88A4B] border-[#B0753B]']
      }
    : {
        name: 'Cozy Espresso & Amber ☕',
        pageBg: 'bg-[#151413]',
        sidebarBg: 'bg-[#100F0E]/95 border-[#2E2A27]',
        cardBg: 'bg-[#211F1D]/85 border-[#36322E] shadow-xl shadow-black/30',
        innerCardBg: 'bg-[#171514]/90 border-[#2C2825]',
        dockBg: 'bg-[#1E1C1A]/95 border-[#443E38] shadow-2xl shadow-black/80',
        textMain: 'text-[#F5F2EB]',
        textMuted: 'text-[#B5AFA9]',
        divider: 'border-[#332F2B]',
        trackBg: 'bg-[#2C2825]',
        orb1: 'bg-[#D99B52]/15',
        orb2: 'bg-[#5B7F78]/20',
        primaryBtn: 'bg-gradient-to-r from-[#5B7F78] to-[#C88A4B] hover:opacity-95 text-white shadow-lg',
        softBadge: 'bg-[#2D2A26] text-[#E6CBA8] border-[#443F3A]',
        streakBadge,
        doneBadge,
        activeNav: 'bg-[#2D2A26] text-white border-[#5B7F78]/60',
        activeBorder: 'border-[#C88A4B]/50 shadow-xl',
        progressBar: 'bg-gradient-to-r from-[#5B7F78] via-[#84A98C] to-[#E09F5A]',
        accentText: 'text-[#E6B88A]',
        barColor: 'from-[#5B7F78] to-[#E09F5A]',
        timelineLine: 'border-[#383430]',
        selectionCls: 'selection:bg-amber-500/30',
        heatLevels: ['bg-[#262320] border-[#332F2B]', 'bg-[#3F5E57] border-[#527870]', 'bg-[#66968C] border-[#84A98C]', 'bg-[#E09F5A] border-[#F3B978]']
      };
};
