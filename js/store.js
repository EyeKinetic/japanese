/**
 * store.js
 * Handles LocalStorage interactions and Supabase Cloud Synchronization.
 */

class AppStore {
    constructor() {
        this.storeKey = 'mext_jp_app_secure_v2';
        this.supabase = null;
        this.isCloudEnabled = false;
        
        this.defaultState = {
            currentUser: null,
            profiles: {}, // Will be populated dynamically
            settings: {
                darkMode: false
            }
        };
        this.init();
    }

    async init() {
        // 1. Local Initialization
        if (!localStorage.getItem(this.storeKey)) {
            this.save(this.defaultState);
        }

        // 2. Supabase Cloud Initialization
        const config = window.SUPABASE_CONFIG;
        if (config && config.url && config.key && window.supabase) {
            try {
                this.supabase = window.supabase.createClient(config.url, config.key);
                this.isCloudEnabled = true;
                console.log("Sensei, Cloud Sentry is active.");
                
                // Initial pull from cloud to sync local cache
                await this.pullFromCloud();
                window.dispatchEvent(new CustomEvent('store-ready'));
            } catch (err) {
                console.error("Cloud Sentry failed to initialize:", err);
            }
        } else {
            console.warn("Sensei, Cloud Sentry is offline. Using local scrolls only.");
        }
    }

    getState() {
        return JSON.parse(localStorage.getItem(this.storeKey));
    }

    save(state) {
        localStorage.setItem(this.storeKey, JSON.stringify(state));
        this.pushToCloud(state);
    }

    async updateProfile(userId, data) {
        const state = this.getState();
        if (state.profiles[userId]) {
            state.profiles[userId] = { ...state.profiles[userId], ...data };
            this.save(state);
        }
    }

    getLeaderboard() {
        const state = this.getState();
        const profiles = Object.values(state.profiles).map(p => ({
            username: p.username || 'Scholar',
            level: p.level,
            xp: p.xp
        }));
        return profiles.sort((a, b) => b.xp - a.xp);
    }

    async register(email, password, username) {
        if (!this.supabase) return { error: "Cloud Sentry Offline" };
        
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email, password
        });
        
        if (authError) return { error: authError.message };
        
        const userId = authData.user.id;
        const profile = {
            id: userId,
            username: username,
            level: 'N5',
            streak: 0,
            vocab_learned: 0,
            kanji_learned: 0,
            grammar_learned: 0,
            quizzes_taken: 0,
            quiz_accuracy: 0,
            xp: 0,
            current_lesson: 1,
            updated_at: new Date().toISOString()
        };

        const { error: profileError } = await this.supabase
            .from('profiles')
            .insert(profile);
            
        if (profileError) return { error: profileError.message };
        
        this.saveAuthUser(userId, username);
        return { success: true };
    }

    async login(email, password) {
        if (!this.supabase) return { error: "Cloud Sentry Offline" };
        
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
            email, password
        });
        
        if (authError) return { error: authError.message };
        
        const userId = authData.user.id;
        const { data: profile, error: profileError } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (profileError) return { error: profileError.message };
        
        this.saveAuthUser(userId, profile.username);
        return { success: true };
    }

    saveAuthUser(userId, username) {
        let state = this.getState();
        state.currentUser = userId;
        this.save(state);
        this.pullFromCloud(); // Refresh local cache with latest cloud data
    }

    async pullFromCloud() {
        if (!this.isCloudEnabled || !this.supabase) return;

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            if (data) {
                let state = this.getState();
                data.forEach(cloudProfile => {
                    state.profiles[cloudProfile.id] = {
                        username: cloudProfile.username,
                        level: cloudProfile.level,
                        streak: cloudProfile.streak,
                        vocabLearned: cloudProfile.vocab_learned,
                        kanjiLearned: cloudProfile.kanji_learned,
                        grammarLearned: cloudProfile.grammar_learned,
                        quizzesTaken: cloudProfile.quizzes_taken || 0,
                        quizAccuracy: cloudProfile.quiz_accuracy || 0,
                        xp: cloudProfile.xp,
                        currentLesson: cloudProfile.current_lesson
                    };
                });
                localStorage.setItem(this.storeKey, JSON.stringify(state));
            }
        } catch (err) {
            console.error("Failed to pull from Cloud Sentry:", err);
        }
    }

    async pushToCloud(state) {
        if (!this.isCloudEnabled || !this.supabase || !state.currentUser) return;

        try {
            const userProfile = state.profiles[state.currentUser];
            if (!userProfile) return;

            const payload = {
                username: userProfile.username,
                level: userProfile.level,
                streak: userProfile.streak,
                vocab_learned: userProfile.vocabLearned,
                kanji_learned: userProfile.kanjiLearned,
                grammar_learned: userProfile.grammarLearned,
                quizzes_taken: userProfile.quizzesTaken || 0,
                quiz_accuracy: userProfile.quizAccuracy || 0,
                xp: userProfile.xp,
                current_lesson: userProfile.currentLesson,
                updated_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('profiles')
                .update(payload)
                .eq('id', state.currentUser);

            if (error) throw error;
        } catch (err) {
            console.error("Failed to push to Cloud Sentry:", err);
        }
    }

    toggleTheme() {
        const state = this.getState();
        state.settings.darkMode = !state.settings.darkMode;
        this.save(state);
        return state.settings.darkMode;
    }
}

const store = new AppStore();
