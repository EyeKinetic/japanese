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
            currentUser: 'shreyas',
            profiles: {
                shreyas: {
                    name: 'Shreyas',
                    level: 'N5',
                    streak: 0,
                    vocabLearned: 0,
                    kanjiLearned: 0,
                    grammarLearned: 0,
                    quizzesTaken: 0,
                    quizAccuracy: 0,
                    xp: 0,
                    currentLesson: 1
                },
                dushyant: {
                    name: 'Dushyant',
                    level: 'N5',
                    streak: 0,
                    vocabLearned: 0,
                    kanjiLearned: 0,
                    grammarLearned: 0,
                    quizzesTaken: 0,
                    quizAccuracy: 0,
                    xp: 0,
                    currentLesson: 1
                }
            },
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

    // --- Cloud Sync Logic ---

    async pushToCloud(state) {
        if (!this.isCloudEnabled) return;

        try {
            const shreyas = state.profiles.shreyas;
            const dushyant = state.profiles.dushyant;

            // Map data to database column names (snake_case in SQL)
            const payload = [
                {
                    id: 'shreyas',
                    name: shreyas.name,
                    level: shreyas.level,
                    streak: shreyas.streak,
                    vocab_learned: shreyas.vocabLearned,
                    kanji_learned: shreyas.kanjiLearned,
                    grammar_learned: shreyas.grammarLearned,
                    xp: shreyas.xp,
                    current_lesson: shreyas.currentLesson
                },
                {
                    id: 'dushyant',
                    name: dushyant.name,
                    level: dushyant.level,
                    streak: dushyant.streak,
                    vocab_learned: dushyant.vocabLearned,
                    kanji_learned: dushyant.kanjiLearned,
                    grammar_learned: dushyant.grammarLearned,
                    xp: dushyant.xp,
                    current_lesson: dushyant.currentLesson
                }
            ];

            const { error } = await this.supabase
                .from('profiles')
                .upsert(payload, { onConflict: 'id' });

            if (error) throw error;
            document.getElementById('data-status').textContent = "Synced with Supabase Cloud ✅";
        } catch (err) {
            console.error("Cloud sync failed:", err);
            document.getElementById('data-status').textContent = "Cloud Sync Failed ❌";
        }
    }

    async pullFromCloud() {
        if (!this.isCloudEnabled) return;

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            if (data && data.length > 0) {
                const state = this.getState();
                data.forEach(dbProfile => {
                    const id = dbProfile.id;
                    if (state.profiles[id]) {
                        state.profiles[id] = {
                            ...state.profiles[id],
                            name: dbProfile.name,
                            level: dbProfile.level,
                            streak: dbProfile.streak,
                            vocabLearned: dbProfile.vocab_learned,
                            kanjiLearned: dbProfile.kanji_learned,
                            grammarLearned: dbProfile.grammar_learned,
                            xp: dbProfile.xp,
                            currentLesson: dbProfile.current_lesson
                        };
                    }
                });
                localStorage.setItem(this.storeKey, JSON.stringify(state));
                console.log("Sensei, local scrolls updated from the Cloud.");
            }
        } catch (err) {
            console.error("Cloud pull failed:", err);
        }
    }

    toggleUser() {
        const state = this.getState();
        state.currentUser = state.currentUser === 'shreyas' ? 'dushyant' : 'shreyas';
        this.save(state);
        return state.currentUser;
    }

    toggleTheme() {
        const state = this.getState();
        state.settings.darkMode = !state.settings.darkMode;
        this.save(state);
        return state.settings.darkMode;
    }
}

const store = new AppStore();
