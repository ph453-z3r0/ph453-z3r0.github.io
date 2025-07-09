// Constants for zone capacities
const ZONE_CAPACITIES = {
    'Zone A': 500,
    'Zone B': 500,
    'Zone C': 500
};

// Fixed occupancy data for testing
const ZONE_OCCUPANCY = {
    'A': 324,
    'B': 156,
    'C': 467
};

// Navigation handling
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update navigation
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update sections with animation
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                    setTimeout(() => section.classList.add('active'), 10);
                } else {
                    section.classList.remove('active');
                    setTimeout(() => {
                        if (!section.classList.contains('active')) {
                            section.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
}

// Initialize the dashboard with fixed numbers
function initializeDashboard() {
    const elements = {
        totalVisitors: '2,547',
        activeZones: '3',
        alertCount: '2',
        droneCount: '3'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Feed Management
const addFeedBtn = document.getElementById('addFeedBtn');
const addFeedModal = document.getElementById('addFeedModal');
const feedGrid = document.getElementById('feedGrid');
let selectedFeedType = null;

addFeedBtn.addEventListener('click', () => {
    addFeedModal.classList.add('active');
});

document.querySelector('.close-btn').addEventListener('click', () => {
    addFeedModal.classList.remove('active');
});

document.querySelectorAll('.feed-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.feed-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFeedType = btn.dataset.type;
    });
});

document.getElementById('addFeedForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const feedName = e.target.querySelector('input').value;
    const location = e.target.querySelector('select').value;
    
    if (feedName && location && selectedFeedType) {
        addNewFeed(feedName, location, selectedFeedType);
        addFeedModal.classList.remove('active');
        e.target.reset();
        selectedFeedType = null;
        document.querySelectorAll('.feed-type-btn').forEach(b => b.classList.remove('active'));
    }
});

function addNewFeed(name, location, type) {
    const feed = document.createElement('div');
    feed.className = 'feed-card';
    feed.dataset.feedType = type;
    feed.innerHTML = `
        <div class="feed-content">
            <img src="placeholder-feed.jpg" alt="${name}">
            <div class="feed-overlay">
                <div class="feed-status">
                    <span class="status-dot"></span>
                    <span>Live</span>
                </div>
                <div class="feed-info">
                    <i class="fas ${type === 'cctv' ? 'fa-video' : 'fa-drone'}"></i>
                    <span>${location}</span>
                </div>
            </div>
        </div>
        <div class="feed-footer">
            <span>${name}</span>
            <div class="feed-actions">
                <button class="btn small" onclick="toggleFullscreen(this)">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
    `;
    feedGrid.appendChild(feed);
}

// Fullscreen functionality
function toggleFullscreen(button) {
    const feedCard = button.closest('.feed-card');
    const icon = button.querySelector('i');
    
    if (feedCard.classList.toggle('fullscreen')) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
        document.body.style.overflow = 'hidden';
    } else {
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
        document.body.style.overflow = '';
    }
}

// Feed type filtering
function toggleFeedType(type) {
    const feeds = document.querySelectorAll('.feed-card');
    const typeButtons = document.querySelectorAll('.feed-type-controls .btn');
    
    // Update button states
    typeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });

    // Show/hide feeds
    feeds.forEach(feed => {
        if (type === 'all') {
            feed.style.display = 'block';
        } else {
            feed.style.display = feed.dataset.feedType === type ? 'block' : 'none';
        }
    });
}

// Drone Deployment
const droneControls = {
    patrol: () => {
        console.log('Initiating patrol mode');
        // Add patrol mode logic
    },
    track: () => {
        console.log('Initiating target tracking');
        // Add tracking logic
    },
    followRoute: () => {
        console.log('Following predefined route');
        // Add route following logic
    }
};

document.querySelectorAll('.drone-actions button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const action = e.target.textContent.toLowerCase();
        if (droneControls[action]) {
            droneControls[action]();
        }
    });
});

