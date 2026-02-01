/**
 * Preset Service - Style Presets
 * Professional style presets for quick application
 */
import { StyleSettings } from '../types';

export interface StylePreset {
    id: string;
    name: string;
    icon: string;
    description: string;
    colors: {
        banner: string;
        headline: string;
        description: string;
        accent: string;
    };
    fonts: {
        headline: string;
        description: string;
    };
    sizes: {
        headline: number;
        description: number;
    };
}

export const STYLE_PRESETS: StylePreset[] = [
    {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        icon: '⬜',
        description: 'Clean, professional look',
        colors: {
            banner: '#FFFFFF',
            headline: '#FFFFFF',
            description: '#CCCCCC',
            accent: '#FFFFFF'
        },
        fonts: {
            headline: 'Inter',
            description: 'Inter'
        },
        sizes: {
            headline: 80,
            description: 36
        }
    },
    {
        id: 'bold-loud',
        name: 'Bold & Loud',
        icon: '🔴',
        description: 'High contrast for viral content',
        colors: {
            banner: '#FF0000',
            headline: '#FFFF00',
            description: '#FFFFFF',
            accent: '#FF0000'
        },
        fonts: {
            headline: 'Anton',
            description: 'Roboto'
        },
        sizes: {
            headline: 100,
            description: 38
        }
    },
    {
        id: 'corporate',
        name: 'Corporate Professional',
        icon: '💼',
        description: 'Business and brand announcements',
        colors: {
            banner: '#1E40AF',
            headline: '#FFFFFF',
            description: '#E5E5E5',
            accent: '#3B82F6'
        },
        fonts: {
            headline: 'Montserrat',
            description: 'Open Sans'
        },
        sizes: {
            headline: 75,
            description: 34
        }
    },
    {
        id: 'sports-dynamic',
        name: 'Sports Dynamic',
        icon: '⚽',
        description: 'Energetic design for sports updates',
        colors: {
            banner: '#F97316',
            headline: '#FFFFFF',
            description: '#FED7AA',
            accent: '#EA580C'
        },
        fonts: {
            headline: 'Oswald',
            description: 'Roboto'
        },
        sizes: {
            headline: 95,
            description: 40
        }
    },
    {
        id: 'tech-gaming',
        name: 'Tech / Gaming',
        icon: '🎮',
        description: 'Modern, futuristic aesthetic',
        colors: {
            banner: '#8B5CF6',
            headline: '#22D3EE',
            description: '#E0E7FF',
            accent: '#A855F7'
        },
        fonts: {
            headline: 'Bebas Neue',
            description: 'Inter'
        },
        sizes: {
            headline: 90,
            description: 36
        }
    },
    {
        id: 'elegant-luxury',
        name: 'Elegant / Luxury',
        icon: '👑',
        description: 'Sophisticated design for premium content',
        colors: {
            banner: '#D4AF37',
            headline: '#FEFCE8',
            description: '#FEF3C7',
            accent: '#B8860B'
        },
        fonts: {
            headline: 'Playfair Display',
            description: 'Lato'
        },
        sizes: {
            headline: 85,
            description: 34
        }
    },
    {
        id: 'news-classic',
        name: 'News Classic',
        icon: '📺',
        description: 'Traditional news broadcast look',
        colors: {
            banner: '#DC2626',
            headline: '#FFFFFF',
            description: '#E5E5E5',
            accent: '#B91C1C'
        },
        fonts: {
            headline: 'Oswald',
            description: 'Inter'
        },
        sizes: {
            headline: 90,
            description: 40
        }
    },
    {
        id: 'dark-mode',
        name: 'Dark Mode',
        icon: '🌙',
        description: 'Sleek dark theme',
        colors: {
            banner: '#374151',
            headline: '#F9FAFB',
            description: '#9CA3AF',
            accent: '#6B7280'
        },
        fonts: {
            headline: 'Poppins',
            description: 'Inter'
        },
        sizes: {
            headline: 80,
            description: 36
        }
    }
];

/**
 * Apply preset to StyleSettings
 */
export function applyPreset(preset: StylePreset): StyleSettings {
    return {
        headlineFontSize: preset.sizes.headline,
        descriptionFontSize: preset.sizes.description,
        headlineColor: preset.colors.headline,
        descriptionColor: preset.colors.description,
        bannerColor: preset.colors.banner,
        headlineFont: preset.fonts.headline,
        descriptionFont: preset.fonts.description
    };
}

export function getPreset(id: string): StylePreset | undefined {
    return STYLE_PRESETS.find(p => p.id === id);
}

export function getDefaultPreset(): StylePreset {
    return STYLE_PRESETS.find(p => p.id === 'news-classic') || STYLE_PRESETS[0];
}
