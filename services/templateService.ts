/**
 * Template Service - Universal Templates
 * Defines all available news card templates
 */

export type TemplateType = 'breaking' | 'quote' | 'fact' | 'announcement' | 'comparison' | 'list' | 'poll' | 'coming-soon' | 'milestone';

export interface Template {
    id: TemplateType;
    name: string;
    icon: string;
    description: string;
    defaultBanner: string;
    bannerVisible: boolean;
    layout: {
        headlinePosition: 'top' | 'center' | 'bottom';
        descriptionPosition: 'below-headline' | 'center' | 'bottom';
        textAlign: 'left' | 'center' | 'right';
    };
}

export const TEMPLATES: Template[] = [
    {
        id: 'breaking',
        name: 'Breaking Update',
        icon: '🔴',
        description: 'News, sports scores, urgent announcements',
        defaultBanner: 'BREAKING NEWS',
        bannerVisible: true,
        layout: {
            headlinePosition: 'bottom',
            descriptionPosition: 'below-headline',
            textAlign: 'left'
        }
    },
    {
        id: 'quote',
        name: 'Quote Card',
        icon: '💬',
        description: 'Motivational quotes, celebrity statements',
        defaultBanner: '',
        bannerVisible: false,
        layout: {
            headlinePosition: 'center',
            descriptionPosition: 'bottom',
            textAlign: 'center'
        }
    },
    {
        id: 'fact',
        name: 'Fact Card',
        icon: '💡',
        description: 'Did you know, statistics, trivia',
        defaultBanner: 'DID YOU KNOW?',
        bannerVisible: true,
        layout: {
            headlinePosition: 'center',
            descriptionPosition: 'below-headline',
            textAlign: 'center'
        }
    },
    {
        id: 'announcement',
        name: 'Announcement',
        icon: '📢',
        description: 'Events, launches, updates, milestones',
        defaultBanner: 'ANNOUNCEMENT',
        bannerVisible: true,
        layout: {
            headlinePosition: 'center',
            descriptionPosition: 'below-headline',
            textAlign: 'center'
        }
    },
    {
        id: 'comparison',
        name: 'Comparison',
        icon: '⚔️',
        description: 'Versus format, before/after, side-by-side',
        defaultBanner: 'VS',
        bannerVisible: true,
        layout: {
            headlinePosition: 'center',
            descriptionPosition: 'bottom',
            textAlign: 'center'
        }
    },
    {
        id: 'list',
        name: 'List Card',
        icon: '📋',
        description: 'Top 5 lists, tips, steps, rankings',
        defaultBanner: 'TOP 5',
        bannerVisible: true,
        layout: {
            headlinePosition: 'top',
            descriptionPosition: 'center',
            textAlign: 'left'
        }
    },
    {
        id: 'poll',
        name: 'Poll / Question',
        icon: '❓',
        description: 'Engagement posts, community questions',
        defaultBanner: 'YOUR OPINION',
        bannerVisible: true,
        layout: {
            headlinePosition: 'center',
            descriptionPosition: 'below-headline',
            textAlign: 'center'
        }
    },
    {
        id: 'coming-soon',
        name: 'Coming Soon',
        icon: '🚀',
        description: 'Teaser announcements, launches',
        defaultBanner: 'COMING SOON',
        bannerVisible: true,
        layout: {
            headlinePosition: 'center',
            descriptionPosition: 'below-headline',
            textAlign: 'center'
        }
    },
    {
        id: 'milestone',
        name: 'Thank You / Milestone',
        icon: '🎉',
        description: 'Celebrating achievements',
        defaultBanner: 'THANK YOU',
        bannerVisible: true,
        layout: {
            headlinePosition: 'center',
            descriptionPosition: 'below-headline',
            textAlign: 'center'
        }
    }
];

export function getTemplate(id: TemplateType): Template {
    return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

export function getDefaultTemplate(): Template {
    return TEMPLATES[0];
}
