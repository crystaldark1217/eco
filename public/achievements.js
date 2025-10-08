// Enhanced Achievement System for EcoQuest
class EcoQuestAchievements {
    constructor() {
        this.achievements = [];
        this.userAchievements = [];
        this.init();
    }
    
    init() {
        this.defineAchievements();
        this.setupAchievementStyles();
    }
    
    defineAchievements() {
        this.achievements = [
            // Challenge Completion Achievements
            {
                id: 'first_challenge',
                title: 'First Steps',
                description: 'Complete your first eco-challenge',
                icon: 'fa-seedling',
                color: '#4CAF50',
                category: 'challenges',
                condition: (user) => user.completedChallenges?.filter(c => c.approved).length >= 1,
                points: 10
            },
            {
                id: 'challenge_streak_3',
                title: 'Getting Momentum',
                description: 'Complete 3 challenges in a row',
                icon: 'fa-fire',
                color: '#FF5722',
                category: 'streaks',
                condition: (user) => this.getStreak(user) >= 3,
                points: 25
            },
            {
                id: 'challenge_5',
                title: 'Eco Enthusiast',
                description: 'Complete 5 challenges',
                icon: 'fa-star',
                color: '#FF9800',
                category: 'challenges',
                condition: (user) => user.completedChallenges?.filter(c => c.approved).length >= 5,
                points: 50
            },
            {
                id: 'challenge_10',
                title: 'Green Warrior',
                description: 'Complete 10 challenges',
                icon: 'fa-shield-alt',
                color: '#2196F3',
                category: 'challenges',
                condition: (user) => user.completedChallenges?.filter(c => c.approved).length >= 10,
                points: 100
            },
            {
                id: 'challenge_25',
                title: 'Eco Champion',
                description: 'Complete 25 challenges',
                icon: 'fa-crown',
                color: '#9C27B0',
                category: 'challenges',
                condition: (user) => user.completedChallenges?.filter(c => c.approved).length >= 25,
                points: 250
            },
            {
                id: 'challenge_50',
                title: 'Planet Protector',
                description: 'Complete 50 challenges',
                icon: 'fa-globe-americas',
                color: '#00BCD4',
                category: 'challenges',
                condition: (user) => user.completedChallenges?.filter(c => c.approved).length >= 50,
                points: 500
            },
            
            // Points Achievements
            {
                id: 'points_100',
                title: 'Point Collector',
                description: 'Earn 100 points',
                icon: 'fa-gem',
                color: '#E91E63',
                category: 'points',
                condition: (user) => user.points >= 100,
                points: 20
            },
            {
                id: 'points_500',
                title: 'Point Master',
                description: 'Earn 500 points',
                icon: 'fa-diamond',
                color: '#3F51B5',
                category: 'points',
                condition: (user) => user.points >= 500,
                points: 100
            },
            {
                id: 'points_1000',
                title: 'Point Legend',
                description: 'Earn 1000 points',
                icon: 'fa-rocket',
                color: '#673AB7',
                category: 'points',
                condition: (user) => user.points >= 1000,
                points: 200
            },
            
            // Level Achievements
            {
                id: 'level_5',
                title: 'Rising Star',
                description: 'Reach Level 5',
                icon: 'fa-arrow-up',
                color: '#FF5722',
                category: 'levels',
                condition: (user) => user.level >= 5,
                points: 50
            },
            {
                id: 'level_10',
                title: 'Eco Expert',
                description: 'Reach Level 10',
                icon: 'fa-trophy',
                color: '#FF9800',
                category: 'levels',
                condition: (user) => user.level >= 10,
                points: 100
            },
            {
                id: 'level_20',
                title: 'Eco Legend',
                description: 'Reach Level 20',
                icon: 'fa-medal',
                color: '#795548',
                category: 'levels',
                condition: (user) => user.level >= 20,
                points: 200
            }
        ];
    }
    
