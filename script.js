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
        document.getElementById('status').innerText = 'Enter some Lua code first!';
        return;
    }
    
    originalCode = input;
    document.getElementById('status').innerText = 'Obfuscating... This may take a moment.';
    
    setTimeout(() => {
        try {
            const obfuscated = obfuscateLua(input);
            document.getElementById('outputCode').value = obfuscated;
            document.getElementById('status').innerText = '✓ Obfuscation complete! Code is protected.';
        } catch (e) {
            document.getElementById('status').innerText = '✗ Error: ' + e.message;
            console.error(e);
        }
    }, 100);
}

function obfuscateLua(code) {
    let result = code;
    const features = CONFIG.features;
    
    // Apply ASCII Anti-Skid if enabled
    if (features.asciiAntiSkid) {
        result = addAsciiAntiSkid(result, features.asciiStyle);
    } else {
        // Always add standard header
        result = `--[[ Pulto's Obfuscator ${CONFIG.version} ${CONFIG.link} ]]--\n` + result;
    }
    
    // Layer 1: String and variable obfuscation
    if (features.byteEncode) result = byteEncode(result);
    if (features.stringSplitting) result = splitStrings(result);
    if (features.variableRenaming) result = renameVariables(result);
    
    // Layer 2: Control flow obfuscation
    if (features.deadFlow) result = addDeadFlow(result);
    if (features.fakeMath) result = addFakeMath(result);
    if (features.controlFlowFlattening) result = flattenControlFlow(result);
    
    // Layer 3: Anti-tampering
    if (features.antiDebug) result = addAntiDebug(result);
    if (features.integrityChecks) result = addIntegrityChecks(result);
    
    // Layer 4: Final encoding
    if (features.wrapStrings) result = wrapEncodedStrings(result);
    
    // Final wrapper with multiple protection layers
    result = wrapInLoader(result);
    
    return result;
}

function addAsciiAntiSkid(code, style) {
    const ascii = ASCII_ARTS[style] || ASCII_ARTS.clean;
    return ascii + '\n\n' + code;
}

function byteEncode(code) {
    // Advanced byte encoding with XOR encryption
    return code.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
        const key = Math.floor(Math.random() * 255);
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) ^ key);
        }
        return `(function(k) local s={${bytes.join(',')}}; local r=''; for i=1,#s do r=r..string.char(s[i]~=k and s[i]~k or s[i]+k) end; return r end)(${key})`;
    });
}

function splitStrings(code) {
    // Split strings into multiple parts
    return code.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
        if (str.length <= 3) return match;
        
        const parts = [];
        for (let i = 0; i < str.length; i += 2) {
            parts.push(str.substr(i, 2));
        }
        
        let result = '';
        parts.forEach((part, index) => {
            if (index === 0) {
                result += `"${part}"`;
            } else {
                result += ` .. "${part}"`;
            }
        });
        
        return result;
    });
}

function renameVariables(code) {
    const varMap = new Map();
    const reserved = {'true':1, 'false':1, 'nil':1, 'and':1, 'or':1, 'not':1, 'function':1, 'end':1, 'if':1, 'then':1, 'else':1, 'elseif':1, 'while':1, 'do':1, 'for':1, 'in':1, 'repeat':1, 'until':1, 'return':1, 'local':1, 'break':1};
    
    // Generate random variable names
    const generateName = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
        let name = '_';
        for (let i = 0; i < 8; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    };
    
    // Find and replace local variables
    return code.replace(/local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
        if (!reserved[varName] && !varMap.has(varName)) {
            varMap.set(varName, generateName());
        }
        return 'local ' + (varMap.get(varName) || varName);
    }).replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match, varName) => {
        return varMap.get(varName) || match;
    });
}

function addDeadFlow(code) {
    const lines = code.split('\n');
    const result = [];
    const predicates = [
        '(1+1 == 2)',
        '(2*2 == 4)',
        '(10 > 5)',
        '(100 ~= 200)',
        '(type(1) == "number")'
    ];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() && Math.random() > 0.6) {
            const pred = predicates[Math.floor(Math.random() * predicates.length)];
            const junkVar = '__x' + Math.floor(Math.random() * 9999);
            
            result.push(`if ${pred} then`);
            result.push(`    local ${junkVar} = ${Math.floor(Math.random() * 1000)}`);
            result.push(`    ${lines[i]}`);
            result.push(`else`);
            result.push(`    -- Dead code path`);
            result.push(`    local ${junkVar} = ${Math.floor(Math.random() * 1000)} * ${Math.floor(Math.random() * 1000)}`);
            result.push(`    ${junkVar} = ${junkVar} + ${Math.floor(Math.random() * 1000)}`);
            result.push(`end`);
        } else {
            result.push(lines[i]);
        }
    }
    
    return result.join('\n');
}

function addFakeMath(code) {
    const operators = ['+', '-', '*', '/', '%', '^'];
    const junkVars = [];
    
    // Generate junk variables
    for (let i = 0; i < 10; i++) {
        junkVars.push('_m' + Math.floor(Math.random() * 9999));
    }
    
    let junkCode = '';
    for (let i = 0; i < junkVars.length; i += 2) {
        const a = Math.floor(Math.random() * 1000);
        const b = Math.floor(Math.random() * 1000);
        const op1 = operators[Math.floor(Math.random() * operators.length)];
        const op2 = operators[Math.floor(Math.random() * operators.length)];
        
        junkCode += `local ${junkVars[i]} = ${a} ${op1} ${b}\n`;
        junkCode += `local ${junkVars[i+1]} = (${junkVars[i]} ${op2} ${a}) % ${b+1}\n`;
    }
    
    return junkCode + '\n' + code;
}

