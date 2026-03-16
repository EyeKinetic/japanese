/**
 * store.js
 * Handles LocalStorage interactions and Supabase Cloud Synchronization.
 */

class AppStore {
    constructor() {
        this.storeKey = 'mext_jp_app_v3';
        this.supabase = null;
        this.isCloudEnabled = false;
        
        this.defaultState = {
            currentUser: null,
            profiles: {}, // Will be populated dynamically
            settings: {
                darkMode: false,
                boardExamsMode: false,
                jeeSprintMode: false
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
        state.profiles[userId] = { ...state.profiles[userId], ...data };
        this.save(state);
    }

    getLeaderboard() {
        const state = this.getState();
        const profiles = Object.values(state.profiles).map(p => ({
            name: p.name,
            level: p.level,
            xp: p.xp
        }));
        // Sort by XP descending
        return profiles.sort((a, b) => b.xp - a.xp);
    }

    loginUser(username) {
        let state = this.getState();
        const id = username.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (!state.profiles[id]) {
            state.profiles[id] = {
                name: username,
                level: 'N5',
                streak: 0,
                vocabLearned: 0,
                kanjiLearned: 0,
                grammarLearned: 0,
                quizzesTaken: 0,
                quizAccuracy: 0,
                xp: 0,
                currentLesson: 1
            };
        }
        
        state.currentUser = id;
        this.save(state);
    }

    async pullFromCloud() {
        if (!this.isCloudEnabled || !this.supabase) return;

        try {
            // Fetch ALL profiles for the global leaderboard
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            if (data && data.length > 0) {
                let state = this.getState();
                let hasChanges = false;
                
                data.forEach(cloudProfile => {
                    const localProfile = state.profiles[cloudProfile.id];
                    // Overwrite local if cloud has more XP, or if local doesn't exist
                    if (!localProfile || cloudProfile.xp >= localProfile.xp) {
                        state.profiles[cloudProfile.id] = {
                            name: cloudProfile.name,
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
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    localStorage.setItem(this.storeKey, JSON.stringify(state));
                    console.log("Global Leaderboard synced from Cloud Sentry.");
                }
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
                id: state.currentUser,
                name: userProfile.name,
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
                .upsert(payload, { onConflict: 'id' });

            if (error) throw error;
            console.log("User progress pushed to Cloud Sentry.");
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
