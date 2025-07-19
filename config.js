// Configuration for BBC Documentary System
// In production, these would be loaded from environment variables

const CONFIG = {
    // API Configuration (these are demo values - replace with real credentials)
    API_KEY: process.env.API_KEY || 'demo-key',
    
    // Supabase Configuration 
    SUPABASE: {
        URL: process.env.SUPABASE_URL || 'https://demo.supabase.co',
        KEY: process.env.SUPABASE_KEY || 'demo-key'
    },
    
    // AI Models Configuration
    AI_MODELS: {
        deepseek: { 
            description: 'Active Forensic Intelligence',
            model: 'deepseek-chat',
            url: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'
        }
    },
    
    // Application Settings
    APP: {
        NAME: 'BBC Documentary System',
        VERSION: '1.0.0',
        ENVIRONMENT: process.env.NODE_ENV || 'development'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
