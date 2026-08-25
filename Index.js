const photoInput =
    document.getElementById("photoInput");

const uploadSection =
    document.getElementById("uploadSection");

const editorSection =
    document.getElementById("editorSection");

const originalImage =
    document.getElementById("originalImage");

const canvas =
    document.getElementById("photoCanvas");

const ctx =
    canvas.getContext("2d");


// ------------------------------------------------
// EDIT SETTINGS
// ------------------------------------------------

let imageData = null;

let settings = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    sharpness: 0
};


// ------------------------------------------------
// PHOTO UPLOAD
// ------------------------------------------------

photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
    }

    const url =
        URL.createObjectURL(file);

    originalImage.src = url;

    originalImage.onload = function () {

        canvas.width =
            originalImage.naturalWidth;

        canvas.height =
            originalImage.naturalHeight;

        analyzeImage();

        resetSettings();

        renderImage();

        uploadSection.classList.add("hidden");

        editorSection.classList.remove("hidden");

        URL.revokeObjectURL(url);
    };
});


// ------------------------------------------------
// ANALYZE PHOTO
// ------------------------------------------------

function analyzeImage() {

    const analysisCanvas =
        document.createElement("canvas");

    const analysisContext =
        analysisCanvas.getContext("2d");

    const maxSize = 500;

    let width =
        originalImage.naturalWidth;

    let height =
        originalImage.naturalHeight;

    if (width > maxSize) {

        const ratio =
            maxSize / width;

        width *= ratio;
        height *= ratio;
    }

    analysisCanvas.width = width;
    analysisCanvas.height = height;

    analysisContext.drawImage(
        originalImage,
        0,
        0,
        width,
        height
    );

    const data =
        analysisContext.getImageData(
            0,
            0,
            width,
            height
        ).data;

    let brightness = 0;

    let red = 0;
    let green = 0;
    let blue = 0;

    let pixels = 0;

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        red += data[i];

        green += data[i + 1];

        blue += data[i + 2];

        const luminance =
            (
                0.299 * data[i] +
                0.587 * data[i + 1] +
                0.114 * data[i + 2]
            );

        brightness += luminance;

        pixels++;
    }

    brightness =
        brightness / pixels;

    red =
        red / pixels;

    green =
        green / pixels;

    blue =
        blue / pixels;


    // Color temperature estimate

    const colorDifference =
        red - blue;


    // Determine condition

    let condition =
        "Balanced";

    if (brightness < 70) {

        condition =
            "Very Dark";

    } else if (brightness < 105) {

        condition =
            "Dark";

    } else if (brightness > 205) {

        condition =
            "Very Bright";

    } else if (brightness > 175) {

        condition =
            "Bright";
    }


    if (brightness >= 105 &&
        brightness <= 175) {

        condition =
            "Well Lit";
    }


    // Update UI

    document.getElementById(
        "brightnessValue"
    ).textContent =
        Math.round(brightness);


    document.getElementById(
        "contrastValue"
    ).textContent =
        calculateContrast(data);


    document.getElementById(
        "colorValue"
    ).textContent =
        colorDifference > 15
            ? "Warm"
            : colorDifference < -15
                ? "Cool"
                : "Natural";


    document.getElementById(
        "lightingValue"
    ).textContent =
        condition;


    document.getElementById(
        "conditionBadge"
    ).textContent =
        condition;

}


// ------------------------------------------------
// CONTRAST ANALYSIS
// ------------------------------------------------

function calculateContrast(data) {

    let values = [];

    for (
        let i = 0;
        i < data.length;
        i += 16
    ) {

        const brightness =
            (
                0.299 * data[i] +
                0.587 * data[i + 1] +
                0.114 * data[i + 2]
            );

        values.push(brightness);
    }

    const average =
        values.reduce(
            (a,b) => a + b,
            0
        ) / values.length;

    let variance = 0;

    values.forEach(value => {

        variance +=
            Math.pow(
                value - average,
                2
            );

    });

    const standardDeviation =
        Math.sqrt(
            variance / values.length
        );

    return Math.round(
        standardDeviation
    );
}


