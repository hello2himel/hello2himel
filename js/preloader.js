document.addEventListener('DOMContentLoaded', function() {
    // Create star background elements
    createStars();
    
    // Variables for preloader
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercentage = document.querySelector('.loading-percentage');
    const loadingMessages = [
        "Exploring the universe...",
        "Calculating stellar distances...",
        "Mapping constellations...",
        "Analyzing quasars...",
        "Loading scientific data...",
        "Preparing astrophysics tools...",
        "Calibrating telescope...",
        "Scanning for exoplanets...",
        "Compiling research papers...",
        "Almost there..."
    ];
    
    // Hello text carousel
    const helloTexts = document.querySelectorAll('.hello-text');
    let currentHelloIndex = 0;
    
    // Function to rotate through hello messages
    function rotateHelloMessages() {
        helloTexts.forEach(item => item.classList.remove('active'));
        helloTexts[currentHelloIndex].classList.add('active');
        
        currentHelloIndex = (currentHelloIndex + 1) % helloTexts.length;
        
        setTimeout(rotateHelloMessages, 2000);
    }
    
    // Start the hello message rotation
    rotateHelloMessages();
    
    // Simulate loading progress
    let loadingProgress = 0;
    let loadingSpeed = 0.5; // Initial speed
    let currentMessageIndex = 0;
    const loadingMessageElement = document.querySelector('.loading-message');
    
    // Update loading message periodically
    function updateLoadingMessage() {
        if (loadingProgress < 100) {
            currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
            loadingMessageElement.textContent = loadingMessages[currentMessageIndex];
            
            // Speed up loading at certain points
            if (loadingProgress > 85) {
                loadingSpeed = 1.0;
            } else if (loadingProgress > 70) {
                loadingSpeed = 0.8;
            } else if (loadingProgress > 40) {
                loadingSpeed = 0.6;
            }
            
            setTimeout(updateLoadingMessage, 3000);
        }
    }
    
    // Start updating loading messages
    updateLoadingMessage();
    
    // Simulate loading progress
    function simulateLoading() {
        if (loadingProgress < 100) {
            loadingProgress += loadingSpeed;
            
            // Ensure we don't exceed 100%
            if (loadingProgress > 100) {
                loadingProgress = 100;
            }
            
            // Update loading bar and percentage
            loadingBar.style.width = loadingProgress + '%';
            loadingPercentage.textContent = Math.floor(loadingProgress) + '%';
            
            // Continue simulation
            if (loadingProgress < 100) {
                requestAnimationFrame(simulateLoading);
            } else {
                // Show main content after a delay
                setTimeout(function() {
                    preloader.style.opacity = '0';
                    mainContent.style.display = 'flex';
                    
                    // Complete transition after fade out
                    setTimeout(function() {
                        preloader.style.display = 'none';
                        
                        // Redirect to main page
                        setTimeout(function() {
                            window.location.href = 'index.html';
                        }, 2000);
                    }, 1000);
                }, 1000);
            }
        }
    }
    
    // Set transition for preloader fade out
    preloader.style.transition = 'opacity 1s ease';
    
    // Start loading simulation
    simulateLoading();
});

// Function to create star background
function createStars() {
    const container = document.body;
    
    // Create stars
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random size between 1px and 3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        star.style.animationDelay = `${Math.random() * 2}s`;
        
        container.appendChild(star);
    }
}

// Function to simulate actual content loading
function simulateContentLoading() {
    // Start checking if all resources are loaded
    window.addEventListener('load', function() {
        // Your additional loading logic can go here
        console.log("All resources loaded!");
    });
}

// Initialize content loading simulation
simulateContentLoading();