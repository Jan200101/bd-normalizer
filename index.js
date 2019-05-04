const { Plugin } = require('powercord/entities');
const { camelCaseify } = require('powercord/util');

module.exports = class BDInjector extends Plugin {

    async startPlugin () {

        this.Normalizer = powercord.pluginManager.get("pc-classNameNormalizer");

        this.Normalizer.prefixes = ["pc", "da"];

        var filteredPrefixes = []
        this.Normalizer.prefixes.forEach(function(prefix) {
            filteredPrefixes.push(`${prefix}-`) 
        })

        this.Normalizer.randClassReg = new RegExp(`^(?!${filteredPrefixes.join("|")})((?:[a-z]|[0-9]|-)+)-(?:[a-z]|[0-9]|-|_){6}$`, "i");
        this.Normalizer.normClassReg = new RegExp(`^(([a-zA-Z0-9]+)-[^\s]{6})(?: (?:${filteredPrefixes.join("|")})([a-zA-Z0-9]+))+$`, "i");

        this.Normalizer.patchModule = this.patchModule;
        this.Normalizer.normalizeElement = this.normalizeElement;

        this.log("Injected")
    }

    patchModule (classNames) {
        for (const baseClassName in classNames) {
            // noinspection JSUnfilteredForInLoop
            const value = classNames[baseClassName];
            if (this._shouldIgnore(value)) {
                continue;
            }

            const classList = value.split(' ');
            for (const normalClass of classList) {
                const match = normalClass.match(this.randClassReg)[1];
                if (!match) {
                    continue;
                } // Shouldn't ever happen since they passed the moduleFilter, but you never know

                const camelCase = camelCaseify(match);

                // noinspection JSUnfilteredForInLoop
                //classNames[baseClassName] += ` pc-${camelCase}`;
                this.prefixes.forEach(function(prefix) {
                    classNames[baseClassName] += ` ${prefix}-${camelCase}`;
                })
            }
        }
    }

    normalizeElement (element) {
        if (!(element instanceof Element)) {
            return;
        }

        for (const targetClass of element.classList) {
            if (!this.randClassReg.test(targetClass)) {
            continue;
        }

        const match = targetClass.match(this.randClassReg)[1];
            const newClass = camelCaseify(match);
            this.prefixes.forEach(function(prefix) {
                element.classList.add(`${prefix}-${newClass}`);
            })
        }

        for (const child of element.children) {
            this.normalizeElement(child);
        }
    }
}
