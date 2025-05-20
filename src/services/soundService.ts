
// Define our sound types
type SoundEffect = 'questionStart' | 'answerReveal' | 'leaderboard';

// Define a class to manage our sounds
class SoundService {
  private sounds: Record<SoundEffect, HTMLAudioElement | null> = {
    questionStart: null,
    answerReveal: null,
    leaderboard: null
  };
  
  private initialized = false;
  
  // Initialize the sound objects
  initialize() {
    if (this.initialized) return;
    
    this.sounds.questionStart = new Audio('/sounds/question.mp3');
    this.sounds.answerReveal = new Audio('/sounds/answer.mp3');
    this.sounds.leaderboard = new Audio('/sounds/leaderboard.mp3');
    
    // Preload sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.load();
        sound.volume = 0.5; // Set default volume
      }
    });
    
    this.initialized = true;
  }
  
  // Method to play a sound
  play(soundType: SoundEffect) {
    // Initialize sounds if not already done
    if (!this.initialized) this.initialize();
    
    const sound = this.sounds[soundType];
    if (sound) {
      // Reset the sound to the beginning before playing
      sound.pause();
      sound.currentTime = 0;
      
      // Play the sound
      sound.play().catch(err => {
        // Handle autoplay restriction errors
        console.log(`Sound play error: ${err.message}`);
      });
    }
  }
  
  // Stop a specific sound
  stop(soundType: SoundEffect) {
    const sound = this.sounds[soundType];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
  
  // Stop all sounds
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
  }
}

// Export a singleton instance
export const soundService = new SoundService();
