// Interview Question Generator - OpenAI Integration
// Uses OpenAI API to generate tailored questions

class InterviewApp {
    constructor() {
        this.apiEndpoint = '/api/generate-questions';
        this.currentData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        const form = document.getElementById('question-form');
        const copyAllBtn = document.getElementById('copy-all-btn');
        const exportTxtBtn = document.getElementById('export-txt-btn');
        const retryBtn = document.getElementById('retry-btn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        copyAllBtn?.addEventListener('click', () => this.copyAllQuestions());
        exportTxtBtn?.addEventListener('click', () => this.exportToTxt());
        retryBtn?.addEventListener('click', () => this.retry());
    }

    setupCharacterCounter() {
        const jdTextarea = document.getElementById('jd-text');
        const jdCount = document.getElementById('jd-count');
        const cvTextarea = document.getElementById('cv-text');
        const cvCount = document.getElementById('cv-count');
        
        jdTextarea.addEventListener('input', () => {
            const count = jdTextarea.value.length;
            jdCount.textContent = count.toLocaleString();
            
            if (count > 100000) {
                jdCount.style.color = '#ff6b6b';
            } else {
                jdCount.style.color = '#666';
            }
        });

        cvTextarea.addEventListener('input', () => {
            const count = cvTextarea.value.length;
            cvCount.textContent = count.toLocaleString();
            
            if (count > 50000) {
                cvCount.style.color = '#ff6b6b';
            } else {
                cvCount.style.color = '#666';
            }
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const role = formData.get('role');
        const seniority = formData.get('seniority');
        const jdText = formData.get('jdText');
        const cvText = formData.get('cvText');

        if (!role || !seniority || !jdText || !cvText) {
            this.showError('Please fill in all required fields');
            return;
        }

        this.setLoading(true);

        try {
            // Call OpenAI API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: role.trim(),
                    seniority: seniority,
                    jdText: jdText.trim(),
                    cvText: cvText.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate questions');
            }

            const questions = await response.json();
            
            this.currentData = questions;
            this.displayResults(questions);
            this.hideError();

        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || 'An error occurred while generating questions');
        } finally {
            this.setLoading(false);
        }
    }


    displayResults(data) {
        const resultsDiv = document.getElementById('results');
        const categoriesDiv = document.getElementById('categories');
        const bonusSection = document.getElementById('bonus-section');
        
        // Clear previous results
        categoriesDiv.innerHTML = '';
        
        // Display categories
        data.categories.forEach((category, index) => {
            const categoryDiv = this.createCategoryElement(category, index);
            categoriesDiv.appendChild(categoryDiv);
        });

        // Display bonus section
        if (data.bonus && (data.bonus.red_flags?.length > 0 || data.bonus.homework_prompt)) {
            this.displayBonusSection(data.bonus);
            bonusSection.style.display = 'block';
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    createCategoryElement(category, index) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        
        const isOpen = index === 0; // Open first category by default
        
        categoryDiv.innerHTML = `
            <div class="category-header" onclick="this.parentElement.classList.toggle('open')">
                <h3>${category.name}</h3>
                <div class="category-actions">
                    <button class="btn-copy-category" onclick="event.stopPropagation(); window.app.copyCategory('${category.name}')">
                        📋 Copy
                    </button>
                    <span class="category-toggle">${isOpen ? '−' : '+'}</span>
                </div>
            </div>
            <div class="category-content" style="display: ${isOpen ? 'block' : 'none'}">
                <div class="questions">
                    ${category.questions.map((question, qIndex) => `
                        <div class="question">
                            <div class="question-text">${question.q}</div>
                            <div class="question-details">
                                <div class="why-matters">
                                    <strong>Why it matters:</strong> ${question.why_it_matters}
                                </div>
                                <div class="good-sounds-like">
                                    <strong>What good sounds like:</strong> ${question.what_good_sounds_like}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        return categoryDiv;
    }

    displayBonusSection(bonus) {
        const redFlagsDiv = document.getElementById('red-flags');
        const homeworkDiv = document.getElementById('homework-prompt');
        
        if (bonus.red_flags && bonus.red_flags.length > 0) {
            redFlagsDiv.innerHTML = `
                <h4>Potential Red Flags:</h4>
                <ul>
                    ${bonus.red_flags.map(flag => `<li>${flag}</li>`).join('')}
                </ul>
            `;
        }
        
        if (bonus.homework_prompt) {
            homeworkDiv.innerHTML = `
                <h4>Homework Prompt:</h4>
                <p>${bonus.homework_prompt}</p>
            `;
        }
    }

    copyCategory(categoryName) {
        const categoryDiv = document.querySelector(`.category:has(.category-header h3:contains("${categoryName}"))`);
        if (!categoryDiv) return;
        
        const questions = categoryDiv.querySelectorAll('.question-text');
        const text = Array.from(questions).map(q => q.textContent).join('\n\n');
        
        navigator.clipboard.writeText(text).then(() => {
            alert('Category copied to clipboard!');
        });
    }

    copyAllQuestions() {
        if (!this.currentData) return;
        
        let allText = '';
        this.currentData.categories.forEach(category => {
            allText += `${category.name}\n`;
            allText += '='.repeat(category.name.length) + '\n\n';
            category.questions.forEach(question => {
                allText += `Q: ${question.q}\n\n`;
                allText += `Why it matters: ${question.why_it_matters}\n\n`;
                allText += `What good sounds like: ${question.what_good_sounds_like}\n\n`;
                allText += '---\n\n';
            });
            allText += '\n';
        });
        
        navigator.clipboard.writeText(allText).then(() => {
            alert('All questions copied to clipboard!');
        });
    }

    exportToTxt() {
        if (!this.currentData) return;
        
        let content = 'Interview Questions\n';
        content += '==================\n\n';
        
        this.currentData.categories.forEach(category => {
            content += `${category.name}\n`;
            content += '='.repeat(category.name.length) + '\n\n';
            category.questions.forEach((question, index) => {
                content += `${index + 1}. ${question.q}\n\n`;
                content += `Why it matters: ${question.why_it_matters}\n\n`;
                content += `What good sounds like: ${question.what_good_sounds_like}\n\n`;
                content += '---\n\n';
            });
            content += '\n';
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview-questions.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    retry() {
        document.getElementById('results').style.display = 'none';
        document.getElementById('question-form').reset();
        document.getElementById('jd-count').textContent = '0';
        document.getElementById('cv-count').textContent = '0';
        this.hideError();
    }

    setLoading(loading) {
        const btn = document.getElementById('generate-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnSpinner = btn.querySelector('.btn-spinner');
        
        if (loading) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline';
        } else {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InterviewApp();
});
