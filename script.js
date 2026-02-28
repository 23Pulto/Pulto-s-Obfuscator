function switchTab(id) {
    document.querySelectorAll(".tabContent").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function toByte(str) {
    return str.split('').map(c => "\\" + c.charCodeAt(0)).join('');
}

function fakeMath() {
    return `
local _mathJunk = (math.random(1000,9999) * 3) - 42
if _mathJunk == 123456 then
    print("Impossible branch")
end
`;
}

function deadControlFlow() {
    return `
if false then
    while true do end
end
`;
}

function wrapString(encoded) {
    return `local function _d() return("${encoded}") end local X=_d()`;
}

function startObfuscation() {
    let status = document.getElementById("status");
    status.innerText = "Obfuscating your code";
    let dots = 0;

    let interval = setInterval(() => {
        dots = (dots + 1) % 4;
        status.innerText = "Obfuscating your code please wait" + ".".repeat(dots);
    }, 400);

    setTimeout(() => {
        clearInterval(interval);

        let code = document.getElementById("inputCode").value;
        let output = "";

        if (document.getElementById("byteEncode").checked)
            code = toByte(code);

        output += `--[[ ${CONFIG.version} ${CONFIG.link} ]]
return(function(...)local Q={`;

        if (document.getElementById("fakeMath").checked)
            output += fakeMath();

        if (document.getElementById("deadFlow").checked)
            output += deadControlFlow();

        if (document.getElementById("wrapStrings").checked)
            output += wrapString(code);

        output += `;return(loadstring("${code}"))(...)end)()`;

        document.getElementById("outputCode").value = output;
        status.innerText = "Obfuscation complete.";
    }, 2000);
}

function decryptLua() {
    let input = document.getElementById("decryptInput").value;

    if (input.includes("Pulto Obfuscator"))
        return document.getElementById("decryptOutput").value = "Protected by Pulto Obfuscator.";

    let matches = input.match(/\\\d+/g);
    if (!matches)
        return document.getElementById("decryptOutput").value = "No byte encoding found.";

    let decoded = matches.map(m => String.fromCharCode(parseInt(m.replace("\\","")))).join('');
    document.getElementById("decryptOutput").value = decoded;
}