// ------------------------------------------------
// AUTO ENHANCE
// ------------------------------------------------

document
.getElementById("autoBtn")
.addEventListener("click", function () {

    const brightness =
        Number(
            document.getElementById(
                "brightnessValue"
            ).textContent
        );


    /*
        Automatically decide
        how much light to add.
    */

    if (brightness < 60) {

        settings.brightness = 35;
        settings.contrast = 12;
        settings.saturation = 8;

    } else if (brightness < 90) {

        settings.brightness = 25;
        settings.contrast = 10;
        settings.saturation = 7;

    } else if (brightness < 120) {

        settings.brightness = 15;
        settings.contrast = 8;
        settings.saturation = 5;

    } else if (brightness > 210) {

        settings.brightness = -18;
        settings.contrast = 5;
        settings.saturation = 2;

    } else if (brightness > 180) {

        settings.brightness = -8;
        settings.contrast = 6;
        settings.saturation = 4;

    } else {

        settings.brightness = 8;
        settings.contrast = 8;
        settings.saturation = 5;
    }


    settings.warmth = 2;

    settings.sharpness = 8;

    updateSliders();

    renderImage();
});


// ------------------------------------------------
// PRESETS
// ------------------------------------------------

document
.querySelectorAll(".preset")
.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            const preset =
                this.dataset.preset;

            applyPreset(preset);
        }
    );
});


function applyPreset(preset) {

    if (preset === "natural") {

        settings = {
            brightness: 7,
            contrast: 8,
            saturation: 5,
            warmth: 2,
            sharpness: 8
        };
    }


    if (preset === "studio") {

        settings = {
            brightness: 12,
            contrast: 15,
            saturation: 4,
            warmth: 4,
            sharpness: 10
        };
    }


    if (preset === "portrait") {

        settings = {
            brightness: 10,
            contrast: 6,
            saturation: 2,
            warmth: 7,
            sharpness: 4
        };
    }


    if (preset === "warm") {

        settings = {
            brightness: 5,
            contrast: 8,
            saturation: 10,
            warmth: 25,
            sharpness: 5
        };
    }


    if (preset === "cool") {

        settings = {
            brightness: 5,
            contrast: 8,
            saturation: 5,
            warmth: -25,
            sharpness: 6
        };
    }


    if (preset === "cinematic") {

        settings = {
            brightness: 2,
            contrast: 20,
            saturation: -5,
            warmth: -3,
            sharpness: 12
        };
    }


    updateSliders();

    renderImage();
}


// ------------------------------------------------
// SLIDERS
// ------------------------------------------------

const sliderNames = [
    "brightness",
    "contrast",
    "saturation",
    "warmth",
    "sharpness"
];


sliderNames.forEach(name => {

    const slider =
        document.getElementById(
            name + "Slider"
        );

    const value =
        document.getElementById(
            name + "ControlValue"
        );

    slider.addEventListener(
        "input",
        function () {

            settings[name] =
                Number(this.value);

            value.textContent =
                this.value;

            renderImage();
        }
    );

});


function updateSliders() {

    sliderNames.forEach(name => {

        const slider =
            document.getElementById(
                name + "Slider"
            );

        const value =
            document.getElementById(
                name + "ControlValue"
            );

        slider.value =
            settings[name];

        value.textContent =
            settings[name];
    });
}


// ------------------------------------------------
// RENDER PHOTO
// ------------------------------------------------

