import React from 'react';
import * as Icons from 'lucide-react';
import { AchievementType, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';

interface Props {
    iconName: string;
    type: AchievementType;
    category: Category;
    unlocked: boolean;
    size?: number;
}

export const AchievementIcon: React.FC<Props> = ({ iconName, type, category, unlocked, size = 32 }) => {
    const LucideIcon = (Icons as any)[iconName] || Icons.HelpCircle;

    // 1. Determine Base Color based on Category
    const categoryColor = CATEGORY_COLORS[category] || '#7E7E7E';

    // 2. Define Styles based on state
    // If locked: Stone/Gray look
    // If unlocked: Use the category color with light/dark variants

    const getCategoryStyles = (baseColor: string) => {
        return {
            bg: baseColor,
            light: adjustColor(baseColor, 40), // lighter
            dark: adjustColor(baseColor, -40)  // darker
        };
    };

    const lockedStyle = {
        bg: '#3f3f46',     // Zinc 700
        light: '#71717a',  // Zinc 500
        dark: '#27272a'    // Zinc 800
    };

    const currentStyle = unlocked ? getCategoryStyles(categoryColor) : lockedStyle;

    const isGoal = type === AchievementType.GOAL;
    const isChallenge = type === AchievementType.CHALLENGE;

    let borderRadius = '4px';
    if (isGoal) borderRadius = '50%';
    if (isChallenge) borderRadius = '2px';

    const containerSize = 'w-20 h-20 min-w-[80px] min-h-[80px]';

    const isSvgPath = iconName.endsWith('.svg');

    return (
        <CardContainer containerClassName={containerSize} className="w-full h-full min-w-[80px] min-h-[80px]">
            <CardBody className="relative w-full h-full min-w-[80px] min-h-[80px]">

                {/* 1. Shadow Layer */}
                <CardItem translateZ="-20" className="absolute inset-0 w-full h-full">
                    <div
                        className="w-full h-full bg-black opacity-60"
                        style={{
                            borderRadius: borderRadius,
                            transform: isChallenge ? 'rotate(45deg) scale(0.85) translate(4px, 4px)' : 'translate(6px, 6px)'
                        }}
                    />
                </CardItem>

                {/* 2. Main Frame Layer */}
                <CardItem translateZ="30" className="w-full h-full">
                    <div
                        className="w-full h-full"
                        style={{ transform: isChallenge ? 'rotate(45deg) scale(0.85)' : 'none' }}
                    >
                        <div
                            className={`
                            relative flex items-center justify-center w-full h-full 
                            border-4 transition-colors duration-300
                            ${!unlocked ? 'grayscale-[0.8]' : ''}
                        `}
                            style={{
                                backgroundColor: currentStyle.bg,
                                borderTopColor: currentStyle.light,
                                borderLeftColor: currentStyle.light,
                                borderBottomColor: currentStyle.dark,
                                borderRightColor: currentStyle.dark,
                                borderRadius: borderRadius,
                                boxShadow: `inset 0 0 15px rgba(0,0,0,0.3)`
                            }}
                        >
                            {/* Inner Decorative Inset for non-goals */}
                            {!isGoal && (
                                <div className="absolute inset-1 border-2 border-black/10 pointer-events-none" style={{ borderRadius: '2px' }}></div>
                            )}

                            {/* 3. Icon Layer */}
                            <CardItem
                                translateZ="50"
                                className="relative z-10 flex items-center justify-center"
                            >
                                <div style={{ transform: isChallenge ? 'rotate(-45deg)' : 'none' }}>
                                    {isSvgPath ? (
                                        <img
                                            src={iconName}
                                            alt="icon"
                                            width={size}
                                            height={size}
                                            style={{
                                                filter: unlocked ? 'brightness(1) drop-shadow(2px 2px 0px rgba(0,0,0,0.6))' : 'brightness(0.6) drop-shadow(2px 2px 0px rgba(0,0,0,0.3))',
                                                opacity: unlocked ? 1 : 0.6
                                            }}
                                            className="transition-all duration-300"
                                        />
                                    ) : (
                                        <LucideIcon
                                            size={size}
                                            color={unlocked ? 'white' : '#a1a1aa'}
                                            className={`transition-all duration-300 ${unlocked ? 'drop-shadow-md' : 'opacity-60'}`}
                                            style={{
                                                filter: unlocked ? 'drop-shadow(2px 2px 0px rgba(0,0,0,0.6))' : 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))'
                                            }}
                                        />
                                    )}
                                </div>
                            </CardItem>
                        </div>
                    </div>
                </CardItem>

                {/* 4. Shine - Floating on top */}
                {unlocked && (
                    <CardItem translateZ="60" className="absolute top-0 right-0 pointer-events-none">
                        <div
                            className="w-3 h-3 bg-white opacity-40 rounded-full blur-[2px]"
                            style={{ transform: isChallenge ? 'translate(-12px, 12px)' : 'translate(-6px, 6px)' }}
                        />
                    </CardItem>
                )}

            </CardBody>
        </CardContainer>
    );
};

// Helper to lighten/darken hex color
function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}