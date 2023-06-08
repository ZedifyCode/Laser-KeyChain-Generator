///<reference path="node_modules/makerjs/index.d.ts" />

var makerjs = require('makerjs') as typeof MakerJs;

class App {

    public fontList: google.fonts.WebfontList;
    private fileUpload: HTMLInputElement
    private fileUploadRemove: HTMLInputElement
    private customFont: opentype.Font;
    private selectFamily: HTMLSelectElement;
    private selectVariant: HTMLSelectElement;
    private filledCheckbox: HTMLInputElement;
    private textInput: HTMLInputElement;
    private sizeInput: HTMLInputElement;
    private renderDiv: HTMLDivElement;
    private outputTextarea: HTMLTextAreaElement;
    private renderOutlineDiv: HTMLDivElement;
    private outlineTextarea: HTMLTextAreaElement;
    private dummy: HTMLInputElement;
    private fillInput: HTMLInputElement;
    private strokeInput: HTMLInputElement;
    private strokeWidthInput: HTMLInputElement;

    private renderCurrent = () => {
        var size = this.sizeInput.valueAsNumber;
        if (!size) size = parseFloat(this.sizeInput.value);
        if (!size) size = 100;
        this.render(
            this.selectFamily.selectedIndex,
            this.selectVariant.selectedIndex,
            this.textInput.value,
            size,
            this.filledCheckbox.checked,
            this.fillInput.value,
            this.strokeInput.value,
            this.strokeWidthInput.value,
        );
    };

    private loadVariants = () => {
        this.selectVariant.options.length = 0;
        var f = this.fontList.items[this.selectFamily.selectedIndex];
        var v = f.variants.forEach(v => this.addOption(this.selectVariant, v));
        this.renderCurrent();
    };
    private updateUrl = () => {
        var urlSearchParams = new URLSearchParams(window.location.search);

        urlSearchParams.set('font-select', this.selectFamily.value);
        urlSearchParams.set('font-variant', this.selectVariant.value);
        urlSearchParams.set('input-filled', String(this.filledCheckbox.checked));
        urlSearchParams.set('input-text', this.textInput.value);
        urlSearchParams.set('input-size', this.sizeInput.value);
        urlSearchParams.set('input-fill', this.fillInput.value);
        urlSearchParams.set('input-stroke', this.strokeInput.value);
        urlSearchParams.set('input-strokeWidth', this.strokeWidthInput.value);
        
        const url = window.location.protocol 
                    + "//" + window.location.host 
                    + window.location.pathname 
                    + "?" 
                    + urlSearchParams.toString();

        window.history.replaceState({path: url}, "", url)

    }
    private readUploadedFile = async (event: Event) => {
        const element = event.currentTarget as HTMLInputElement;

        if (element.files.length === 0) {
          this.customFont = undefined;
        } else {
          var files = element.files[0];

          var buffer = await files.arrayBuffer();

          var font = opentype.parse(buffer);

          this.customFont = font;
        }
        this.renderCurrent();
    }
    private removeUploadedFont = () => {
        this.fileUpload.value = null;
        this.customFont = undefined;
        this.renderCurrent();
    }

    constructor() {

    }

    init() {

        this.fileUpload = this.$('#font-upload') as HTMLInputElement;
        this.fileUploadRemove = this.$('#font-upload-remove') as HTMLInputElement;
        this.selectFamily = this.$('#font-select') as HTMLSelectElement;
        this.selectVariant = this.$('#font-variant') as HTMLSelectElement;
        this.filledCheckbox = this.$('#input-filled') as HTMLInputElement;
        this.textInput = this.$('#input-text') as HTMLInputElement;
        this.sizeInput = this.$('#input-size') as HTMLInputElement;
        this.renderDiv = this.$('#svg-render') as HTMLDivElement;
        this.outputTextarea = this.$('#output-svg') as HTMLTextAreaElement;
        this.renderOutlineDiv = this.$('#svg-render-outline') as HTMLDivElement;
        this.outlineTextarea = this.$('#outline-svg') as HTMLTextAreaElement;
        this.dummy = this.$('#dummy') as HTMLInputElement;
        this.fillInput = this.$('#input-fill') as HTMLInputElement;
        this.strokeInput = this.$('#input-stroke') as HTMLInputElement;
        this.strokeWidthInput = this.$('#input-stroke-width') as HTMLInputElement;
    }

