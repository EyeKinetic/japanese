/**
 * store.js
 * Handles LocalStorage interactions
 */

class AppStore {
    constructor() {
        this.storeKey = 'mext_jp_app_v3';
        this.defaultState = {
            currentUser: 'shreyas', // 'shreyas' or 'dushyant'
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

    init() {
        if (!localStorage.getItem(this.storeKey)) {
            this.save(this.defaultState);
        }
    }

    getState() {
        return JSON.parse(localStorage.getItem(this.storeKey));
    }

    save(state) {
        localStorage.setItem(this.storeKey, JSON.stringify(state));
    }

    updateProfile(userId, data) {
        const state = this.getState();
        state.profiles[userId] = { ...state.profiles[userId], ...data };
        this.save(state);
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
