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
        
        this.intensitySlider = document.getElementById('intensity-slider');
        this.intensityValue = document.getElementById('intensity-value');
        this.saveBtn = document.getElementById('save-transformation');
        this.viewGalleryBtn = document.getElementById('view-gallery');
        this.actionButtons = document.getElementById('action-buttons');
        this.gallerySection = document.getElementById('gallery-section');
        this.closeGalleryBtn = document.getElementById('close-gallery');
        this.galleryGrid = document.getElementById('gallery-grid');
        this.galleryLoading = document.getElementById('gallery-loading');
        
        this.currentImageData = null;
        this.currentTransformationUrl = null;
        this.stream = null;
        this.room = new WebsimSocket();
        
        this.init();
    }
    
    init() {
        this.generateBtn.addEventListener('click', () => this.generateElvisImage());
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.cameraBtn.addEventListener('click', () => this.startCamera());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        this.intensitySlider.addEventListener('input', (e) => this.updateIntensityDisplay(e));
        this.saveBtn.addEventListener('click', () => this.saveTransformation());
        this.viewGalleryBtn.addEventListener('click', () => this.showGallery());
        this.closeGalleryBtn.addEventListener('click', () => this.hideGallery());
        
        // Add quick gallery button listener
        document.getElementById('quick-gallery-btn').addEventListener('click', () => this.showGallery());
    }
    
    updateIntensityDisplay(event) {
        const value = event.target.value;
        this.intensityValue.textContent = `${value}%`;
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
            const intensity = parseInt(this.intensitySlider.value);
            const intensityPrompt = this.getIntensityPrompt(intensity);
            
            const result = await websim.imageGen({
                prompt: `Transform this person into Elvis Presley with ${intensityPrompt} - give them Elvis's iconic black pompadour hairstyle with sideburns, classic Elvis sunglasses or confident smile, white rhinestone jumpsuit with high collar, maintain the person's facial structure but add Elvis's signature style and charisma, professional portrait lighting, photorealistic`,
                image_inputs: [
                    {
                        url: this.currentImageData
                    }
                ],
                aspect_ratio: "3:4"
            });
            
            this.currentTransformationUrl = result.url;
            this.displayImage(result.url);
            this.updateButton();
            this.showActionButtons();
            
        } catch (error) {
            console.error('Error generating Elvis image:', error);
            this.hideLoading();
            alert('Oops! The King had a little technical difficulty. Please try again!');
        }
    }
    
    getIntensityPrompt(intensity) {
        if (intensity <= 25) return "subtle Elvis influence, keeping most original features";
        if (intensity <= 50) return "moderate Elvis transformation, balanced style";
        if (intensity <= 75) return "strong Elvis characteristics, distinctive King look";
        return "full Elvis transformation, maximum King energy and style";
    }
    
    showActionButtons() {
        this.actionButtons.classList.remove('hidden');
    }
    
    async saveTransformation() {
        if (!this.currentTransformationUrl || !this.currentImageData) {
            alert('No transformation to save!');
            return;
        }
        
        try {
            // Upload original image to get a permanent URL
            const originalBlob = await this.dataUrlToBlob(this.currentImageData);
            const originalImageUrl = await websim.upload(originalBlob);
            
            const intensity = parseInt(this.intensitySlider.value);
            
            await this.room.collection('elvis_transformations').create({
                original_image_url: originalImageUrl,
                elvis_image_url: this.currentTransformationUrl,
                intensity: intensity
            });
            
            alert('Your Elvis transformation has been saved to the gallery! 🎸');
            
        } catch (error) {
            console.error('Error saving transformation:', error);
            alert('Failed to save transformation. Please try again!');
        }
    }
    
    async dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return await response.blob();
    }
    
    async showGallery() {
        this.gallerySection.classList.remove('hidden');
        this.galleryLoading.classList.remove('hidden');
        
        try {
            const transformations = await this.room.query(`
                SELECT 
                    t.id,
                    t.original_image_url,
                    t.elvis_image_url,
                    t.intensity,
                    t.created_at,
                    u.username,
                    COUNT(v.id) as vote_count
                FROM public.elvis_transformations t
                JOIN public.user u ON t.user_id = u.id
                LEFT JOIN public.transformation_votes v ON t.id = v.transformation_id
                GROUP BY t.id, t.original_image_url, t.elvis_image_url, t.intensity, t.created_at, u.username
                ORDER BY vote_count DESC, t.created_at DESC
            `);
            
            this.renderGallery(transformations);
            
        } catch (error) {
            console.error('Error loading gallery:', error);
            alert('Failed to load gallery. Please try again!');
        } finally {
            this.galleryLoading.classList.add('hidden');
        }
    }
    
    renderGallery(transformations) {
        this.galleryGrid.innerHTML = transformations.map((item, index) => `
            <div class="gallery-item" data-id="${item.id}">
                <div class="rank-badge">#${index + 1}</div>
                <div class="image-comparison">
                    <img src="${item.original_image_url}" alt="Original" class="gallery-original">
                    <div class="arrow">→</div>
                    <img src="${item.elvis_image_url}" alt="Elvis transformation" class="gallery-elvis">
                </div>
                <div class="transformation-info">
                    <div class="creator">by ${item.username}</div>
                    <div class="intensity-badge">King Level: ${item.intensity}%</div>
                    <button class="vote-btn" data-transformation-id="${item.id}">
                        <span class="vote-icon">👑</span>
                        <span class="vote-count">${item.vote_count}</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add vote button listeners
        this.galleryGrid.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.voteForTransformation(e));
        });
    }
    
    async voteForTransformation(event) {
        const transformationId = event.currentTarget.dataset.transformationId;
        const currentUser = await window.websim.getCurrentUser();
        
        try {
            await this.room.collection('transformation_votes').upsert({
                id: `${currentUser.id}-${transformationId}`,
                transformation_id: transformationId
            });
            
            // Refresh the gallery to show updated vote counts
            this.showGallery();
            
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. You may have already voted for this transformation!');
        }
    }
    
    hideGallery() {
        this.gallerySection.classList.add('hidden');
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