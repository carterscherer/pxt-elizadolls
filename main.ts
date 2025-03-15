namespace ElizaDolls {

    // In case it gets lost from above (// then %) 
    //  % color="#FE99F8"

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - P U L S E  1


    let pulseMinLocal = 1024;
    let pulseMaxLocal = 0;
    let pulseLocal = 0;
    let pulseMotion = 0.001;

    //% block="read beat"
    //% group="Pulse"
    export function pulseSensorBeat( ) : boolean {

        pulseLocal = pins.analogReadPin( AnalogPin.P1 );

        pulseMinLocal += ( 1024 - pulseMinLocal ) * pulseMotion;
        if (pulseLocal < pulseMinLocal )
            pulseMinLocal = pulseLocal;

        pulseMaxLocal -= pulseMaxLocal * pulseMotion;
        if (pulseLocal > pulseMaxLocal)
            pulseMaxLocal = pulseLocal;

        let range = pulseMaxLocal - pulseMinLocal;

        let output = false;

        if ( range > 0 ) {
            if ( ( pulseLocal - pulseMinLocal ) > 3 * range / 4 )
                output = true;
        }

        return output;
    }

    let pulseSensorBpmBeat = false;
    let pulseSensorBpmRunningTime = 0;
    let pulseSensorBpmStore = 0;

    //% block="read pulse BPM"
    //% group="Pulse"
    export function pulseSensorBpm(): number {
        let beat = pulseSensorBeat();
        if ( beat && ( beat != pulseSensorBpmBeat ) ) {
            let runningTime = input.runningTime();
            pulseSensorBpmStore = 60000 / ( runningTime - pulseSensorBpmRunningTime );
            pulseSensorBpmRunningTime = runningTime;
        }
        pulseSensorBpmBeat = beat;
        return pulseSensorBpmStore;
    }

    
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - P U L S E  2


    //% block="read pulse wave"
    //% group="Pulse"
    export function pulseSensorWave(): number { 
        pulseLocal = pins.analogReadPin(AnalogPin.P1);

        pulseMinLocal += (1024 - pulseMinLocal) * pulseMotion;
        if (pulseLocal < pulseMinLocal)
            pulseMinLocal = pulseLocal;

        pulseMaxLocal -= pulseMaxLocal * pulseMotion;
        if (pulseLocal > pulseMaxLocal)
            pulseMaxLocal = pulseLocal;

        let range2 = pulseMaxLocal - pulseMinLocal;

        let output2 = 0;

        if (range2 > 0) {
            output2 = 1024 * (pulseLocal - pulseMinLocal) / range2;
        }

        return output2;    
    }

/*
    //% block="read pulse max"
    //% group="Pulse"
    export function pulseSensorRangeMax(): number { return pulseMaxLocal; }

    //% block="read pulse min"
    //% group="Pulse"
    export function pulseSensorRangeMin(): number { return pulseMinLocal; }
*/

    // For all LED functions
    // Packing into number:  ( r << 16 ) | (g << 8 ) | b
    // Sending to ws2812   ---b---g---r--->
    // Added some text to pxt.json to disable BT 
    // this helps with console output!

    //% block="set Left Earring, Right Earring, Necklace $leftEar | $rightEar | $necklace"
    //% group="Accessories"
    //% leftEar.shadow="colorNumberPicker"
    //% rightEar.shadow="colorNumberPicker"
    //% necklace.shadow="colorNumberPicker"
    export function ledAccessories(leftEar: number, rightEar: number, necklace: number ) {
        let e = pins.createBuffer(13 * 3)
        let offset = 0;

        // Left Ear

        let rColor = (leftEar >> 16) & 0xFF;
        let gColor = (leftEar >> 8) & 0xFF;
        let bColor = (leftEar >> 0) & 0xFF;

        e[offset + 0] = gColor;
        e[offset + 1] = rColor;
        e[offset + 2] = bColor;

        // Right Ear

        offset += 3;

        rColor = (rightEar >> 16) & 0xFF;
        gColor = (rightEar >> 8) & 0xFF;
        bColor = (rightEar >> 0) & 0xFF;

        e[offset + 0] = gColor;
        e[offset + 1] = rColor;
        e[offset + 2] = bColor;

        // Necklace

        for ( let i = 0; i < 11; i++ ) { 
            offset += 3;

            rColor = (necklace >> 16) & 0xFF;
            gColor = (necklace >> 8) & 0xFF;
            bColor = (necklace >> 0) & 0xFF;

            e[offset + 0] = gColor;
            e[offset + 1] = rColor;
            e[offset + 2] = bColor;
        }
        
        // Zip all the colors out

        ws2812b.sendBuffer(e, DigitalPin.P16);
    }


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - E A R I N G S


    //% block="set Accessory $accessory"
    //% group="Accessories"
    //% accessory.shadow="colorNumberPicker"
    export function ledAccessory(accessory: number) {
        let f = pins.createBuffer(12 * 3)
        let offset2 = 0;

        // Accessory
        let rColor2;
        let gColor2;
        let bColor2;

        for (let j = 0; j < 12; j++) {
            rColor2 = (accessory >> 16) & 0xFF;
            gColor2 = (accessory >> 8) & 0xFF;
            bColor2 = (accessory >> 0) & 0xFF;

            f[offset2 + 0] = gColor2;
            f[offset2 + 1] = rColor2;
            f[offset2 + 2] = bColor2;

            offset2 += 3;
        }

        // Zip all the colors out

        ws2812b.sendBuffer(f, DigitalPin.P16);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - S E T  R I N G


    //% block="set ring led $cv"
    //% group="Ring"
    //% cv.shadow="colorNumberPicker"
    export function ringDirect(cv: number) {
        let g = pins.createBuffer(25 * 3)

        let rColor22 = (cv >> 16) & 0xFF;
        let gColor22 = (cv >> 8) & 0xFF;
        let bColor22 = (cv >> 0) & 0xFF;

        for (let k = 0; k < 25; k++) {
            g[k * 3 + 0] = gColor22;
            g[k * 3 + 1] = rColor22;
            g[k * 3 + 2] = bColor22;
        }
        // ws2812b.setBufferMode(DigitalPin.P8, ws2812b.BUFFER_MODE_RGB );
        ws2812b.sendBuffer(g, DigitalPin.P8);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - R A I N B O W


    //% block="Animated Rainbow Ring $cv"
    //% group="Ring"
    //% cv.shadow="colorNumberPicker"
    export function ringDirectRainbow() {
        let h = pins.createBuffer(25 * 3); // 25 LEDs, each with 3 bytes (RGB)

        for (let l = 0; l < 255; l++) {
            for (let m = 0; m < 25; m++) {
                // Create a wave effect by varying the colors across the LEDs
                let rColor3 = (l + m * 10) % 50; // Red shifts slightly per LED
                let gColor3 = (l + m * 20) % 50; // Green shifts faster
                let bColor3 = (l + m * 30) % 50; // Blue shifts even faster

                // Assign the colors to the buffer
                h[m * 3 + 0] = gColor3; // G
                h[m * 3 + 1] = rColor3; // R
                h[m * 3 + 2] = bColor3; // B
            }

            // Send the buffer to the LEDs
            ws2812b.sendBuffer(h, DigitalPin.P8);

            // Simple delay to slow down the animation
            basic.pause(100); // Adjust the pause duration to change speed
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - R A I N B O W - S I M P L E

    //% block="A RAINBOW Ring"
    //% group="Ring"
    //% cv.shadow="colorNumberPicker"
    export function A_RAINBOW_RING() {
        let g = pins.createBuffer(25 * 3);

        for (let k = 0; k < 25; k++) {
            let hue = (k * 360) / 25; // Spread hues evenly around the ring
            let [r, gColor, b] = hsvToRgb(hue, 1, 1); // Convert HSV to RGB

            g[k * 3 + 0] = gColor; // Green component
            g[k * 3 + 1] = r;      // Red component
            g[k * 3 + 2] = b;      // Blue component
        }

        ws2812b.sendBuffer(g, DigitalPin.P8);
    }


    // Function to convert HSV to RGB
    function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
        let c = v * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = v - c;

        let r = 0, g = 0, b = 0;
        if (h < 60) [r, g, b] = [c, x, 0];
        else if (h < 120) [r, g, b] = [x, c, 0];
        else if (h < 180) [r, g, b] = [0, c, x];
        else if (h < 240) [r, g, b] = [0, x, c];
        else if (h < 300) [r, g, b] = [x, 0, c];
        else[r, g, b] = [c, 0, x];

        return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    }



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - D I S T A N C E


    //% block
    //% group="Distance Read Bear"
    export function distance(): number {
        let trig = DigitalPin.P1;
        let echo = DigitalPin.P2;
        let maxCMDistance = 100 * 58;

        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCMDistance);

        return Math.idiv(d, 58);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - S O I L


    //% block
    //% group="Plant Happiness - Carrot"
    export function soilMoistureRead(): number {
        const SOIL_SENSOR_ADDRESS = 0x36; // Default I2C address for the STEMMA Soil Sensor
        const TOUCH_BASE = 0x0F; // Base register for moisture
        const TOUCH_OFFSET = 0x10; // Offset for moisture reading

        let buffer = pins.createBuffer(2);

        // Write command to the sensor
        buffer[0] = TOUCH_BASE;
        buffer[1] = TOUCH_OFFSET;
        pins.i2cWriteBuffer(SOIL_SENSOR_ADDRESS, buffer, false);

        // Small delay before reading
        pause(5);

        // Read moisture level (16-bit value)
        buffer = pins.i2cReadBuffer(SOIL_SENSOR_ADDRESS, 2, false);
        let moistureLevel = (buffer[0] << 8) | buffer[1]; // Convert to 16-bit integer

        // Additional delay to prevent excessive I2C reads
        pause(5000);

        return moistureLevel;
    }


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - C O L O R - F L O W E R

    // Top-level configurations
    const LED_BRIGHTNESS = 0.25; // Increased brightness headroom
    const GAMMA = 2.2; // Stronger gamma correction for color purity

    // Simplified color sensor reader (RGB only)
    //% block
    //% group="READ - Color Flower"
    export function newColorSensor(): { red: number; green: number; blue: number } {
        const COLOR_SENSOR_ADDRESS = 0x10; // I2C address for VEML6040
        const RED_REG = 0x08; // Register for red 
        const GREEN_REG = 0x09; // Register for green 
        const BLUE_REG = 0x0A; // Register for blue 

        function readRegister(register: number): number {
            let buffer = pins.createBuffer(1);
            buffer[0] = register;
            pins.i2cWriteBuffer(COLOR_SENSOR_ADDRESS, buffer, false);
            basic.pause(5); // Small delay before reading
            buffer = pins.i2cReadBuffer(COLOR_SENSOR_ADDRESS, 2, false);
            return (buffer[0] << 8) | buffer[1];
        }

        return {
            red: readRegister(RED_REG),
            green: readRegister(GREEN_REG),
            blue: readRegister(BLUE_REG)
        };
    }

// Improved scaling function
    function scaleColor(value: number, maxSensorValue = 65535): number {
        let normalized = value / maxSensorValue; // Normalize to 0-1 range
        let corrected = Math.pow(normalized, 1 / GAMMA); // Apply gamma correction
        return Math.round(corrected * 255 * LED_BRIGHTNESS); // Scale to 0-255
    }

    //% block
    //% group="Set Ring Color"
    export function setRingFlowerColor() {
        const color = newColorSensor();

        // Apply scaling to sensor values
        let r = scaleColor(color.red);
        let g = scaleColor(color.green);
        let b = scaleColor(color.blue);

        // Create LED buffer
        let buffer = pins.createBuffer(25 * 3);
        for (let i = 0; i < 25; i++) {
            buffer[i * 3 + 0] = g;  // Green
            buffer[i * 3 + 1] = r;  // Red
            buffer[i * 3 + 2] = b;  // Blue
        }

        ws2812b.sendBuffer(buffer, DigitalPin.P8);
    }


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - C O L O R - F L O W E R



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - O T H E R


    let colorSensorConfigured: boolean = false;
    let colorSensorAddress: number = 0x39;
    let colorSensorEnableRegister: number = 0x80;
    let colorSensorATimeRegister: number = 0x81;
    let colorSensorWTimeRegister: number = 0x83;
    let colorSensorPersRegister: number = 0x8C;
    let colorSensorAGainRegister: number = 0x8F;
    let colorSensorIdRegister: number = 0x92;
    let colorSensorStatusRegister: number = 0x93;
    let colorSensorRedRegister: number = 0x96;
    let colorSensorGreenRegister: number = 0x98;
    let colorSensorBlueRegister: number = 0x9A;

    let colorSensorId: number = 0x90;

    //% block
    //% group="ColorSensor"
    export function checkColorSensor(): boolean {
        let id3 = i2cReadRegister8(colorSensorAddress, colorSensorIdRegister);
        // basic.showNumber( id )
        return (id3 == colorSensorId)
    }

    export function colorSensorReadId(): number {
        let id32 = i2cReadRegister8(colorSensorAddress, colorSensorIdRegister);
        // basic.showNumber( id )
        return id32;
    }

    export function colorSensorReadStatus(): number {
        let status = i2cReadRegister8(colorSensorAddress, colorSensorStatusRegister);
        // basic.showNumber( id )
        return status;
    }

    export function colorSensorReadEnable(): number {
        let status2 = i2cReadRegister8(colorSensorAddress, colorSensorEnableRegister);
        // basic.showNumber( id )
        return status2;
    }

    //% block
    //% group="ColorSensor"
    export function colorSensorRead(): number {
        let rSense: number = 0;
        let bSense: number = 0;
        let gSense: number = 0;

        colorSensorConfigure();

        if (colorSensorConfigured) {
            rSense = i2cReadRegister16(colorSensorAddress, colorSensorRedRegister);
            gSense = i2cReadRegister16(colorSensorAddress, colorSensorGreenRegister);
            bSense = i2cReadRegister16(colorSensorAddress, colorSensorBlueRegister);
        }

        let punchup = 3;  // 2.5 worked for a while - too washed out?

        let rColor222 = (rSense >> 8) & 0xFF;
        let gColor222 = (gSense >> 8) & 0xFF;
        let bColor222 = (bSense >> 8) & 0xFF;

        rColor222 = Math.pow(rColor222, punchup );
        gColor222 = Math.pow(gColor222, punchup );
        bColor222 = Math.pow(bColor222, punchup );

        let cMax = (rColor222 > gColor222) ? rColor222 : gColor222;
        cMax = (bColor222 > cMax) ? bColor222 : cMax;

        rColor222 = 16 * rColor222 / cMax;
        gColor222 = 16 * gColor222 / cMax;
        bColor222 = 16 * bColor222 / cMax;

        // basic.showNumber( rColor >> 4 );

        return (rColor222 << 16) | (gColor222 << 8) | bColor222;
        // return (rSense << 16) | (gSense << 8) | bSense;

    }

    //% block
    //% group="ColorSensor"
    export function colorGetRed(color: number): number {
        return (color >> 16) & 0xFF;
    }

    //% block
    //% group="ColorSensor"
    export function colorGetGreen(color: number): number {
        return (color >> 8) & 0xFF;
    }

    //% block
    //% group="ColorSensor"
    export function colorGetBlue(color: number): number {
        return (color & 0xFF);
    }

    function colorSensorConfigure() {
        if (!colorSensorConfigured && checkColorSensor()) {
            // turn it on
            // Control Reg:  PON
            i2cWriteRegister(colorSensorAddress, colorSensorEnableRegister, 0x01)

            basic.pause(100)

            // ATime  :RGB TIMING:FF 2.4ms, C0 150ms
            i2cWriteRegister(colorSensorAddress, colorSensorATimeRegister, 0xC0)
            // Wait Time:FF 2.4ms
            i2cWriteRegister(colorSensorAddress, colorSensorWTimeRegister, 0xFF)
            // Persistance: 0x00 - IRQ every time
            i2cWriteRegister(colorSensorAddress, colorSensorPersRegister, 0)
            // AGain: 0 - 3
            i2cWriteRegister(colorSensorAddress, colorSensorAGainRegister, 3)

            // Control Reg:  PON AEN
            i2cWriteRegister(colorSensorAddress, colorSensorEnableRegister, 0x08 | 0x03)
            basic.pause(100)


            //            basic.showString( "C");
            colorSensorConfigured = true;
        }
    }

    export function i2cReadRegister8(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt8LE, false)
    }

    export function i2cReadRegister16(address: number, register: number): number {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        return pins.i2cReadNumber(address, NumberFormat.UInt16LE, false)
    }



    export function i2cWriteRegister8_8(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register,
            NumberFormat.UInt8LE,
            true
        )
        pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }

    export function i2cWriteRegister(address: number, register: number, value: number) {
        pins.i2cWriteNumber(
            address,
            register | (value << 8),
            NumberFormat.UInt16LE,
            false
        )
        // pins.i2cWriteNumber(address, value, NumberFormat.UInt8LE, false)
    }

}
