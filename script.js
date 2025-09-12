class ElvisAI {
    constructor() {
        this.generateBtn = document.getElementById('generate-btn');
        this.loading = document.getElementById('loading');
        this.imagePlaceholder = document.getElementById('image-placeholder');
        this.elvisImage = document.getElementById('elvis-image');
        
        this.init();
    }
    
    init() {
        this.generateBtn.addEventListener('click', () => this.generateElvisImage());
    }
    
    async generateElvisImage() {
        this.showLoading();
        
        try {
            const result = await websim.imageGen({
                prompt: "A sophisticated AI assistant reimagined as Elvis Presley in his prime - iconic black pompadour hair with sideburns, wearing a white rhinestone jumpsuit with a high collar, classic Elvis sunglasses, confident charismatic smile, studio lighting, professional portrait style, digital art meets photography, futuristic yet retro aesthetic",
                aspect_ratio: "3:4"
            });
            
            this.displayImage(result.url);
            this.updateButton();
            
        } catch (error) {
            console.error('Error generating Elvis image:', error);
            this.hideLoading();
            alert('Oops! The King had a little technical difficulty. Please try again!');
        }
    }
    
    showLoading() {
        this.generateBtn.disabled = true;
        this.generateBtn.querySelector('.btn-text').textContent = 'Transforming...';
        this.loading.classList.remove('hidden');
        this.imagePlaceholder.classList.add('hidden');
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
        this.generateBtn.disabled = false;
    }
    
    displayImage(imageUrl) {
        this.elvisImage.src = imageUrl;
        this.elvisImage.classList.remove('hidden');
        this.hideLoading();
        
        // Add a subtle entrance animation
        this.elvisImage.style.opacity = '0';
        this.elvisImage.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            this.elvisImage.style.transition = 'all 0.5s ease';
            this.elvisImage.style.opacity = '1';
            this.elvisImage.style.transform = 'scale(1)';
        }, 100);
    }
    
    updateButton() {
        this.generateBtn.querySelector('.btn-text').textContent = 'Generate Another Look';
        this.generateBtn.querySelector('.btn-icon').textContent = '🎸';
    }
}

// Initialize the Elvis AI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ElvisAI();
});

