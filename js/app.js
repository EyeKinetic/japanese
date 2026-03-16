/**
 * app.js
 * Main UI Logic and Chart implementations
 */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Login & Data Management logic
    const lsData = localStorage.getItem('mext_jp_app_data');
    if (lsData && lsData.includes('"me"')) {
        // Purge old structure to avoid breaking state with shreyas/dushyant update
        localStorage.removeItem('mext_jp_app_data');
        location.reload(); 
        return;
    }

    const loginScreen = document.getElementById('login-screen');
    const loggedIn = sessionStorage.getItem('login_session');

    if (!loggedIn) {
        loginScreen.classList.remove('hidden');
        const submitBtn = document.getElementById('login-submit');
        if(submitBtn) {
            submitBtn.addEventListener('click', () => {
                const usernameInput = document.getElementById('login-username').value.trim();
                if(!usernameInput) {
                    alert("Sensei, a name is required.");
                    return;
                }
                store.loginUser(usernameInput);
                sessionStorage.setItem('login_session', 'true');
                loginScreen.classList.add('hidden');
                updateDashboardUI();
            });
        }
    } else {
        loginScreen.classList.add('hidden');
    }

    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');
    
    // Quiz View Elements
    const lessonQuizView = document.getElementById('lesson-quiz-view');
    const quizProgressText = document.getElementById('quiz-progress-text');
    const quizCharDisplay = document.getElementById('quiz-char-display');
    const quizOptions = document.getElementById('quiz-options');
    const abandonQuizBtn = document.getElementById('abandon-quiz');
    const lessonBrowser = document.getElementById('lesson-browser');
    const activeLessonContainer = document.getElementById('active-lesson-container');
    const lessonListContainer = document.getElementById('lesson-list-container');
    const activeLessonVocab = document.getElementById('active-lesson-vocab');
    const backToLessonsBtn = document.getElementById('back-to-lessons');
    const finishLessonBtn = document.getElementById('start-lesson-quiz-btn');

    let currentQuizPool = [];
    let currentQuizQuestions = [];
    let currentQuizIndex = 0;
    let currentQuizScore = 0;
    let isQuizActive = false; // Anti-cheat state tracking


    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all nav items and views
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            // Add active to clicked nav item
            item.classList.add('active');
            
            // Get target view and activate
            const targetId = item.getAttribute('data-target');
            document.getElementById(`view-${targetId}`).classList.add('active');
            
            // Update Title
            viewTitle.textContent = item.querySelector('.label').textContent;

            // Trigger re-render of charts if progress view is shown
            if(targetId === 'progress') {
                renderCharts();
            }
        });
    });

    // 2. State & UI Initialization
    const appState = store.getState();
    const htmlObj = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');

    // Theme setup
    if (appState.settings.darkMode) {
        htmlObj.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        htmlObj.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = store.toggleTheme();
        if (isDark) {
            htmlObj.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        } else {
            htmlObj.setAttribute('data-theme', 'light');
            themeToggle.textContent = '🌙';
        }
        if(document.getElementById('view-progress').classList.contains('active')) {
             renderCharts(); // Re-render charts for correct colors
        }
    });

    // User Switcher
    const userSwitcher = document.getElementById('user-switcher');
    const streakCount = document.getElementById('streak-count');
    function updateDashboardUI() {
        const state = store.getState();
        if(!state.currentUser || !state.profiles[state.currentUser]) return;
        const activeUserList = state.profiles[state.currentUser];
        
        userSwitcher.querySelector('.user-name').textContent = activeUserList.name;
        userSwitcher.querySelector('.avatar').textContent = activeUserList.name.charAt(0).toUpperCase();
        streakCount.textContent = activeUserList.streak;

        // Update Dashboard Lesson Card
        const currentLessonObj = LESSON_PLAN.find(l => l.id === activeUserList.currentLesson) || LESSON_PLAN[LESSON_PLAN.length - 1];
        document.getElementById('dash-lesson-title').textContent = `Lesson ${currentLessonObj.id}: ${currentLessonObj.title}`;
        document.getElementById('dash-lesson-desc').textContent = currentLessonObj.desc;
        const lessonBtn = document.querySelector('.start-lesson-btn');
        if(activeUserList.currentLesson > LESSON_PLAN.length) {
            lessonBtn.textContent = "N1 Mastery Achieved!";
            lessonBtn.disabled = true;
        } else {
            lessonBtn.textContent = "Start Lesson";
            lessonBtn.disabled = false;
        }

        // Update Global Rank Quick View
        const leaderboard = store.getLeaderboard();
        const myRank = leaderboard.findIndex(p => p.name.toLowerCase() === activeUserList.name.toLowerCase()) + 1;
        
        const rankSpan = document.getElementById('my-global-rank');
        if(rankSpan) {
            rankSpan.textContent = `#${myRank > 0 ? myRank : '--'}`;
            document.getElementById('my-total-xp').textContent = activeUserList.xp;
            
            if(myRank === 1) {
                document.getElementById('rank-status-message').textContent = "You are the Top Scholar of the Dojo!";
            } else if (myRank > 1) {
                const nextTarget = leaderboard[myRank - 2];
                document.getElementById('rank-status-message').textContent = `Targeting ${nextTarget.name} (#${myRank - 1})`;
            }
        }
    }

    // Cloud Sync Refresh
    window.addEventListener('store-ready', () => {
        updateDashboardUI();
        renderLessons();
        if(document.getElementById('view-progress').classList.contains('active')) {
            renderCharts();
        }
    });

    // Countdown Logic
    function updateCountdown() {
        // Target: next May 1st (Typical MEXT Application window)
        const now = new Date();
        let targetYear = now.getFullYear();
        let targetDate = new Date(`May 1, ${targetYear} 00:00:00`).getTime();
        
        // If May 1st has passed this year, point to next year
        if (now.getTime() > targetDate) {
            targetYear++;
            targetDate = new Date(`May 1, ${targetYear} 00:00:00`).getTime();
        }
        
        const nowMs = now.getTime();
        const distance = targetDate - nowMs;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('cd-days').textContent = days;
            document.getElementById('cd-hours').textContent = hours;
        } else {
            document.getElementById('cd-days').textContent = "0";
            document.getElementById('cd-hours').textContent = "0";
        }
    }
    
    // Initialize real-time updates
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 3. Activity Graph Mock
    function renderActivityGraph() {
        const container = document.getElementById('activity-graph');
        if (!container) return; // Prevent throwing if element doesn't exist
        container.innerHTML = '';
        for(let i = 0; i < 90; i++) {
            const el = document.createElement('div');
            el.className = 'activity-day';
            // Randomly assign activity level for mock purposes
            if(i > 70) {
                const rand = Math.random();
                if(rand > 0.7) el.classList.add('active-3');
                else if(rand > 0.4) el.classList.add('active-2');
                else if(rand > 0.1) el.classList.add('active-1');
            }
            container.appendChild(el);
        }
    }

    // 4. Charts setup
    let readinessChartInstance = null;
    let comparisonChartInstance = null;

    function renderCharts() {
        const state = store.getState();
        const user = state.profiles[state.currentUser];
        const isDark = state.settings.darkMode;
        
        // Colors from CSS
        const style = getComputedStyle(document.body);
        const textColor = style.getPropertyValue('--text-primary').trim();
        const gridColor = style.getPropertyValue('--border-color').trim();
        const n3Color = style.getPropertyValue('--color-n3').trim();
        const n5Color = style.getPropertyValue('--color-n5').trim();
        const n4Color = style.getPropertyValue('--color-n4').trim();

        // Calculate Readiness (Weighted: Vocab 40%, Kanji 30%, Grammar 30%)
        const vocabProg = (user.vocabLearned / TOTAL_VOCAB) * 100;
        const kanjiProg = (user.kanjiLearned / TOTAL_KANJI) * 100;
        const grammarProg = (user.grammarLearned / TOTAL_GRAMMAR) * 100;
        
        const overallN1Readiness = Math.round((vocabProg * 0.4) + (kanjiProg * 0.3) + (grammarProg * 0.3));
        document.getElementById('readiness-percent').textContent = `${overallN1Readiness}%`;

        // Update Progress Bars
        document.querySelector('.vocab-fill').style.width = `${vocabProg}%`;
        document.querySelector('.progress-item:nth-child(2) .progress-header span:last-child').textContent = `${user.vocabLearned} / ${TOTAL_VOCAB}`;
        
        document.querySelector('.kanji-fill').style.width = `${kanjiProg}%`;
        document.querySelector('.progress-item:nth-child(3) .progress-header span:last-child').textContent = `${user.kanjiLearned} / ${TOTAL_KANJI}`;
        
        document.querySelector('.grammar-fill').style.width = `${grammarProg}%`;
        document.querySelector('.progress-item:nth-child(4) .progress-header span:last-child').textContent = `${user.grammarLearned} / ${TOTAL_GRAMMAR}`;


        // Readiness Donut Chart
        const rCtx = document.getElementById('readinessChart');
        if(readinessChartInstance) readinessChartInstance.destroy();
        
        let ringColor = '#ef4444'; // default red
        if(overallN3Readiness > 40) ringColor = '#eab308'; // yellow
        if(overallN3Readiness > 80) ringColor = '#22c55e'; // green

        readinessChartInstance = new Chart(rCtx, {
            type: 'doughnut',
            data: {
                labels: ['Ready', 'Remaining'],
                datasets: [{
                    data: [overallN3Readiness, 100 - overallN3Readiness],
                    backgroundColor: [ringColor, isDark ? '#334155' : '#e5e7eb'],
                    borderWidth: 0,
                    borderRadius: 10,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        // Global Leaderboard Rendering
        const leaderboardBody = document.getElementById('leaderboard-body');
        if(leaderboardBody) {
            leaderboardBody.innerHTML = '';
            const leaderboard = store.getLeaderboard();
            
            if(leaderboard.length === 0) {
                leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--text-secondary);">No scholars found.</td></tr>';
            } else {
                leaderboard.forEach((profile, index) => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid var(--border-color)';
                    
                    // Highlight current user
                    if (state.currentUser && profile.name.toLowerCase() === state.profiles[state.currentUser].name.toLowerCase()) {
                        tr.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; // subtle red tint for active user
                    }

                    tr.innerHTML = `
                        <td style="padding: 10px; font-weight: bold; color: ${index === 0 ? '#eab308' : 'var(--text-primary)'}">#${index + 1}</td>
                        <td style="padding: 10px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-n3); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">
                                    ${profile.name.charAt(0).toUpperCase()}
                                </div>
                                <span style="font-weight: 500;">${profile.name}</span>
                            </div>
                        </td>
                        <td style="padding: 10px;"><span class="badge" style="background: var(--color-n5)">${profile.level}</span></td>
                        <td style="padding: 10px; font-weight: bold; color: var(--color-n3);">${profile.xp}</td>
                    `;
                    leaderboardBody.appendChild(tr);
                });
            }
        }
    }

    // Canvas Drawing Logic
    const canvas = document.getElementById('writingCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        
        ctx.strokeStyle = appState.settings.darkMode ? '#e8eaed' : '#202124';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        const startDrawing = (e) => {
            isDrawing = true;
            draw(e);
        };

        const stopDrawing = () => {
            isDrawing = false;
            ctx.beginPath();
        };

        const draw = (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            // Handle both Mouse and Touch
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            ctx.lineTo(clientX - rect.left, clientY - rect.top);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(clientX - rect.left, clientY - rect.top);
            e.preventDefault();
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events
        canvas.addEventListener('touchstart', startDrawing, {passive: false});
        canvas.addEventListener('touchmove', draw, {passive: false});
        canvas.addEventListener('touchend', stopDrawing);

        document.getElementById('clearCanvas').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        // Refresh canvas colors when theme changes
        themeToggle.addEventListener('click', () => {
             ctx.strokeStyle = store.getState().settings.darkMode ? '#e8eaed' : '#202124';
        });
    }

    // Sequential Lesson Logic
    let activelyViewingLessonId = null;

    function renderLessons() {
        lessonListContainer.innerHTML = '';
        const state = store.getState();
        const userCurLevel = state.profiles[state.currentUser].currentLesson;

        LESSON_PLAN.forEach(lesson => {
            const isLocked = lesson.id > userCurLevel;
            const isCompleted = lesson.id < userCurLevel;
            const card = document.createElement('div');
            card.className = `card lesson-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
            card.style.cursor = isLocked ? 'not-allowed' : 'pointer';
            card.style.opacity = isLocked ? '0.6' : '1';
            card.style.marginBottom = '10px';

            let statusBadge = isLocked ? '🔒 Locked' : (isCompleted ? '✅ Review' : '⭐ Active');

            card.innerHTML = `
                <div class="card-header">
                    <h3>Lesson ${lesson.id}: ${lesson.title}</h3>
                    <span class="badge" style="background:${isLocked ? '#64748b' : 'var(--color-n5)'}">${statusBadge}</span>
                </div>
                <p class="text-secondary">${lesson.desc}</p>
            `;

            if(!isLocked) {
                card.addEventListener('click', () => openLesson(lesson.id));
            }
            lessonListContainer.appendChild(card);
        });
    }

    function playAudio(text) {
        // High-Quality MP3 TTS Engine via Google Translate TTS
        const audioUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&q=${encodeURIComponent(text)}`;
        const audio = new Audio(audioUrl);
        audio.play().catch(e => {
            console.warn("MP3 Audio failed, falling back to basic Synthesis", e);
            if ('speechSynthesis' in window) {
                const msg = new SpeechSynthesisUtterance(text);
                msg.lang = 'ja-JP';
                msg.rate = 0.8;
                window.speechSynthesis.speak(msg);
            }
        });
    }

    function testPronunciation(expectedJapanese, btnElement) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showSenseiMessage("Your browser does not support the Microphone Dojo. Use Chrome/Edge.", "error");
            return;
        }

        const originalText = btnElement.textContent;
        btnElement.textContent = "🎙️ Listening...";
        btnElement.style.background = "#ef4444"; // recording red

        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript.trim();
            console.log("Heard:", speechResult, "Expected:", expectedJapanese);
            
            // Check if string contains or matches closely
            if (speechResult.includes(expectedJapanese) || expectedJapanese.includes(speechResult) || expectedJapanese === speechResult) {
                btnElement.textContent = "✅ Perfect!";
                btnElement.style.background = "#22c55e";
                playAudio("すごい"); // "Sugoi" (Amazing)
            } else {
                btnElement.textContent = "❌ Try Again";
                btnElement.style.background = "#f59e0b";
                showSenseiMessage(`I heard: "${speechResult}". Listen closely and try again.`, "warning");
            }
            
            setTimeout(() => {
                btnElement.textContent = originalText;
                btnElement.style.background = "var(--color-n4)";
            }, 3000);
        };

        recognition.onerror = (event) => {
            console.error(event);
            btnElement.textContent = "❌ Error";
            btnElement.style.background = "#f59e0b";
            showSenseiMessage("Mic error. Ensure permissions are granted.", "error");
            setTimeout(() => {
                btnElement.textContent = originalText;
                btnElement.style.background = "var(--color-n4)";
            }, 3000);
        };

        try {
            recognition.start();
        } catch(e) {
            console.error("Speech recognition already started or blocked", e);
        }
    }

    function openLesson(id) {
        activelyViewingLessonId = id;
        const lesson = LESSON_PLAN.find(l => l.id === id);
        if(!lesson) return;

        lessonBrowser.classList.add('hidden');
        activeLessonContainer.classList.remove('hidden');
        document.getElementById('active-lesson-title').textContent = `Lesson ${lesson.id}: ${lesson.title}`;
        
        activeLessonVocab.innerHTML = '';
        lesson.vocab.forEach(v => {
            const li = document.createElement('li');
            li.className = 'vocab-item';
            li.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="v-word">
                            <span class="kanji">${v.jp}</span>
                        </div>
                    </div>
                    <div class="flashcard-back">
                        <div class="v-meaning">${v.roma}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    <button class="btn btn-sm btn-flashcard" style="flex: 1;">Flip & Listen</button>
                    <button class="btn btn-sm btn-mic" title="Test Pronunciation" style="background: var(--color-n4);">🎤</button>
                </div>
            `;
            
            // Re-bind flip and audio logic for dynamically generated flashcards
            const flipBtn = li.querySelector('.btn-flashcard');
            flipBtn.addEventListener('click', (e) => {
                const inner = li.querySelector('.flashcard-inner');
                // Play audio ONLY if flipping to the back (not unfolding)
                const isCurrentlyFlipped = li.classList.contains('flipped');
                if(!isCurrentlyFlipped) {
                    playAudio(v.jp);
                }
                li.classList.toggle('flipped');
                flipBtn.textContent = isCurrentlyFlipped ? 'Flip & Listen' : 'Unflip';
            });

            const micBtn = li.querySelector('.btn-mic');
            micBtn.addEventListener('click', (e) => {
                testPronunciation(v.jp, micBtn);
            });
            
            activeLessonVocab.appendChild(li);
        });

        const state = store.getState();
        const user = state.profiles[state.currentUser];
        if (id < user.currentLesson) {
            finishLessonBtn.textContent = "Finish Review";
        } else {
            finishLessonBtn.textContent = "Complete Lesson";
        }
    }

    backToLessonsBtn.addEventListener('click', () => {
        activeLessonContainer.classList.add('hidden');
        lessonBrowser.classList.remove('hidden');
        renderLessons();
    });

    finishLessonBtn.addEventListener('click', () => {
        const state = store.getState();
        const userLevel = state.profiles[state.currentUser].currentLesson;
        
        if (activelyViewingLessonId < userLevel) {
            showSenseiMessage('Review complete. Never forget the basics.', 'info');
            backToLessonsBtn.click();
            return;
        }

        // Start Quiz Hurdle
        startLessonQuiz();
    });

    function startLessonQuiz() {
        activeLessonContainer.classList.add('hidden');
        lessonQuizView.classList.remove('hidden');
        isQuizActive = true;

        
        const state = store.getState();
        const userLevel = state.profiles[state.currentUser].currentLesson;
        
        // Accumulate ALL vocab from lesson 1 up to current lesson
        currentQuizPool = [];
        LESSON_PLAN.forEach(lesson => {
            if (lesson.id <= userLevel) {
                currentQuizPool = [...currentQuizPool, ...lesson.vocab];
            }
        });

        // Generate 5 questions
        currentQuizQuestions = [];
        const poolCopy = [...currentQuizPool];
        for (let i = 0; i < 5; i++) {
            if (poolCopy.length === 0) break;
            const randomIndex = Math.floor(Math.random() * poolCopy.length);
            const word = poolCopy.splice(randomIndex, 1)[0];
            
            // Generate 3 wrong options
            const wrongOptions = currentQuizPool
                .filter(w => w.roma !== word.roma)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(w => w.roma);
            
            const options = [word.roma, ...wrongOptions].sort(() => 0.5 - Math.random());
            
            currentQuizQuestions.push({
                question: word.jp,
                answer: word.roma,
                options: options
            });
        }

        currentQuizIndex = 0;
        currentQuizScore = 0;
        showNextQuizQuestion();
    }

    function showNextQuizQuestion() {
        if (currentQuizIndex >= currentQuizQuestions.length) {
            isQuizActive = false;
            finishQuiz();
            return;
        }

        const q = currentQuizQuestions[currentQuizIndex];
        quizProgressText.textContent = `Question ${currentQuizIndex + 1}/${currentQuizQuestions.length}`;
        quizCharDisplay.textContent = q.question;
        quizOptions.innerHTML = '';
        
        q.options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleQuizAnswer(opt, btn));
            quizOptions.appendChild(btn);
        });
    }

    function handleQuizAnswer(selected, element) {
        const q = currentQuizQuestions[currentQuizIndex];
        const allOptions = quizOptions.querySelectorAll('.quiz-option');
        allOptions.forEach(opt => opt.style.pointerEvents = 'none');

        if (selected === q.answer) {
            element.classList.add('correct');
            currentQuizScore++;
            playAudio(q.question); // Bonus: play audio on correct
        } else {
            element.classList.add('incorrect');
            // Show correct answer
            allOptions.forEach(opt => {
                if (opt.textContent === q.answer) opt.classList.add('correct');
            });
            showSenseiMessage('Pathetic! How could you forget this?', 'error');
        }

        setTimeout(() => {
            currentQuizIndex++;
            showNextQuizQuestion();
        }, 1500);
    }

    function finishQuiz() {
        const winThreshold = 4; // 80% (4 out of 5)
        const passed = currentQuizScore >= winThreshold;

        if (passed) {
            const state = store.getState();
            const userLevel = state.profiles[state.currentUser].currentLesson;
            
            store.updateProfile(state.currentUser, { 
                currentLesson: userLevel + 1,
                xp: state.profiles[state.currentUser].xp + 100, // Bonus for passing test
                vocabLearned: state.profiles[state.currentUser].vocabLearned + 5
            });
            
            showSenseiMessage(`Impressive score: ${currentQuizScore}/5. You may proceed.`, 'success');
            
            setTimeout(() => {
                lessonQuizView.classList.add('hidden');
                lessonBrowser.classList.remove('hidden');
                updateDashboardUI();
                renderLessons();
            }, 2000);
        } else {
            showSenseiMessage(`Score: ${currentQuizScore}/5. FAILURE! Retake the lesson immediately.`, 'error');
            setTimeout(() => {
                lessonQuizView.classList.add('hidden');
                activeLessonContainer.classList.remove('hidden');
            }, 2000);
        }
    }



    // Settings Sync
    const toggleBoards = document.getElementById('toggle-boards');
    const toggleJee = document.getElementById('toggle-jee');
    
    if (toggleBoards && toggleJee) {
        toggleBoards.checked = appState.settings.boardExamsMode;
        toggleJee.checked = appState.settings.jeeSprintMode;

        toggleBoards.addEventListener('change', (e) => {
            const st = store.getState();
            st.settings.boardExamsMode = e.target.checked;
            store.save(st);
        });
        toggleJee.addEventListener('change', (e) => {
            const st = store.getState();
            st.settings.jeeSprintMode = e.target.checked;
            store.save(st);
        });
    }

    // --- Sensei Notification System ---
    const showSenseiMessage = (msg, type = 'info') => {
        let toast = document.getElementById('sensei-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sensei-toast';
            toast.className = 'sensei-toast';
            // Append to #app to stay inside the flex layout but above content
            document.getElementById('app').appendChild(toast);
        }
        
        // Reset animation by removing and re-adding
        toast.classList.remove('show', 'success', 'warning', 'error', 'info');
        // Force reflow
        void toast.offsetWidth;

        let icon = '👨‍🏫';
        if(type === 'success') icon = '🎌';
        if(type === 'warning') icon = '⚠️';
        if(type === 'error') icon = '❌';

        toast.innerHTML = `<span class="icon">${icon}</span><span class="msg">${msg}</span>`;
        toast.classList.add('show', type);
        
        // Clear previous timeout if exists
        if(toast.dataset.timeoutId) {
            clearTimeout(Number(toast.dataset.timeoutId));
        }

        // Remove 'show' class after 3.5 seconds
        const timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);

        toast.dataset.timeoutId = timeoutId.toString();
    };

    // --- Button Event Listeners (Direct Binding for Reliability) ---
    // Dashboard
    const startLessonBtns = document.querySelectorAll('.start-lesson-btn');
    startLessonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
             showSenseiMessage('Stop procrastinating! Your lesson starts now. Don\'t embarrass me.', 'warning');
             // Functional change: navigate to learn tab automatically
             const learnNav = document.querySelector('.nav-item[data-target="learn"]');
             if(learnNav) learnNav.click();
        });
    });

    const takeQuizBtns = document.querySelectorAll('.quiz-card .btn-secondary');
    takeQuizBtns.forEach(btn => {
        btn.addEventListener('click', () => {
			showSenseiMessage('A daily quiz is mandatory. Let us test your memory!', 'info');
             // Navigate to tests
             const testsNav = document.querySelector('.nav-item[data-target="tests"]');
             if(testsNav) testsNav.click();
		});
    });

    // Practice Canvas (Functional Check Visualizer)
    const checkCanvasBtns = document.querySelectorAll('#checkCanvas');
    checkCanvasBtns.forEach(btn => {
        btn.addEventListener('click', () => {
             showSenseiMessage('Pathetic stroke order! But acceptable for today. Next time: PERFECT it.', 'warning');
             // Clear the canvas slightly to simulate it's been graded and reset
             const cvs = document.getElementById('writingCanvas');
             if(cvs) {
                 const ctx = cvs.getContext('2d');
                 ctx.fillStyle = "rgba(239, 68, 68, 0.2)"; // transparent red for "graded"
                 ctx.fillRect(0, 0, cvs.width, cvs.height);
                 setTimeout(() => { ctx.clearRect(0,0, cvs.width, cvs.height) }, 1000);
             }
        });
    });

    const nextScenarioBtns = document.querySelectorAll('.dialog-card .btn-primary');
    nextScenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
			showSenseiMessage('Next scenario... I expect your pronunciation to be clearer!', 'info');
		});
    });

    // Tests
    const testBtns = document.querySelectorAll('.quiz-card-feature .btn-primary');
    if (testBtns.length >= 3) {
        testBtns[0].addEventListener('click', () => showSenseiMessage('N5 Daily Quiz starting. Focus!', 'info'));
        testBtns[1].addEventListener('click', () => showSenseiMessage('Weekly Mock Test. Show me your progress!', 'info'));
        testBtns[2].addEventListener('click', () => showSenseiMessage('JLPT Mock. This is a serious test, prepare your mind!', 'warning'));
    }

    // Settings
    const settingBtns = document.querySelectorAll('.settings-card .btn');
    settingBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const txt = e.target.textContent;
            if (txt.includes('Export')) {
                const data = JSON.stringify(store.getState());
                const blob = new Blob([data], {type: "application/json"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "mext_jp_backup.json";
                a.click();
                showSenseiMessage('Data exported securely. Don\'t lose it!', 'success');
            } else if (txt.includes('Import')) {
                showSenseiMessage('Data imported successfully. Welcome back to your studies!', 'success');
            } else if (txt.includes('Reset')) {
                if (confirm('Are you sure you want to erase all your hard work, gakusei? This cannot be undone.')) {
                    localStorage.removeItem(store.storeKey);
                    showSenseiMessage('Data reset. We start from zero. Gambari mashou!', 'error');
                    setTimeout(() => location.reload(), 2000);
                }
            }
        });
    });

    // Initial render
    updateDashboardUI();
    renderActivityGraph();
    renderLessons();
    // Pre-calculate to populate charts (but they aren't visible yet)
    // Wait for the chart container to have width before rendering (ChartJS quirk on display:none)
    // Instead, rendering happens when user clicks the Progress tab.
    // 12. Premium Liquid Cursor Logic
    const cursorGlider = document.getElementById('cursor-glider');

    let mouseX = 0;
    let mouseY = 0;
    let gliderX = 0;
    let gliderY = 0;

    const updatePosition = (clientX, clientY) => {
        mouseX = clientX;
        mouseY = clientY;
    };

    window.addEventListener('mousemove', (e) => updatePosition(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
        if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    });

    function animateCursor() {
        // High-end smooth lerp
        gliderX += (mouseX - gliderX) * 0.12;
        gliderY += (mouseY - gliderY) * 0.12;

        cursorGlider.style.left = `${gliderX}px`;
        cursorGlider.style.top = `${gliderY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects for glider
    const hoverables = 'a, button, .nav-item, .card, .clickable, .profile-switcher, .vocab-item';
    const setCursorActive = (active) => {
        if (active) cursorGlider.classList.add('active');
        else cursorGlider.classList.remove('active');
    };

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) setCursorActive(true);
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) setCursorActive(false);
    });

    // Mobile touch-start feedback
    document.addEventListener('touchstart', (e) => {
        if (e.target.closest(hoverables)) setCursorActive(true);
        if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    document.addEventListener('touchend', () => setCursorActive(false));

    // 13. "Tab-Sentry" Anti-Cheat Logic
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && isQuizActive) {
            isQuizActive = false;
            
            // Penalty Logic
            const state = store.getState();
            const user = state.profiles[state.currentUser];
            const penalty = 50;
            const newXp = Math.max(0, user.xp - penalty);
            
            store.updateProfile(state.currentUser, { xp: newXp });
            
            // Terminate Quiz
            lessonQuizView.classList.add('hidden');
            lessonBrowser.classList.remove('hidden');
            
            // Aggressive Notification
            showSenseiMessage(`DISHONORABLE BEHAVIOR DETECTION. You left the Dojo during a test. Penalty: -${penalty} XP.`, 'error');
            
            // Refresh UI to show new XP
            updateDashboardUI();
        }
    });

    abandonQuizBtn.addEventListener('click', () => {
        isQuizActive = false;
        lessonQuizView.classList.add('hidden');
        lessonBrowser.classList.remove('hidden');
        showSenseiMessage('You abandoned the hurdle. Sensei is disappointed.', 'warning');
    });

    // 14. "Chibi Sensei" Pet Sprite Manager
    class ChibiPetManager {
        constructor() {
            this.pets = [];
            this.petTypes = [
                { id: 'dog', emoji: '🐶', img: 'img/chibi_dog.png' },
                { id: 'cat', emoji: '🐱', img: 'img/chibi_cat.png' }
            ];
            this.spawnInterval = 30000;
            this.start();
        }

        start() {
            setTimeout(() => this.spawnPet(), 5000);
            setInterval(() => this.spawnPet(), this.spawnInterval);
        }

        spawnPet() {
            const type = this.petTypes[Math.floor(Math.random() * this.petTypes.length)];
            const petEl = document.createElement('div');
            petEl.className = 'chibi-pet';
            petEl.textContent = type.emoji;

            const img = new Image();
            img.src = type.img;
            img.onload = () => {
                petEl.style.backgroundImage = `url('${type.img}')`;
                petEl.textContent = '';
            };
            
            const side = Math.floor(Math.random() * 4);
            let x, y, dx, dy;

            switch(side) {
                case 0: x = Math.random() * window.innerWidth; y = -50; dx = (Math.random()-0.5)*2; dy = Math.random()*2+1; break;
                case 1: x = window.innerWidth + 50; y = Math.random() * window.innerHeight; dx = -(Math.random()*2+1); dy = (Math.random()-0.5)*2; break;
                case 2: x = Math.random() * window.innerWidth; y = window.innerHeight + 50; dx = (Math.random()-0.5)*2; dy = -(Math.random()*2+1); break;
                case 3: x = -50; y = Math.random() * window.innerHeight; dx = Math.random()*2+1; dy = (Math.random()-0.5)*2; break;
            }

            petEl.style.left = `${x}px`;
            petEl.style.top = `${y}px`;
            document.body.appendChild(petEl);

            const pet = { id: type.id, el: petEl, x, y, dx, dy, active: true, behavior: 'walking' };
            this.pets.push(pet);

            const handleInteraction = (e) => {
                e.preventDefault();
                this.interactWithPet(pet);
            };

            petEl.addEventListener('click', handleInteraction);
            petEl.addEventListener('touchstart', handleInteraction, { passive: false });

            this.animatePet(pet);
        }

        interactWithPet(pet) {
            if (!pet.active) return;
            const rand = Math.random();
            if (rand < 0.4) {
                pet.behavior = 'cute';
                pet.el.classList.add('acting-cute');
                showSenseiMessage(`${pet.id === 'dog' ? 'Inu' : 'Neko'}-chan is acting cute! ✨`, 'info');
                setTimeout(() => {
                    if (pet.active) {
                        pet.el.classList.remove('acting-cute');
                        pet.behavior = 'walking';
                    }
                }, 3000);
            } else {
                pet.behavior = 'running';
                pet.el.classList.add('running-away');
                pet.active = false;
                pet.dx *= 5; pet.dy *= 5;
                showSenseiMessage(`${pet.id === 'dog' ? 'Inu' : 'Neko'}-chan got shy! 💨`, 'info');
                setTimeout(() => pet.el.remove(), 500);
            }
        }

        animatePet(pet) {
            if (!pet.active && pet.behavior !== 'running') return;
            if (pet.behavior === 'walking' || pet.behavior === 'running') {
                pet.x += pet.dx;
                pet.y += pet.dy;
                pet.el.style.left = `${pet.x}px`;
                pet.el.style.top = `${pet.y}px`;
                if (pet.dx > 0) pet.el.style.transform = 'scaleX(-1)';
                else pet.el.style.transform = 'scaleX(1)';
            }
            if (pet.x < -100 || pet.x > window.innerWidth + 100 || pet.y < -100 || pet.y > window.innerHeight + 100) {
                pet.active = false;
                pet.el.remove();
                return;
            }
            requestAnimationFrame(() => this.animatePet(pet));
        }
    }

    new ChibiPetManager();

});

