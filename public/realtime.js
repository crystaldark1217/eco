// Real-time WebSocket functionality for EcoQuest
class EcoQuestRealtime {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.eventHandlers = new Map();
        
        this.init();
    }
    
    init() {
        this.connect();
        this.setupHeartbeat();
    }
    
    connect() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.authenticate();
                this.showConnectionStatus('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.showConnectionStatus('disconnected');
                this.attemptReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showConnectionStatus('error');
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.attemptReconnect();
        }
    }
    
    authenticate() {
        const token = localStorage.getItem('token');
        if (token && this.isConnected) {
            this.send({
                type: 'authenticate',
                token: token
            });
        }
    }
    
    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected, message not sent:', data);
        }
    }
    
    handleMessage(data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'user_update':
                this.handleUserUpdate(payload);
                break;
            case 'challenge_approved':
                this.handleChallengeApproved(payload);
                break;
            case 'challenge_rejected':
                this.handleChallengeRejected(payload);
                break;
            case 'new_challenge':
                this.handleNewChallenge(payload);
                break;
            case 'leaderboard_update':
                this.handleLeaderboardUpdate(payload);
                break;
            case 'achievement_unlocked':
                this.handleAchievementUnlocked(payload);
                break;
            case 'notification':
                this.handleNotification(payload);
                break;
            default:
                console.log('Unknown message type:', type, payload);
        }
        
        // Trigger custom event handlers
        if (this.eventHandlers.has(type)) {
            this.eventHandlers.get(type).forEach(handler => handler(payload));
        }
    }
    
    handleUserUpdate(payload) {
        // Update user data in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...payload };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update UI elements
        this.updateUserStats(updatedUser);
        
        // Show points animation if points increased
        if (payload.points && payload.points > currentUser.points) {
            this.showPointsAnimation(payload.points - currentUser.points);
        }
    }
    
    handleChallengeApproved(payload) {
        EcoQuest.showNotification(
            `🎉 Challenge "${payload.challengeTitle}" approved! You earned ${payload.points} points!`,
            'success',
            8000
        );
        
        // Trigger confetti animation
        this.showCelebration();
        
        // Update dashboard if on dashboard page
        if (window.location.pathname === '/dashboard') {
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
    
    handleChallengeRejected(payload) {
        EcoQuest.showNotification(
            `❌ Challenge "${payload.challengeTitle}" was rejected. Please try again with a better photo.`,
            'error',
            6000
        );
    }
    
    handleNewChallenge(payload) {
        EcoQuest.showNotification(
            `🆕 New challenge available: "${payload.title}"!`,
            'info',
            5000
        );
        
        // Update challenges list if on dashboard
        if (window.location.pathname === '/dashboard' && typeof loadChallenges === 'function') {
            loadChallenges();
        }
    }
    
    handleLeaderboardUpdate(payload) {
        // Update leaderboard if visible
        if (document.getElementById('leaderboard-container')) {
            this.updateLeaderboard(payload);
        }
    }
    
    handleAchievementUnlocked(payload) {
        this.showAchievementModal(payload);
        EcoQuest.showNotification(
            `🏆 Achievement Unlocked: ${payload.title}!`,
            'success',
            6000
        );
    }
    
    handleNotification(payload) {
        EcoQuest.showNotification(payload.message, payload.type || 'info', payload.duration || 5000);
    }
    
    updateUserStats(user) {
        // Update various UI elements with new user data
        const elements = {
            'username': user.username,
            'user-points': user.points,
            'user-level': user.level,
            'profile-points': user.points,
            'profile-level': user.level
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        if (progressBar && progressText) {
            const currentLevelPoints = user.points % 100;
            progressBar.style.width = currentLevelPoints + '%';
            progressText.textContent = `${currentLevelPoints} / 100 points to next level`;
        }
    }
    
    showPointsAnimation(points) {
        const animation = document.createElement('div');
        animation.className = 'points-animation';
        animation.innerHTML = `+${points} points!`;
        animation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 10000;
            animation: pointsFloat 3s ease-out forwards;
            box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        `;
        
        // Add animation styles if not already present
        if (!document.querySelector('#points-animation-styles')) {
            const styles = document.createElement('style');
            styles.id = 'points-animation-styles';
            styles.textContent = `
                @keyframes pointsFloat {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                    80% {
                        opacity: 1;
                        transform: translate(-50%, -60%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -80%) scale(0.8);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 3000);
    }
    
    showCelebration() {
        // Simple confetti-like celebration
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 50);
        }
    }
    
    createConfetti() {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'][Math.floor(Math.random() * 5)]};
            top: -10px;
            left: ${Math.random() * 100}%;
            z-index: 10000;
            border-radius: 50%;
            animation: confettiFall 3s linear forwards;
        `;
        
        // Add confetti animation if not present
        if (!document.querySelector('#confetti-styles')) {
            const styles = document.createElement('style');
            styles.id = 'confetti-styles';
            styles.textContent = `
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
    
    showConnectionStatus(status) {
        let statusElement = document.getElementById('connection-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'connection-status';
            statusElement.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                z-index: 1000;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusElement);
        }
        
        const statusConfig = {
            connected: {
                text: '🟢 Connected',
                style: 'background: #4CAF50; color: white;'
            },
            disconnected: {
                text: '🔴 Disconnected',
                style: 'background: #f44336; color: white;'
            },
            error: {
                text: '⚠️ Connection Error',
                style: 'background: #FF9800; color: white;'
            }
        };
        
        const config = statusConfig[status];
        statusElement.textContent = config.text;
        statusElement.style.cssText += config.style;
        
        // Hide connected status after 3 seconds
        if (status === 'connected') {
            setTimeout(() => {
                statusElement.style.opacity = '0';
                setTimeout(() => {
                    if (statusElement.parentElement) {
                        statusElement.remove();
                    }
                }, 300);
            }, 3000);
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.log('Max reconnection attempts reached');
            this.showConnectionStatus('error');
        }
    }
    
    setupHeartbeat() {
        setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping' });
            }
        }, 30000); // Send ping every 30 seconds
    }
    
    // Public methods for subscribing to events
    on(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType).push(handler);
    }
    
    off(eventType, handler) {
        if (this.eventHandlers.has(eventType)) {
            const handlers = this.eventHandlers.get(eventType);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
}

// Initialize real-time connection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is authenticated
    if (EcoQuest && EcoQuest.isAuthenticated()) {
        window.ecoQuestRealtime = new EcoQuestRealtime();
    }
});

// Make it globally available
window.EcoQuestRealtime = EcoQuestRealtime;