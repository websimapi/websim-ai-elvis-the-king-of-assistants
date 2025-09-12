class ElvisAI {
    constructor() {
        this.generateBtn = document.getElementById('generate-btn');
        this.captureBtn = document.getElementById('capture-btn');
        this.cameraBtn = document.getElementById('camera-btn');
        this.uploadBtn = document.getElementById('upload-btn');
        this.fileInput = document.getElementById('file-input');
        this.loading = document.getElementById('loading');
        this.imagePlaceholder = document.getElementById('image-placeholder');
        this.elvisImage = document.getElementById('elvis-image');
        this.cameraVideo = document.getElementById('camera-video');
        this.cameraCanvas = document.getElementById('camera-canvas');
        
        this.currentImageData = null;
        this.stream = null;
        
        this.init();
    }
    
    init() {
        this.generateBtn.addEventListener('click', () => this.generateElvisImage());
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.cameraBtn.addEventListener('click', () => this.startCamera());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
    
    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            this.cameraVideo.srcObject = this.stream;
            
            this.showCameraMode();
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please try uploading a photo instead.');
        }
    }
    
    showCameraMode() {
        this.imagePlaceholder.classList.add('hidden');
        this.elvisImage.classList.add('hidden');
        this.cameraVideo.classList.remove('hidden');
        this.captureBtn.classList.remove('hidden');
        this.generateBtn.classList.add('hidden');
        this.cameraBtn.classList.add('active');
        this.uploadBtn.classList.remove('active');
    }
    
    capturePhoto() {
        const canvas = this.cameraCanvas;
        const video = this.cameraVideo;
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        this.currentImageData = canvas.toDataURL('image/jpeg', 0.8);
        
        this.stopCamera();
        this.showCapturedImage();
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.cameraVideo.classList.add('hidden');
        this.captureBtn.classList.add('hidden');
    }
    
    showCapturedImage() {
        this.elvisImage.src = this.currentImageData;
        this.elvisImage.classList.remove('hidden');
        this.generateBtn.classList.remove('hidden');
        this.generateBtn.querySelector('.btn-text').textContent = 'Transform Into Elvis';
        this.cameraBtn.classList.remove('active');
    }
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.currentImageData = await this.fileToDataUrl(file);
        this.showUploadedImage();
    }
    
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    showUploadedImage() {
        this.imagePlaceholder.classList.add('hidden');
        this.cameraVideo.classList.add('hidden');
        this.elvisImage.src = this.currentImageData;
        this.elvisImage.classList.remove('hidden');
        this.generateBtn.classList.remove('hidden');
        this.captureBtn.classList.add('hidden');
        this.generateBtn.querySelector('.btn-text').textContent = 'Transform Into Elvis';
        this.uploadBtn.classList.add('active');
        this.cameraBtn.classList.remove('active');
    }
    
    async generateElvisImage() {
        if (!this.currentImageData) {
            alert('Please take a photo or upload an image first!');
            return;
        }
        
        this.showLoading();
        
        try {
            const result = await websim.imageGen({
                prompt: "Transform this person into Elvis Presley - give them Elvis's iconic black pompadour hairstyle with sideburns, classic Elvis sunglasses or confident smile, white rhinestone jumpsuit with high collar, maintain the person's facial structure but add Elvis's signature style and charisma, professional portrait lighting, photorealistic",
                image_inputs: [
                    {
                        url: this.currentImageData
                    }
                ],
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
        this.elvisImage.classList.add('hidden');
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
        this.generateBtn.querySelector('.btn-text').textContent = 'Transform Again';
        this.generateBtn.querySelector('.btn-icon').textContent = '🎸';
    }
}

// Initialize the Elvis AI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ElvisAI();
});