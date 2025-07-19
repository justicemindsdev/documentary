const AI_MODELS = {
            'deepseek': {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'deepseek/deepseek-v3',
                description: 'Cost-effective bulk analysis',
                priority: 1
            },
            'claude-3.5': {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'anthropic/claude-3.5-sonnet',
                description: 'Nuanced context understanding',
                priority: 2
            },
            'claude-3.7': {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'anthropic/claude-3.7-sonnet',
                description: 'Advanced reasoning',
                priority: 3
            },
            'gpt-4o': {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'openai/chatgpt-4o-latest',
                description: 'Creative content generation',
                priority: 4
            },
            'o1-preview': {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'openai/o1-preview-2024-09-12',
                description: 'Complex narrative reasoning',
                priority: 5
            },
            'grok': {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'x-ai/grok-beta',
                description: 'Creative and unconventional',
                priority: 6
            }
        };

        const API_KEY = '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';
        const ELEVENLABS_API_KEY = 'sk_c5aed397a3b15db9e2ccf8371c0d380d25d7dc5fa308d7c0';

        // Supabase Configuration - EVIDENTIA Project
        const SUPABASE_URL = 'https://tvecnfdqakrevzaeifpk.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWNuZmRxYWtyZXZ6YWVpZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIwNjQsImV4cCI6MjA2Mzk1ODA2NH0.q-8ukkJZ4FGSbZyEYp0letP-S58hC2PA6lUOWUH9H2Y';
        
        // Initialize Supabase
        const supabase