// Dynamic Crowd Routing
function updateCrowdRouting() {
    const zones = ['A', 'B', 'C'];
    
    zones.forEach(zone => {
        const current = ZONE_OCCUPANCY[zone];
        const capacity = ZONE_CAPACITIES[`Zone ${zone}`];
        const percentage = (current / capacity) * 100;
        
        updateZoneStats(zone, current, percentage);
        
        if (percentage > 90) {
            suggestRedirection(zone, zones.filter(z => z !== zone));
        }
    });

    // Update congestion chart
    updateCongestionChart();
}

function updateZoneStats(zone, current, percentage) {
    const zoneElement = document.querySelector(`#zone${zone}`);
    if (zoneElement) {
        const countElement = zoneElement.querySelector('.count');
        if (countElement) {
            countElement.textContent = current;
        }
    }
}

function suggestRedirection(fromZone, toZones) {
    const routingAlerts = document.querySelector('.routing-alerts');
    if (!routingAlerts) return;

    const bestZone = toZones.reduce((best, zone) => {
        const current = ZONE_OCCUPANCY[zone];
        const capacity = ZONE_CAPACITIES[`Zone ${zone}`];
        const percentage = (current / capacity) * 100;
        
        return percentage < (best.percentage || 100) ? { zone, percentage } : best;
    }, {});

    if (bestZone.zone) {
        const suggestion = document.createElement('div');
        suggestion.className = 'route-suggestion';
        suggestion.innerHTML = `
            <div class="route-path">
                <span class="zone">Zone ${fromZone}</span>
                <i class="fas fa-arrow-right"></i>
                <span class="zone">Zone ${bestZone.zone}</span>
            </div>
            <button class="btn small">View Route</button>
        `;
        routingAlerts.appendChild(suggestion);
    }
}

// Congestion Chart
function updateCongestionChart() {
    const ctx = document.getElementById('congestionChart');
    if (!ctx) return;

    const data = {
        labels: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
        datasets: [
            {
                label: 'Zone A',
                data: [65, 70, 75, 80, 85, 90],
                borderColor: '#2563eb',
                fill: false
            },
            {
                label: 'Zone B',
                data: [30, 35, 40, 45, 50, 55],
                borderColor: '#22c55e',
                fill: false
            },
            {
                label: 'Zone C',
                data: [85, 88, 90, 92, 94, 95],
                borderColor: '#f59e0b',
                fill: false
            }
        ]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Congestion Level (%)'
                    }
                }
            }
        }
    });
}

// Anomaly Detection
function updateAnomalyDetection() {
    const anomalyStats = {
        current: 3,
        last24h: 12,
        types: {
            'Fire Risk': 'low',
            'Smoke Detection': 'none',
            'Stampede Risk': 'medium'
        }
    };

    // Update anomaly type values
    document.querySelectorAll('.type-item').forEach(item => {
        const label = item.querySelector('.type-label');
        const value = item.querySelector('.type-value');
        if (label && value) {
            const type = label.textContent.trim();
            const status = anomalyStats.types[type] || 'none';
            value.className = `type-value ${status}`;
            value.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    });

    // Update stats
    const currentAnomalies = document.querySelector('.anomaly-stats .stat-value');
    if (currentAnomalies) {
        currentAnomalies.textContent = anomalyStats.current;
    }
}

// Priority Alerts
document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const priority = btn.dataset.priority;
        filterAlertsByPriority(priority);
    });
});

function filterAlertsByPriority(priority) {
    const alerts = document.querySelectorAll('.alert-item');
    alerts.forEach(alert => {
        const alertPriority = alert.dataset.priority;
        alert.style.display = priority === 'all' || alertPriority === priority ? 'flex' : 'none';
    });
}

