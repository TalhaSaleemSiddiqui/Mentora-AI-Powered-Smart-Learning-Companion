/**
 * Natural text-to-speech via Puter.js (free AWS Polly neural voices).
 * Falls back to browser speech if the API is unavailable.
 */
(function (global) {


    const ONES = [
        'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
        'seventeen', 'eighteen', 'nineteen'
    ];
    const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    let speakToken = 0;
    let currentAudio = null;

    function stopPlayback() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.onended = null;
            currentAudio.onerror = null;
            currentAudio = null;
        }
        if ('speechSynthesis' in global) {
            global.speechSynthesis.cancel();
        }
    }



    function numberToWords(n) {
        const num = parseInt(n, 10);
        if (Number.isNaN(num)) return String(n);
        if (num < 0) return `minus ${numberToWords(Math.abs(num))}`;
        if (num < 20) return ONES[num];
        if (num < 100) {
            const tens = Math.floor(num / 10);
            const ones = num % 10;
            return ones ? `${TENS[tens]} ${ONES[ones]}` : TENS[tens];
        }
        if (num < 1000) {
            const hundreds = Math.floor(num / 100);
            const rest = num % 100;
            const head = `${ONES[hundreds]} hundred`;
            return rest ? `${head} ${numberToWords(rest)}` : head;
        }
        return String(num);
    }

    function humanizeText(text) {
        let out = String(text)
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, ' and ')
            .replace(/&/g, ' and ')
            .replace(/\s+/g, ' ')
            .trim();

        out = out
            .replace(/\$(\d+)\.(\d{2})\b/g, (_, dollars, cents) => {
                const d = numberToWords(dollars);
                const c = parseInt(cents, 10);
                if (!c) return `${d} dollars`;
                return `${d} dollars and ${numberToWords(c)} cents`;
            })
            .replace(/\$(\d+)\b/g, (_, n) => `${numberToWords(n)} dollars`)
            .replace(/(\d+)\s*÷\s*(\d+)\s+equals?\s+(\d+)/gi, (_, a, b, c) =>
                `${numberToWords(a)} divided by ${numberToWords(b)} equals ${numberToWords(c)}`)
            .replace(/(\d+)\s*÷\s*(\d+)/gi, (_, a, b) => `${numberToWords(a)} divided by ${numberToWords(b)}`)
            .replace(/(\d+)\s+divided\s+by\s+(\d+)\s+equals?\s+(\d+)/gi, (_, a, b, c) =>
                `${numberToWords(a)} divided by ${numberToWords(b)} equals ${numberToWords(c)}`)
            .replace(/(\d+)\s+divided\s+by\s+(\d+)/gi, (_, a, b) => `${numberToWords(a)} divided by ${numberToWords(b)}`)
            .replace(/(\d+)\s*\/\s*(\d+)/g, (_, a, b) => `${numberToWords(a)} over ${numberToWords(b)}`)
            .replace(/(\d+)\s*[×x*]\s*(\d+)/gi, (_, a, b) => `${numberToWords(a)} times ${numberToWords(b)}`)
            .replace(/(\d+)\s*\+\s*(\d+)/g, (_, a, b) => `${numberToWords(a)} plus ${numberToWords(b)}`)
            .replace(/(\d+)\s*[−\-]\s*(\d+)/g, (_, a, b) => `${numberToWords(a)} minus ${numberToWords(b)}`)
            .replace(/(\d+)\s*(?:equals?|is)\s*(\d+)/gi, (_, a, b) => `${numberToWords(a)} equals ${numberToWords(b)}`)
            .replace(/\bLevel\s+(\d+)\b/gi, (_, n) => `Level ${numberToWords(n)}`)
            .replace(/\bDay\s+(\d+)\b/gi, (_, n) => `Day ${numberToWords(n)}`)
            .replace(/\b(\d{1,4})\b/g, (match) => numberToWords(match));

        return out
            .replace(/\.\.\./g, '. ')
            .replace(/[!]{2,}/g, '!')
            .replace(/([,;:])(?!\s)/g, '$1 ')
            .replace(/\s+([,.!?])/g, '$1')
            .trim();
    }





    function speakWithBrowser(text, token) {
        if (!('speechSynthesis' in global)) return Promise.resolve();

        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = global.speechSynthesis.getVoices();
            const preferred = voices.find((v) => /joanna|samantha|karen|moira|female/i.test(v.name))
                || voices.find((v) => v.lang?.startsWith('en'));
            if (preferred) utterance.voice = preferred;
            utterance.lang = 'en-US';
            utterance.rate = 0.95;
            utterance.pitch = 1;

            utterance.onend = () => {
                if (token === speakToken) resolve();
            };
            utterance.onerror = () => resolve();

            if (token !== speakToken) {
                resolve();
                return;
            }

            global.speechSynthesis.speak(utterance);
        });
    }

    async function speakHeartwarming(text) {
        if (text == null || text === '') return;

        const humanized = humanizeText(text);
        if (!humanized) return;

        const token = ++speakToken;
        stopPlayback();

        await speakWithBrowser(humanized, token);
    }

    global.HeartwarmingTTS = {
        speak: speakHeartwarming,
        humanizeText,
        stop: () => {
            speakToken += 1;
            stopPlayback();
        }
    };
})(typeof window !== 'undefined' ? window : globalThis);
