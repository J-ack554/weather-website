document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const cityInput = document.getElementById('cityInput');
    const getWeatherBtn = document.getElementById('getWeather');
    const weatherCard = document.getElementById('weatherCard');
    const errorMessage = document.getElementById('errorMessage');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    const minimizeChatBtn = document.getElementById('minimizeChat');
    const chatbotContainer = document.querySelector('.chatbot-container');

    // Date formatting
    const dateElement = document.getElementById('date');
    const date = new Date();
    dateElement.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Enter key event listeners
    cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            getWeather();
        }
    });

    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Button click event listeners
    getWeatherBtn.addEventListener('click', getWeather);
    sendMessageBtn.addEventListener('click', sendChatMessage);
    minimizeChatBtn.addEventListener('click', toggleChatbot);

    // Get weather data
    async function getWeather() {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name');
            return;
        }
        
        try {
            showLoading();
            const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);
            
            // Update UI with weather data
            document.getElementById('cityName').textContent = data.city;
            document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
            document.getElementById('temperature').textContent = `${data.temp}°C`;
            document.getElementById('weatherDescription').textContent = data.description;
            document.getElementById('feelsLike').textContent = `${data.feels_like}°C`;
            document.getElementById('humidity').textContent = `${data.humidity}%`;
            document.getElementById('wind').textContent = `${data.wind} m/s`;
            document.getElementById('pressure').textContent = `${data.pressure} hPa`;
            
            // Show weather card and hide error
            weatherCard.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            
            // Add greeting message in chat based on weather
            const greeting = getWeatherGreeting(data);
            addBotMessage(greeting);
            
        } catch (error) {
            showError(error.message || 'Failed to get weather data');
            weatherCard.classList.add('hidden');
        }
    }

    function showLoading() {
        errorMessage.classList.add('hidden');
        weatherCard.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.textContent = `Error: ${message}`;
        errorMessage.classList.remove('hidden');
    }

    // Chatbot functionality
    function sendChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addUserMessage(message);
        
        // Process the message and get response
        processMessage(message);
        
        // Clear input
        chatInput.value = '';
    }

    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot';
        messageElement.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    async function processMessage(message) {
        // Wait a moment to simulate processing
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const lowerMessage = message.toLowerCase();
        
        // Check if it's a weather query
        if (lowerMessage.includes('weather') && lowerMessage.includes('in')) {
            // Try to extract city name
            const cityMatch = lowerMessage.match(/weather in (\w+)/i);
            if (cityMatch && cityMatch[1]) {
                const city = cityMatch[1];
                cityInput.value = city;
                addBotMessage(`Let me check the weather in ${city} for you...`);
                getWeather();
                return;
            }
        }
        
        // Handle greetings
        if (containsGreeting(lowerMessage)) {
            addBotMessage("Hello! I'm your weather assistant. How can I help you today?");
            return;
        }
        
        // Handle weather-related queries
        if (lowerMessage.includes('weather') || 
            lowerMessage.includes('temperature') || 
            lowerMessage.includes('forecast') ||
            lowerMessage.includes('rain') ||
            lowerMessage.includes('sunny')) {
            
            if (weatherCard.classList.contains('hidden')) {
                addBotMessage("Please use the search box above to check the weather for a specific city. For example, you can ask me about 'weather in London'.");
            } else {
                const cityName = document.getElementById('cityName').textContent;
                addBotMessage(`I'm currently showing you the weather for ${cityName}. Is there anything specific you'd like to know about the weather there?`);
            }
            return;
        }
        
        // Handle thanks
        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            addBotMessage("You're welcome! Let me know if you need anything else.");
            return;
        }
        
        // Handle goodbye
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            addBotMessage("Goodbye! Have a great day. Feel free to come back if you need more weather information.");
            return;
        }
        
        // Default response
        addBotMessage("I'm a weather assistant and can help with weather-related questions. Try asking about the weather in a specific city!");
    }

    function containsGreeting(message) {
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => message.includes(greeting));
    }

    function getWeatherGreeting(data) {
        const temp = data.temp;
        const description = data.description.toLowerCase();
        
        if (temp > 30) {
            return `It's quite hot in ${data.city} right now! Don't forget to stay hydrated.`;
        } else if (temp > 20) {
            return `The weather is nice and warm in ${data.city}. Enjoy your day!`;
        } else if (temp > 10) {
            return `It's mild in ${data.city} today. A light jacket might be comfortable.`;
        } else if (temp > 0) {
            return `It's chilly in ${data.city}. You might want to bundle up a bit.`;
        } else {
            return `It's freezing in ${data.city}! Stay warm and dress in layers.`;
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function toggleChatbot() {
        chatbotContainer.classList.toggle('chatbot-minimized');
        
        // Change button icon
        if (chatbotContainer.classList.contains('chatbot-minimized')) {
            minimizeChatBtn.innerHTML = '<i class="fas fa-plus"></i>';
        } else {
            minimizeChatBtn.innerHTML = '<i class="fas fa-minus"></i>';
            scrollToBottom();
        }
    }
});