function renderImage() {

    if (!originalImage.src) {
        return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        CSS-style image processing
        through Canvas filters.
    */

    const brightness =
        100 + settings.brightness;

    const contrast =
        100 + settings.contrast;

    const saturation =
        100 + settings.saturation;


    ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
    `;


    ctx.drawImage(
        originalImage,
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Warmth effect
    */

    if (settings.warmth !== 0) {

        applyWarmth();
    }


    /*
        Studio Light
    */

    renderStudioLight();


    /*
        Simple sharpness effect
    */

    if (settings.sharpness > 0) {

        applySharpness();
    }


    ctx.filter = "none";

    originalImage.style.display =
        "none";

    canvas.style.display =
        "block";
}


// ------------------------------------------------
// WARMTH
// ------------------------------------------------

function applyWarmth() {

    const strength =
        Math.abs(settings.warmth) / 100;

    const overlay =
        ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
        );


    if (settings.warmth > 0) {

        overlay.addColorStop(
            0,
            `rgba(255,160,70,${strength * .20})`
        );

        overlay.addColorStop(
            1,
            `rgba(255,220,150,${strength * .10})`
        );

    } else {

        overlay.addColorStop(
            0,
            `rgba(70,150,255,${strength * .15})`
        );

        overlay.addColorStop(
            1,
            `rgba(120,190,255,${strength * .10})`
        );
    }


    ctx.fillStyle =
        overlay;

    ctx.globalCompositeOperation =
        "soft-light";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.globalCompositeOperation =
        "source-over";
}


// ------------------------------------------------
// STUDIO LIGHT
// ------------------------------------------------

function renderStudioLight() {

    /*
        Creates a soft lighting effect.
    */

    const gradient =
        ctx.createRadialGradient(
            canvas.width * .5,
            canvas.height * .35,
            0,
            canvas.width * .5,
            canvas.height * .45,
            Math.max(
                canvas.width,
                canvas.height
            ) * .7
        );


    gradient.addColorStop(
        0,
        "rgba(255,255,255,0.10)"
    );

    gradient.addColorStop(
        0.5,
        "rgba(255,255,255,0.03)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0.08)"
    );


    ctx.fillStyle =
        gradient;

    ctx.globalCompositeOperation =
        "soft-light";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.globalCompositeOperation =
        "source-over";
}


// ------------------------------------------------
// SHARPNESS
// ------------------------------------------------

function applySharpness() {

    const amount =
        settings.sharpness / 100;


    if (amount <= 0) {
        return;
    }


    /*
        A subtle high-contrast overlay.
        This is intentionally conservative
        to avoid destroying image quality.
    */

    ctx.globalAlpha =
        amount * .15;

    ctx.globalCompositeOperation =
        "overlay";

    ctx.drawImage(
        canvas,
        0,
        0
    );

    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation =
        "source-over";
}


// ------------------------------------------------
// BEFORE / AFTER
// ------------------------------------------------

let showingOriginal = false;

document
.getElementById("beforeAfterBtn")
.addEventListener("click", function () {

    showingOriginal =
        !showingOriginal;

    if (showingOriginal) {

        canvas.style.display =
            "none";

        originalImage.style.display =
            "block";

        this.textContent =
            "Show Edited";

    } else {

        originalImage.style.display =
            "none";

        canvas.style.display =
            "block";

        this.textContent =
            "Show Original";
    }
});


// ------------------------------------------------
// RESET
// ------------------------------------------------

document
.getElementById("resetBtn")
.addEventListener("click", function () {

    if (!originalImage.src) {
        return;
    }

    resetSettings();

    renderImage();
});


function resetSettings() {

    settings = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        sharpness: 0
    };

    updateSliders();

    showingOriginal = false;

    document
        .getElementById("beforeAfterBtn")
        .textContent =
        "Show Original";
}


// ------------------------------------------------
// DOWNLOAD
// ------------------------------------------------

document
.getElementById("downloadBtn")
.addEventListener("click", function () {

    if (!originalImage.src) {
        return;
    }


    /*
        Make sure edited image
        is currently rendered.
    */

    renderImage();


    canvas.toBlob(
        function (blob) {

            if (!blob) {

                alert(
                    "Could not create image."
                );

                return;
            }


            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href =
                url;

            link.download =
                "glowedit-photo.jpg";

            document.body.appendChild(link);

            link.click();

            link.remove();

            setTimeout(() => {

                URL.revokeObjectURL(url);

            }, 1000);

        },
        "image/jpeg",
        0.92
    );
});
