namespace ElizaDolls {

    // In case it gets lost from above (// then %) 
    //  % color="#FE99F8"

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

    //% block
    //% group="Read - Color Flower"
    export function newColorSensor(): { red: number; green: number; blue: number; white: number } {
        const COLOR_SENSOR_ADDRESS = 0x10; // I2C address for VEML6040
        const CONFIG_REG = 0x00; // Configuration register
        const RED_REG = 0x08; // Register for red 
        const GREEN_REG = 0x09; // Register for green 
        const BLUE_REG = 0x0A; // Register for blue 
        const WHITE_REG = 0x0B; // Register for white 

        // Configure VEML6040: Power on, 80ms integration, 1x gain
        let configBuffer = pins.createBuffer(3);
        configBuffer[0] = CONFIG_REG; // Register address
        configBuffer[1] = 0x00;      // High byte (no trigger)
        configBuffer[2] = 0x01;      // Low byte: Power on, IT=80ms, Gain=1x
        pins.i2cWriteBuffer(COLOR_SENSOR_ADDRESS, configBuffer, false);
        basic.pause(10); // Allow sensor initialization

        function readRegister(register: number): number {
            let buffer2 = pins.createBuffer(1);
            buffer2[0] = register;
            pins.i2cWriteBuffer(COLOR_SENSOR_ADDRESS, buffer2, false);
            basic.pause(5); // Small delay before reading
            buffer2 = pins.i2cReadBuffer(COLOR_SENSOR_ADDRESS, 2, false);
            // Correct byte order: MSB first (buffer[0] << 8) | buffer[1]
            return (buffer2[0] << 8) | buffer2[1];
        }

        let red = readRegister(RED_REG);
        let green = readRegister(GREEN_REG);
        let blue = readRegister(BLUE_REG);
        let white = readRegister(WHITE_REG);

        basic.pause(50); // Short delay between readings

        // Apply cool white compensation and noise floor
        return {
            red: Math.max(MIN_COLOR_THRESHOLD, red * COOL_WHITE_COMPENSATION.red),
            green: Math.max(MIN_COLOR_THRESHOLD, green * COOL_WHITE_COMPENSATION.green),
            blue: Math.max(MIN_COLOR_THRESHOLD, blue * COOL_WHITE_COMPENSATION.blue),
            white
        };
    }

    // Update the LED_BRIGHTNESS if needed (now correctly scaled)
    const LED_BRIGHTNESS = 0.3; // Now effective due to correct scaling

    // Corrected scaleColor function with proper sensor range and optional gamma
    function scaleColor(value: number): number {
        // Map 16-bit sensor value (0-65535) to 0-255, then apply brightness
        let scaled = Math.map(value, 0, 65535, 0, 255);
        scaled = Math.round(scaled * LED_BRIGHTNESS);
        // Optional gamma correction (uncomment if needed)
        // scaled = Math.pow(scaled / 255, 2.8) * 255;
        return Math.round(scaled);
    }

    // Add these compensation factors at the top
    const COOL_WHITE_COMPENSATION = { red: 0.80, green: 1.0, blue: 0.95 }; // Reduce blue, boost red
    const MIN_COLOR_THRESHOLD = 5; // Ignore values below this to avoid noise


    // Enhanced setRingFlowerColor with smart color balancing
    //% block
    //% group="Set Ring - - - Color Flower"
    export function setRingFlowerColor() {
        let color = newColorSensor();

        // Use white channel to normalize colors
        const total = color.red + color.green + color.blue;
        const whiteBalance = color.white / 3; // Average white component

        let r = scaleColor(color.red * (whiteBalance / (color.red || 1)));
        let g = scaleColor(color.green * (whiteBalance / (color.green || 1)));
        let b = scaleColor(color.blue * (whiteBalance / (color.blue || 1)));

        // Find dominant color with hysteresis
        const max = Math.max(Math.max(r, g), b);
        const DOMINANCE_FACTOR = 0.19; // More aggressive suppression
        const IS_DOMINANT = (channel: number) => channel > max * 0.7; // 70% threshold

        if (IS_DOMINANT(r)) {
            g *= DOMINANCE_FACTOR;
            b *= DOMINANCE_FACTOR;
        } else if (IS_DOMINANT(g)) {
            r *= DOMINANCE_FACTOR;
            b *= DOMINANCE_FACTOR;
        } else if (IS_DOMINANT(b)) {
            r *= DOMINANCE_FACTOR;
            g *= DOMINANCE_FACTOR;
        }

        // Create buffer with emphasized colors
        let n = pins.createBuffer(25 * 3);
        const FINAL_SCALE = 1.2; // Final brightness boost
        for (let o = 0; o < 25; o++) {
            n[o * 3 + 0] = Math.min(255, g * FINAL_SCALE);  // Green
            n[o * 3 + 1] = Math.min(255, r * FINAL_SCALE);  // Red
            n[o * 3 + 2] = Math.min(255, b * FINAL_SCALE);  // Blue
        }

        ws2812b.sendBuffer(n, DigitalPin.P8);
    }
    //% block
    //% group="A0 Soil Moisture"
    // export function soilMoisture(): number {
    //     let moistureLevel: number = 0;
    //     // Read the analog value from the soil moisture sensor on AnalogPin.P0
    //     moistureLevel = pins.analogReadPin(AnalogPin.P0);

    //     return moistureLevel; // Return the current moisture level
    // }


        // const minValue = 0;   
        // const maxValue = 1023; 
        // const percentage = Math.map(moistureLevel, minValue, maxValue, 0, 100);

        // // Return the moisture percentage
        // return Math.constrain(percentage, 0, 100);

    // //% block
    // //% group="Digital Soil Moisture"
    // export function soilMoistureDigital(): number {
    //     // Read the analog value from the soil moisture sensor on AnalogPin.P1
    //     const moistureLevel = pins.digitalReadPin(DigitalPin.P1);
    //     const moistureLevelTwo = pins.digitalReadPin(DigitalPin.P2);

    //     // Optionally, you can map the moisture level to a percentage (0-100%)
    //     const minValue = 0;   // Adjust this based on your sensor's calibration for dry soil
    //     const maxValue = 1023; // Adjust this based on your sensor's calibration for wet soil
    //     const percentage = Math.map(moistureLevel, minValue, maxValue, 0, 100);

    //     // Return the moisture percentage
    //     return Math.constrain(percentage, 0, 100);
    // }


    // 

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
