// obfuscator.js
class PultoObfuscator {
    constructor(config) {
        this.config = config;
        this.strings = []; // will hold all extracted string literals
        this.stringMap = new Map(); // maps original string to its index in the table
        this.varCounter = 0;
        this.reserved = new Set(['true','false','nil','and','or','not','function','end','if','then','else','elseif','while','do','for','in','repeat','until','return','local','break']);
    }

    // Main entry point
    obfuscate(code) {
        let result = code;

        // Extract and encode strings
        if (this.config.features.byteEncode) {
            result = this.extractStrings(result);
        }

        // Apply other obfuscations in order
        if (this.config.features.variableRenaming) {
            result = this.renameVariables(result);
        }
        if (this.config.features.stringSplitting) {
            result = this.splitStrings(result);
        }
        if (this.config.features.deadFlow) {
            result = this.addDeadFlow(result);
        }
        if (this.config.features.fakeMath) {
            result = this.addFakeMath(result);
        }
        if (this.config.features.controlFlowFlattening) {
            result = this.flattenControlFlow(result);
        }
        if (this.config.features.antiDebug) {
            result = this.addAntiDebug(result);
        }
        if (this.config.features.integrityChecks) {
            result = this.addIntegrityChecks(result);
        }

        // Wrap in loader with string table
        result = this.wrapInLoader(result);

        return result;
    }

    // Extract all string literals and replace with references to encoded table
    extractStrings(code) {
        const stringRegex = /(['"])(.*?)\1/g;
        let match;
        let newCode = code;
        let offset = 0;

        while ((match = stringRegex.exec(code)) !== null) {
            const fullMatch = match[0];
            const quote = match[1];
            const str = match[2];
            const start = match.index + offset;
            const end = start + fullMatch.length;

            let index;
            if (this.stringMap.has(str)) {
                index = this.stringMap.get(str);
            } else {
                index = this.strings.length;
                this.strings.push(this.encodeString(str));
                this.stringMap.set(str, index);
            }

            // Replace with table access: d[index] (after decoder is defined)
            const replacement = `d[${index+1}]`; // Lua tables are 1-indexed
            newCode = newCode.substring(0, start) + replacement + newCode.substring(end);
            offset += replacement.length - fullMatch.length;
        }

        return newCode;
    }

    // Encode a string as a sequence of escaped decimal bytes: \123\456 etc.
    encodeString(str) {
        let encoded = '';
        for (let i = 0; i < str.length; i++) {
            const byte = str.charCodeAt(i);
            encoded += '\\' + byte.toString().padStart(3, '0');
        }
        return encoded;
    }

    // Generate the string table and decoder
    generateStringTableAndDecoder() {
        // Build table d with encoded strings
        let tableEntries = [];
        for (let i = 0; i < this.strings.length; i++) {
            tableEntries.push(`"${this.strings[i]}"`);
        }
        const tableDecl = `local d={${tableEntries.join(',')}}`;

        // Generate a complex decoder similar to the example
        // We'll create a function that processes each string: removes backslashes and converts to chars
        // But to mimic complexity, we'll add arithmetic obfuscation around it.
        const decoder = `
do
    local function h(s)
        local r = {}
        local i = 1
        while i <= #s do
            local b = 0
            local c = string.byte(s, i)
            if c == 92 then -- backslash
                i = i + 1
                local n = 0
                while i <= #s do
                    local d = string.byte(s, i)
                    if d >= 48 and d <= 57 then
                        n = n * 10 + (d - 48)
                        i = i + 1
                    else
                        break
                    end
                end
                table.insert(r, string.char(n))
            else
                table.insert(r, string.char(c))
                i = i + 1
            end
        end
        return table.concat(r)
    end
    for i=1,#d do
        d[i] = h(d[i])
    end
end
`;
        return tableDecl + '\n' + decoder;
    }

    renameVariables(code) {
        const varMap = new Map();
        // Simple regex to find local variables (this is imperfect but works for basic cases)
        // We'll match 'local name' and then later replace all occurrences.
        // This is a simplified version; a full parser would be better but we'll keep it simple.
        const localRegex = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        let newCode = code;
        while ((match = localRegex.exec(code)) !== null) {
            const varName = match[1];
            if (!this.reserved.has(varName) && !varMap.has(varName)) {
                const newName = this.generateVarName();
                varMap.set(varName, newName);
            }
        }
        // Replace all occurrences of these variable names (word boundaries)
        varMap.forEach((newName, oldName) => {
            const wordRegex = new RegExp('\\b' + oldName + '\\b', 'g');
            newCode = newCode.replace(wordRegex, newName);
        });
        return newCode;
    }

    generateVarName() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
        let name = '_';
        for (let i = 0; i < 8; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    }

    splitStrings(code) {
        // Replace string literals with concatenated parts
        return code.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
            if (str.length <= 3) return match;
            const parts = [];
            for (let i = 0; i < str.length; i += 2) {
                parts.push(str.substr(i, 2));
            }
            return parts.map(p => quote + p + quote).join(' .. ');
        });
    }

    addDeadFlow(code) {
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

    addFakeMath(code) {
        const operators = ['+', '-', '*', '/', '%', '^'];
        const junkVars = [];
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

    flattenControlFlow(code) {
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

    addAntiDebug(code) {
        const anti = `
-- Anti-debug
do
    local d = debug or getfenv and getfenv().debug
    if d then
        for k,v in pairs(d) do d[k]=nil end
    end
    local dangerous = {'loadfile','dofile','load','loadstring'}
    for _,n in pairs(dangerous) do
        _ENV[n] = nil
    end
end
`;
        return anti + code;
    }

    addIntegrityChecks(code) {
        // Simple hash of the code (placeholder)
        const hash = this.hashCode(code);
        const integrity = `
-- Integrity check
do
    local function hash(s)
        local h = 0
        for i=1,#s do
            h = (h * 31 + string.byte(s,i)) % 2147483647
        end
        return h
    end
    if hash([[${code}]]) ~= ${hash} then
        error("Code tampered")
    end
end
`;
        return integrity + code;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
        return Math.abs(hash);
    }

    wrapInLoader(code) {
        const version = this.config.version;
        const link = this.config.link;
        const stringTableAndDecoder = this.generateStringTableAndDecoder();

        // Build the loader similar to the example but with our own structure
        const loader = `--[[ Pulto's Obfuscator ${version} ${link} ]]

return(function(...)
    ${stringTableAndDecoder}

    -- Complex environment setup
    local env = getfenv and getfenv() or _ENV
    local load = env.load or env.loadstring

    -- Protected code
    local core = [[
${code}
    ]]

    local f, err = load(core)
    if not f then error("Loader error: "..tostring(err)) end
    if setfenv then setfenv(f, env) end
    return f(...)
end)`;
        return loader;
    }
}
