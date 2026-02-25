document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.reveal');
    const progressFill = document.querySelector('.progress-fill');
    
    const observerOptions = {
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animate each step with a stagger effect
                setTimeout(() => {
                    entry.target.classList.add('active');
                    
                    // Update progress line based on how many steps are visible
                    const activeCount = document.querySelectorAll('.step-item.active').length;
                    const progressWidth = ((activeCount - 1) / (steps.length - 1)) * 100;
                    progressFill.style.width = `${progressWidth}%`;
                }, index * 200); // 200ms stagger
            }
        });
    }, observerOptions);

    steps.forEach(step => observer.observe(step));
});