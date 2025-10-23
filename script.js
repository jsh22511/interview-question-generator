// Interview Question Generator - Virtual Wizards
// Handles PDF parsing, API calls, and UI interactions

class InterviewQuestionApp {
    constructor() {
        this.apiEndpoint = '/api/generate-questions'; // Will be updated automatically by Vercel
        this.pdfWorker = null;
        this.currentData = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        const form = document.getElementById('question-form');
        const fileInput = document.getElementById('cv-upload');
        const copyAllBtn = document.getElementById('copy-all-btn');
        const exportTxtBtn = document.getElementById('export-txt-btn');
        const retryBtn = document.getElementById('retry-btn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        copyAllBtn?.addEventListener('click', () => this.copyAllQuestions());
        exportTxtBtn?.addEventListener('click', () => this.exportToTxt());
        retryBtn?.addEventListener('click', () => this.retry());
    }


    setupCharacterCounter() {
        const jdTextarea = document.getElementById('jd-text');
        const jdCount = document.getElementById('jd-count');
        
        jdTextarea.addEventListener('input', () => {
            const count = jdTextarea.value.length;
            jdCount.textContent = count.toLocaleString();
            
            // Warn if approaching limit
            if (count > 100000) {
                jdCount.style.color = '#ff6b6b';
            } else {
                jdCount.style.color = '#666';
            }
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.style.display = 'block';

        // Check file size (150KB limit)
        if (file.size > 150 * 1024) {
            this.showError(`File size (${this.formatFileSize(file.size)}) exceeds 150KB limit`);
            return;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const role = formData.get('role');
        const seniority = formData.get('seniority');
        const jdText = formData.get('jdText');
        const cvFile = formData.get('cvFile');

        if (!role || !seniority || !jdText || !cvFile) {
            this.showError('Please fill in all required fields');
            return;
        }

        this.setLoading(true);

        try {
            // Parse CV file
            const cvText = await this.parseCVFile(cvFile);
            
            // Prepare API request
            const requestData = {
                role: role.trim(),
                seniority: seniority,
                jdText: jdText.trim(),
                cvText: cvText
            };

            // Make API call
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate questions');
            }

            this.currentData = data;
            this.displayResults(data);
            this.hideError();

        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || 'An error occurred while generating questions');
        } finally {
            this.setLoading(false);
        }
    }

    async parseCVFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'txt') {
            return this.parseTextFile(file);
        } else if (fileExtension === 'pdf') {
            return this.parsePDFSimple(file);
        } else {
            throw new Error('Please upload a .txt or .pdf file.');
        }
    }

    parseTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read text file'));
            reader.readAsText(file);
        });
    }

    async parsePDFSimple(file) {
        try {
            // Convert PDF to base64 for server processing
            const arrayBuffer = await file.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            
            // Send PDF to server for reliable parsing
            const response = await fetch('/api/parse-pdf-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    pdfData: base64,
                    fileName: file.name
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to parse PDF');
            }

            const result = await response.json();
            return result.text;
            
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('Failed to parse PDF. Please try uploading a .txt file with your CV content instead.');
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
        
        if (isOpen) {
            categoryDiv.classList.add('open');
        }
        
        return categoryDiv;
    }

    displayBonusSection(bonus) {
        const redFlagsDiv = document.getElementById('red-flags');
        const homeworkPromptDiv = document.getElementById('homework-prompt');
        
        if (bonus.red_flags && bonus.red_flags.length > 0) {
            redFlagsDiv.innerHTML = `
                <h4>🚩 Red Flags to Watch For</h4>
                <ul>
                    ${bonus.red_flags.map(flag => `<li>${flag}</li>`).join('')}
                </ul>
            `;
        }
        
        if (bonus.homework_prompt) {
            homeworkPromptDiv.innerHTML = `
                <h4>📝 Homework Assignment</h4>
                <p>${bonus.homework_prompt}</p>
            `;
        }
    }

    async copyAllQuestions() {
        if (!this.currentData) return;
        
        let allText = `Interview Questions for ${this.currentData.role} (${this.currentData.seniority} level)\n\n`;
        
        this.currentData.categories.forEach(category => {
            allText += `## ${category.name}\n\n`;
            category.questions.forEach((question, index) => {
                allText += `${index + 1}. ${question.q}\n`;
                allText += `   Why it matters: ${question.why_it_matters}\n`;
                allText += `   What good sounds like: ${question.what_good_sounds_like}\n\n`;
            });
        });
        
        if (this.currentData.bonus) {
            if (this.currentData.bonus.red_flags?.length > 0) {
                allText += `## Red Flags to Watch For\n`;
                this.currentData.bonus.red_flags.forEach(flag => {
                    allText += `• ${flag}\n`;
                });
                allText += '\n';
            }
            
            if (this.currentData.bonus.homework_prompt) {
                allText += `## Homework Assignment\n${this.currentData.bonus.homework_prompt}\n`;
            }
        }
        
        try {
            await navigator.clipboard.writeText(allText);
            this.showToast('All questions copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy to clipboard');
        }
    }

    async copyCategory(categoryName) {
        if (!this.currentData) return;
        
        const category = this.currentData.categories.find(cat => cat.name === categoryName);
        if (!category) return;
        
        let categoryText = `${category.name} Questions\n\n`;
        category.questions.forEach((question, index) => {
            categoryText += `${index + 1}. ${question.q}\n`;
            categoryText += `   Why it matters: ${question.why_it_matters}\n`;
            categoryText += `   What good sounds like: ${question.what_good_sounds_like}\n\n`;
        });
        
        try {
            await navigator.clipboard.writeText(categoryText);
            this.showToast(`${categoryName} questions copied to clipboard!`);
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy to clipboard');
        }
    }

    async exportToTxt() {
        if (!this.currentData) return;
        
        try {
            const allText = await this.generateExportText();
            
            const blob = new Blob([allText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interview-questions-${this.currentData.role.replace(/\s+/g, '-').toLowerCase()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Questions exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Failed to export questions');
        }
    }

    async generateExportText() {
        let allText = `Interview Questions for ${this.currentData.role} (${this.currentData.seniority} level)\n`;
        allText += `Generated on ${new Date().toLocaleDateString()}\n`;
        allText += `Powered by Virtual Wizards\n\n`;
        
        this.currentData.categories.forEach(category => {
            allText += `${category.name.toUpperCase()}\n`;
            allText += '='.repeat(category.name.length) + '\n\n';
            category.questions.forEach((question, index) => {
                allText += `${index + 1}. ${question.q}\n\n`;
                allText += `   Why it matters: ${question.why_it_matters}\n\n`;
                allText += `   What good sounds like: ${question.what_good_sounds_like}\n\n`;
                allText += '---\n\n';
            });
        });
        
        if (this.currentData.bonus) {
            if (this.currentData.bonus.red_flags?.length > 0) {
                allText += `RED FLAGS TO WATCH FOR\n`;
                allText += '='.repeat(25) + '\n\n';
                this.currentData.bonus.red_flags.forEach(flag => {
                    allText += `• ${flag}\n`;
                });
                allText += '\n';
            }
            
            if (this.currentData.bonus.homework_prompt) {
                allText += `HOMEWORK ASSIGNMENT\n`;
                allText += '='.repeat(20) + '\n\n';
                allText += `${this.currentData.bonus.homework_prompt}\n\n`;
            }
        }
        
        return allText;
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
        const errorDiv = document.getElementById('error');
        const errorMessage = document.getElementById('error-message');
        
        errorMessage.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide results if showing
        document.getElementById('results').style.display = 'none';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    retry() {
        this.hideError();
        document.getElementById('question-form').scrollIntoView({ behavior: 'smooth' });
    }

    showToast(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InterviewQuestionApp();
});