// Command Interface
function setupCommandInterface() {
    const commandInput = document.getElementById('commandInput');
    const commandHistory = document.getElementById('commandHistory');
    const sendButton = document.querySelector('.command-send');

    if (!commandInput || !commandHistory || !sendButton) {
        console.error('Command interface elements not found');
        return;
    }

    function addToHistory(command, isUser = true) {
        const entry = document.createElement('div');
        entry.className = isUser ? 'user-command' : 'system-response';
        
        if (isUser) {
            entry.innerHTML = `<span class="prompt">$</span> ${command}`;
        } else {
            entry.textContent = command;
        }
        
        commandHistory.appendChild(entry);
        commandHistory.scrollTop = commandHistory.scrollHeight;
    }

    function handleCommand(command) {
        addToHistory(command);
        
        // Command processing
        let response;
        switch (command.toLowerCase()) {
            case 'help':
                response = `Available commands:
- status: Show system status
- zones: List active zones
- alerts: Show recent alerts
- clear: Clear command history
- exit: Close terminal session`;
                break;
            case 'status':
                response = `System Status:
✓ All systems operational
✓ Database connection: OK
✓ API endpoints: Responding
✓ Camera feeds: 4/4 online
✓ Drone connection: Stable`;
                break;
            case 'zones':
                response = `Active Zones:
Zone A: ${ZONE_OCCUPANCY.A} people (${Math.round(ZONE_OCCUPANCY.A/ZONE_CAPACITIES['Zone A']*100)}% capacity)
Zone B: ${ZONE_OCCUPANCY.B} people (${Math.round(ZONE_OCCUPANCY.B/ZONE_CAPACITIES['Zone B']*100)}% capacity)
Zone C: ${ZONE_OCCUPANCY.C} people (${Math.round(ZONE_OCCUPANCY.C/ZONE_CAPACITIES['Zone C']*100)}% capacity)`;
                break;
            case 'clear':
                commandHistory.innerHTML = '';
                return;
            case 'exit':
                response = 'Closing terminal session...';
                setTimeout(() => {
                    const dashboardLink = document.querySelector('[href="#dashboard"]');
                    if (dashboardLink) dashboardLink.click();
                }, 1000);
                break;
            default:
                response = `Command not recognized. Type "help" for available commands.`;
        }
        
        setTimeout(() => addToHistory(response, false), 100);
    }

    // Add click event listener
    sendButton.addEventListener('click', () => {
        const command = commandInput.value.trim();
        if (command) {
            handleCommand(command);
            commandInput.value = '';
        }
    });

    // Add keypress event listener
    commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && commandInput.value.trim()) {
            handleCommand(commandInput.value.trim());
            commandInput.value = '';
        }
    });
}

// Alert Priority Filtering
document.addEventListener('DOMContentLoaded', function() {
    const alertFilters = document.querySelector('.alert-filters');
    const alertItems = document.querySelectorAll('.alert-item');

    if (alertFilters) {
        alertFilters.addEventListener('click', function(e) {
            if (e.target.matches('button')) {
                // Remove active class from all buttons
                alertFilters.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');

                const priority = e.target.dataset.priority;

                // Show/hide alerts based on priority
                alertItems.forEach(item => {
                    if (priority === 'all' || item.dataset.priority === priority) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    }

    // Face Data Search Functionality
    const faceSearchInput = document.querySelector('.search-box input');
    const faceDataRows = document.querySelectorAll('.face-data-table tbody tr');

    if (faceSearchInput) {
        faceSearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            faceDataRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // Face Data Filter Buttons
    const filterButtons = document.querySelector('.filter-buttons');
    
    if (filterButtons) {
        filterButtons.addEventListener('click', function(e) {
            if (e.target.matches('button')) {
                // Remove active class from all buttons
                filterButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');

                const filter = e.target.textContent.toLowerCase();

                faceDataRows.forEach(row => {
                    const status = row.querySelector('.status-badge').textContent.toLowerCase();
                    if (filter === 'all' || status === filter) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    }
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    try {
        setupNavigation();
        initializeDashboard();
        updateCrowdRouting();
        updateAnomalyDetection();
        setupCommandInterface();
        
        // Add some initial feeds
        addNewFeed('Main Entrance', 'Zone A', 'cctv');
        addNewFeed('Parking Area', 'Zone B', 'drone');
        addNewFeed('Food Court', 'Zone C', 'cctv');
        addNewFeed('Event Area', 'Zone A', 'drone');

        // Setup feed type filters
        document.querySelectorAll('.feed-type-controls .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type || 'all';
                toggleFeedType(type);
            });
        });

        // Setup priority filters
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterAlertsByPriority(btn.dataset.priority || 'all');
            });
        });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}); 