    setupAchievementStyles() {
        if (!document.querySelector('#achievement-styles')) {
            const styles = document.createElement('style');
            styles.id = 'achievement-styles';
            styles.textContent = `
                .achievements-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .achievement-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .achievement-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                }
                
                .achievement-card.unlocked {
                    border: 2px solid var(--achievement-color);
                    background: linear-gradient(135deg, white, var(--achievement-light-color));
                }
                
                .achievement-card.locked {
                    opacity: 0.6;
                    background: #f5f5f5;
                    border: 2px solid #e0e0e0;
                }
                
                .achievement-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    text-align: center;
                    position: relative;
                }
                
                .achievement-card.unlocked .achievement-icon {
                    color: var(--achievement-color);
                    animation: achievementGlow 2s ease-in-out infinite alternate;
                }
                
                .achievement-card.locked .achievement-icon {
                    color: #ccc;
                }
                
                .achievement-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    text-align: center;
                }
                
                .achievement-card.unlocked .achievement-title {
                    color: #2d5a27;
                }
                
                .achievement-card.locked .achievement-title {
                    color: #999;
                }
                
                .achievement-description {
                    color: #666;
                    text-align: center;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                
                .achievement-status {
                    text-align: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 0.5rem;
                    border-radius: 20px;
                    margin-top: 1rem;
                }
                
                .achievement-card.unlocked .achievement-status {
                    background: var(--achievement-color);
                    color: white;
                }
                
                .achievement-card.locked .achievement-status {
                    background: #e0e0e0;
                    color: #999;
                }
                
                .achievement-progress {
                    margin-top: 1rem;
                }
                
                .achievement-progress-bar {
                    background: #e0e0e0;
                    border-radius: 10px;
                    height: 8px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .achievement-progress-fill {
                    height: 100%;
                    background: var(--achievement-color);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }
                
                .achievement-progress-text {
                    font-size: 0.8rem;
                    color: #666;
                    text-align: center;
                }
                
                .achievement-category-filter {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }
                
                .category-filter-btn {
                    padding: 0.5rem 1rem;
                    border: 2px solid #e0e0e0;
                    background: white;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                .category-filter-btn:hover {
                    border-color: #4CAF50;
                    background: #f0f8f0;
                }
                
                .category-filter-btn.active {
                    background: #4CAF50;
                    color: white;
                    border-color: #4CAF50;
                }
                
                .achievement-stats {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }
                
                .achievement-stat {
                    text-align: center;
                }
                
                .achievement-stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #4CAF50;
                }
                
                .achievement-stat-label {
                    font-size: 0.9rem;
                    color: #666;
                }
                
                @keyframes achievementGlow {
                    0% { text-shadow: 0 0 5px currentColor; }
                    100% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
                }
                
                @media (max-width: 768px) {
                    .achievements-container {
                        grid-template-columns: 1fr;
                    }
                    
                    .achievement-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .category-filter-btn {
                        font-size: 0.8rem;
                        padding: 0.4rem 0.8rem;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    async checkAchievements(user) {
        const newAchievements = [];
        const currentAchievements = user.achievements || [];
        
        for (const achievement of this.achievements) {
            const hasAchievement = currentAchievements.includes(achievement.id);
            const meetsCondition = achievement.condition(user);
            
            if (!hasAchievement && meetsCondition) {
                newAchievements.push(achievement);
            }
        }
        
        return newAchievements;
    }
    
    renderAchievements(user, containerId, category = 'all') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const userAchievements = user.achievements || [];
        const filteredAchievements = category === 'all' 
            ? this.achievements 
            : this.achievements.filter(a => a.category === category);
        
        const stats = this.calculateStats(user);
        
        container.innerHTML = `
            <div class="achievement-stats">
                <div class="achievement-stat">
                    <div class="achievement-stat-value">${stats.unlocked}</div>
                    <div class="achievement-stat-label">Unlocked</div>
                </div>
                <div class="achievement-stat">
                    <div class="achievement-stat-value">${stats.total}</div>
                    <div class="achievement-stat-label">Total</div>
                </div>
                <div class="achievement-stat">
                    <div class="achievement-stat-value">${Math.round(stats.percentage)}%</div>
                    <div class="achievement-stat-label">Complete</div>
                </div>
                <div class="achievement-stat">
                    <div class="achievement-stat-value">${stats.points}</div>
                    <div class="achievement-stat-label">Bonus Points</div>
                </div>
            </div>
            
            <div class="achievement-category-filter">
                <button class="category-filter-btn ${category === 'all' ? 'active' : ''}" 
                        onclick="window.ecoQuestAchievements?.filterByCategory('${containerId}', 'all')">
                    All
                </button>
                <button class="category-filter-btn ${category === 'challenges' ? 'active' : ''}" 
                        onclick="window.ecoQuestAchievements?.filterByCategory('${containerId}', 'challenges')">
                    Challenges
                </button>
                <button class="category-filter-btn ${category === 'points' ? 'active' : ''}" 
                        onclick="window.ecoQuestAchievements?.filterByCategory('${containerId}', 'points')">
                    Points
                </button>
                <button class="category-filter-btn ${category === 'levels' ? 'active' : ''}" 
                        onclick="window.ecoQuestAchievements?.filterByCategory('${containerId}', 'levels')">
                    Levels
                </button>
                <button class="category-filter-btn ${category === 'streaks' ? 'active' : ''}" 
                        onclick="window.ecoQuestAchievements?.filterByCategory('${containerId}', 'streaks')">
                    Streaks
                </button>
            </div>
            
            <div class="achievements-container">
                ${filteredAchievements.map(achievement => this.renderAchievementCard(achievement, user)).join('')}
            </div>
        `;
    }
    
    renderAchievementCard(achievement, user) {
        const isUnlocked = (user.achievements || []).includes(achievement.id) || achievement.condition(user);
        const progress = this.getAchievementProgress(achievement, user);
        
        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                 style="--achievement-color: ${achievement.color}; --achievement-light-color: ${achievement.color}20;">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                    ${isUnlocked ? '<div style="position: absolute; top: -5px; right: -5px; background: #4CAF50; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;"><i class="fas fa-check"></i></div>' : ''}
                </div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                
                ${!isUnlocked && progress.current < progress.total ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar">
                            <div class="achievement-progress-fill" 
                                 style="width: ${(progress.current / progress.total) * 100}%; background: ${achievement.color};"></div>
                        </div>
                        <div class="achievement-progress-text">
                            ${progress.current} / ${progress.total}
                        </div>
                    </div>
                ` : ''}
                
                <div class="achievement-status">
                    ${isUnlocked ? `<i class="fas fa-check"></i> Unlocked (+${achievement.points} pts)` : '<i class="fas fa-lock"></i> Locked'}
                </div>
            </div>
        `;
    }
    
    calculateStats(user) {
        const userAchievements = user.achievements || [];
        const unlockedByCondition = this.achievements.filter(a => a.condition(user)).length;
        const unlocked = Math.max(userAchievements.length, unlockedByCondition);
        const total = this.achievements.length;
        const percentage = total > 0 ? (unlocked / total) * 100 : 0;
        const points = this.achievements
            .filter(a => userAchievements.includes(a.id) || a.condition(user))
            .reduce((sum, a) => sum + a.points, 0);
        
        return { unlocked, total, percentage, points };
    }
    
    getAchievementProgress(achievement, user) {
        // This is a simplified progress calculation
        switch (achievement.id) {
            case 'first_challenge':
                return { current: Math.min(user.completedChallenges?.filter(c => c.approved).length || 0, 1), total: 1 };
            case 'challenge_5':
                return { current: Math.min(user.completedChallenges?.filter(c => c.approved).length || 0, 5), total: 5 };
            case 'challenge_10':
                return { current: Math.min(user.completedChallenges?.filter(c => c.approved).length || 0, 10), total: 10 };
            case 'challenge_25':
                return { current: Math.min(user.completedChallenges?.filter(c => c.approved).length || 0, 25), total: 25 };
            case 'challenge_50':
                return { current: Math.min(user.completedChallenges?.filter(c => c.approved).length || 0, 50), total: 50 };
            case 'points_100':
                return { current: Math.min(user.points || 0, 100), total: 100 };
            case 'points_500':
                return { current: Math.min(user.points || 0, 500), total: 500 };
            case 'points_1000':
                return { current: Math.min(user.points || 0, 1000), total: 1000 };
            case 'level_5':
                return { current: Math.min(user.level || 1, 5), total: 5 };
            case 'level_10':
                return { current: Math.min(user.level || 1, 10), total: 10 };
            case 'level_20':
                return { current: Math.min(user.level || 1, 20), total: 20 };
            default:
                return { current: 0, total: 1 };
        }
    }
    
    filterByCategory(containerId, category) {
        const user = EcoQuest.getCurrentUser();
        this.renderAchievements(user, containerId, category);
    }
    
    // Helper methods for achievement conditions
    getStreak(user) {
        // Simplified streak calculation
        const challenges = user.completedChallenges?.filter(c => c.approved) || [];
        return Math.min(challenges.length, 10); // Simplified for demo
    }
}

// Initialize achievements system
document.addEventListener('DOMContentLoaded', () => {
    if (EcoQuest && EcoQuest.isAuthenticated()) {
        window.ecoQuestAchievements = new EcoQuestAchievements();
    }
});

// Make it globally available
window.EcoQuestAchievements = EcoQuestAchievements;