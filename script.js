// script.js
let originalCode = '';

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tabContent').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function startObfuscation() {
    const input = document.getElementById('inputCode').value;
    if (!input.trim()) {
        document.getElementById('status').innerText = 'Please enter some Lua code!';
        return;
    }
    
    originalCode = input;
    document.getElementById('status').innerText = 'Obfuscating...';
    
    // Use setTimeout to prevent UI freezing
    setTimeout(() => {
        try {
            const obfuscated = obfuscateLua(input);
            document.getElementById('outputCode').value = obfuscated;
            document.getElementById('status').innerText = 'Obfuscation complete!';
        } catch (e) {
            document.getElementById('status').innerText = 'Error: ' + e.message;
        }
    }, 100);
}

function obfuscateLua(code) {
    let result = code;
    
    // Apply selected obfuscation techniques
    if (document.getElementById('byteEncode').checked) {
        result = byteEncode(result);
    }
    
    if (document.getElementById('fakeMath').checked) {
        result = addFakeMath(result);
    }
    
    if (document.getElementById('deadFlow').checked) {
        result = addDeadFlow(result);
    }
    
    if (document.getElementById('wrapStrings').checked) {
        result = wrapEncodedStrings(result);
    }
    
    // Add loader wrapper
    result = wrapInLoader(result);
    
    return result;
}

function byteEncode(code) {
    // Convert strings to byte representations
    return code.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return `string.char(${bytes.join(',')})`;
    });
}

function addFakeMath(code) {
    // Add fake mathematical garbage code
    const junkVars = ['_', '__', '___', 'a', 'b', 'c', 'x', 'y', 'z'];
    const junkCode = [];
    
    for (let i = 0; i < 5; i++) {
        const var1 = junkVars[Math.floor(Math.random() * junkVars.length)];
        const var2 = junkVars[Math.floor(Math.random() * junkVars.length)];
        const num1 = Math.floor(Math.random() * 1000);
        const num2 = Math.floor(Math.random() * 1000);
        const ops = ['+', '-', '*', '/', '%', '^'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        
        junkCode.push(`local ${var1}${i}=${num1}${op}${num2}`);
        junkCode.push(`local ${var2}${i}=(${num1}+${num2})${op}${var1}${i}`);
    }
    
    return junkCode.join('\n') + '\n\n' + code;
}

function addDeadFlow(code) {
    // Add dead control flow with opaque predicates
    const lines = code.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        // Add junk control flow before some lines
        if (Math.random() > 0.7 && lines[i].trim()) {
            const fakeVar = '_flow' + Math.floor(Math.random() * 1000);
            const fakeNum = Math.floor(Math.random() * 100);
            
            result.push(`local ${fakeVar}=${fakeNum}`);
            result.push(`if ${fakeVar} > ${fakeNum-1} or ${fakeVar} < ${fakeNum+1} then`);
            result.push(`    ${lines[i]}`);
            result.push(`end`);
        } else {
            result.push(lines[i]);
        }
    }
    
    return result.join('\n');
}

function wrapEncodedStrings(code) {
    // Wrap strings in complex encoding/decoding functions
    const encoder = `
local function decodeString(s)
    local bytes = {}
    for i = 1, #s, 2 do
        local byte = tonumber(string.sub(s, i, i+1), 16)
        table.insert(bytes, byte)
    end
    return string.char(unpack(bytes))
end

`;
    
    // Find strings and encode them in hex
    code = code.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
        const hex = [];
        for (let i = 1; i <= str.length; i++) {
            hex.push(str.charCodeAt(i-1).toString(16).padStart(2, '0'));
        }
        return `decodeString("${hex.join('')}")`;
    });
    
    return encoder + code;
}

function wrapInLoader(code) {
    // Create the final loader with anti-tampering
    const version = CONFIG.version;
    const link = CONFIG.link;
    
    return `--[[
    ${version}
    ${link}
    Pulto Obfuscator
]]

return(function(...)
    local code = [[
${code}
    ]]
    
    -- Anti-tampering checks
    local function checkEnvironment()
        local env = getfenv and getfenv() or _ENV
        local dangerous = {'debug', 'getfenv', 'setfenv', 'loadstring'}
        for _, v in pairs(dangerous) do
            if env[v] then
                return false
            end
        end
        return true
    end
    
    if not checkEnvironment() then
        error("Protected code")
    end
    
    -- Execute the obfuscated code
    local func = load(code)
    if func then
        return func(...)
    else
        error("Failed to load protected code")
    end
end)`;
}

function decryptLua() {
    const input = document.getElementById('decryptInput').value;
    const output = document.getElementById('decryptOutput');
    
    try {
        // Attempt to extract and decode strings
        let decoded = input;
        
        // Find decodeString functions and try to decode
        const decodeRegex = /decodeString\("([0-9a-f]+)"\)/g;
        decoded = decoded.replace(decodeRegex, (match, hex) => {
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                const byte = parseInt(hex.substr(i, 2), 16);
                str += String.fromCharCode(byte);
            }
            return '"' + str + '"';
        });
        
        // Remove loader wrapper
        decoded = decoded.replace(/return\(function\(\.\.\.\).*?end\)\(\)/s, '');
        
        // Remove junk code (simple version)
        const lines = decoded.split('\n');
        const cleaned = lines.filter(line => {
            return !line.match(/^local _\w+=\d+/) && 
                   !line.match(/^if _\w+ >/) &&
                   line.trim().length > 0;
        }).join('\n');
        
        output.value = cleaned || 'Could not fully decrypt (may be heavily obfuscated)';
    } catch (e) {
        output.value = 'Decryption failed: ' + e.message;
    }
}

// Copy output to clipboard
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c' && document.activeElement.id === 'outputCode') {
        e.preventDefault();
        document.getElementById('outputCode').select();
        document.execCommand('copy');
        document.getElementById('status').innerText = 'Copied to clipboard!';
    }
});
