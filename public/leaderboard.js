// Leaderboard functionality for EcoQuest
class EcoQuestLeaderboard {
    constructor() {
        this.leaderboardData = [];
        this.currentUser = null;
        this.refreshInterval = null;
        this.init();
    }
    
    init() {
        this.currentUser = EcoQuest.getCurrentUser();
        this.setupLeaderboardContainer();
        this.loadLeaderboard();
        this.startAutoRefresh();
    }
    
    setupLeaderboardContainer() {
        // Add leaderboard styles if not present
        if (!document.querySelector('#leaderboard-styles')) {
            const styles = document.createElement('style');
            styles.id = 'leaderboard-styles';
            styles.textContent = `
                .leaderboard-widget {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .leaderboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e0e0e0;
                }
                
                .leaderboard-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #2d5a27;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .leaderboard-refresh {
                    background: none;
                    border: none;
                    color: #4CAF50;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                
                .leaderboard-refresh:hover {
                    background: #f0f8f0;
                    transform: rotate(180deg);
                }
                
                .leaderboard-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                .leaderboard-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border-radius: 8px;
                    background: #f8f9fa;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .leaderboard-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                
                .leaderboard-item.current-user {
                    background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
                    border: 2px solid #4CAF50;
                }
                
                .leaderboard-item.top-three {
                    background: linear-gradient(135deg, #fff8e1, #fffde7);
                }
                
                .leaderboard-item.rank-1 {
                    background: linear-gradient(135deg, #fff8e1, #ffecb3);
                    border-left: 4px solid #FFD700;
                }
                
                .leaderboard-item.rank-2 {
                    background: linear-gradient(135deg, #f3e5f5, #e1bee7);
                    border-left: 4px solid #C0C0C0;
                }
                
                .leaderboard-item.rank-3 {
                    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
                    border-left: 4px solid #CD7F32;
                }
                
                .rank {
                    font-size: 1.2rem;
                    font-weight: bold;
                    min-width: 40px;
                    text-align: center;
                    margin-right: 1rem;
                }
                
                .rank i {
                    font-size: 1.5rem;
                }
                
                .user-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                
                .username {
                    font-weight: 600;
                    color: #2d5a27;
                    font-size: 1rem;
                }
                
                .level {
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .points {
                    font-weight: 600;
                    color: #4CAF50;
                    font-size: 1rem;
                    text-align: right;
                    min-width: 80px;
                }
                
                .leaderboard-loading {
                    text-align: center;
                    padding: 2rem;
                    color: #666;
                }
                
                .leaderboard-error {
                    text-align: center;
                    padding: 2rem;
                    color: #f44336;
                }
                
                .leaderboard-empty {
                    text-align: center;
                    padding: 2rem;
                    color: #666;
                }
                
                .user-rank-info {
                    background: #e8f5e8;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-top: 1rem;
                    text-align: center;
                }
                
                @media (max-width: 768px) {
                    .leaderboard-item {
                        padding: 0.75rem;
                    }
                    
                    .rank {
                        min-width: 30px;
                        margin-right: 0.75rem;
                    }
                    
                    .username {
                        font-size: 0.9rem;
                    }
                    
                    .points {
                        font-size: 0.9rem;
                        min-width: 60px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    async loadLeaderboard() {
        try {
            const response = await EcoQuest.api.get('/leaderboard');
            if (response.success) {
                this.leaderboardData = response.data;
                this.renderLeaderboard();
            } else {
                throw new Error(response.message || 'Failed to load leaderboard');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.renderError('Failed to load leaderboard. Please try again.');
        }
    }
    
    renderLeaderboard() {
        const containers = document.querySelectorAll('.leaderboard-container, #leaderboard-container');
        
        containers.forEach(container => {
            if (this.leaderboardData.length === 0) {
                container.innerHTML = this.renderEmpty();
                return;
            }
            
            const currentUserRank = this.findCurrentUserRank();
            
            container.innerHTML = `
                <div class="leaderboard-widget">
                    <div class="leaderboard-header">
                        <div class="leaderboard-title">
                            <i class="fas fa-trophy"></i>
                            Leaderboard
                        </div>
                        <button class="leaderboard-refresh" onclick="window.ecoQuestLeaderboard?.refresh()" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    
                    <div class="leaderboard-list">
                        ${this.leaderboardData.slice(0, 10).map((user, index) => this.renderLeaderboardItem(user, index)).join('')}
                    </div>
                    
                    ${currentUserRank > 10 ? this.renderCurrentUserRank(currentUserRank) : ''}
                </div>
            `;
        });
    }
    
    renderLeaderboardItem(user, index) {
        const rank = index + 1;
        const isCurrentUser = this.currentUser && user._id === this.currentUser.id;
        const isTopThree = rank <= 3;
        
        let rankDisplay;
        if (rank === 1) {
            rankDisplay = '<i class="fas fa-trophy" style="color: #FFD700;"></i>';
        } else if (rank === 2) {
            rankDisplay = '<i class="fas fa-trophy" style="color: #C0C0C0;"></i>';
        } else if (rank === 3) {
            rankDisplay = '<i class="fas fa-trophy" style="color: #CD7F32;"></i>';
        } else {
            rankDisplay = `#${rank}`;
        }
        
        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${isTopThree ? `top-three rank-${rank}` : ''}" 
                 data-user-id="${user._id}" data-rank="${rank}">
                <div class="rank">${rankDisplay}</div>
                <div class="user-info">
                    <div class="username">
                        ${user.username}
                        ${isCurrentUser ? '<i class="fas fa-user" style="color: #4CAF50; margin-left: 0.5rem;"></i>' : ''}
                    </div>
                    <div class="level">Level ${user.level}</div>
                </div>
                <div class="points">${EcoQuest.formatPoints(user.points)} pts</div>
            </div>
        `;
    }
    
    renderCurrentUserRank(rank) {
        const currentUser = this.leaderboardData.find(user => user._id === this.currentUser.id);
        if (!currentUser) return '';
        
        return `
            <div class="user-rank-info">
                <div style="font-weight: 600; color: #2d5a27; margin-bottom: 0.5rem;">Your Rank</div>
                <div style="font-size: 1.2rem;">
                    #${rank} - ${currentUser.username}
                </div>
                <div style="color: #666; font-size: 0.9rem;">
                    ${EcoQuest.formatPoints(currentUser.points)} points • Level ${currentUser.level}
                </div>
            </div>
        `;
    }
    
    renderLoading() {
        return `
            <div class="leaderboard-widget">
                <div class="leaderboard-loading">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem; color: #4CAF50;"></i>
                    <p>Loading leaderboard...</p>
                </div>
            </div>
        `;
    }
    
    renderError(message) {
        const containers = document.querySelectorAll('.leaderboard-container, #leaderboard-container');
        containers.forEach(container => {
            container.innerHTML = `
                <div class="leaderboard-widget">
                    <div class="leaderboard-error">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="window.ecoQuestLeaderboard?.refresh()">
                            <i class="fas fa-retry"></i>
                            Try Again
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    renderEmpty() {
        return `
            <div class="leaderboard-widget">
                <div class="leaderboard-empty">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; color: #ccc;"></i>
                    <p>No users on the leaderboard yet.</p>
                    <p>Complete challenges to be the first!</p>
                </div>
            </div>
        `;
    }
    
    findCurrentUserRank() {
        if (!this.currentUser) return -1;
        
        const userIndex = this.leaderboardData.findIndex(user => user._id === this.currentUser.id);
        return userIndex >= 0 ? userIndex + 1 : -1;
    }
    
    async refresh() {
        const refreshButton = document.querySelector('.leaderboard-refresh');
        if (refreshButton) {
            refreshButton.style.transform = 'rotate(360deg)';
        }
        
        await this.loadLeaderboard();
        
        if (refreshButton) {
            setTimeout(() => {
                refreshButton.style.transform = '';
            }, 500);
        }
    }
    
    startAutoRefresh() {
        // Refresh leaderboard every 2 minutes
        this.refreshInterval = setInterval(() => {
            this.loadLeaderboard();
        }, 120000);
    }
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    // Method to update leaderboard with real-time data
    updateWithRealtimeData(data) {
        this.leaderboardData = data;
        this.renderLeaderboard();
    }
    
    // Method to add leaderboard to any page
    static addToPage(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }
        
        container.classList.add('leaderboard-container');
        
        if (!window.ecoQuestLeaderboard) {
            window.ecoQuestLeaderboard = new EcoQuestLeaderboard();
        }
    }
    
    destroy() {
        this.stopAutoRefresh();
    }
}

// Auto-initialize if leaderboard container exists
document.addEventListener('DOMContentLoaded', () => {
    const leaderboardContainers = document.querySelectorAll('.leaderboard-container, #leaderboard-container');
    if (leaderboardContainers.length > 0 && EcoQuest && EcoQuest.isAuthenticated()) {
        window.ecoQuestLeaderboard = new EcoQuestLeaderboard();
    }
});

// Make it globally available
window.EcoQuestLeaderboard = EcoQuestLeaderboard;