    readQueryParams() {
        var urlSearchParams = new URLSearchParams(window.location.search);

        var selectFamily = urlSearchParams.get('font-select');
        var selectVariant = urlSearchParams.get('font-variant');
        var filledCheckbox = urlSearchParams.get('input-filled');
        var textInput = urlSearchParams.get('input-text');
        var sizeInput = urlSearchParams.get('input-size');
        var fillInput = urlSearchParams.get('input-fill');
        var strokeInput = urlSearchParams.get('input-stroke');
        var strokeWidthInput = urlSearchParams.get('input-stroke-width');

        if (selectFamily !== "" && selectFamily !== null)
            this.selectFamily.value = selectFamily;
        
        if (selectVariant !== "" && selectVariant !== null)
            this.selectVariant.value = selectVariant;

        if (filledCheckbox !== "" && filledCheckbox !== null)
            this.filledCheckbox.checked = filledCheckbox === "true" ? true : false;
     
        if (textInput !== "" && textInput !== null)
            this.textInput.value = textInput;
        
        if (sizeInput !== "" && sizeInput !== null)
            this.sizeInput.value = sizeInput;

        if (fillInput !== "" && fillInput !== null)
            this.fillInput.value = fillInput;

        if (strokeInput !== "" && strokeInput !== null)
            this.strokeInput.value = strokeInput;
        
        if (strokeWidthInput !== "" && strokeWidthInput !== null)
            this.strokeWidthInput.value = strokeWidthInput;

    }

    handleEvents() {
        this.fileUpload.onchange = this.readUploadedFile;
        this.fileUploadRemove.onclick = this.removeUploadedFont
        this.selectFamily.onchange = this.loadVariants;
        this.selectVariant.onchange =
            this.textInput.onchange =
            this.textInput.onkeyup =
            this.sizeInput.onkeyup =
            this.filledCheckbox.onchange =
            this.fillInput.onchange =
            this.fillInput.onkeyup =
            this.strokeInput.onchange =
            this.strokeInput.onkeyup =
            this.strokeWidthInput.onchange =
            this.strokeWidthInput.onkeyup =
            this.renderCurrent
            ;

        // Is triggered on the document whenever a new color is picked
        document.addEventListener("coloris:pick", debounce(this.renderCurrent))
    }

    $(selector: string) {
        return document.querySelector(selector);
    }

    addOption(select: HTMLSelectElement, optionText: string) {
        var option = document.createElement('option');
        option.text = optionText;
        option.value = optionText;
        select.options.add(option);
    }

    getGoogleFonts(apiKey: string) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + apiKey, true);
        xhr.onloadend = () => {
            this.fontList = JSON.parse(xhr.responseText);
            this.fontList.items.forEach(font => this.addOption(this.selectFamily, font.family));
            this.loadVariants();

            this.handleEvents();

            this.readQueryParams();
            this.renderCurrent();
        };
        xhr.send();
    }

    callMakerjs(font: opentype.Font, text: string, size: number, filled: boolean,
         fill: string, stroke: string, strokeWidth: string) {
        //generate the text using a font
        var textModel = new makerjs.models.Text(font, text, size, false);

        var svg = makerjs.exporter.toSVG(textModel, {
                fill: 'none',
                stroke: '#000', 
                strokeWidth: '0.25mm',
            });

        this.renderDiv.innerHTML = svg;
        this.outputTextarea.value = svg;

        var outerModel = makerjs.model.outline(textModel, 25);
        var holeModel = new makerjs.models.Holes(6, [[-40, 50]]);
        var holeOuterModel = new makerjs.models.Holes(25, [[-40, 50]]);

        // create a keychain model
        var keychainModel = {
            models: {
                text: textModel,
                outer: makerjs.model.combineUnion(outerModel, holeOuterModel),
                hole: holeModel,
                outerh: holeOuterModel
            }
        }

        var keychain = makerjs.exporter.toSVG(keychainModel);
        this.renderOutlineDiv.innerHTML = keychain;
        this.outlineTextarea.value = keychain;
    }

    render(
        fontIndex: number,
        variantIndex: number,
        text: string,
        size: number,
        filled: boolean,
        fill: string,
        stroke: string,
        strokeWidth: string,
    ) {
        
        var f = this.fontList.items[fontIndex];
        var v = f.variants[variantIndex];
        var url = f.files[v].substring(5);  //remove http:

        if (this.customFont !== undefined) {
            this.callMakerjs(this.customFont, text, size, filled, fill, stroke, strokeWidth);
        } else {
            opentype.load(url, (err, font) => {
                this.callMakerjs(font, text, size, filled, fill, stroke, strokeWidth);
            });
        }
    }
}

var app = new App();

window.onload = () => {
    app.init();
    app.getGoogleFonts('AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc');
};

/**
 * Creates and returns a new debounced version of the passed function that will
 * postpone its execution until after wait milliseconds have elapsed since the last time it was invoked.
 * 
 * @param callback 
 * @param wait 
 * @returns 
 */
function debounce(callback, wait = 200) {
    let timeoutId = null;

    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  }
