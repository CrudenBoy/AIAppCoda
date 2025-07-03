// my-interactive-slides-app/src/services/ttsManager.ts

/**
 * TTSManager handles Text-to-Speech synthesis using the Web Speech API.
 * It is designed to be decoupled from any UI framework to prevent lifecycle issues,
 * such as React re-renders interrupting speech. It also manages a queue
 * to handle browser-specific bugs like speech being cut off after 15 seconds.
 */
class TTSManager {
    private utteranceQueue: SpeechSynthesisUtterance[] = [];
    private isSpeaking: boolean = false;
    private isPaused: boolean = false;
    private onCompleteCallback: (() => void) | null = null;
    private voice: SpeechSynthesisVoice | null = null;

    constructor(voice?: SpeechSynthesisVoice) {
        this.voice = voice || null;
    }

    /**
     * Splits text into smaller chunks suitable for the SpeechSynthesis API.
     * This method avoids splitting words by finding the last space within the chunk size.
     * @param text The full text to be spoken.
     * @returns An array of smaller text chunks.
     */
    private chunkText(text: string): string[] {
        const chunkSize = 180;
        const chunks: string[] = [];
        let remainingText = text;

        while (remainingText.length > chunkSize) {
            let chunk = remainingText.slice(0, chunkSize);
            let lastSpaceIndex = chunk.lastIndexOf(' ');

            if (lastSpaceIndex > 0) {
                chunk = chunk.slice(0, lastSpaceIndex);
            }

            chunks.push(chunk);
            remainingText = remainingText.slice(chunk.length).trim();
        }

        if (remainingText.length > 0) {
            chunks.push(remainingText);
        }

        return chunks;
    }

    /**
     * Speaks the provided text. If speech is already in progress, it is
     * stopped before starting the new synthesis.
     * @param text The text to be spoken.
     * @param onComplete An optional callback to execute when speech is finished.
     */
    public speak(text: string, onComplete?: () => void): void {
        if (this.isSpeaking) {
            this.stop();
        }

        this.onCompleteCallback = onComplete || null;
        const textChunks = this.chunkText(text);
        this.utteranceQueue = textChunks.map(chunk => {
            const utterance = new SpeechSynthesisUtterance(chunk);
            if (this.voice) {
                utterance.voice = this.voice;
            }
            utterance.onend = this.handleUtteranceEnd.bind(this);
            return utterance;
        });

        this.isSpeaking = true;
        this.isPaused = false;
        this.playNextChunk();
    }

    /**
     * Plays the next utterance in the queue.
     */
    private playNextChunk(): void {
        if (this.utteranceQueue.length > 0) {
            const utterance = this.utteranceQueue.shift();
            if (utterance) {
                window.speechSynthesis.speak(utterance);
            }
        } else {
            this.isSpeaking = false;
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
                this.onCompleteCallback = null; // Reset callback
            }
        }
    }

    /**
     * Handles the 'onend' event of an utterance, triggering the next chunk.
     */
    private handleUtteranceEnd(): void {
        if (this.isSpeaking && !this.isPaused) {
            this.playNextChunk();
        }
    }

    /**
     * Pauses the current speech synthesis.
     */
    public pause(): void {
        if (this.isSpeaking && !this.isPaused) {
            this.isPaused = true;
            window.speechSynthesis.pause();
        }
    }

    /**
     * Resumes the paused speech synthesis.
     */
    public resume(): void {
        if (this.isSpeaking && this.isPaused) {
            this.isPaused = false;
            window.speechSynthesis.resume();
        }
    }

    /**
     * Stops the speech synthesis immediately and clears the queue.
     */
    public stop(): void {
        this.isSpeaking = false;
        this.isPaused = false;
        this.utteranceQueue = [];
        this.onCompleteCallback = null;
        window.speechSynthesis.cancel();
    }
}

export default TTSManager;