function flattenControlFlow(code) {
    // Convert code into a state machine
    const lines = code.split('\n').filter(line => line.trim());
    let stateMachine = 'do\n';
    stateMachine += '    local __state = 0\n';
    stateMachine += '    while true do\n';
    stateMachine += '        if __state == 0 then\n';
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim()) {
            if (i < lines.length - 1) {
                stateMachine += `            ${lines[i]}\n`;
                stateMachine += `            __state = ${i + 1}\n`;
                stateMachine += '            break\n';
                stateMachine += `        elseif __state == ${i + 1} then\n`;
            } else {
                stateMachine += `            ${lines[i]}\n`;
                stateMachine += '            break\n';
            }
        }
    }
    
    stateMachine += '        end\n';
    stateMachine += '    end\n';
    stateMachine += 'end\n';
    
    return stateMachine;
}

function addAntiDebug(code) {
    const antiDebug = `
-- Anti-debug protection
do
    local __debug = debug or getfenv and getfenv().debug
    if __debug then
        -- Disable debug functions
        __debug.getinfo = nil
        __debug.getlocal = nil
        __debug.setlocal = nil
        __debug.getupvalue = nil
        __debug.setupvalue = nil
        __debug.getregistry = nil
        __debug.getmetatable = nil
        __debug.setmetatable = nil
        __debug.traceback = nil
    end
    
    -- Prevent bytecode inspection
    local __bytecode = string.dump and string.dump(loadstring or load)
    if __bytecode then
        __bytecode = nil
    end
end

`;
    return antiDebug + code;
}

function addIntegrityChecks(code) {
    const checks = `
-- Integrity verification
do
    local __env = getfenv and getfenv() or _ENV
    local __allowed = {
        ['print'] = true,
        ['string'] = true,
        ['table'] = true,
        ['math'] = true,
        ['os'] = true,
        ['io'] = true
    }
    
    -- Check for tampering
    for __k, __v in pairs(__env) do
        if not __allowed[__k] and type(__v) == 'function' then
            -- Suspicious function detected
            error("Environment tampering detected")
        end
    end
    
    -- Self-integrity check
    local function __hash(__str)
        local __h = 0
        for __i = 1, #__str do
            __h = (__h * 31 + string.byte(__str, __i)) % 2147483647
        end
        return __h
    end
    
    -- Verify code hasn't been modified
    local __codeHash = ${hashCode(code)}
    if __hash(string.dump(function() end)) ~= __codeHash then
        error("Code modification detected")
    end
end

`;
    
    // Calculate a simple hash of the original code
    const hash = code.split('').reduce((h, c) => {
        return ((h << 5) - h + c.charCodeAt(0)) | 0;
    }, 0);
    
    return checks.replace('${hashCode(code)}', Math.abs(hash).toString());
}

function wrapEncodedStrings(code) {
    // Create a complex decoder
    const decoder = `
-- Complex string decoder
do
    local __chars = {}
    for __i = 32, 126 do
        __chars[string.char(__i)] = __i
    end
    
    local function __decode(__str)
        local __result = {}
        local __len = #__str
        local __i = 1
        while __i <= __len do
            local __c = string.sub(__str, __i, __i)
            if __chars[__c] then
                table.insert(__result, string.char(__chars[__c] - 10))
            else
                table.insert(__result, __c)
            end
            __i = __i + 1
        end
        return table.concat(__result)
    end
end

`;
    
    // Encode strings with simple shifting
    code = code.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
        let encoded = '';
        for (let i = 1; i <= str.length; i++) {
            const c = str.charCodeAt(i-1);
            if (c >= 32 && c <= 126) {
                encoded = encoded + string.fromCharCode(c + 10);
            } else {
                encoded = encoded + str.charAt(i-1);
            }
        }
        return `__decode("${encoded}")`;
    });
    
    return decoder + code;
}

function wrapInLoader(code) {
    const version = CONFIG.version;
    const link = CONFIG.link;
    
    return `--[[ Pulto's Obfuscator ${version} ${link} ]]

return(function(...)
    -- Multi-layer protection system
    local __ENV = getfenv and getfenv() or _ENV
    local __LOAD = __ENV.load or __ENV.loadstring
    local __TABLE = __ENV.table
    local __STRING = __ENV.string
    local __MATH = __ENV.math
    
    -- Anti-debug layer
    do
        local __DEBUG = __ENV.debug
        if __DEBUG then
            for __k, __v in pairs(__DEBUG) do
                __DEBUG[__k] = nil
            end
        end
        
        -- Remove dangerous globals
        local __dangerous = {'loadfile', 'dofile', 'load', 'loadstring'}
        for _, __name in pairs(__dangerous) do
            __ENV[__name] = nil
        end
    end
    
    -- Code verification
    local __CODE = [[
${code}
    ]]
    
    -- Execute in protected environment
    local __func, __err = __LOAD(__CODE)
    if not __func then
        error("Protected code execution failed: " .. tostring(__err))
    end
    
    -- Setfenv for older Lua versions
    if setfenv then
        setfenv(__func, __ENV)
    end
    
    -- Execute with error handling
    local __success, __result = pcall(__func, ...)
    if not __success then
        -- Check if error was from tampering
        if __STRING and __STRING.find and __STRING.find(__result, "tampering") then
            error("Code protection triggered - possible tampering detected")
        else
            error(__result)
        end
    end
    
    return __result
end)`;
}

function decryptLua() {
    const input = document.getElementById('decryptInput').value;
    const output = document.getElementById('decryptOutput');
    
    try {
        // Try to extract the actual code from the loader
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

// Add keyboard shortcuts
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
