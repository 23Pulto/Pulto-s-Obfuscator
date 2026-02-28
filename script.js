// script.js
let originalCode = '';
let obfuscator = null;

window.addEventListener('load', function() {
    // Initialize obfuscator with config
    obfuscator = new PultoObfuscator(CONFIG);
    
    // Verification overlay code...
    // (keep existing verification code)
});

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tabContent').forEach(content => content.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function startObfuscation() {
    const input = document.getElementById('inputCode').value;
    if (!input.trim()) {
        document.getElementById('status').innerText = 'Enter some Lua code first!';
        return;
    }
    originalCode = input;
    document.getElementById('status').innerText = 'Obfuscating... This may take a moment.';
    
    setTimeout(() => {
        try {
            // Collect feature flags from checkboxes
            const features = {
                byteEncode: document.getElementById('byteEncode').checked,
                fakeMath: document.getElementById('fakeMath').checked,
                deadFlow: document.getElementById('deadFlow').checked,
                wrapStrings: document.getElementById('wrapStrings').checked,
                variableRenaming: document.getElementById('variableRenaming')?.checked || false,
                stringSplitting: document.getElementById('stringSplitting')?.checked || false,
                controlFlowFlattening: document.getElementById('controlFlowFlattening')?.checked || false,
                antiDebug: document.getElementById('antiDebug')?.checked || false,
                integrityChecks: document.getElementById('integrityChecks')?.checked || false,
                asciiAntiSkid: document.getElementById('asciiAntiSkid')?.checked || false,
                asciiStyle: document.getElementById('asciiStyle')?.value || 'clean'
            };
            // Merge with CONFIG defaults
            CONFIG.features = { ...CONFIG.features, ...features };
            
            const obfuscated = obfuscator.obfuscate(input);
            document.getElementById('outputCode').value = obfuscated;
            document.getElementById('status').innerText = '✓ Obfuscation complete! Code is protected.';
        } catch (e) {
            document.getElementById('status').innerText = '✗ Error: ' + e.message;
            console.error(e);
        }
    }, 100);
}

function decryptLua() {
    const input = document.getElementById('decryptInput').value;
    const output = document.getElementById('decryptOutput');
    try {
        const codeMatch = input.match(/\|\|\n(.*?)\n    \]\]/s);
        if (codeMatch && codeMatch[1]) {
            output.value = "Decryption partially successful - extracted core code:\n\n" + codeMatch[1];
        } else {
            output.value = "Could not decrypt - code is heavily protected";
        }
    } catch (e) {
        output.value = 'Decryption failed: ' + e.message;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        startObfuscation();
    }
    if (e.ctrlKey && e.key === 'c' && document.activeElement.id === 'outputCode') {
        e.preventDefault();
        document.getElementById('outputCode').select();
        document.execCommand('copy');
        document.getElementById('status').innerText = '✓ Copied to clipboard!';
    }
});
