// Copyright (c) 2012-2017, Matt Godbolt & Rubén Rincón
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

var Compile = require('../base-compiler');
var _ = require('underscore-node');

function compilenewgol(info, env) {
    var compiler = new Compile(info, env);
    compiler.originalGetDefaultExecOptions = compiler.getDefaultExecOptions;

    function convertNewGoL(code) {
        var re = /^\s+(0[xX]?[0-9A-Za-z]+)?\s?[0-9]+\s*\(([^:]+):([0-9]+)\)\s*([A-Z]+)(.*)/;
        var prevLine = null;
        var file = null;
        var fileCount = 1;
        return code.map(function (obj) {
            var line = obj.text;
            var match = line.match(re);
            if (match) {
                var res = "";
                if (file !== match[2]) {
                    res += "\t.file " + fileCount + ' "' + match[2] + '"\n';
                    file = match[2];
                    fileCount++;
                }
                if (prevLine !== match[3]) {
                    res += "\t.loc " + fileCount + " " + match[3] + " 0\n";
                    prevLine = match[3];
                }
                var ret = res + "\t" + match[4].toLowerCase() + match[5];
                return ret;
            } else
                return null;
        }).filter(_.identity).join("\n");
    }

    compiler.postProcess = function (result, outputFilename, filters) {
        result.asm = convertNewGoL(result.stdout);
        result.stdout = [];
        return Promise.resolve(result);
    };

    compiler.optionsForFilter = function (filters, outputFilename, userOptions) {
        // If we're dealing with an older version...
        if (this.compiler.id === '6g141') {
            return ['tool', '6g', '-g', '-o', outputFilename, '-S'];
        }
        return ['tool', 'compile', '-o', outputFilename, '-S'];
    };

    compiler.getDefaultExecOptions = function () {
        var execOptions = this.originalGetDefaultExecOptions();
        var goroot = this.env.compilerProps("compiler." + this.compiler.id + ".goroot");
        if (goroot) {
            execOptions.env.GOROOT = goroot;
        }
        return execOptions;
    };

    return compiler.initialise();
}

module.exports = compilenewgol;
